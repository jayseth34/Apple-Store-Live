import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { NavMenu, NavMenuItem } from "../models/nav-menu";

export interface NavMenuInput {
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
}

export interface NavMenuItemInput {
  name: string;
  categorySlug: string;
  order: number;
  isActive: boolean;
  backgroundImage?: string;
  categoryDescription?: string;
  categoryButtonText?: string;
}

@Injectable({ providedIn: "root" })
export class AdminNavMenuService {
  private base = `${environment.apiBaseUrl}/api/admin/nav-menus`;

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<NavMenu[]>(this.base);
  }

  createMenu(input: NavMenuInput) {
    return this.http.post<NavMenu>(this.base, input);
  }

  updateMenu(id: number, input: Partial<NavMenuInput>) {
    return this.http.put<NavMenu>(`${this.base}/${id}`, input);
  }

  deleteMenu(id: number) {
    return this.http.delete<{ ok: true }>(`${this.base}/${id}`);
  }

  createItem(menuId: number, input: NavMenuItemInput) {
    return this.http.post<NavMenuItem>(`${this.base}/${menuId}/items`, input);
  }

  updateItem(menuId: number, itemId: number, input: Partial<NavMenuItemInput>) {
    return this.http.put<NavMenuItem>(`${this.base}/${menuId}/items/${itemId}`, input);
  }

  deleteItem(menuId: number, itemId: number) {
    return this.http.delete<{ ok: true }>(`${this.base}/${menuId}/items/${itemId}`);
  }
}
