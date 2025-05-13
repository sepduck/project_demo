import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormInputComponent } from '../common/form-input/form-input.component';
import { ButtonModule } from 'primeng/button';
import { LOGIN } from '../../constants/path-valiable';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import { Toolbar } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { ChangePasswordComponent } from '../../pages/account/change-password/change-password.component';
import { ProfileComponent } from '../../pages/account/profile/profile.component';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [ProfileComponent, ChangePasswordComponent, CommonModule, FormsModule, ButtonModule, Toolbar, AvatarModule, OverlayPanelModule, DialogModule, PasswordModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  rolesSelect: any[] = [];
  activeTab: string = 'tab1';
  showAdvancedFilter: boolean = false;

  id!: number;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  phoneNumber: string = '';
  verifyToken: boolean = false;
  thumbnail: string = '';
  isRandomPassword: boolean = false;
  errorMessage: string = '';
  mustChangePassword: boolean = false;
  isAction: boolean = false;
  isLockedOut: boolean = false;
  previewImageUrl: string | ArrayBuffer | null = null;
  roleName: string = '';
  isSubmitting: boolean = false;
  baseImageUrl: string = 'http://localhost:5293/api/v1/images/view/';
  defaultImageUrl: string = '/images/default-profile-picture.png';

  currentPassword: string = '';
  newPassword: string = '';

  isPasswordVisible: boolean = false;
  isNewPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  passwordMismatch: boolean = false;

  errors: {
    currentPassword?: string;
    newPassword?: string,
    confirmPassword?: string
  } = {}

  isProfile: boolean = false;
  visible: boolean = false;
  isDarkMode = false;
  showDialog() { this.visible = true; }
  showProfile() { this.isProfile = true }

  constructor(private http: HttpClient, private authService: AuthService, private router: Router, private userService: UserService, private alertService: AlertService, private themeService: ThemeService) { }
  ngOnInit(): void {
    this.getUserDetail();
    this.themeService.initializeTheme();
    this.isDarkMode = this.themeService.getIsDarkMode();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
  onProfileUpdateSuccess() {
    this.isProfile = false;
    this.getUserDetail();
  }
  get avatarImage(): string {
    return typeof this.previewImageUrl === 'string'
      ? this.previewImageUrl
      : this.defaultImageUrl;
  }
  getUserDetail(): void {
    this.userService.getCurrentUser().subscribe({
      next: (res) => {
        if (res.code === 200) {
          const user = res.result;
          this.id = user.id;
          this.firstName = user.firstName;
          this.lastName = user.lastName;
          this.email = user.email;
          this.username = user.username;
          this.phoneNumber = user.phoneNumber ?? '';
          this.thumbnail = user.thumbnail ?? '';
          this.verifyToken = user.verifyToken;
          this.isRandomPassword = user.isRandomPassword;
          this.mustChangePassword = user.mustChangePassword;
          this.isAction = user.isAction;
          this.isLockedOut = user.isLockedOut;
          this.roleName = user.roleName
          if (user.thumbnail) {
            const isFullUrl = user.thumbnail.startsWith('https://') || user.thumbnail.startsWith('http://');
            this.previewImageUrl = isFullUrl ? user.thumbnail : this.baseImageUrl + user.thumbnail;
          }
        }
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải thông tin người dùng: ' + err.message;
      }
    });
  }

  changePassword(): void {
    this.errorMessage = '';
    if (!this.validatePasswords()) {
      return;
    }
    this.userService.changePassword(this.currentPassword, this.newPassword,).subscribe({
      next: (res) => {
        if (res.code === 200) {
          const closeButton = document.querySelector('#changePassword .btn-close') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
          this.alertService.success("Thay đổi mật khẩu thành công!")
          this.router.navigate([LOGIN]);
        } else if (res.code === 4004) {
          this.errors.currentPassword = res.message
        } else if (res.code === 400) {
          this.errors.newPassword = res.message
        } else {
          this.alertService.error('Thay đổi mật khẩu thất bại!');
          console.log(res.message);

        }
      },
      error: (err) => {
        this.errorMessage = 'Lỗi thay đổi mật khẩu : ' + err.message;
      }
    });
  }
  validatePasswords(): boolean {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch = true;
      this.errors.confirmPassword = 'Mật khẩu mới và nhập lại mật khẩu không khớp';
      return false;
    }

    if (!this.currentPassword) {
      this.errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
      return false;
    }

    if (!this.newPassword) {
      this.errors.newPassword = 'Vui lòng nhập mật khẩu mới';
      return false;
    }

    if (this.currentPassword === this.newPassword) {
      this.errors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
      return false;
    }

    this.passwordMismatch = false;
    this.errorMessage = '';
    return true;
  }


  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('jwtToken')
        this.router.navigate([LOGIN])
      },
      error: err => {
        localStorage.removeItem('token');
        this.router.navigate([LOGIN]);
      }
    })
  }
}
