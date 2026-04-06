import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable } from "rxjs";
import { AdminAuthService } from "../services/admin-auth.service";

@Injectable()
export class AdminAuthInterceptor implements HttpInterceptor {
  constructor(private auth: AdminAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    const isAdminCall = req.url.includes("/api/admin/");
    if (!token || !isAdminCall) return next.handle(req);

    return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
}