import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Product, paiseToInr } from "../../../models/product";
import { AdminProductsService } from "../../../services/admin-products.service";
import { ProductsService } from "../../../services/products.service";

const CATEGORIES = [
  "power bank",
  "covers",
  "keyboard",
  "mouse",
  "pencil",
  "airpods",
  "whoop",
  "controller"
];

@Component({
  selector: "app-admin-product-form",
  templateUrl: "./admin-product-form.component.html",
  styleUrls: ["./admin-product-form.component.scss"]
})
export class AdminProductFormComponent implements OnInit {
  categories = CATEGORIES;
  mode: "create" | "edit" = "create";
  loading = false;
  error: string | null = null;
  imageFile: File | null = null;
  productId?: number;

  form = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    category: [CATEGORIES[0], [Validators.required]],
    description: ["", [Validators.required, Validators.minLength(5)]],
    priceInr: [0, [Validators.required, Validators.min(1)]],
    compareAtPriceInr: [null as any],
    stock: [0, [Validators.required, Validators.min(0)]],
    isActive: [true]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminApi: AdminProductsService,
    private productsApi: ProductsService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.mode = "edit";
      this.productId = Number(idParam);
      this.loadExisting(this.productId);
    }
  }

  private loadExisting(id: number) {
    this.loading = true;
    this.productsApi.get(id).subscribe({
      next: (p: Product) => {
        this.form.patchValue({
          name: p.name,
          category: p.category as any,
          description: p.description,
          priceInr: paiseToInr(p.pricePaise),
          compareAtPriceInr: p.compareAtPricePaise ? paiseToInr(p.compareAtPricePaise) : null,
          stock: p.stock,
          isActive: p.isActive
        });
        this.loading = false;
      },
      error: () => {
        this.error = "Failed to load product";
        this.loading = false;
      }
    });
  }

  onFileChange(e: any) {
    const file = e?.target?.files?.[0];
    this.imageFile = file || null;
  }

  save() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const input = {
      name: String(v.name),
      category: String(v.category),
      description: String(v.description),
      pricePaise: Math.round(Number(v.priceInr) * 100),
      compareAtPricePaise:
        v.compareAtPriceInr == null || v.compareAtPriceInr === "" ? undefined : Math.round(Number(v.compareAtPriceInr) * 100),
      stock: Number(v.stock) || 0,
      isActive: !!v.isActive,
      image: this.imageFile
    };

    this.loading = true;

    if (this.mode === "create") {
      this.adminApi.create(input).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigateByUrl("/admin/products");
        },
        error: (e) => {
          this.loading = false;
          this.error = e?.error?.error || "Save failed";
        }
      });
      return;
    }

    this.adminApi.update(this.productId!, input).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl("/admin/products");
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error || "Save failed";
      }
    });
  }
}