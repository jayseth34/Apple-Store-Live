import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AdminAuthService } from "../../../services/admin-auth.service";

@Component({
  selector: "app-admin-login",
  templateUrl: "./admin-login.component.html",
  styleUrls: ["./admin-login.component.scss"]
})
export class AdminLoginComponent {
  password = "";
  loading = false;
  error: string | null = null;

  constructor(private auth: AdminAuthService, private router: Router) {}

  login() {
    this.error = null;
    this.loading = true;
    this.auth.login(this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl("/admin/products");
      },
      error: (e) => {
        this.loading = false;
        this.error = e?.error?.error || "Login failed";
      }
    });
  }
}