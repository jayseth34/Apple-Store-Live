import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { map, tap } from "rxjs/operators";

type LoginResponse = { token: string };

@Injectable({ providedIn: "root" })
export class AdminAuthService {
  private readonly tokenKey = "admin_token";

  constructor(private http: HttpClient) {}

  login(password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/api/admin/login`, { password })
      .pipe(tap((r) => localStorage.setItem(this.tokenKey, r.token)));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  verify() {
    return this.http.get<{ ok: true }>(`${environment.apiBaseUrl}/api/admin/me`).pipe(map(() => true));
  }
}