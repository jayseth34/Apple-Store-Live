import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CheckoutCustomer, PaymentsService } from "../../services/payments.service";
import { CheckoutProfileService } from "../../services/checkout-profile.service";
import { MyOrdersService } from "../../services/my-orders.service";
import { CartItem, CartService } from "../../services/cart.service";
import { Product, paiseToInr } from "../../models/product";
import { ProductsService } from "../../services/products.service";
import { RazorpayService } from "../../services/razorpay.service";

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.css"]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  productsById = new Map<number, Product>();
  loading = false;
  error: string | null = null;

  customer: CheckoutCustomer;
  payingFor: number | null = null;
  payingAll = false;
  paymentStatus: string | null = null;

  constructor(
    private cart: CartService,
    private productsApi: ProductsService,
    private paymentsApi: PaymentsService,
    private profile: CheckoutProfileService,
    private myOrders: MyOrdersService,
    private razorpay: RazorpayService,
    private router: Router
  ) {
    this.customer = this.profile.load();
  }

  ngOnInit(): void {
    this.items = this.cart.getItems();
    this.cart.items$.subscribe((items) => {
      this.items = items;
      this.loadProducts();
    });
    this.loadProducts();
  }

  inr(paise: number) {
    return paiseToInr(paise);
  }

  productFor(item: CartItem): Product | undefined {
    return this.productsById.get(item.productId);
  }

  totalPaise(): number {
    let total = 0;
    for (const item of this.items) {
      const p = this.productFor(item);
      if (p) total += p.pricePaise * item.quantity;
    }
    return total;
  }

  saveCustomer() {
    this.profile.save(this.customer);
  }

  isCustomerValid() {
    const c = this.customer;
    return (
      c.name.trim().length >= 2 &&
      c.phone.trim().length >= 8 &&
      c.address1.trim().length >= 5 &&
      c.city.trim().length >= 2 &&
      c.state.trim().length >= 2 &&
      c.pincode.trim().length >= 4
    );
  }

  inc(item: CartItem) {
    this.cart.setQuantity(item.productId, item.quantity + 1);
  }

  dec(item: CartItem) {
    this.cart.setQuantity(item.productId, item.quantity - 1);
  }

  remove(item: CartItem) {
    this.cart.remove(item.productId);
  }

  goShop() {
    this.router.navigateByUrl("/products");
  }

  private loadProducts() {
    const ids = new Set(this.items.map((i) => i.productId));
    if (ids.size === 0) {
      this.productsById.clear();
      return;
    }

    this.loading = true;
    this.productsApi.list().subscribe({
      next: (products) => {
        this.productsById = new Map(products.map((p) => [p.id, p] as const));
        // remove stale cart items
        for (const item of this.cart.getItems()) {
          if (!this.productsById.has(item.productId)) this.cart.remove(item.productId);
        }
        this.loading = false;
      },
      error: () => {
        this.error = "Failed to load products";
        this.loading = false;
      }
    });
  }

  async checkoutAll() {
    if (this.items.length === 0) return;

    this.paymentStatus = null;
    if (!this.isCustomerValid()) {
      this.paymentStatus = "Please fill delivery details";
      return;
    }

    this.payingAll = true;
    this.saveCustomer();

    try {
      const order = await this.paymentsApi
        .createCartOrder(
          this.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          this.customer
        )
        .toPromise();
      if (!order) throw new Error("Failed to create order");

      this.myOrders.addFromCreateOrder(order);

      await this.razorpay.load();

      const options: any = {
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "Apple Store",
        description: `Cart order (${order.items?.length || 0} items)`,
        order_id: order.razorpayOrderId,
        handler: (response: any) => {
          this.paymentsApi
            .verifyPayment({
              orderId: order.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
            .subscribe({
              next: () => {
                this.cart.clear();
                this.router.navigate(["/order", order.publicId], { queryParams: { token: order.accessToken } });
              },
              error: () => (this.paymentStatus = "Payment verification failed")
            });
        },
        prefill: {
          name: this.customer.name,
          email: this.customer.email || undefined,
          contact: this.customer.phone
        },
        theme: { color: "#111" }
      };

      const rz = new (window as any).Razorpay(options);
      rz.on("payment.failed", () => {
        this.paymentStatus = "Payment failed";
      });
      rz.open();
    } catch (e: any) {
      this.paymentStatus = e?.message || "Payment failed";
    } finally {
      this.payingAll = false;
    }
  }

  async checkoutItem(item: CartItem) {
    const product = this.productFor(item);
    if (!product) return;

    this.paymentStatus = null;
    if (!this.isCustomerValid()) {
      this.paymentStatus = "Please fill delivery details";
      return;
    }

    this.payingFor = item.productId;
    this.saveCustomer();

    try {
      const order = await this.paymentsApi.createOrder(product.id, item.quantity, this.customer).toPromise();
      if (!order) throw new Error("Failed to create order");

      this.myOrders.addFromCreateOrder(order);

      await this.razorpay.load();

      const options: any = {
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "Apple Store",
        description: order.product.name,
        order_id: order.razorpayOrderId,
        handler: (response: any) => {
          this.paymentsApi
            .verifyPayment({
              orderId: order.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
            .subscribe({
              next: () => {
                this.cart.remove(item.productId);
                this.router.navigate(["/order", order.publicId], { queryParams: { token: order.accessToken } });
              },
              error: () => (this.paymentStatus = "Payment verification failed")
            });
        },
        prefill: {
          name: this.customer.name,
          email: this.customer.email || undefined,
          contact: this.customer.phone
        },
        theme: { color: "#111" }
      };

      const rz = new (window as any).Razorpay(options);
      rz.on("payment.failed", () => {
        this.paymentStatus = "Payment failed";
      });
      rz.open();
    } catch (e: any) {
      this.paymentStatus = e?.message || "Payment failed";
    } finally {
      this.payingFor = null;
    }
  }
}