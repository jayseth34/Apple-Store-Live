export interface NavMenuItem {
  id: number;
  menuId: number;
  name: string;
  categorySlug: string;
  order: number;
  isActive: boolean;
  backgroundImage?: string;
  categoryDescription?: string;
  categoryButtonText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NavMenu {
  id: number;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  items: NavMenuItem[];
  createdAt: string;
  updatedAt: string;
}
