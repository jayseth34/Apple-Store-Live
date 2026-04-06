import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

export type CheckoutCustomer = {
  name: string;
  phone: string;
  email?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

export type CreateOrderResponse = {
  keyId: string;
  amountPaise: number;
  currency: string;
  razorpayOrderId: string;
  orderId: number;
  publicId: string;
  accessToken: string;
  product: { id: number; name: string };
};

export type CartCheckoutItem = {
  productId: number;
  quantity: number;
};

export type CreateCartOrderResponse = {
  keyId: string;
  amountPaise: number;
  currency: string;
  razorpayOrderId: string;
  orderId: number;
  publicId: string;
  accessToken: string;
  items: Array<{ productId: number; name: string; quantity: number }>;
};

@Injectable({ providedIn: "root" })
export class PaymentsService {
  constructor(private http: HttpClient) {}

  createOrder(productId: number, quantity: number, customer: CheckoutCustomer) {
    return this.http.post<CreateOrderResponse>(`${environment.apiBaseUrl}/api/payments/create-order`, {
      productId,
      quantity,
      customer
    });
  }

  createCartOrder(items: CartCheckoutItem[], customer: CheckoutCustomer) {
    return this.http.post<CreateCartOrderResponse>(`${environment.apiBaseUrl}/api/payments/create-cart-order`, {
      items,
      customer
    });
  }

  verifyPayment(payload: {
    orderId: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return this.http.post<{ ok: true }>(`${environment.apiBaseUrl}/api/payments/verify`, payload);
  }
}