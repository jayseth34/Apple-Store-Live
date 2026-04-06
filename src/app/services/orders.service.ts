import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Order } from "../models/order";

@Injectable({ providedIn: "root" })
export class OrdersService {
  constructor(private http: HttpClient) {}

  get(publicId: string, token: string) {
    const params = new HttpParams().set("token", token);
    return this.http.get<Order>(`${environment.apiBaseUrl}/api/orders/${publicId}`, { params });
  }
}