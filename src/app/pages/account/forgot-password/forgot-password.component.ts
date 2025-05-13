import { Component } from '@angular/core';
import { AccountFormComponent } from '../../../components/account-form/account-form.component';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { FormButtonComponent } from '../../../components/common/form-button/form-button.component';
import { Router } from '@angular/router';
import { validateEmail } from '../../../utils/validators';
import { EMAIL_VALIDATION, LOGIN } from '../../../constants/path-valiable';
import { AuthService } from '../../../services/auth.service';
import { AUTHENTICATION_FAILED, RESET_PASSWORD_LINK_INSTRUCTION } from '../../../constants/error-message';

@Component({
  selector: 'app-forgot-password',
  imports: [AccountFormComponent, FormInputComponent, FormButtonComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  constructor(private router: Router, private authService: AuthService) { }
  description: string = RESET_PASSWORD_LINK_INSTRUCTION;
  email: string = '';
  errors: {
    email?: string
  } = {}
  goToLogin() {
    this.router.navigate([LOGIN]);
  }
  validate(): boolean {
    this.errors = {}

    const emailError = validateEmail(this.email)
    if (emailError) this.errors.email = emailError

    return Object.keys(this.errors).length == 0
  }
  forgotPassword() {
    if (!this.validate()) return;

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.router.navigate([EMAIL_VALIDATION(this.email)]);
        } else {
          this.errors.email = res.message;
        }
      },
      error: (error) => {
        alert(AUTHENTICATION_FAILED);
      }
    });
  }
}
