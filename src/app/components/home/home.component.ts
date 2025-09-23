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
  id: number;
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
  dealsScrollDots: number[] = [];

  // Hero Data
  heroData = {
    large: {
      title: 'Apple MacBook',
      description: 'Built for Apple Intelligence.<br>Starting From ₹119900.00*',
      buttonText: 'View Details'
    },
    medium: {
      title: 'iPhone 16 Pro',
      description: 'Built for Apple Intelligence. Starting From ₹119900.00*',
      buttonText: 'Shop Now'
    },
    small1: {
      title: 'Apple Watch Ultra 2',
      description: 'New finish. Never quit. Starting From ₹89900.00*',
      buttonText: 'Shop Now',
      background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      color: 'white'
    },
    small2: {
      title: 'iPad Air',
      description: 'Unleash your creativity with the iPad. Starting From ₹59900.00*',
      buttonText: 'Shop Now',
      background: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)',
      color: 'white'
    },
    small3: {
      title: 'iPad Air',
      description: 'Unleash your creativity with the iPad. Starting From ₹59900.00*',
      buttonText: 'Shop Now',
      background: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)',
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
  ];

  // Enhanced Categories with proper background images
  categories: Category[] = [
    {
      id: 1,
      name: 'iPhones',
      description: 'Experience the power of iPhone with cutting-edge technology, stunning cameras, and lightning-fast performance.',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=1200&fit=crop&crop=center',
      icon: 'fas fa-mobile-alt',
      displayText: 'iPHONE'
    },
    {
      id: 2,
      name: 'iPad',
      description: 'Unleash your creativity with the iPad—powerful performance, stunning display, and all-day battery life. Perfect for work, play, and everything in between!',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=1200&fit=crop&crop=center',
      icon: 'fas fa-tablet-alt',
      displayText: 'iPAD'
    },
    {
      id: 3,
      name: 'MacBook',
      description: 'Power through your day with MacBook - featuring M-series chips, all-day battery life, and stunning Retina displays.',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=1200&fit=crop&crop=center',
      icon: 'fas fa-laptop',
      displayText: 'MacBook'
    },
    {
      id: 4,
      name: 'Apple Watch',
      description: 'Stay connected and healthy with Apple Watch - your ultimate companion for fitness, communication, and style.',
      buttonText: 'Shop Now',
      backgroundImage: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=1200&fit=crop&crop=center',
      icon: 'fas fa-clock',
      displayText: 'WATCH'
    }
  ];

  // Top Picks
  topPicksTitle = {
    main: 'Top picks,',
    subtitle: 'discover our best selling favourites today.'
  };

  topPicks = [
    {
      id: 1,
      name: 'iPhone 16 Pro',
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      category: 'phones',
      badge: '',
      currentPrice: 119900,
      originalPrice: 129900
    },
    {
      id: 2,
      name: 'iPad Air M2',
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      category: 'tablets',
      badge: 'Popular',
      currentPrice: 59900,
      originalPrice: 64900
    },
    {
      id: 3,
      name: 'MacBook Air M3',
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      category: 'laptops',
      badge: 'Best Seller',
      currentPrice: 114900,
      originalPrice: 119900
    },
    {
      id: 4,
      name: 'AirPods Pro 2',
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      category: 'audio',
      badge: 'Hot',
      currentPrice: 24900,
      originalPrice: 26900
    },
    {
      id: 5,
      name: 'Apple Watch Series 10',
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      category: 'watches',
      badge: 'Latest',
      currentPrice: 46900,
      originalPrice: 49900
    },
    {
      id: 6,
      name: 'Magic Keyboard',
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      category: 'accessories',
      badge: 'Premium',
      currentPrice: 10900,
      originalPrice: 11900
    }
  ];

  // Featured Product
  featuredProduct = {
    id: 1,
    subtitle: 'New Camera New Design',
    title: 'iPhone 16 Pro Max',
    description: 'Titanium. So Strong. So Light. So Pro.',
    buttonText: 'Shop Now',
    image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg'
  };

  // Hot Deals
  hotDealsTitle = {
    main: 'Hot Deals,',
    subtitle: 'take a look at what\'s trending, right now.'
  };

  hotDeals: Product[] = [
    {
      id: 1,
      name: 'Apple MacBook Air Laptop',
      category: 'Hot Deals, MacBook',
      description: 'Apple MacBook Air Laptop: Apple M1 chip, 13.3-inch/33.74 cm Retina Display, 8GB RAM, 256GB SSD Storage',
      currentPrice: 54900,
      originalPrice: 89900,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: '-39%'
    },
    {
      id: 2,
      name: 'Apple iPad Air M2',
      category: 'Hot Deals, iPad',
      description: 'Apple iPad Air M2',
      currentPrice: 54900,
      originalPrice: 64900,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: '-17%'
    },
    {
      id: 3,
      name: 'Apple MacBook Air 13(16GB, 256GB SSD)',
      category: 'Hot Deals, MacBook',
      currentPrice: 79900,
      originalPrice: 89900,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: 'Sale!'
    },
    {
      id: 4,
      name: 'Apple Watch Series 10 GPS+Cellular with Sport Band',
      category: '10 Series, Watches',
      currentPrice: 79900,
      originalPrice: 84900,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: 'Sale!'
    }
  ];

  // Some Products
  someProductsTitle = 'Some products';
  someProducts: Product[] = [
    {
      id: 1,
      name: 'iPhone 16',
      category: 'iPhone, iPhone 16',
      currentPrice: 69900,
      originalPrice: 103200,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: 'Sale!'
    },
    {
      id: 2,
      name: 'iPhone 16 Pro',
      category: 'iPhone, iPhone 16 pro',
      currentPrice: 109900,
      originalPrice: 159900,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: 'Sale!'
    }
  ];

  // Accessories Section
  accessoriesCards = [
    {
      categoryId: 7,
      title: 'Accessories',
      description: 'Apple accessories enhance your devices with premium design, seamless integration, and advanced functionality.',
      buttonText: 'Shop Now'
    },
    {
      categoryId: 5,
      title: 'AirPods',
      description: 'Experience exceptional sound quality and seamless connectivity with Apple AirPods.',
      buttonText: 'Explore'
    }
  ];

  // Sidebar Data
  sidebarData = {
    image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
    imageAlt: 'AppleCare',
    menuItems: [
      { id: 0, name: 'All Categories', icon: 'fas fa-list' },
      { id: 1, name: 'iPhones', icon: 'fas fa-mobile-alt' },
      { id: 2, name: 'MacBook', icon: 'fas fa-laptop' },
      { id: 3, name: 'iPads', icon: 'fas fa-tablet-alt' },
      { id: 4, name: 'CTO', icon: 'fas fa-cogs' },
      { id: 5, name: 'AirPods', icon: 'fas fa-headphones' },
      { id: 6, name: 'watches', icon: 'fas fa-clock' },
      { id: 7, name: 'Accessories', icon: 'fas fa-keyboard' }
    ]
  };

  // Best Selling
  bestSellingTitle = 'Best-selling products';
  bestSellingProducts: Product[] = [
    {
      id: 1,
      name: 'Apple iPhone 16',
      category: 'iPhone, iPhone 16',
      currentPrice: 69900,
      originalPrice: 103200,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: 'Sale!'
    },
    {
      id: 2,
      name: 'Apple iPhone 16 pro',
      category: 'iPhone, iPhone 16 pro',
      currentPrice: 109900,
      originalPrice: 159900,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: 'Sale!'
    },
    {
      id: 3,
      name: 'Apple iPhone 15',
      category: 'iPhone, iPhone 15',
      currentPrice: 61900,
      originalPrice: 89900,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: 'Sale!'
    },
    {
      id: 4,
      name: '60W USB-C To C Charge Cable (1m)',
      category: 'Accessories',
      currentPrice: 1805,
      originalPrice: 1900,
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      badge: '-5%'
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
      name: 'John Doe',
      testimonial: 'The service was outstanding. I am very happy with my new MacBook Air. The whole process was smooth and easy. Highly recommend!',
      status: 'Verified Customer'
    },
    {
      type: 'image',
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      title: 'NEW IPHONE 16 PLUS',
      description: 'Customer feedback...'
    },
    {
      type: 'image',
      image: 'https://images.macrumors.com/t/SmIQxxD8PeNRatir3RFKfqT519g=/3532x/article-new/2023/09/iPhone-16-Side-2-Feature.jpg',
      title: 'HAPPY CUSTOMER NEW MACBOOK AIR M1',
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

  navigateToCategory(categoryId: number): void {
    this.router.navigate(['/products'], { queryParams: { category: categoryId } });
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
  onCategoryHover(categoryId: number): void {
    const categoryCard = document.querySelector(`[data-category="${categoryId}"]`) as HTMLElement;
    if (categoryCard) {
      categoryCard.classList.add('hovered');
    }
  }

  onCategoryLeave(categoryId: number): void {
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
