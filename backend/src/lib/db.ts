import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

export type ProductVariant = {
  id: number;
  name: string;
  description?: string;
  pricePaise: number;
  imagePath?: string;
  stock: number;
  sku?: string;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  description: string;
  pricePaise: number;
  compareAtPricePaise?: number;
  imagePath?: string;
  sku?: string;
  isTopPick?: boolean;
  isHotDeal?: boolean;
  isBestSelling?: boolean;
  stock: number;
  isActive: boolean;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
};

export type NavMenu = {
  id: number;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NavMenuItem = {
  id: number;
  menuId: number;
  name: string;
  categorySlug: string;
  order: number;
  isActive: boolean;
  backgroundImage?: string;
  categoryDescription?: string;
  categoryButtonText?: string;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: number;

  publicId: string;
  accessTokenHash: string;

  /**
   * Multi-item orders use `items`. Legacy single-item orders use `productId` + `quantity`.
   * `quantity` is kept for quick display (sum of item quantities).
   */
  items?: Array<{
    productId: number;
    quantity: number;
    unitPricePaise?: number;
  }>;

  productId?: number;
  quantity: number;
  amountPaise: number;
  currency: string;

  customerName: string;
  customerPhone: string;
  customerEmail?: string;

  shippingAddress1: string;
  shippingAddress2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;

  createdAt: string;
  updatedAt: string;
};

type Data = {
  products: Product[];
  orders: Order[];
  navMenus: NavMenu[];
  navMenuItems: NavMenuItem[];
  nextProductId: number;
  nextOrderId: number;
  nextNavMenuId: number;
  nextNavMenuItemId: number;
  nextVariantId: number;
};

const defaultData: Data = {
  products: [],
  orders: [],
  navMenus: [],
  navMenuItems: [],
  nextProductId: 1,
  nextOrderId: 1,
  nextNavMenuId: 1,
  nextNavMenuItemId: 1,
  nextVariantId: 1000
};

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const file = path.join(dataDir, "db.json");
const adapter = new JSONFile<Data>(file);
export const db = new Low<Data>(adapter, defaultData);

export function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function initDb() {
  await db.read();
  db.data ||= { ...defaultData };

  if (!Array.isArray(db.data.products) || !Array.isArray(db.data.orders)) {
    db.data = { ...defaultData };
  }

  if (!Array.isArray(db.data.navMenus)) db.data.navMenus = [];
  if (!Array.isArray(db.data.navMenuItems)) db.data.navMenuItems = [];
  if (!db.data.nextNavMenuId) db.data.nextNavMenuId = 1;
  if (!db.data.nextNavMenuItemId) db.data.nextNavMenuItemId = 1;
  if (!db.data.nextVariantId) db.data.nextVariantId = 1000;
}

export async function listActiveProducts(params: { category?: string; q?: string; topPick?: boolean; hotDeal?: boolean; bestSelling?: boolean }) {
  await db.read();
  const category = params.category?.trim().toLowerCase();
  const q = params.q?.trim().toLowerCase();
  const topPick = params.topPick === true;
  const hotDeal = params.hotDeal === true;
  const bestSelling = params.bestSelling === true;

  return db.data!.products
    .filter((p) => p.isActive)
    .filter((p) => (topPick ? !!p.isTopPick : true))
    .filter((p) => (hotDeal ? !!p.isHotDeal : true))
    .filter((p) => (bestSelling ? !!p.isBestSelling : true))
    .filter((p) => (category ? p.category.toLowerCase() === category : true))
    .filter((p) => {
      if (!q) return true;
      const productMatches =
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q));
      const variantMatches = p.variants?.some((v) =>
        v.name.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q)) ||
        (v.sku && v.sku.toLowerCase().includes(q))
      );
      return productMatches || variantMatches;
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listAllProducts() {
  await db.read();
  return [...db.data!.products].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getActiveProduct(id: number) {
  await db.read();
  return db.data!.products.find((p) => p.id === id && p.isActive) || null;
}

export async function createProduct(input: Omit<Product, "id" | "createdAt" | "updatedAt">) {
  await db.read();
  const now = new Date().toISOString();

  let variants = input.variants;
  if (variants && variants.length > 0) {
    variants = variants.map((v) => ({
      ...v,
      id: v.id || db.data!.nextVariantId++
    }));
  }

  const product: Product = {
    id: db.data!.nextProductId++,
    ...input,
    variants,
    createdAt: now,
    updatedAt: now
  };
  db.data!.products.push(product);
  await db.write();
  return product;
}

export async function updateProduct(id: number, patch: Partial<Omit<Product, "id" | "createdAt">>) {
  await db.read();
  const product = db.data!.products.find((p) => p.id === id);
  if (!product) return null;

  let patchWithVariants = { ...patch };
  if (patch.variants && patch.variants.length > 0) {
    patchWithVariants.variants = patch.variants.map((v) => ({
      ...v,
      id: v.id || db.data!.nextVariantId++
    }));
  }

  Object.assign(product, patchWithVariants, { updatedAt: new Date().toISOString() });
  await db.write();
  return product;
}

export async function softDeleteProduct(id: number) {
  return updateProduct(id, { isActive: false });
}

export async function createOrder(input: Omit<Order, "id" | "createdAt" | "updatedAt">) {
  await db.read();
  const now = new Date().toISOString();
  const order: Order = {
    id: db.data!.nextOrderId++,
    ...input,
    createdAt: now,
    updatedAt: now
  };
  db.data!.orders.push(order);
  await db.write();
  return order;
}

export async function updateOrder(id: number, patch: Partial<Omit<Order, "id" | "createdAt">>) {
  await db.read();
  const order = db.data!.orders.find((o) => o.id === id);
  if (!order) return null;
  Object.assign(order, patch, { updatedAt: new Date().toISOString() });
  await db.write();
  return order;
}

export async function getOrder(id: number) {
  await db.read();
  return db.data!.orders.find((o) => o.id === id) || null;
}

export async function getOrderByPublicId(publicId: string) {
  await db.read();
  return db.data!.orders.find((o) => o.publicId === publicId) || null;
}

export async function findOrderByRazorpayOrderId(razorpayOrderId: string) {
  await db.read();
  return db.data!.orders.find((o) => o.razorpayOrderId === razorpayOrderId) || null;
}

export async function listOrders() {
  await db.read();
  return [...db.data!.orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function listNavMenus(activeOnly = false) {
  await db.read();
  const menus = activeOnly
    ? db.data!.navMenus.filter((m) => m.isActive)
    : [...db.data!.navMenus];
  menus.sort((a, b) => a.order - b.order);

  return menus.map((menu) => ({
    ...menu,
    items: db.data!.navMenuItems
      .filter((i) => i.menuId === menu.id && (!activeOnly || i.isActive))
      .sort((a, b) => a.order - b.order)
  }));
}

export async function createNavMenu(input: Omit<NavMenu, "id" | "createdAt" | "updatedAt">) {
  await db.read();
  const now = new Date().toISOString();
  const menu: NavMenu = { id: db.data!.nextNavMenuId++, ...input, createdAt: now, updatedAt: now };
  db.data!.navMenus.push(menu);
  await db.write();
  return menu;
}

export async function updateNavMenu(id: number, patch: Partial<Omit<NavMenu, "id" | "createdAt">>) {
  await db.read();
  const menu = db.data!.navMenus.find((m) => m.id === id);
  if (!menu) return null;
  Object.assign(menu, patch, { updatedAt: new Date().toISOString() });
  await db.write();
  return menu;
}

export async function deleteNavMenu(id: number) {
  await db.read();
  const idx = db.data!.navMenus.findIndex((m) => m.id === id);
  if (idx === -1) return false;
  db.data!.navMenus.splice(idx, 1);
  db.data!.navMenuItems = db.data!.navMenuItems.filter((i) => i.menuId !== id);
  await db.write();
  return true;
}

export async function createNavMenuItem(input: Omit<NavMenuItem, "id" | "createdAt" | "updatedAt">) {
  await db.read();
  const now = new Date().toISOString();
  const item: NavMenuItem = { id: db.data!.nextNavMenuItemId++, ...input, createdAt: now, updatedAt: now };
  db.data!.navMenuItems.push(item);
  await db.write();
  return item;
}

export async function updateNavMenuItem(id: number, patch: Partial<Omit<NavMenuItem, "id" | "createdAt">>) {
  await db.read();
  const item = db.data!.navMenuItems.find((i) => i.id === id);
  if (!item) return null;
  Object.assign(item, patch, { updatedAt: new Date().toISOString() });
  await db.write();
  return item;
}

export async function deleteNavMenuItem(id: number) {
  await db.read();
  const idx = db.data!.navMenuItems.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  db.data!.navMenuItems.splice(idx, 1);
  await db.write();
  return true;
}

export async function decrementProductStock(productId: number, quantity: number) {
  await db.read();
  const product = db.data!.products.find((p) => p.id === productId);
  if (!product) return null;
  product.stock = Math.max(0, product.stock - Math.max(0, quantity));
  product.updatedAt = new Date().toISOString();
  await db.write();
  return product;
}

export async function hardDeleteOrder(id: number) {
  await db.read();
  const idx = db.data!.orders.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  db.data!.orders.splice(idx, 1);
  await db.write();
  return true;
}

type CollectionKey = "products" | "orders" | "navMenus" | "navMenuItems";
export const VALID_COLLECTIONS: CollectionKey[] = ["products", "orders", "navMenus", "navMenuItems"];

export async function listCollection(collection: CollectionKey) {
  await db.read();
  return [...(db.data![collection] as Array<{ id: number }>)];
}

export async function hardDeleteFromCollection(collection: CollectionKey, id: number) {
  await db.read();
  const arr = db.data![collection] as Array<{ id: number }>;
  const idx = arr.findIndex((item) => item.id === id);
  if (idx === -1) return false;
  arr.splice(idx, 1);
  await db.write();
  return true;
}





