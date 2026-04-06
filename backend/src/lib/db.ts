import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

export type Product = {
  id: number;
  name: string;
  category: string;
  description: string;
  pricePaise: number;
  compareAtPricePaise?: number;
  imagePath?: string;
  stock: number;
  isActive: boolean;
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
  nextProductId: number;
  nextOrderId: number;
};

const defaultData: Data = {
  products: [],
  orders: [],
  nextProductId: 1,
  nextOrderId: 1
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

  if (db.data.products.length === 0) {
    const now = new Date().toISOString();
    const seed: Omit<Product, "id">[] = [
      {
        name: "MagSafe Power Bank (Compatible)",
        category: "power bank",
        description: "Low-cost compatible MagSafe-style power bank for iPhone.",
        pricePaise: 199900,
        compareAtPricePaise: 249900,
        stock: 25,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Silicone Case Cover",
        category: "covers",
        description: "Soft-touch silicone cover compatible with popular iPhone models.",
        pricePaise: 59900,
        compareAtPricePaise: 99900,
        stock: 100,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Wireless Keyboard (Mac Layout)",
        category: "keyboard",
        description: "Compact wireless keyboard with Mac-friendly layout.",
        pricePaise: 149900,
        compareAtPricePaise: 199900,
        stock: 40,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Wireless Mouse",
        category: "mouse",
        description: "Ergonomic wireless mouse for iPad/Mac/Windows.",
        pricePaise: 99900,
        compareAtPricePaise: 129900,
        stock: 60,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Stylus Pencil (Compatible)",
        category: "pencil",
        description: "Affordable stylus compatible with iPad (model-dependent).",
        pricePaise: 129900,
        compareAtPricePaise: 179900,
        stock: 50,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: "True Wireless Earbuds (AirPods-style)",
        category: "airpods",
        description: "Budget true wireless earbuds with charging case.",
        pricePaise: 179900,
        compareAtPricePaise: 249900,
        stock: 35,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Fitness Band (WHOOP-style)",
        category: "whoop",
        description: "Budget fitness band for daily activity tracking.",
        pricePaise: 249900,
        compareAtPricePaise: 299900,
        stock: 20,
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Bluetooth Game Controller",
        category: "controller",
        description: "Bluetooth controller compatible with iPhone/iPad/Mac (game support varies).",
        pricePaise: 229900,
        compareAtPricePaise: 279900,
        stock: 30,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    for (const p of seed) {
      db.data.products.push({ id: db.data.nextProductId++, ...p });
    }

    await db.write();
  }
}

export async function listActiveProducts(params: { category?: string; q?: string }) {
  await db.read();
  const category = params.category?.trim().toLowerCase();
  const q = params.q?.trim().toLowerCase();

  return db.data!.products
    .filter((p) => p.isActive)
    .filter((p) => (category ? p.category.toLowerCase() === category : true))
    .filter((p) =>
      q ? p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) : true
    )
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
  const product: Product = {
    id: db.data!.nextProductId++,
    ...input,
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
  Object.assign(product, patch, { updatedAt: new Date().toISOString() });
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

export async function decrementProductStock(productId: number, quantity: number) {
  await db.read();
  const product = db.data!.products.find((p) => p.id === productId);
  if (!product) return null;
  product.stock = Math.max(0, product.stock - Math.max(0, quantity));
  product.updatedAt = new Date().toISOString();
  await db.write();
  return product;
}