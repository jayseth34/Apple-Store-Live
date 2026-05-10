import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AdminDbService, CollectionName } from "../../../services/admin-db.service";

interface ColMeta {
  key: CollectionName;
  label: string;
  columns: string[];
}

const COLLECTIONS: ColMeta[] = [
  { key: "products",      label: "Products",        columns: ["id", "name", "category", "pricePaise", "stock", "isActive"] },
  { key: "orders",        label: "Orders",           columns: ["id", "customerName", "customerPhone", "status", "amountPaise", "createdAt"] },
  { key: "navMenus",      label: "Nav Menus",        columns: ["id", "name", "slug", "order", "isActive"] },
  { key: "navMenuItems",  label: "Nav Menu Items",   columns: ["id", "menuId", "name", "categorySlug", "order", "isActive"] }
];

@Component({
  selector: "app-admin-db",
  templateUrl: "./admin-db.component.html",
  styleUrls: ["./admin-db.component.scss"]
})
export class AdminDbComponent implements OnInit {
  collections = COLLECTIONS;
  activeCol: ColMeta = COLLECTIONS[0];

  rows: any[] = [];
  loading = false;
  error: string | null = null;

  query = "";
  expandedId: number | null = null;
  deletingId: number | null = null;

  constructor(private dbSvc: AdminDbService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  selectCollection(col: ColMeta) {
    this.activeCol = col;
    this.query = "";
    this.expandedId = null;
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;
    this.rows = [];
    this.dbSvc.list(this.activeCol.key).subscribe({
      next: (data) => { this.rows = data; this.loading = false; },
      error: () => { this.error = "Failed to load"; this.loading = false; }
    });
  }

  get filteredRows(): any[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }

  cellValue(row: any, col: string): string {
    const v = row[col];
    if (v === undefined || v === null) return "—";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    return String(v);
  }

  isBoolean(row: any, col: string): boolean {
    return typeof row[col] === "boolean";
  }

  toggleExpand(id: number) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  formatJson(row: any): string {
    return JSON.stringify(row, null, 2);
  }

  confirmDelete(row: any) {
    const msg = `Permanently delete ${this.activeCol.label.slice(0, -1).toLowerCase()} #${row.id}?\n\nThis cannot be undone.`;
    if (!confirm(msg)) return;
    this.deletingId = row.id;
    this.error = null;
    this.dbSvc.delete(this.activeCol.key, row.id).subscribe({
      next: () => {
        this.rows = this.rows.filter((r) => r.id !== row.id);
        this.deletingId = null;
      },
      error: () => {
        this.error = "Delete failed";
        this.deletingId = null;
      }
    });
  }

  goBack() {
    this.router.navigateByUrl("/admin/products");
  }
}
