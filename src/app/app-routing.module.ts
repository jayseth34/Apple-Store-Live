import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { HomeComponent } from "./components/home/home.component";
import { ProductsComponent } from "./components/products/products.component";
import { ProductDetailsComponent } from "./components/product-details/product-details.component";
import { CartComponent } from "./components/cart/cart.component";
import { OrderTrackingComponent } from "./components/order-tracking/order-tracking.component";
import { MyOrdersComponent } from "./components/my-orders/my-orders.component";

import { AdminLoginComponent } from "./components/admin/admin-login/admin-login.component";
import { AdminProductsComponent } from "./components/admin/admin-products/admin-products.component";
import { AdminProductFormComponent } from "./components/admin/admin-product-form/admin-product-form.component";
import { AdminOrdersComponent } from "./components/admin/admin-orders/admin-orders.component";
import { AdminAuthGuard } from "./auth/admin-auth.guard";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "home", component: HomeComponent },
  { path: "products", component: ProductsComponent },
  { path: "cart", component: CartComponent },
  { path: "product/:id", component: ProductDetailsComponent },
  { path: "order/:publicId", component: OrderTrackingComponent },
  { path: "my-orders", component: MyOrdersComponent },

  { path: "admin/login", component: AdminLoginComponent },
  { path: "admin/products", component: AdminProductsComponent, canActivate: [AdminAuthGuard] },
  { path: "admin/products/new", component: AdminProductFormComponent, canActivate: [AdminAuthGuard] },
  { path: "admin/products/:id/edit", component: AdminProductFormComponent, canActivate: [AdminAuthGuard] },
  { path: "admin/orders", component: AdminOrdersComponent, canActivate: [AdminAuthGuard] },

  { path: "**", redirectTo: "" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}