import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type CartItem = {
  productId: number;
  quantity: number;
  variantId?: number;
};

const STORAGE_KEY = "cart_v1";

function clampQty(qty: number) {
  return Math.min(10, Math.max(1, Math.floor(qty || 1)));
}

@Injectable({ providedIn: "root" })
export class CartService {
  private subject = new BehaviorSubject<CartItem[]>(this.load());
  items$ = this.subject.asObservable();

  getItems(): CartItem[] {
    return this.subject.value;
  }

  getCount(): number {
    return this.subject.value.reduce((sum, i) => sum + i.quantity, 0);
  }

  add(productId: number, quantity = 1, variantId?: number) {
    const items = [...this.subject.value];
    const idx = items.findIndex((i) => i.productId === productId && i.variantId === variantId);
    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: clampQty(items[idx].quantity + quantity) };
    } else {
      items.push({ productId, quantity: clampQty(quantity), variantId });
    }
    this.set(items);
  }

  setQuantity(productId: number, quantity: number) {
    const items = this.subject.value.map((i) =>
      i.productId === productId ? { ...i, quantity: clampQty(quantity) } : i
    );
    this.set(items);
  }

  remove(productId: number) {
    this.set(this.subject.value.filter((i) => i.productId !== productId));
  }

  clear() {
    this.set([]);
  }

  private set(items: CartItem[]) {
    this.subject.next(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((x) => x && typeof x.productId === "number" && typeof x.quantity === "number")
        .map((x) => ({ productId: x.productId, quantity: clampQty(x.quantity) }));
    } catch {
      return [];
    }
  }
}