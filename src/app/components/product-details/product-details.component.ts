import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface StorageOption {
  size: string;
  price: number;
}

interface ColorOption {
  name: string;
  hex: string;
}

interface Product {
  id: number;
  name: string;
  currentPrice: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  colors: ColorOption[];
  storageOptions: StorageOption[];
}

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  product: Product | null = null;
  selectedImageIndex = 0;
  selectedColor = 'yellow';
  selectedStorage = '128GB';
  quantity = 1;
  finalPrice = 69900;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    this.loadProduct(productId);
  }

  loadProduct(id: string | null): void {
    // Mock product data - replace with actual service call
    this.product = {
      id: 1,
      name: 'iPhone 15 Plus',
      currentPrice: 69900,
      originalPrice: 89900,
      discount: 22,
      images: [
        'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
        // Add more images
      ],
      colors: [
        { name: 'black', hex: '#000000' },
        { name: 'blue', hex: '#007AFF' },
        { name: 'green', hex: '#34C759' },
        { name: 'pink', hex: '#FF69B4' },
        { name: 'yellow', hex: '#FFD60A' }
      ],
      storageOptions: [
        { size: '128GB', price: 69900 },
        { size: '256GB', price: 79900 },
        { size: '512GB', price: 99900 }
      ]
    };
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  selectColor(color: string): void {
    this.selectedColor = color;
  }

  selectStorage(storage: StorageOption): void {
    this.selectedStorage = storage.size;
    this.finalPrice = storage.price * this.quantity;
  }

  increaseQuantity(): void {
    this.quantity++;
    this.updateFinalPrice();
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateFinalPrice();
    }
  }

  updateFinalPrice(): void {
    const selectedStorageOption = this.product?.storageOptions.find(s => s.size === this.selectedStorage);
    if (selectedStorageOption) {
      this.finalPrice = selectedStorageOption.price * this.quantity;
    }
  }

  addToCart(): void {
    console.log('Added to cart:', {
      product: this.product?.name,
      color: this.selectedColor,
      storage: this.selectedStorage,
      quantity: this.quantity,
      totalPrice: this.finalPrice
    });
  }
}
