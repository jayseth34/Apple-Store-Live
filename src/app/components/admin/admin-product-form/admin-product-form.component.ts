import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormArray, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Product, ProductVariant, paiseToInr } from "../../../models/product";
import { AdminProductsService } from "../../../services/admin-products.service";
import { ProductsService } from "../../../services/products.service";
import { AdminNavMenuService } from "../../../services/admin-nav-menu.service";

const FALLBACK_CATEGORIES = [
  "power bank", "covers", "keyboard", "mouse", "pencil",
  "airpods", "whoop", "controller",
  "macbook", "mac mini", "iphone", "ipad", "accessories"
];

@Component({
  selector: "app-admin-product-form",
  templateUrl: "./admin-product-form.component.html",
  styleUrls: ["./admin-product-form.component.scss"]
})
export class AdminProductFormComponent implements OnInit {
  categories: string[] = FALLBACK_CATEGORIES;
  mode: "create" | "edit" = "create";
  loading = false;
  error: string | null = null;
  imageFile: File | null = null;
  productId?: number;
  variants: (ProductVariant & { imageFile?: File })[] = [];
  variantImageFiles: Map<number, File> = new Map();
  expandVariantsSection = false;

  form = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    category: [FALLBACK_CATEGORIES[0], [Validators.required]],
    description: ["", [Validators.required, Validators.minLength(5)]],
    priceInr: [0, [Validators.required, Validators.min(1)]],
    compareAtPriceInr: [null as any],
    stock: [0, [Validators.required, Validators.min(0)]],
    isTopPick: [false],
    isHotDeal: [false],
    isBestSelling: [false],
    isActive: [true]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminApi: AdminProductsService,
    private productsApi: ProductsService,
    private navMenuApi: AdminNavMenuService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.mode = "edit";
      this.productId = Number(idParam);
      this.loadExisting(this.productId);
    }
  }

  private loadCategories() {
    this.navMenuApi.list().subscribe({
      next: (menus) => {
        const slugs = menus
          .flatMap((m) => m.items)
          .filter((i) => i.isActive)
          .map((i) => i.categorySlug);
        const unique = [...new Set([...slugs, ...FALLBACK_CATEGORIES])];
        this.categories = unique;
      },
      error: () => { /* keep fallback */ }
    });
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
          isTopPick: (p as any).isTopPick === true,
          isHotDeal: (p as any).isHotDeal === true,
          isBestSelling: (p as any).isBestSelling === true,
          isActive: p.isActive
        });
        if (p.variants && p.variants.length > 0) {
          this.variants = [...p.variants];
          this.expandVariantsSection = true;
        }
        this.loading = false;
      },
      error: () => {
        this.error = "Failed to load product";
        this.loading = false;
      }
    });
  }

  addVariant() {
    const nextId = Math.max(0, ...this.variants.map(v => v.id || 0)) + 1;
    this.variants.push({
      id: nextId,
      name: `Variant ${nextId}`,
      pricePaise: 0,
      stock: 0
    });
  }

  removeVariant(index: number) {
    this.variants.splice(index, 1);
    const variantId = this.variants[index]?.id;
    if (variantId) {
      this.variantImageFiles.delete(variantId);
    }
  }

  onVariantImageChange(index: number, e: any) {
    const file = e?.target?.files?.[0];
    if (file && this.variants[index]) {
      this.variantImageFiles.set(this.variants[index].id, file);
      this.variants[index].imageFile = file;
    }
  }

  updateVariantField(index: number, field: keyof ProductVariant, value: any) {
    if (this.variants[index]) {
      if (field === 'pricePaise') {
        (this.variants[index] as any)[field] = Math.round(Number(value) * 100);
      } else if (field === 'stock') {
        (this.variants[index] as any)[field] = Number(value);
      } else {
        (this.variants[index] as any)[field] = value;
      }
    }
  }

  variantPriceInr(pricePaise: number): number {
    return paiseToInr(pricePaise);
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

    if (this.mode === "create" && !this.imageFile) {
      this.error = "An image is required for new products.";
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
      isTopPick: (v as any).isTopPick === true,
      isHotDeal: (v as any).isHotDeal === true,
      isBestSelling: (v as any).isBestSelling === true,
      isActive: (v as any).isActive === true,
      image: this.imageFile,
      variants: this.variants,
      variantImages: Array.from(this.variantImageFiles.entries())
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


