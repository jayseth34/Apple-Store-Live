import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { NavMenu } from "../models/nav-menu";

@Injectable({ providedIn: "root" })
export class NavMenuService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<NavMenu[]>(`${environment.apiBaseUrl}/api/nav-menus`);
  }
}
