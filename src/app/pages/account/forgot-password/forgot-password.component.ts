import { Component } from '@angular/core';
import { AccountFormComponent } from '../../../components/account-form/account-form.component';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { FormButtonComponent } from '../../../components/common/form-button/form-button.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { validateEmail } from '../../../utils/validators';

@Component({
  selector: 'app-forgot-password',
  imports: [AccountFormComponent, FormInputComponent, FormButtonComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  constructor(private router: Router, private authService: AuthService) { }
  description: string = "Liên kết đặt lại mật khẩu sẽ được gửi đến email của bạn để đặt lại mật khẩu của bạn. Nếu bạn không nhận được email trong vòng vài phút, vui lòng thử lại."
  email: string = '';
  errors: {
    email?: string
  } = {}
  goToLogin() {
    this.router.navigate(['/account/login']);
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
          this.router.navigate([`/account/email-validation/${this.email}`]);
        } else {
          this.errors.email = res.message;
        }
      },
      error: (error) => {
        alert("Xác thực thất bại!");
      }
    });
  }
}
