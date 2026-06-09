import express from "express";
import cors from "cors";
import path from "node:path";
import crypto from "node:crypto";
import { z } from "zod";
import { env } from "./lib/env.js";
import { requireAdmin, signAdminToken } from "./lib/auth.js";
import { upload, toImagePath } from "./lib/upload.js";
import { razorpay, verifyPaymentSignature, verifyWebhookSignature } from "./lib/razorpay.js";
import {
  initDb,
  listActiveProducts,
  listAllProducts,
  getActiveProduct,
  createProduct,
  updateProduct,
  softDeleteProduct,
  createOrder,
  updateOrder,
  getOrder,
  getOrderByPublicId,
  decrementProductStock,
  findOrderByRazorpayOrderId,
  listOrders,
  sha256Hex,
  listNavMenus,
  createNavMenu,
  updateNavMenu,
  deleteNavMenu,
  createNavMenuItem,
  updateNavMenuItem,
  deleteNavMenuItem,
  hardDeleteOrder,
  hardDeleteFromCollection,
  listCollection,
  VALID_COLLECTIONS
} from "./lib/db.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => res.json({ ok: true, features: { cartCheckout: true, multiItemOrders: true } }));

app.post("/api/payments/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.header("x-razorpay-signature") || "";
  const rawBody = req.body as Buffer;

  if (!env.RAZORPAY_WEBHOOK_SECRET) return res.status(400).json({ error: "Webhook secret not set" });
  if (!verifyWebhookSignature(rawBody, signature)) return res.status(401).json({ error: "Bad signature" });

  const event = JSON.parse(rawBody.toString("utf8")) as { event?: string; payload?: any };
  const entityOrderId = event?.payload?.payment?.entity?.order_id as string | undefined;
  const entityPaymentId = event?.payload?.payment?.entity?.id as string | undefined;

  if (entityOrderId) {
    const match = await findOrderByRazorpayOrderId(entityOrderId);
    if (match) {
      await updateOrder(match.id, {
        status: event.event || match.status,
        razorpayPaymentId: entityPaymentId || match.razorpayPaymentId
      });
    }
  }

  return res.json({ ok: true });
});

app.use(express.json());

app.post("/api/admin/login", async (req, res) => {
  const body = z.object({ password: z.string().min(1) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body" });
  if (body.data.password !== env.ADMIN_PASSWORD) return res.status(401).json({ error: "Invalid password" });
  return res.json({ token: signAdminToken() });
});

app.get("/api/admin/me", requireAdmin, (_req, res) => res.json({ ok: true }));
type AnyOrder = Record<string, any>;
function sanitizeOrder<T extends AnyOrder>(order: T): Omit<T, "accessTokenHash"> {
  // Never expose token hashes to clients
  const { accessTokenHash: _ignore, ...rest } = order as any;
  return rest;
}
type OrderItem = { productId: number; quantity: number; unitPricePaise?: number };

function toOrderItems(order: any): OrderItem[] {
  if (Array.isArray(order.items) && order.items.length > 0) return order.items as OrderItem[];
  if (order.productId) {
    const qty = Math.max(1, Number(order.quantity) || 1);
    const unit = Math.round((Number(order.amountPaise) || 0) / qty);
    return [{ productId: Number(order.productId), quantity: qty, unitPricePaise: unit }];
  }
  return [];
}

function enrichOrder(order: any, productById: Map<number, any>) {
  const items = toOrderItems(order).map((i) => {
    const product = productById.get(i.productId) || null;
    return {
      ...i,
      unitPricePaise: i.unitPricePaise ?? (product ? product.pricePaise : undefined),
      product
    };
  });

  const primaryProduct = items.length > 0 ? items[0].product : order.productId ? productById.get(order.productId) || null : null;

  return {
    ...sanitizeOrder(order),
    isPaid: !!order.razorpayPaymentId,
    product: primaryProduct,
    items
  };
}

app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
  const orders = await listOrders();
  const products = await listAllProducts();
  const productById = new Map(products.map((p) => [p.id, p] as const));

  return res.json(
    orders.map((o) => enrichOrder(o, productById))
  );
});

app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const body = z.object({ status: z.string().min(2) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body" });

  const updated = await updateOrder(id, { status: body.data.status });
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json(updated);
});

app.delete("/api/admin/orders/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
  const ok = await hardDeleteOrder(id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  return res.json({ ok: true });
});

// ── DB Explorer routes ─────────────────────────────────────────────────────

app.get("/api/admin/db/:collection", requireAdmin, async (req, res) => {
  const col = req.params.collection as any;
  if (!VALID_COLLECTIONS.includes(col)) return res.status(400).json({ error: "Invalid collection" });
  const data = await listCollection(col);
  return res.json(data);
});

app.delete("/api/admin/db/:collection/:id", requireAdmin, async (req, res) => {
  const col = req.params.collection as any;
  const id = Number(req.params.id);
  if (!VALID_COLLECTIONS.includes(col)) return res.status(400).json({ error: "Invalid collection" });
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
  const ok = await hardDeleteFromCollection(col, id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  return res.json({ ok: true });
});

app.get("/api/products", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;

  const topPick =
    typeof req.query.topPick === "string"
      ? ["1", "true", "yes"].includes(req.query.topPick.toLowerCase())
      : undefined;

  const hotDeal =
    typeof req.query.hotDeal === "string"
      ? ["1", "true", "yes"].includes(req.query.hotDeal.toLowerCase())
      : undefined;

  const bestSelling =
    typeof req.query.bestSelling === "string"
      ? ["1", "true", "yes"].includes(req.query.bestSelling.toLowerCase())
      : undefined;

  const products = await listActiveProducts({ category, q, topPick, hotDeal, bestSelling });
  return res.json(products);
});

app.get("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
  const product = await getActiveProduct(id);
  if (!product) return res.status(404).json({ error: "Not found" });
  return res.json(product);
});


const Bool = z.preprocess((v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(s)) return true;
    if (["0", "false", "no", "off"].includes(s)) return false;
  }
  return v;
}, z.boolean());
const AdminProductVariantSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  pricePaise: z.coerce.number().int().nonnegative(),
  stock: z.coerce.number().int().nonnegative()
});

const AdminProductSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().min(5),
  pricePaise: z.coerce.number().int().positive(),
  compareAtPricePaise: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().int().positive().optional()
  ),
  stock: z.coerce.number().int().nonnegative().default(0),
  isTopPick: Bool.default(false),
  isHotDeal: Bool.default(false),
  isBestSelling: Bool.default(false),
  isActive: Bool.default(true),
  variants: z.preprocess(
    (v) => (typeof v === "string" ? JSON.parse(v) : v),
    z.array(AdminProductVariantSchema).optional()
  )
});

app.post("/api/admin/products", requireAdmin, upload.any(), async (req, res) => {
  const parsed = AdminProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });

  const files = (req.files as Express.Multer.File[]) || [];
  const mainImageFile = files.find(f => f.fieldname === "image");
  const imagePath = mainImageFile?.filename ? toImagePath(mainImageFile.filename) : undefined;

  let variants: any[] = [];

  if (parsed.data.variants && parsed.data.variants.length > 0) {
    const variantImageMap = new Map<number, string>();
    files.forEach(f => {
      const match = f.fieldname.match(/^variant_image_(\d+)$/);
      if (match) {
        const variantId = parseInt(match[1], 10);
        variantImageMap.set(variantId, toImagePath(f.filename));
      }
    });

    variants = parsed.data.variants.map((v: any) => ({
      ...v,
      imagePath: variantImageMap.get(v.id) || v.imagePath
    }));
  }

  const created = await createProduct({
    ...parsed.data,
    imagePath,
    variants: variants.length > 0 ? variants : undefined,
    stock: parsed.data.stock ?? 0,
    isActive: parsed.data.isActive ?? true
  });

  return res.status(201).json(created);
});

app.put("/api/admin/products/:id", requireAdmin, upload.any(), async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = AdminProductSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });

  const files = (req.files as Express.Multer.File[]) || [];
  const mainImageFile = files.find(f => f.fieldname === "image");
  const imagePath = mainImageFile?.filename ? toImagePath(mainImageFile.filename) : undefined;

  const updateData: any = { ...parsed.data };
  if (imagePath) updateData.imagePath = imagePath;

  if (parsed.data.variants && parsed.data.variants.length > 0) {
    const variantImageMap = new Map<number, string>();
    files.forEach(f => {
      const match = f.fieldname.match(/^variant_image_(\d+)$/);
      if (match) {
        const variantId = parseInt(match[1], 10);
        variantImageMap.set(variantId, toImagePath(f.filename));
      }
    });

    updateData.variants = parsed.data.variants.map((v: any) => ({
      ...v,
      imagePath: variantImageMap.get(v.id) || v.imagePath
    }));
  } else {
    delete updateData.variants;
  }

  const updated = await updateProduct(id, updateData);
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json(updated);
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
  const updated = await softDeleteProduct(id);
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json({ ok: true });
});

const CreateOrderSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().max(10).default(1),
  customer: z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email().optional().or(z.literal("")),
    address1: z.string().min(5),
    address2: z.string().optional().or(z.literal("")),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    country: z.string().min(2).default("IN")
  })
});


const CreateCartOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive().max(10)
      })
    )
    .min(1)
    .max(20),
  customer: CreateOrderSchema.shape.customer
});

app.post("/api/payments/create-cart-order", async (req, res) => {
  const body = CreateCartOrderSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body", details: body.error.flatten() });

  // merge duplicates
  const byId = new Map<number, number>();
  for (const it of body.data.items) {
    byId.set(it.productId, (byId.get(it.productId) || 0) + it.quantity);
  }
  const items = [...byId.entries()].map(([productId, quantity]) => ({ productId, quantity }));

  const products: any[] = [];
  let amountPaise = 0;
  let totalQty = 0;

  for (const it of items) {
    const product = await getActiveProduct(it.productId);
    if (!product) return res.status(404).json({ error: `Product not found: ${it.productId}` });
    if (product.stock < it.quantity) return res.status(409).json({ error: `Insufficient stock for ${product.name}` });

    products.push(product);
    amountPaise += product.pricePaise * it.quantity;
    totalQty += it.quantity;
  }

  const publicId = crypto.randomUUID();
  const accessToken = crypto.randomBytes(16).toString("hex");
  const accessTokenHash = sha256Hex(accessToken);

  const orderDb = await createOrder({
    publicId,
    accessTokenHash,

    items: items.map((it) => {
      const product = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        quantity: it.quantity,
        unitPricePaise: product ? product.pricePaise : undefined
      };
    }),

    quantity: totalQty,
    amountPaise,
    currency: "INR",

    customerName: body.data.customer.name,
    customerPhone: body.data.customer.phone,
    customerEmail: body.data.customer.email || undefined,

    shippingAddress1: body.data.customer.address1,
    shippingAddress2: body.data.customer.address2 || undefined,
    city: body.data.customer.city,
    state: body.data.customer.state,
    pincode: body.data.customer.pincode,
    country: body.data.customer.country,

    status: "CREATED"
  });

  const rpOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `order_${orderDb.id}`,
    notes: { publicId, kind: "cart" }
  });

  await updateOrder(orderDb.id, { razorpayOrderId: rpOrder.id });

  return res.json({
    keyId: env.RAZORPAY_KEY_ID,
    amountPaise,
    currency: "INR",
    razorpayOrderId: rpOrder.id,
    orderId: orderDb.id,
    publicId,
    accessToken,
    items: items.map((it) => {
      const p = products.find((x) => x.id === it.productId);
      return { productId: it.productId, name: p?.name || `Product #${it.productId}`, quantity: it.quantity };
    })
  });
});
app.post("/api/payments/create-order", async (req, res) => {
  const body = CreateOrderSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body", details: body.error.flatten() });

  const product = await getActiveProduct(body.data.productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  if (product.stock <= 0) return res.status(409).json({ error: "Out of stock" });

  const amountPaise = product.pricePaise * body.data.quantity;

  const publicId = crypto.randomUUID();
  const accessToken = crypto.randomBytes(16).toString("hex");
  const accessTokenHash = sha256Hex(accessToken);

  const orderDb = await createOrder({
    publicId,
    accessTokenHash,

    productId: product.id,
    quantity: body.data.quantity,
    amountPaise,
    currency: "INR",

    customerName: body.data.customer.name,
    customerPhone: body.data.customer.phone,
    customerEmail: body.data.customer.email || undefined,

    shippingAddress1: body.data.customer.address1,
    shippingAddress2: body.data.customer.address2 || undefined,
    city: body.data.customer.city,
    state: body.data.customer.state,
    pincode: body.data.customer.pincode,
    country: body.data.customer.country,

    status: "CREATED"
  });

  const rpOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `order_${orderDb.id}`,
    notes: { productId: String(product.id), publicId }
  });

  await updateOrder(orderDb.id, { razorpayOrderId: rpOrder.id });

  return res.json({
    keyId: env.RAZORPAY_KEY_ID,
    amountPaise,
    currency: "INR",
    razorpayOrderId: rpOrder.id,
    orderId: orderDb.id,
    publicId,
    accessToken,
    product: { id: product.id, name: product.name }
  });
});

app.post("/api/payments/verify", async (req, res) => {
  const body = z
    .object({
      orderId: z.number().int().positive(),
      razorpay_order_id: z.string().min(1),
      razorpay_payment_id: z.string().min(1),
      razorpay_signature: z.string().min(1)
    })
    .safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid body" });

  const ok = verifyPaymentSignature(body.data);
  if (!ok) return res.status(401).json({ error: "Bad signature" });

  const existingOrder = await getOrder(body.data.orderId);
  if (!existingOrder) return res.status(404).json({ error: "Order not found" });

  await updateOrder(body.data.orderId, {
    status: "PAID",
    razorpayOrderId: body.data.razorpay_order_id,
    razorpayPaymentId: body.data.razorpay_payment_id
  });

    const items = toOrderItems(existingOrder);
  for (const it of items) {
    await decrementProductStock(it.productId, it.quantity);
  }


  return res.json({ ok: true });
});

app.get("/api/orders/:publicId", async (req, res) => {
  const publicId = String(req.params.publicId || "");
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!publicId) return res.status(400).json({ error: "Invalid id" });
  if (!token) return res.status(401).json({ error: "Missing token" });

  const order = await getOrderByPublicId(publicId);
  if (!order) return res.status(404).json({ error: "Not found" });
  if (order.accessTokenHash !== sha256Hex(token)) return res.status(403).json({ error: "Forbidden" });

  const products = await listAllProducts();
  const productById = new Map(products.map((p) => [p.id, p] as const));
  return res.json(enrichOrder(order, productById));
});

// ── Nav Menu routes ────────────────────────────────────────────────────────

app.get("/api/nav-menus", async (_req, res) => {
  const menus = await listNavMenus(true);
  return res.json(menus);
});

app.get("/api/admin/nav-menus", requireAdmin, async (_req, res) => {
  const menus = await listNavMenus(false);
  return res.json(menus);
});

const NavMenuSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  order: z.coerce.number().int().nonnegative().default(0),
  isActive: z.preprocess((v) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return ["1","true","yes"].includes(v.toLowerCase());
    return v;
  }, z.boolean().default(true))
});

const NavMenuItemSchema = z.object({
  name: z.string().min(1),
  categorySlug: z.string().min(1),
  order: z.coerce.number().int().nonnegative().default(0),
  isActive: z.preprocess((v) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return ["1","true","yes"].includes(v.toLowerCase());
    return v;
  }, z.boolean().default(true)),
  backgroundImage: z.string().url().optional().or(z.literal("")),
  categoryDescription: z.string().optional(),
  categoryButtonText: z.string().optional()
});

app.post("/api/admin/nav-menus", requireAdmin, async (req, res) => {
  const parsed = NavMenuSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  const menu = await createNavMenu(parsed.data);
  return res.status(201).json(menu);
});

app.put("/api/admin/nav-menus/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = NavMenuSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  const updated = await updateNavMenu(id, parsed.data);
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json(updated);
});

app.delete("/api/admin/nav-menus/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
  const ok = await deleteNavMenu(id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  return res.json({ ok: true });
});

app.post("/api/admin/nav-menus/:id/items", requireAdmin, async (req, res) => {
  const menuId = Number(req.params.id);
  if (!Number.isFinite(menuId)) return res.status(400).json({ error: "Invalid id" });
  const parsed = NavMenuItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  const item = await createNavMenuItem({ ...parsed.data, menuId });
  return res.status(201).json(item);
});

app.put("/api/admin/nav-menus/:menuId/items/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = NavMenuItemSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  const updated = await updateNavMenuItem(id, parsed.data);
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json(updated);
});

app.delete("/api/admin/nav-menus/:menuId/items/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
  const ok = await deleteNavMenuItem(id);
  if (!ok) return res.status(404).json({ error: "Not found" });
  return res.json({ ok: true });
});

await initDb();

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});


