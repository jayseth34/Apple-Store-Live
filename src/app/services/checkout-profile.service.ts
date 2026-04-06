import { Injectable } from "@angular/core";
import { CheckoutCustomer } from "./payments.service";

const STORAGE_KEY = "checkout_customer_v1";

const EMPTY: CheckoutCustomer = {
  name: "",
  phone: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
  country: "IN"
};

@Injectable({ providedIn: "root" })
export class CheckoutProfileService {
  load(): CheckoutCustomer {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...EMPTY };
      const parsed = JSON.parse(raw);
      return { ...EMPTY, ...parsed };
    } catch {
      return { ...EMPTY };
    }
  }

  save(customer: CheckoutCustomer) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
  }
}