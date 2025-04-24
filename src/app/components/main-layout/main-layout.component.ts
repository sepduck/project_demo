import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { ToastModule } from 'primeng/toast'
@Component({
  selector: 'app-main-layout',
  imports: [SidebarComponent, RouterModule, NavbarComponent, ToastModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',

})
export class MainLayoutComponent {

}
