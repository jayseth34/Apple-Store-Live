import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { Product, fallbackImageForCategory, paiseToInr } from "../../models/product";
import { CartService } from "../../services/cart.service";
import { CheckoutProfileService } from "../../services/checkout-profile.service";
import { MyOrdersService } from "../../services/my-orders.service";
import { CheckoutCustomer, PaymentsService } from "../../services/payments.service";
import { ProductsService } from "../../services/products.service";
import { RazorpayService } from "../../services/razorpay.service";

@Component({
  selector: "app-product-details",
  templateUrl: "./product-details.component.html",
  styleUrls: ["./product-details.component.css"]
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error: string | null = null;
  quantity = 1;
  paying = false;
  paymentStatus: string | null = null;
  addedToCart = false;

  customer: CheckoutCustomer;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsApi: ProductsService,
    private paymentsApi: PaymentsService,
    private razorpay: RazorpayService,
    private cart: CartService,
    private profile: CheckoutProfileService,
    private myOrders: MyOrdersService
  ) {
    this.customer = this.profile.load();
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (!Number.isFinite(id)) {
      this.router.navigateByUrl("/products");
      return;
    }
    this.load(id);
  }

  load(id: number) {
    this.loading = true;
    this.error = null;
    this.productsApi.get(id).subscribe({
      next: (p) => {
        this.product = p;
        this.loading = false;
      },
      error: () => {
        this.error = "Product not found";
        this.loading = false;
      }
    });
  }

  saveCustomer() {
    this.profile.save(this.customer);
  }

  displayImageUrl() {
    if (!this.product) return null;
    if (!this.product.imagePath) return fallbackImageForCategory(this.product.category);
    const p = this.product.imagePath;
    if (p.startsWith("http")) return p;
    if (p.startsWith("/")) return `${environment.apiBaseUrl}${p}`;
    return `${environment.apiBaseUrl}/${p}`;
  }

  inr(paise: number) {
    return paiseToInr(paise);
  }

  increaseQuantity() {
    if (this.quantity < 10) this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) this.quantity--;
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

  addToCart() {
    if (!this.product) return;
    this.cart.add(this.product.id, this.quantity);
    this.addedToCart = true;
    setTimeout(() => (this.addedToCart = false), 1600);
  }

  goCart() {
    this.router.navigateByUrl("/cart");
  }

  async buyNow() {
    if (!this.product) return;

    this.paymentStatus = null;
    if (!this.isCustomerValid()) {
      this.paymentStatus = "Please fill delivery details";
      return;
    }

    this.paying = true;
    this.saveCustomer();

    try {
      const order = await this.paymentsApi
        .createOrder(this.product.id, this.quantity, this.customer)
        .toPromise();
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
      this.paying = false;
    }
  }
}