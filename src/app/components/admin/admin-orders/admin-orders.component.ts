import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { Order } from "../../../models/order";
import { paiseToInr } from "../../../models/product";
import { AdminOrdersService } from "../../../services/admin-orders.service";

const STATUSES = [
  "CREATED",
  "PAID",
  "SHIPMENT_PICKED",
  "OUT_FOR_DELIVERY",
  "DELIVERY_TODAY",
  "DELIVERED",
  "CANCELLED"
];

@Component({
  selector: "app-admin-orders",
  templateUrl: "./admin-orders.component.html",
  styleUrls: ["./admin-orders.component.scss"]
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;
  statuses = STATUSES;

  constructor(private api: AdminOrdersService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  inr(paise: number) {
    return paiseToInr(paise);
  }

  private titleCaseFromEnum(value: string) {
    const words = String(value || "")
      .trim()
      .replace(/_/g, " ")
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return words.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  statusLabel(status: string) {
    const s = String(status || "").toUpperCase();
    if (s === "FULFILLED") return "Delivered";
    if (s === "DELIVERY_TODAY") return "Delivery today";
    return this.titleCaseFromEnum(status);
  }

  productName(o: Order) {
    const items = o.items || [];
    if (items.length > 0) {
      const first = items[0].product?.name || `Product #${items[0].productId}`;
      return items.length > 1 ? `${first} +${items.length - 1} more` : first;
    }

    return o.product?.name || `Product #${o.productId || "-"}`;
  }

  itemsLabel(o: Order) {
    const items = o.items || [];
    const text = items
      .map((it) => `${it.quantity}� ${it.product?.name || `#${it.productId}`}`)
      .slice(0, 4)
      .join(", ");
    return text + (items.length > 4 ? " �" : "");
  }

  imageUrl(o: Order) {
    const imagePath = o.product?.imagePath;
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `${environment.apiBaseUrl}${imagePath}`;
    return `${environment.apiBaseUrl}/${imagePath}`;
  }

  load() {
    this.loading = true;
    this.error = null;
    this.api.list().subscribe({
      next: (o) => {
        this.orders = o;
        this.loading = false;
      },
      error: () => {
        this.error = "Failed to load orders";
        this.loading = false;
      }
    });
  }

  goProducts() {
    this.router.navigateByUrl("/admin/products");
  }

  setStatus(o: Order, status: string) {
    this.api.updateStatus(o.id, status).subscribe({
      next: (updated) => {
        o.status = updated.status;
      },
      error: () => {
        this.error = "Failed to update status";
      }
    });
  }
}