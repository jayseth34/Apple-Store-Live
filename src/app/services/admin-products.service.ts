import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Product } from "../models/product";

export type ProductVariantInput = {
  id?: number;
  name: string;
  description?: string;
  pricePaise: number;
  stock: number;
};

export type ProductUpsertInput = {
  name: string;
  category: string;
  description: string;
  pricePaise: number;
  compareAtPricePaise?: number;
  stock: number;
  isActive: boolean;
  isTopPick?: boolean;
  isHotDeal?: boolean;
  isBestSelling?: boolean;
  image?: File | null;
  variants?: ProductVariantInput[];
  variantImages?: Array<[number, File]>;
};

@Injectable({ providedIn: "root" })
export class AdminProductsService {
  constructor(private http: HttpClient) {}

  create(input: ProductUpsertInput) {
    const fd = this.toFormData(input);
    return this.http.post<Product>(`${environment.apiBaseUrl}/api/admin/products`, fd);
  }

  update(id: number, input: Partial<ProductUpsertInput>) {
    const fd = this.toFormData(input);
    return this.http.put<Product>(`${environment.apiBaseUrl}/api/admin/products/${id}`, fd);
  }

  delete(id: number) {
    return this.http.delete<{ ok: true }>(`${environment.apiBaseUrl}/api/admin/products/${id}`);
  }

  private toFormData(input: Partial<ProductUpsertInput>) {
    const fd = new FormData();
    if (input.name != null) fd.append("name", input.name);
    if (input.category != null) fd.append("category", input.category);
    if (input.description != null) fd.append("description", input.description);
    if (input.pricePaise != null) fd.append("pricePaise", String(input.pricePaise));
    if (input.compareAtPricePaise != null) fd.append("compareAtPricePaise", String(input.compareAtPricePaise));
    if (input.compareAtPricePaise === undefined && (input as any).compareAtPricePaise === undefined) {
      // do nothing
    }
    if (input.stock != null) fd.append("stock", String(input.stock));
    if (input.isActive != null) fd.append("isActive", String(input.isActive));
    if (input.isTopPick != null) fd.append("isTopPick", String(input.isTopPick));
    if (input.isHotDeal != null) fd.append("isHotDeal", String(input.isHotDeal));
    if (input.isBestSelling != null) fd.append("isBestSelling", String(input.isBestSelling));
    if (input.image) fd.append("image", input.image);
    if (input.variants && input.variants.length > 0) {
      fd.append("variants", JSON.stringify(input.variants));
    }
    if (input.variantImages && input.variantImages.length > 0) {
      input.variantImages.forEach(([variantId, file]) => {
        fd.append(`variant_image_${variantId}`, file);
      });
    }
    return fd;
  }
}

