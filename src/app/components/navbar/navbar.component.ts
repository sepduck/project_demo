import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormInputComponent } from '../common/form-input/form-input.component';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule, FormInputComponent],
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


  constructor(private http: HttpClient, private authService: AuthService, private router: Router, private userService: UserService) { }
  ngOnInit(): void {
    this.getUserDetail();
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
          if (user.thumbnail) { this.previewImageUrl = this.baseImageUrl + user.thumbnail; }
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
    console.log(this.currentPassword, this.newPassword);

    this.userService.changePassword(this.currentPassword, this.newPassword,).subscribe({
      next: (res) => {
        if (res.code === 200) {
          const closeButton = document.querySelector('#changePassword .btn-close') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
          alert('Thay đổi mật khẩu thành công!');
          this.router.navigate(['/account/login']);
        } else {
          this.errorMessage = 'Thay đổi mật khẩu thất bại!';
        }
      },
      error: (err) => {
        this.errorMessage = 'Lỗi thay đổi mật khẩu : ' + err.message;
      }
    });
  }
  validatePasswords(): boolean {
    // Kiểm tra nếu mật khẩu mới và xác nhận mật khẩu khớp nhau
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch = true;
      this.errors.confirmPassword = 'Mật khẩu mới và nhập lại mật khẩu không khớp';
      return false;
    }

    // Kiểm tra nếu mật khẩu hiện tại trống
    if (!this.currentPassword) {
      this.errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
      return false;
    }

    // Kiểm tra nếu mật khẩu mới trống
    if (!this.newPassword) {
      this.errors.newPassword = 'Vui lòng nhập mật khẩu mới';
      return false;
    }

    // Kiểm tra nếu mật khẩu mới giống mật khẩu cũ
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
        this.router.navigate(['account/login'])
      },
      error: err => {
        console.error('Logout failed:', err);
        localStorage.removeItem('token');
        this.router.navigate(['account/login']);
      }
    })
  }
}
