import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { CartService } from "../../../services/cart.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html"
})
export class HeaderComponent {
  cartCount$ = this.cart.items$;

  categories = [
    { id: "power bank", name: "Power Bank" },
    { id: "covers", name: "Covers" },
    { id: "keyboard", name: "Keyboard" },
    { id: "mouse", name: "Mouse" },
    { id: "pencil", name: "Pencil" },
    { id: "airpods", name: "AirPods" },
    { id: "whoop", name: "Whoop" },
    { id: "controller", name: "Controller" }
  ];

  constructor(private router: Router, private cart: CartService) {}

  getCartCount() {
    return this.cart.getCount();
  }

  goHome() {
    this.router.navigateByUrl("/");
  }

  goProducts(category?: string) {
    if (category) {
      this.router.navigate(["/products"], { queryParams: { category } });
      return;
    }
    this.router.navigateByUrl("/products");
  }

  goCart() {
    this.router.navigateByUrl("/cart");
  }

  goMyOrders() {
    this.router.navigateByUrl("/my-orders");
  }

  goAdmin() {
    this.router.navigateByUrl("/admin/login");
  }
}