import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { AdminAuthService } from "../services/admin-auth.service";

@Injectable({ providedIn: "root" })
export class AdminAuthGuard implements CanActivate {
  constructor(private auth: AdminAuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.auth.isLoggedIn()) return true;
    return this.router.parseUrl("/admin/login");
  }
}