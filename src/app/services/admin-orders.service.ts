import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Order } from "../models/order";

@Injectable({ providedIn: "root" })
export class AdminOrdersService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<Order[]>(`${environment.apiBaseUrl}/api/admin/orders`);
  }

  updateStatus(id: number, status: string) {
    return this.http.put<Order>(`${environment.apiBaseUrl}/api/admin/orders/${id}/status`, { status });
  }
}