import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Product } from "../models/product";

@Injectable({ providedIn: "root" })
export class ProductsService {
  constructor(private http: HttpClient) {}

  list(params?: { category?: string; q?: string }) {
    let httpParams = new HttpParams();
    if (params?.category) httpParams = httpParams.set("category", params.category);
    if (params?.q) httpParams = httpParams.set("q", params.q);
    return this.http.get<Product[]>(`${environment.apiBaseUrl}/api/products`, { params: httpParams });
  }

  get(id: number) {
    return this.http.get<Product>(`${environment.apiBaseUrl}/api/products/${id}`);
  }
}