import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from '../../services/products.service';
import { NavMenuService } from '../../services/nav-menu.service';
import { NavMenuItem } from '../../models/nav-menu';
import { Product as ApiProduct, fallbackImageForCategory, paiseToInr } from '../../models/product';
import { environment } from '../../../environments/environment';

interface Product {
  id: number;
  name: string;
  category: string;
  description?: string;
  currentPrice: number;
  originalPrice?: number;
  image: string;
  badge: string;
}

interface Category {
  id: string | number;
  name: string;
  description: string;
  buttonText: string;
  backgroundImage: string;
  icon?: string;
  displayText?: string;
}

interface Feature {
  icon: string;
  title: string;
}

interface Customer {
  type: 'testimonial' | 'image';
  name?: string;
  testimonial?: string;
  status?: string;
  image?: string;
  title?: string;
  description?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('picksScroll', { static: false }) picksScrollElement!: ElementRef;

  private intersectionObserver!: IntersectionObserver;
  activeScrollIndex = 0;
  scrollDots: number[] = [];
  @ViewChild('dealsScroll', { static: false }) dealsScrollElement!: ElementRef;
  activeDealsScrollIndex = 0;
  dealsScrollDots: number[] = [];  // Hero Data
  heroData = {
    large: {
      title: 'Apple Accessories',
      description: 'Low-cost essentials for your devices.<br>Power banks, covers, keyboards, mice and more.',
      buttonText: 'Browse Products'
    },
    medium: {
      title: 'Weekly Deals',
      description: 'Save big on everyday accessories - limited stock, updated regularly.',
      buttonText: 'Shop Now'
    },
    small1: {
      title: 'Fast Charging',
      description: 'Power banks and charging essentials for daily use.',
      buttonText: 'Shop Power',
      background: 'linear-gradient(135deg, rgba(9, 132, 227, 0.85) 0%, rgba(9, 132, 227, 0.45) 100%), url(https://images.unsplash.com/photo-1616427592793-3c1f06f3a2c3?auto=format&fit=crop&w=1400&q=80)',
      color: 'white'
    },
    small2: {
      title: 'Protection',
      description: 'Covers and cases to keep your device safe.',
      buttonText: 'Shop Covers',
      background: 'linear-gradient(135deg, rgba(253, 121, 168, 0.75) 0%, rgba(253, 203, 110, 0.45) 100%), url(https://images.unsplash.com/photo-1603317575587-6c5c5f2f1b8c?auto=format&fit=crop&w=1400&q=80)',
      color: 'white'
    },
    small3: {
      title: 'Audio & Fitness',
      description: 'Earbuds and fitness bands on a budget.',
      buttonText: 'Explore',
      background: 'linear-gradient(135deg, rgba(0, 184, 148, 0.75) 0%, rgba(0, 184, 148, 0.35) 100%), url(https://images.unsplash.com/photo-1585386959984-a4155223168e?auto=format&fit=crop&w=1400&q=80)',
      color: 'white'
    }
  };
  // Features
  features: Feature[] = [
    { icon: 'fas fa-shipping-fast', title: 'Fast Shipping' },
    { icon: 'fas fa-shield-alt', title: 'Secure Payment' },
    { icon: 'fas fa-headset', title: '24/7 Support' },
    { icon: 'fas fa-undo', title: 'Easy Returns' },
    { icon: 'fas fa-medal', title: 'Best Quality' }
  ];  // Categories — populated dynamically from nav menu items
  categories: Category[] = [];  // Top Picks
  topPicksTitle = {
    main: 'Top picks,',
    subtitle: 'our best selling accessories right now.'
  };

  // Top Picks — populated dynamically from products with isTopPick=true
  topPicks: Product[] = [];
  // Featured Product
  featuredProduct = {
    id: 1,
    subtitle: 'Limited stock',
    title: 'MagSafe Power Bank (Compatible)',
    description: 'Snap-on charging for your daily commute and travel.',
    buttonText: 'Buy Now',
    image: 'https://images.unsplash.com/photo-1616427592793-3c1f06f3a2c3?w=1400&fit=crop&crop=center'
  };
  // Hot Deals
  hotDealsTitle = {
    main: 'Hot Deals,',
    subtitle: 'grab these accessories before they sell out.'
  };

  // Hot Deals — populated dynamically from products with isHotDeal=true
  hotDeals: Product[] = [];
  // Some Products — first 2 hot deals (or top picks as fallback)
  someProductsTitle = 'Featured';
  someProducts: Product[] = [];
  // Accessories Section
  // Accessories Section
  // Accessories Section
  accessoriesCards = [
    {
      categoryId: 'covers',
      title: 'Covers & Cases',
      description: 'Everyday protection with clean looks and comfortable grip.',
      buttonText: 'Shop Covers',
      image: 'https://images.unsplash.com/photo-1603317575587-6c5c5f2f1b8c?auto=format&fit=crop&w=1600&q=80'
    },
    {
      categoryId: 'airpods',
      title: 'Audio Essentials',
      description: 'Budget earbuds for calls, music and workouts.',
      buttonText: 'Explore Audio',
      image: 'https://images.unsplash.com/photo-1585386959984-a4155223168e?auto=format&fit=crop&w=1600&q=80'
    }
  ];
  // Sidebar Data
  sidebarData = {
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200&fit=crop&crop=center',
    imageAlt: 'Accessories',
    menuItems: [
      { id: 'power bank', name: 'Power Bank', icon: 'fas fa-bolt' },
      { id: 'covers', name: 'Covers', icon: 'fas fa-shield-alt' },
      { id: 'keyboard', name: 'Keyboard', icon: 'fas fa-keyboard' },
      { id: 'mouse', name: 'Mouse', icon: 'fas fa-mouse' },
      { id: 'pencil', name: 'Pencil', icon: 'fas fa-pen' },
      { id: 'airpods', name: 'Audio', icon: 'fas fa-headphones' },
      { id: 'whoop', name: 'Fitness', icon: 'fas fa-heartbeat' },
      { id: 'controller', name: 'Controller', icon: 'fas fa-gamepad' }
    ]
  };
  // Best Selling
  bestSellingTitle = 'Best-selling products';
  // Customers
  customersTitle = {
    main: 'Happy',
    highlight: 'Customers'
  };

  customers: Customer[] = [
    {
      type: 'testimonial',
      name: 'Verified Buyer',
      testimonial: 'Great quality for the price. The cover fits perfectly and delivery was quick.',
      status: 'Verified Customer'
    },
    {
      type: 'image',
      image: 'https://images.unsplash.com/photo-1603317575587-6c5c5f2f1b8c?w=1200&fit=crop&crop=center',
      title: 'NEW COVER ARRIVAL',
      description: 'Customer feedback...'
    },
    {
      type: 'image',
      image: 'https://images.unsplash.com/photo-1585386959984-a4155223168e?w=1200&fit=crop&crop=center',
      title: 'EARBUDS DELIVERED',
      description: 'Customer feedback...'
    }
  ];
  // WhatsApp
  whatsappLink = 'https://wa.me/1234567890';
  whatsappText = 'Contact Us';

  // Best Selling — dynamic
  navCategoryItems: NavMenuItem[] = [];
  selectedBsCategory: string | null = null;
  allBestSelling: Product[] = [];
  bestSellingLoaded = false;

  get filteredBestSelling(): Product[] {
    if (!this.selectedBsCategory) return this.allBestSelling;
    return this.allBestSelling.filter(
      (p) => p.category.toLowerCase() === this.selectedBsCategory!.toLowerCase()
    );
  }

  selectBsCategory(slug: string | null): void {
    this.selectedBsCategory = slug;
  }

  iconForCategory(slug: string): string {
    const map: Record<string, string> = {
      'power bank': 'fas fa-bolt',
      'covers': 'fas fa-shield-alt',
      'keyboard': 'fas fa-keyboard',
      'mouse': 'fas fa-mouse',
      'pencil': 'fas fa-pen',
      'airpods': 'fas fa-headphones',
      'whoop': 'fas fa-heartbeat',
      'controller': 'fas fa-gamepad',
      'macbook': 'fas fa-laptop',
      'mac mini': 'fas fa-desktop',
      'iphone': 'fas fa-mobile-alt',
      'ipad': 'fas fa-tablet-alt',
      'accessories': 'fas fa-star'
    };
    return map[slug.toLowerCase()] || 'fas fa-tag';
  }

  constructor(private router: Router, private productsApi: ProductsService, private navMenuSvc: NavMenuService) {
    // Initialize scroll dots
    this.refreshPicksDots();
  }

  ngOnInit(): void {
    this.initData();
    this.initAnimations();
    this.loadTopPicks();
    this.loadHotDeals();
    this.loadNavCategories();
    this.loadBestSelling();
  }

  ngAfterViewInit(): void {
    this.initPicksScrollListener();
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  async initData(): Promise<void> {
    // Replace these with actual API calls
    // this.heroData = await this.apiService.getHeroData();
    // this.features = await this.apiService.getFeatures();
    // this.categories = await this.apiService.getCategories();
    // this.hotDeals = await this.apiService.getHotDeals();
    // etc.
  }

  private refreshPicksDots(): void {
    this.scrollDots = Array.from({ length: Math.ceil(this.topPicks.length / 3) }, (_, i) => i);
  }

  private imageUrlForProduct(p: ApiProduct): string {
    if (!p.imagePath) return fallbackImageForCategory(p.category);
    if (p.imagePath.startsWith('http')) return p.imagePath;
    if (p.imagePath.startsWith('/')) return `${environment.apiBaseUrl}${p.imagePath}`;
    return `${environment.apiBaseUrl}/${p.imagePath}`;
  }

  private readonly categoryFallbackImages: Record<string, string> = {
    'power bank': 'https://images.unsplash.com/photo-1616427592793-3c1f06f3a2c3?w=800&h=1200&fit=crop&crop=center',
    'covers': 'https://images.unsplash.com/photo-1603317575587-6c5c5f2f1b8c?w=800&h=1200&fit=crop&crop=center',
    'keyboard': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=1200&fit=crop&crop=center',
    'mouse': 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&h=1200&fit=crop&crop=center',
    'pencil': 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800&h=1200&fit=crop&crop=center',
    'airpods': 'https://images.unsplash.com/photo-1585386959984-a4155223168e?w=800&h=1200&fit=crop&crop=center',
    'whoop': 'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800&h=1200&fit=crop&crop=center',
    'controller': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=1200&fit=crop&crop=center',
    'macbook': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=1200&fit=crop&crop=center',
    'mac mini': 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&h=1200&fit=crop&crop=center',
    'iphone': 'https://images.unsplash.com/photo-1603317575587-6c5c5f2f1b8c?w=800&h=1200&fit=crop&crop=center',
    'ipad': 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800&h=1200&fit=crop&crop=center',
    'accessories': 'https://images.unsplash.com/photo-1585386959984-a4155223168e?w=800&h=1200&fit=crop&crop=center'
  };

  private loadNavCategories(): void {
    this.navMenuSvc.list().subscribe({
      next: (menus) => {
        const seen = new Set<string>();
        const items: NavMenuItem[] = [];
        for (const menu of menus) {
          if (!menu.isActive) continue;
          for (const item of menu.items) {
            if (!item.isActive || seen.has(item.categorySlug)) continue;
            seen.add(item.categorySlug);
            items.push(item);
          }
        }
        this.navCategoryItems = items;
        this.categories = items.map((item) => ({
          id: item.categorySlug,
          name: item.name,
          description: item.categoryDescription || 'Explore our collection.',
          buttonText: item.categoryButtonText || 'Shop Now',
          backgroundImage: item.backgroundImage || this.categoryFallbackImages[item.categorySlug.toLowerCase()] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=1200&fit=crop&crop=center',
          displayText: item.name.toUpperCase().substring(0, 6)
        }));
      },
      error: () => {}
    });
  }

  private loadBestSelling(): void {
    this.productsApi.list({ bestSelling: true }).subscribe({
      next: (products) => {
        this.allBestSelling = products.map((p) => ({
          id: p.id,
          name: p.name,
          image: this.imageUrlForProduct(p),
          category: p.category,
          badge: p.compareAtPricePaise ? 'Sale' : '',
          currentPrice: paiseToInr(p.pricePaise),
          originalPrice: p.compareAtPricePaise ? paiseToInr(p.compareAtPricePaise) : undefined
        }));
        this.bestSellingLoaded = true;
      },
      error: () => { this.bestSellingLoaded = true; }
    });
  }

  private loadTopPicks(): void {
    this.productsApi.list({ topPick: true }).subscribe({
      next: (products) => {
        if (!Array.isArray(products) || products.length === 0) return;
        this.topPicks = products.map((p) => ({
          id: p.id,
          name: p.name,
          image: this.imageUrlForProduct(p),
          category: p.category,
          badge: 'Top Pick',
          currentPrice: paiseToInr(p.pricePaise),
          originalPrice: p.compareAtPricePaise ? paiseToInr(p.compareAtPricePaise) : undefined
        }));
        this.refreshPicksDots();
      },
      error: () => {}
    });
  }

  private loadHotDeals(): void {
    this.productsApi.list({ hotDeal: true }).subscribe({
      next: (products) => {
        if (!Array.isArray(products) || products.length === 0) return;
        this.hotDeals = products.map((p) => {
          const discount = p.compareAtPricePaise
            ? Math.round((1 - p.pricePaise / p.compareAtPricePaise) * 100)
            : 0;
          return {
            id: p.id,
            name: p.name,
            image: this.imageUrlForProduct(p),
            category: p.category,
            description: p.description,
            badge: discount > 0 ? `-${discount}%` : 'Deal',
            currentPrice: paiseToInr(p.pricePaise),
            originalPrice: p.compareAtPricePaise ? paiseToInr(p.compareAtPricePaise) : undefined
          };
        });
        this.dealsScrollDots = Array.from({ length: Math.ceil(this.hotDeals.length / 3) }, (_, i) => i);
        if (this.someProducts.length === 0) {
          this.someProducts = this.hotDeals.slice(0, 2);
        }
      },
      error: () => {}
    });
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  navigateToCategory(categoryId: any): void {
    const category = typeof categoryId === "string" ? categoryId : undefined;
    this.router.navigate(["/products"], { queryParams: category ? { category } : {} });
  }

  initAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = '1';
          (entry.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Wait for DOM to be ready
    setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => {
        const element = el as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        this.intersectionObserver.observe(element);
      });
    }, 100);
  }

  // Enhanced Category Methods
  onCategoryHover(categoryId: string | number): void {
    const categoryCard = document.querySelector(`[data-category="${categoryId}"]`) as HTMLElement;
    if (categoryCard) {
      categoryCard.classList.add('hovered');
    }
  }

  onCategoryLeave(categoryId: string | number): void {
    const categoryCard = document.querySelector(`[data-category="${categoryId}"]`) as HTMLElement;
    if (categoryCard) {
      categoryCard.classList.remove('hovered');
    }
  }

  // Top Picks Scroll Methods
  scrollPicksLeft(): void {
    if (this.picksScrollElement) {
      const scrollContainer = this.picksScrollElement.nativeElement;
      scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
    }
  }

  scrollPicksRight(): void {
    if (this.picksScrollElement) {
      const scrollContainer = this.picksScrollElement.nativeElement;
      scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
    }
  }

  scrollToIndex(index: number): void {
    if (this.picksScrollElement) {
      const scrollContainer = this.picksScrollElement.nativeElement;
      const itemWidth = 308; // 280px width + 28px gap
      scrollContainer.scrollTo({ left: index * itemWidth * 3, behavior: 'smooth' });
      this.activeScrollIndex = index;
    }
  }

  private initPicksScrollListener(): void {
    if (this.picksScrollElement) {
      const scrollContainer = this.picksScrollElement.nativeElement;
      scrollContainer.addEventListener('scroll', () => {
        const itemWidth = 308; // 280px width + 28px gap
        const scrollLeft = scrollContainer.scrollLeft;
        const newIndex = Math.round(scrollLeft / (itemWidth * 3));
        this.activeScrollIndex = Math.min(newIndex, this.scrollDots.length - 1);
      });
    }
  }

  scrollDealsLeft(): void {
    if (this.dealsScrollElement) {
      const scrollContainer = this.dealsScrollElement.nativeElement;
      scrollContainer.scrollBy({ left: -340, behavior: 'smooth' });
    }
  }

  scrollDealsRight(): void {
    if (this.dealsScrollElement) {
      const scrollContainer = this.dealsScrollElement.nativeElement;
      scrollContainer.scrollBy({ left: 340, behavior: 'smooth' });
    }
  }

  scrollDealsToIndex(index: number): void {
    if (this.dealsScrollElement) {
      const scrollContainer = this.dealsScrollElement.nativeElement;
      const itemWidth = 344; // 320px width + 24px gap
      scrollContainer.scrollTo({ left: index * itemWidth * 3, behavior: 'smooth' });
      this.activeDealsScrollIndex = index;
    }
  }
}


