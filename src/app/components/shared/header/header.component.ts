import { Component, OnInit, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { CartService } from "../../../services/cart.service";
import { NavMenuService } from "../../../services/nav-menu.service";
import { NavMenu } from "../../../models/nav-menu";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent implements OnInit {
  navMenus: NavMenu[] = [];
  openDropdownId: number | null = null;
  mobileMenuOpen = false;
  mobileExpandedMenuId: number | null = null;

  constructor(
    private router: Router,
    private cart: CartService,
    private navMenuSvc: NavMenuService
  ) {}

  ngOnInit(): void {
    this.navMenuSvc.list().subscribe({
      next: (menus) => { this.navMenus = menus; },
      error: () => { /* silently fail — nav still works without dynamic menus */ }
    });
  }

  getCartCount() {
    return this.cart.getCount();
  }

  goHome() { this.router.navigateByUrl("/"); }
  goProducts(category?: string) {
    if (category) {
      this.router.navigate(["/products"], { queryParams: { category } });
    } else {
      this.router.navigateByUrl("/products");
    }
    this.closeAll();
  }
  goCart()     { this.router.navigateByUrl("/cart"); this.closeAll(); }
  goMyOrders() { this.router.navigateByUrl("/my-orders"); this.closeAll(); }
  goAdmin()    { this.router.navigateByUrl("/admin/login"); this.closeAll(); }

  openDropdown(id: number) { this.openDropdownId = id; }
  closeDropdown()           { this.openDropdownId = null; }
  toggleDropdown(id: number) {
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) this.mobileExpandedMenuId = null;
  }

  toggleMobileExpand(id: number) {
    this.mobileExpandedMenuId = this.mobileExpandedMenuId === id ? null : id;
  }

  closeAll() {
    this.openDropdownId = null;
    this.mobileMenuOpen = false;
    this.mobileExpandedMenuId = null;
  }

  @HostListener("document:click", ["$event"])
  onDocClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest(".nav-dropdown-wrap") && !target.closest(".navbar-brand")) {
      this.openDropdownId = null;
    }
    if (!target.closest(".mobile-nav-wrap")) {
      this.mobileMenuOpen = false;
      this.mobileExpandedMenuId = null;
    }
  }
}
