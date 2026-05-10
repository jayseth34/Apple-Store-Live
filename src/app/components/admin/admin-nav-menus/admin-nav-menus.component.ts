import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NavMenu, NavMenuItem } from "../../../models/nav-menu";
import { AdminNavMenuService } from "../../../services/admin-nav-menu.service";

interface MenuForm {
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
}

interface ItemForm {
  name: string;
  categorySlug: string;
  order: number;
  isActive: boolean;
  backgroundImage: string;
  categoryDescription: string;
  categoryButtonText: string;
}

@Component({
  selector: "app-admin-nav-menus",
  templateUrl: "./admin-nav-menus.component.html",
  styleUrls: ["./admin-nav-menus.component.scss"]
})
export class AdminNavMenusComponent implements OnInit {
  menus: NavMenu[] = [];
  loading = false;
  error: string | null = null;

  showAddMenu = false;
  addMenuForm: MenuForm = { name: "", slug: "", order: 0, isActive: true };
  addMenuLoading = false;

  editingMenuId: number | null = null;
  editMenuForm: MenuForm = { name: "", slug: "", order: 0, isActive: true };

  showAddItemForMenu: number | null = null;
  addItemForm: ItemForm = { name: "", categorySlug: "", order: 0, isActive: true, backgroundImage: "", categoryDescription: "", categoryButtonText: "" };
  addItemLoading = false;

  editingItemId: number | null = null;
  editItemForm: ItemForm = { name: "", categorySlug: "", order: 0, isActive: true, backgroundImage: "", categoryDescription: "", categoryButtonText: "" };
  editItemMenuId: number | null = null;

  constructor(private api: AdminNavMenuService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;
    this.api.list().subscribe({
      next: (menus) => { this.menus = menus; this.loading = false; },
      error: () => { this.error = "Failed to load menus"; this.loading = false; }
    });
  }

  slugify(name: string) {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  onAddMenuNameChange() {
    this.addMenuForm.slug = this.slugify(this.addMenuForm.name);
  }

  submitAddMenu() {
    if (!this.addMenuForm.name.trim()) return;
    this.addMenuLoading = true;
    this.api.createMenu(this.addMenuForm).subscribe({
      next: () => { this.addMenuLoading = false; this.showAddMenu = false; this.resetAddMenuForm(); this.load(); },
      error: () => { this.addMenuLoading = false; this.error = "Failed to create menu"; }
    });
  }

  resetAddMenuForm() {
    this.addMenuForm = { name: "", slug: "", order: 0, isActive: true };
  }

  startEditMenu(menu: NavMenu) {
    this.editingMenuId = menu.id;
    this.editMenuForm = { name: menu.name, slug: menu.slug, order: menu.order, isActive: menu.isActive };
  }

  submitEditMenu(menuId: number) {
    this.api.updateMenu(menuId, this.editMenuForm).subscribe({
      next: () => { this.editingMenuId = null; this.load(); },
      error: () => { this.error = "Failed to update menu"; }
    });
  }

  deleteMenu(menu: NavMenu) {
    if (!confirm(`Delete menu "${menu.name}" and all its items?`)) return;
    this.api.deleteMenu(menu.id).subscribe({
      next: () => this.load(),
      error: () => { this.error = "Failed to delete menu"; }
    });
  }

  toggleAddItem(menuId: number) {
    this.showAddItemForMenu = this.showAddItemForMenu === menuId ? null : menuId;
    this.addItemForm = { name: "", categorySlug: "", order: 0, isActive: true, backgroundImage: "", categoryDescription: "", categoryButtonText: "" };
  }

  onAddItemNameChange() {
    this.addItemForm.categorySlug = this.addItemForm.name.toLowerCase().trim();
  }

  submitAddItem(menuId: number) {
    if (!this.addItemForm.name.trim()) return;
    this.addItemLoading = true;
    this.api.createItem(menuId, this.addItemForm).subscribe({
      next: () => { this.addItemLoading = false; this.showAddItemForMenu = null; this.load(); },
      error: () => { this.addItemLoading = false; this.error = "Failed to create item"; }
    });
  }

  startEditItem(item: NavMenuItem, menuId: number) {
    this.editingItemId = item.id;
    this.editItemMenuId = menuId;
    this.editItemForm = {
      name: item.name,
      categorySlug: item.categorySlug,
      order: item.order,
      isActive: item.isActive,
      backgroundImage: item.backgroundImage || "",
      categoryDescription: item.categoryDescription || "",
      categoryButtonText: item.categoryButtonText || ""
    };
  }

  submitEditItem(menuId: number, itemId: number) {
    this.api.updateItem(menuId, itemId, this.editItemForm).subscribe({
      next: () => { this.editingItemId = null; this.editItemMenuId = null; this.load(); },
      error: () => { this.error = "Failed to update item"; }
    });
  }

  deleteItem(menuId: number, item: NavMenuItem) {
    if (!confirm(`Delete item "${item.name}"?`)) return;
    this.api.deleteItem(menuId, item.id).subscribe({
      next: () => this.load(),
      error: () => { this.error = "Failed to delete item"; }
    });
  }

  goProducts() {
    this.router.navigateByUrl("/admin/products");
  }

  goOrders() {
    this.router.navigateByUrl("/admin/orders");
  }
}
