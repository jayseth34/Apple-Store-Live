import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { Product, fallbackImageForCategory, paiseToInr } from "../../models/product";
import { CartService } from "../../services/cart.service";
import { ProductsService } from "../../services/products.service";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.css"]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  activeCategory: string | null = null;

  constructor(
    private productsApi: ProductsService,
    private cart: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((m) => {
      this.activeCategory = m.get("category");
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.productsApi.list({ category: this.activeCategory || undefined }).subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.error = "Failed to load products";
        this.loading = false;
      }
    });
  }

  imageUrl(p: Product) {
    if (!p.imagePath) return fallbackImageForCategory(p.category);
    if (p.imagePath.startsWith("http")) return p.imagePath;
    if (p.imagePath.startsWith("/")) return `${environment.apiBaseUrl}${p.imagePath}`;
    return `${environment.apiBaseUrl}/${p.imagePath}`;
  }

  inr(paise: number) {
    return paiseToInr(paise);
  }

  view(productId: number): void {
    this.router.navigate(["/product", productId]);
  }

  addToCart(product: Product, event: MouseEvent) {
    event.stopPropagation();
    this.cart.add(product.id, 1);
  }

  onSortChange(_event: any): void {
    // optional later
  }
}