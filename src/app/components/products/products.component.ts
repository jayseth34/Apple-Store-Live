import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  badge: string;
  badgeClass: string;
  outOfStock: boolean;
  inWishlist: boolean;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  products: Product[] = [
    {
      id: 1,
      name: 'Apple iPhone 13',
      category: 'iPhone, iPhone 13',
      description: 'iPhone 13. The most advanced dual-camera system ever on iPhone. Lightning-fast A15 Bionic chip.',
      currentPrice: 44900,
      originalPrice: 54900,
      discount: 18,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: 'Sale!',
      badgeClass: 'sale',
      outOfStock: false,
      inWishlist: false
    },
    {
      id: 2,
      name: 'Apple iPhone 15 Plus',
      category: 'iPhone, iPhone 15 plus',
      description: 'iPhone 15 Plus. Dynamic Island. 48MP Main camera. All-day battery life.',
      currentPrice: 69900,
      originalPrice: 79900,
      discount: 13,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: 'Sale!',
      badgeClass: 'sale',
      outOfStock: false,
      inWishlist: false
    }
    // Add more products here...
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.initAnimations();
  }

  onSortChange(event: any): void {
    const sortValue = event.target.value;
    // Implement sorting logic here
    console.log('Sorting by:', sortValue);
  }

  addToCart(product: Product): void {
    if (!product.outOfStock) {
      console.log('Added to cart:', product.name);
      // Implement add to cart logic
    }
  }

  toggleWishlist(product: Product): void {
    product.inWishlist = !product.inWishlist;
  }

  goToProductDetails(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  initAnimations(): void {
    // Copy animation code from home component
  }
}
