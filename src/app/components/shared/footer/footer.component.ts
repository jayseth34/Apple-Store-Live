import { Component, OnInit } from '@angular/core';
import { NavMenuService } from '../../../services/nav-menu.service';
import { NavMenuItem } from '../../../models/nav-menu';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  categoryLinks: NavMenuItem[] = [];

  constructor(private navMenuSvc: NavMenuService) {}

  ngOnInit(): void {
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
        this.categoryLinks = items;
      },
      error: () => { /* keep static fallback empty — footer still renders */ }
    });
  }
}
