import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription, forkJoin, of, timer } from "rxjs";
import { catchError } from "rxjs/operators";
import { Order } from "../../models/order";
import { paiseToInr } from "../../models/product";
import { MyOrdersService, StoredOrder } from "../../services/my-orders.service";
import { OrdersService } from "../../services/orders.service";

@Component({
  selector: "app-my-orders",
  templateUrl: "./my-orders.component.html",
  styleUrls: ["./my-orders.component.css"]
})
export class MyOrdersComponent implements OnInit, OnDestroy {
  stored: StoredOrder[] = [];
  details = new Map<string, Order>();
  loading = false;
  error: string | null = null;

  private sub?: Subscription;

  constructor(private store: MyOrdersService, private api: OrdersService, private router: Router) {}

  ngOnInit(): void {
    this.reloadFromStore();
    this.refresh(true);

    // Keep statuses updated if admin changes them
    this.sub = timer(10000, 10000).subscribe(() => this.refresh(false));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  reloadFromStore() {
    this.stored = this.store.list();
  }

  refresh(showLoading: boolean) {
    this.reloadFromStore();
    if (showLoading) this.loading = true;
    this.error = null;

    if (this.stored.length === 0) {
      this.details.clear();
      this.loading = false;
      return;
    }

    const reqs = this.stored.map((s) =>
      this.api.get(s.publicId, s.token).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(reqs).subscribe({
      next: (orders) => {
        this.details.clear();
        for (const o of orders) {
          if (o && o.publicId) this.details.set(o.publicId, o);
        }
        this.loading = false;
      },
      error: () => {
        this.error = "Failed to load orders";
        this.loading = false;
      }
    });
  }

  detailFor(s: StoredOrder) {
    return this.details.get(s.publicId) || null;
  }

  inr(paise?: number) {
    return paiseToInr(paise || 0);
  }

  track(s: StoredOrder) {
    this.router.navigate(["/order", s.publicId], { queryParams: { token: s.token } });
  }

  remove(s: StoredOrder) {
    this.store.remove(s.publicId);
    this.refresh(false);
  }

  clearAll() {
    this.store.clear();
    this.refresh(false);
  }

  goShop() {
    this.router.navigateByUrl("/products");
  }
}