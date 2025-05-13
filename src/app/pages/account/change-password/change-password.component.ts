import { CHANGE_PASSWORD_FAILED, CHANGE_PASSWORD_SUCCESS, CURRENT_PASSWORD_REQUIRED, NEW_PASSWORD_CONFIRM_MISMATCH, NEW_PASSWORD_NOT_SAME_AS_OLD, NEW_PASSWORD_REQUIRED } from './../../../constants/error-message';
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
          this.alertService.success(CHANGE_PASSWORD_SUCCESS)
          this.router.navigate([LOGIN]);
        } else if (res.code === 4004) {
          this.errors.currentPassword = res.message
        } else if (res.code === 400) {
          this.errors.newPassword = res.message
        } else {
          this.alertService.error(CHANGE_PASSWORD_FAILED);
          console.log(res.message);

        }
      },
      error: (err) => {
        this.errorMessage = CHANGE_PASSWORD_FAILED;
      }
    });
  }

  validatePasswords(): boolean {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch = true;
      this.errors.confirmPassword = NEW_PASSWORD_CONFIRM_MISMATCH;
      return false;
    }

    if (!this.currentPassword) {
      this.errors.currentPassword = CURRENT_PASSWORD_REQUIRED;
      return false;
    }

    if (!this.newPassword) {
      this.errors.newPassword = NEW_PASSWORD_REQUIRED;
      return false;
    }

    if (this.currentPassword === this.newPassword) {
      this.errors.newPassword = NEW_PASSWORD_NOT_SAME_AS_OLD;
      return false;
    }

    this.passwordMismatch = false;
    this.errorMessage = '';
    return true;
  }
}
