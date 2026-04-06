import { Product } from "./product";

export interface Order {
  id: number;

  publicId?: string;

  productId?: number;
  product?: Product | null;
  items?: Array<{
    productId: number;
    quantity: number;
    unitPricePaise?: number;
    product?: Product | null;
  }>;
  quantity: number;
  amountPaise: number;
  currency: string;

  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;

  shippingAddress1?: string;
  shippingAddress2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;

  status: string;
  isPaid?: boolean;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}