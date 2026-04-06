import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HeaderComponent } from "./components/shared/header/header.component";
import { FooterComponent } from "./components/shared/footer/footer.component";
import { HomeComponent } from "./components/home/home.component";
import { ProductsComponent } from "./components/products/products.component";
import { ProductDetailsComponent } from "./components/product-details/product-details.component";
import { OrderTrackingComponent } from "./components/order-tracking/order-tracking.component";
import { MyOrdersComponent } from "./components/my-orders/my-orders.component";
import { CartComponent } from "./components/cart/cart.component";

import { AdminLoginComponent } from "./components/admin/admin-login/admin-login.component";
import { AdminProductsComponent } from "./components/admin/admin-products/admin-products.component";
import { AdminProductFormComponent } from "./components/admin/admin-product-form/admin-product-form.component";
import { AdminOrdersComponent } from "./components/admin/admin-orders/admin-orders.component";

import { AdminAuthInterceptor } from "./auth/admin-auth.interceptor";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    ProductsComponent,
    ProductDetailsComponent,
    OrderTrackingComponent,
    MyOrdersComponent,
    CartComponent,
    AdminLoginComponent,
    AdminProductsComponent,
    AdminProductFormComponent,
    AdminOrdersComponent
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AdminAuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}