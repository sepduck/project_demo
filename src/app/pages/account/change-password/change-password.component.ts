import { Component, EventEmitter, Output } from '@angular/core';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../../services/user.service';
import { AlertService } from '../../../services/alert.service';
import { Router } from '@angular/router';
import { LOGIN } from '../../../constants/path-valiable';

@Component({
  selector: 'change-password',
  imports: [FormInputComponent, ButtonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  constructor(private userService: UserService, private alertService: AlertService, private router: Router) {}
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordMismatch: boolean = false;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  @Output() cancel = new EventEmitter<void>()

  errors: {
    currentPassword?: string;
    newPassword?: string,
    confirmPassword?: string
  } = {}

  onCancelEmit() {
    this.cancel.emit()
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
}
