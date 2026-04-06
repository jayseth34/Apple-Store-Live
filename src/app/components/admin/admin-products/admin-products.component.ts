import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { Product, paiseToInr } from "../../../models/product";
import { ProductsService } from "../../../services/products.service";
import { AdminProductsService } from "../../../services/admin-products.service";

@Component({
  selector: "app-admin-products",
  templateUrl: "./admin-products.component.html",
  styleUrls: ["./admin-products.component.scss"]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  query = "";

  constructor(
    private productsApi: ProductsService,
    private adminApi: AdminProductsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get filteredProducts(): Product[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.products;
    return this.products.filter((p) => {
      const hay = `${p.id} ${p.name} ${p.category} ${p.description}`.toLowerCase();
      return hay.includes(q);
    });
  }

  inr(paise: number) {
    return paiseToInr(paise);
  }

  imageUrl(p: Product) {
    if (!p.imagePath) return null;
    if (p.imagePath.startsWith("http")) return p.imagePath;
    if (p.imagePath.startsWith("/")) return `${environment.apiBaseUrl}${p.imagePath}`;
    return `${environment.apiBaseUrl}/${p.imagePath}`;
  }

  load() {
    this.loading = true;
    this.error = null;
    this.productsApi.list().subscribe({
      next: (p) => {
        this.products = p;
        this.loading = false;
      },
      error: () => {
        this.error = "Failed to load products";
        this.loading = false;
      }
    });
  }

  newProduct() {
    this.router.navigateByUrl("/admin/products/new");
  }

  edit(p: Product) {
    this.router.navigate(["/admin/products", p.id, "edit"]);
  }

  remove(p: Product) {
    if (!confirm(`Delete ${p.name}?`)) return;
    this.adminApi.delete(p.id).subscribe({
      next: () => this.load(),
      error: () => (this.error = "Delete failed")
    });
  }
}