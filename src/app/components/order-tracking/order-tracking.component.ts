import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription, timer } from "rxjs";
import { Order } from "../../models/order";
import { paiseToInr } from "../../models/product";
import { OrdersService } from "../../services/orders.service";

const STATUS_STEPS = [
  "CREATED",
  "PAID",
  "SHIPMENT_PICKED",
  "OUT_FOR_DELIVERY",
  "DELIVERY_TODAY",
  "DELIVERED"
];

@Component({
  selector: "app-order-tracking",
  templateUrl: "./order-tracking.component.html",
  styleUrls: ["./order-tracking.component.css"]
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  loading = false;
  error: string | null = null;

  steps = STATUS_STEPS;

  private publicId = "";
  private token = "";
  private sub?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, private api: OrdersService) {}

  ngOnInit(): void {
    this.publicId = String(this.route.snapshot.paramMap.get("publicId") || "");
    this.token = String(this.route.snapshot.queryParamMap.get("token") || "");

    if (!this.publicId || !this.token) {
      this.error = "Missing tracking link";
      return;
    }

    this.refresh(true);

    // Poll every 5s so user sees admin status updates
    this.sub = timer(5000, 5000).subscribe(() => this.refresh(false));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  refresh(showLoading: boolean) {
    if (showLoading) this.loading = true;
    this.error = null;

    this.api.get(this.publicId, this.token).subscribe({
      next: (o) => {
        this.order = o;
        this.loading = false;
      },
      error: () => {
        this.error = "Order not found";
        this.loading = false;
      }
    });
  }

  inr(paise: number) {
    return paiseToInr(paise);
  }

  paidLabel() {
    if (!this.order) return "-";
    return this.order.isPaid || !!this.order.razorpayPaymentId ? "PAID" : "NOT PAID";
  }

  private titleCaseFromEnum(value: string) {
    const words = String(value || "")
      .trim()
      .replace(/_/g, " ")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  statusLabel(status: string) {
    const s = String(status || "").toUpperCase();
    if (s === "FULFILLED") return "Delivered";
    if (s === "DELIVERY_TODAY") return "Delivery today";
    return this.titleCaseFromEnum(status);
  }

  stepLabel(status: string) {
    switch (status) {
      case "CREATED":
        return "Placed";
      case "PAID":
        return "Paid";
      case "SHIPMENT_PICKED":
        return "Shipment picked";
      case "OUT_FOR_DELIVERY":
        return "Out for delivery";
      case "DELIVERY_TODAY":
        return "Delivery today";
      case "DELIVERED":
        return "Delivered";
      default:
        return this.statusLabel(status);
    }
  }

  stepIndex() {
    let s = (this.order?.status || "").toUpperCase();
    if (s === "CANCELLED") return -1;
    if (s === "FULFILLED") s = "DELIVERED"; 

    const idx = STATUS_STEPS.indexOf(s);
    if (idx >= 0) return idx;

    // any other status after payment is treated as delivered
    if (s && s !== "CREATED") return STATUS_STEPS.indexOf("DELIVERED");
    return 0;
  }

  progressPct() {
    const idx = this.stepIndex();
    if (idx < 0) return 0;
    return Math.round(((idx + 1) / STATUS_STEPS.length) * 100);
  }

  backToProducts() {
    this.router.navigateByUrl("/products");
  }
}