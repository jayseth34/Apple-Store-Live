import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";

export type CollectionName = "products" | "orders" | "navMenus" | "navMenuItems";

@Injectable({ providedIn: "root" })
export class AdminDbService {
  constructor(private http: HttpClient) {}

  list(collection: CollectionName) {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/api/admin/db/${collection}`);
  }

  delete(collection: CollectionName, id: number) {
    return this.http.delete<{ ok: boolean }>(`${environment.apiBaseUrl}/api/admin/db/${collection}/${id}`);
  }
}
