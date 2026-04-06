import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

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
  ];  // Enhanced Categories (initial phase: accessories)
  categories: Category[] = [
    {
      id: 'power bank',
      name: 'Power Bank',
      description: 'Charge anywhere with affordable power banks.',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1616427592793-3c1f06f3a2c3?w=800&h=1200&fit=crop&crop=center',
      displayText: 'POWER'
    },
    {
      id: 'covers',
      name: 'Covers',
      description: 'Protect your device with low-cost cases and covers.',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1603317575587-6c5c5f2f1b8c?w=800&h=1200&fit=crop&crop=center',
      displayText: 'COVERS'
    },
    {
      id: 'keyboard',
      name: 'Keyboard',
      description: 'Wireless keyboards for tablets and laptops.',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=1200&fit=crop&crop=center',
      displayText: 'KEYS'
    },
    {
      id: 'mouse',
      name: 'Mouse',
      description: 'Comfortable mice for work and gaming.',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&h=1200&fit=crop&crop=center',
      displayText: 'MOUSE'
    },
    {
      id: 'pencil',
      name: 'Pencil',
      description: 'Affordable stylus options for tablets.',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800&h=1200&fit=crop&crop=center',
      displayText: 'PENCIL'
    },
    {
      id: 'airpods',
      name: 'AirPods',
      description: 'Budget earbuds for everyday listening.',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1585386959984-a4155223168e?w=800&h=1200&fit=crop&crop=center',
      displayText: 'AUDIO'
    },
    {
      id: 'whoop',
      name: 'Whoop',
      description: 'Fitness bands and trackers on a budget.',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800&h=1200&fit=crop&crop=center',
      displayText: 'FIT'
    },
    {
      id: 'controller',
      name: 'Controller',
      description: 'Bluetooth controllers for mobile and tablets.',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=1200&fit=crop&crop=center',
      displayText: 'PLAY'
    }
  ];  // Top Picks
  topPicksTitle = {
    main: 'Top picks,',
    subtitle: 'our best selling accessories right now.'
  };

  topPicks = [
    {
      id: 1,
      name: 'MagSafe Power Bank (Compatible)',
      image: 'https://images.unsplash.com/photo-1616427592793-3c1f06f3a2c3?w=1200&fit=crop&crop=center',
      category: 'power bank',
      badge: 'Deal',
      currentPrice: 1999,
      originalPrice: 2499
    },
    {
      id: 2,
      name: 'Silicone Case Cover',
      image: 'https://images.unsplash.com/photo-1603317575587-6c5c5f2f1b8c?w=1200&fit=crop&crop=center',
      category: 'covers',
      badge: 'Popular',
      currentPrice: 599,
      originalPrice: 999
    },
    {
      id: 3,
      name: 'Wireless Keyboard (Mac Layout)',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&fit=crop&crop=center',
      category: 'keyboard',
      badge: 'Top',
      currentPrice: 1499,
      originalPrice: 1999
    },
    {
      id: 4,
      name: 'Wireless Mouse',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200&fit=crop&crop=center',
      category: 'mouse',
      badge: 'Value',
      currentPrice: 999,
      originalPrice: 1299
    },
    {
      id: 5,
      name: 'Stylus Pencil (Compatible)',
      image: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=1200&fit=crop&crop=center',
      category: 'pencil',
      badge: 'New',
      currentPrice: 1299,
      originalPrice: 1799
    },
    {
      id: 6,
      name: 'True Wireless Earbuds',
      image: 'https://images.unsplash.com/photo-1585386959984-a4155223168e?w=1200&fit=crop&crop=center',
      category: 'airpods',
      badge: 'Hot',
      currentPrice: 1799,
      originalPrice: 2499
    }
  ];
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

  hotDeals: Product[] = [
    {
      id: 2,
      name: 'Silicone Case Cover',
      category: 'Covers',
      description: 'Soft-touch case cover with comfortable grip.',
      currentPrice: 599,
      originalPrice: 999,
      image: 'https://images.unsplash.com/photo-1603317575587-6c5c5f2f1b8c?w=1200&fit=crop&crop=center',
      badge: '-40%'
    },
    {
      id: 3,
      name: 'Wireless Keyboard (Mac Layout)',
      category: 'Keyboard',
      description: 'Compact wireless keyboard for tablets and laptops.',
      currentPrice: 1499,
      originalPrice: 1999,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&fit=crop&crop=center',
      badge: '-25%'
    },
    {
      id: 4,
      name: 'Wireless Mouse',
      category: 'Mouse',
      description: 'Ergonomic mouse for work and daily browsing.',
      currentPrice: 999,
      originalPrice: 1299,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200&fit=crop&crop=center',
      badge: '-23%'
    },
    {
      id: 6,
      name: 'True Wireless Earbuds',
      category: 'Audio',
      description: 'Budget earbuds with charging case and clear sound.',
      currentPrice: 1799,
      originalPrice: 2499,
      image: 'https://images.unsplash.com/photo-1585386959984-a4155223168e?w=1200&fit=crop&crop=center',
      badge: '-28%'
    }
  ];
  // Some Products
  someProductsTitle = 'Some products';
  someProducts: Product[] = [
    {
      id: 1,
      name: 'MagSafe Power Bank (Compatible)',
      category: 'Power',
      currentPrice: 1999,
      originalPrice: 2499,
      image: 'https://images.unsplash.com/photo-1616427592793-3c1f06f3a2c3?w=1200&fit=crop&crop=center',
      badge: 'Deal'
    },
    {
      id: 5,
      name: 'Stylus Pencil (Compatible)',
      category: 'Pencil',
      currentPrice: 1299,
      originalPrice: 1799,
      image: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=1200&fit=crop&crop=center',
      badge: 'New'
    }
  ];
  // Accessories Section
  accessoriesCards = [
    {
      categoryId: 'covers',
      title: 'Covers & Cases',
      description: 'Everyday protection with clean looks and comfortable grip.',
      buttonText: 'Shop Covers'
    },
    {
      categoryId: 'airpods',
      title: 'Audio Essentials',
      description: 'Budget earbuds for calls, music and workouts.',
      buttonText: 'Explore Audio'
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
  bestSellingProducts: Product[] = [
    {
      id: 2,
      name: 'Silicone Case Cover',
      category: 'Covers',
      currentPrice: 599,
      originalPrice: 999,
      image: 'https://images.unsplash.com/photo-1603317575587-6c5c5f2f1b8c?w=1200&fit=crop&crop=center',
      badge: 'Top'
    },
    {
      id: 1,
      name: 'MagSafe Power Bank (Compatible)',
      category: 'Power',
      currentPrice: 1999,
      originalPrice: 2499,
      image: 'https://images.unsplash.com/photo-1616427592793-3c1f06f3a2c3?w=1200&fit=crop&crop=center',
      badge: 'Deal'
    },
    {
      id: 6,
      name: 'True Wireless Earbuds',
      category: 'Audio',
      currentPrice: 1799,
      originalPrice: 2499,
      image: 'https://images.unsplash.com/photo-1585386959984-a4155223168e?w=1200&fit=crop&crop=center',
      badge: 'Hot'
    },
    {
      id: 3,
      name: 'Wireless Keyboard (Mac Layout)',
      category: 'Keyboard',
      currentPrice: 1499,
      originalPrice: 1999,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&fit=crop&crop=center',
      badge: 'Popular'
    }
  ];
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

  constructor(private router: Router) {
    // Initialize scroll dots
    this.scrollDots = Array.from({ length: Math.ceil(this.topPicks.length / 3) }, (_, i) => i);
  }

  ngOnInit(): void {
    this.initData();
    this.initAnimations();
    this.dealsScrollDots = Array.from({ length: Math.ceil(this.hotDeals.length / 3) }, (_, i) => i);

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
