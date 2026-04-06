import { Injectable } from "@angular/core";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

@Injectable({ providedIn: "root" })
export class RazorpayService {
  private loading?: Promise<void>;

  load(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();
    if (this.loading) return this.loading;

    this.loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
      document.body.appendChild(script);
    });

    return this.loading;
  }
}