import { Injectable } from "@angular/core";
import { CreateCartOrderResponse, CreateOrderResponse } from "./payments.service";

export type StoredOrder = {
  publicId: string;
  token: string;
  orderId?: number;
  productName?: string;
  amountPaise?: number;
  createdAt?: string;
};

const KEY = "apple_store_my_orders_v1";

function safeParse(value: string | null): any {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: "root" })
export class MyOrdersService {
  private read(): StoredOrder[] {
    const raw = safeParse(localStorage.getItem(KEY));
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((x) => x && typeof x.publicId === "string" && typeof x.token === "string")
      .map((x) => ({
        publicId: String(x.publicId),
        token: String(x.token),
        orderId: typeof x.orderId === "number" ? x.orderId : undefined,
        productName: typeof x.productName === "string" ? x.productName : undefined,
        amountPaise: typeof x.amountPaise === "number" ? x.amountPaise : undefined,
        createdAt: typeof x.createdAt === "string" ? x.createdAt : undefined
      }));
  }

  private write(list: StoredOrder[]) {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  }

  list(): StoredOrder[] {
    return this.read().sort((a, b) => ((a.createdAt || "") < (b.createdAt || "") ? 1 : -1));
  }

  addFromCreateOrder(order: CreateOrderResponse | CreateCartOrderResponse) {
    const productNameFromSingle = (order as any).product?.name as string | undefined;
    const items = (order as any).items as Array<{ name: string }> | undefined;
    const productNameFromCart =
      items && items.length > 0
        ? `${items[0].name}${items.length > 1 ? ` +${items.length - 1} more` : ""}`
        : undefined;

    const next: StoredOrder = {
      publicId: order.publicId,
      token: order.accessToken,
      orderId: order.orderId,
      productName: productNameFromSingle || productNameFromCart,
      amountPaise: order.amountPaise,
      createdAt: new Date().toISOString()
    };

    const list = this.read();
    const existingIdx = list.findIndex((o) => o.publicId === next.publicId);
    if (existingIdx >= 0) list.splice(existingIdx, 1);
    list.unshift(next);
    this.write(list);
  }

  remove(publicId: string) {
    const list = this.read().filter((o) => o.publicId !== publicId);
    this.write(list);
  }

  clear() {
    this.write([]);
  }
}