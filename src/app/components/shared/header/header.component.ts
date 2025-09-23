import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
  name: string;
  route: string;
  id: string;
}

interface NavigationMenus {
  iphone: MenuItem[];
  ipad: MenuItem[];
  watches: MenuItem[];
  macbook: MenuItem[];
  airpods: MenuItem[];
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  cartCount = 0;
  activeDropdown: string | null = null;
  private isMobile = false;
  
  navigationMenus: NavigationMenus = {
    iphone: [
      { name: 'iPhone 13', route: '/products/iphone-13', id: 'iphone-13' },
      { name: 'iPhone 14', route: '/products/iphone-14', id: 'iphone-14' },
      { name: 'iPhone 15', route: '/products/iphone-15', id: 'iphone-15' },
      { name: 'iPhone 15 plus', route: '/products/iphone-15-plus', id: 'iphone-15-plus' },
      { name: 'iPhone 16', route: '/products/iphone-16', id: 'iphone-16' },
      { name: 'iPhone 16 pro', route: '/products/iphone-16-pro', id: 'iphone-16-pro' },
      { name: 'iPhone 16 plus', route: '/products/iphone-16-plus', id: 'iphone-16-plus' },
      { name: 'iPhone 16 pro max', route: '/products/iphone-16-pro-max', id: 'iphone-16-pro-max' },
      { name: 'iPhone 16(e)', route: '/products/iphone-16e', id: 'iphone-16e' }
    ],
    ipad: [
      { name: 'iPad Air', route: '/products/ipad-air', id: 'ipad-air' },
      { name: 'iPad Pro 11"', route: '/products/ipad-pro-11', id: 'ipad-pro-11' },
      { name: 'iPad Pro 12.9"', route: '/products/ipad-pro-12', id: 'ipad-pro-12' },
      { name: 'iPad 10th Gen', route: '/products/ipad-10th', id: 'ipad-10th' },
      { name: 'iPad Mini', route: '/products/ipad-mini', id: 'ipad-mini' }
    ],
    watches: [
      { name: 'Apple Watch Series 9', route: '/products/watch-series-9', id: 'watch-series-9' },
      { name: 'Apple Watch Ultra 2', route: '/products/watch-ultra-2', id: 'watch-ultra-2' },
      { name: 'Apple Watch SE', route: '/products/watch-se', id: 'watch-se' },
      { name: 'Apple Watch Series 8', route: '/products/watch-series-8', id: 'watch-series-8' }
    ],
    macbook: [
      { name: 'MacBook Air M3', route: '/products/macbook-air-m3', id: 'macbook-air-m3' },
      { name: 'MacBook Air M2', route: '/products/macbook-air-m2', id: 'macbook-air-m2' },
      { name: 'MacBook Pro 14"', route: '/products/macbook-pro-14', id: 'macbook-pro-14' },
      { name: 'MacBook Pro 16"', route: '/products/macbook-pro-16', id: 'macbook-pro-16' },
      { name: 'MacBook Air 13"', route: '/products/macbook-air-13', id: 'macbook-air-13' }
    ],
    airpods: [
      { name: 'AirPods Pro 2', route: '/products/airpods-pro-2', id: 'airpods-pro-2' },
      { name: 'AirPods 3rd Gen', route: '/products/airpods-3rd', id: 'airpods-3rd' },
      { name: 'AirPods Max', route: '/products/airpods-max', id: 'airpods-max' },
      { name: 'AirPods 2nd Gen', route: '/products/airpods-2nd', id: 'airpods-2nd' }
    ]
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.checkScreenSize();
    this.initNavbar();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.activeDropdown = null;
    }
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 992;
  }

  showDropdown(category: string): void {
    if (!this.isMobile) {
      this.activeDropdown = category;
    }
  }

  hideDropdown(category: string): void {
    if (!this.isMobile) {
      setTimeout(() => {
        if (this.activeDropdown === category) {
          this.activeDropdown = null;
        }
      }, 300);
    }
  }

  toggleDropdown(category: string): void {
    if (this.isMobile) {
      this.activeDropdown = this.activeDropdown === category ? null : category;
    }
  }

  navigateToCategory(category: string): void {
    this.router.navigate(['/products'], { queryParams: { category: category } });
    this.activeDropdown = null;
  }

  navigateToProduct(route: string): void {
    this.router.navigate([route]);
    this.activeDropdown = null;
  }

  toggleSearch(): void {
    console.log('Search clicked');
  }

  openCart(): void {
    console.log('Cart opened');
  }

  private initNavbar(): void {
    window.addEventListener('scroll', () => {
      const navbar = document.querySelector('.navbar') as HTMLElement;
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.style.background = 'rgba(255, 255, 255, 0.95)';
          navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
          navbar.style.background = 'rgba(255, 255, 255, 0.8)';
          navbar.style.boxShadow = 'none';
        }
      }
    });
  }
}
