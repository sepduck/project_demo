import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  items: MenuItem[] = [];
  constructor(public authService: AuthService) { }

  isCollapsed: boolean = false;
  isSubMenuOpen: boolean = true;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed && this.isSubMenuOpen) {
      this.isSubMenuOpen = true;
    }
  }

  toggleSubMenu() {
    this.isSubMenuOpen = !this.isSubMenuOpen;
  }
}
