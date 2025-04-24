import { Component } from '@angular/core';
import { AccountFormComponent } from '../../../components/account-form/account-form.component';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { FormButtonComponent } from '../../../components/common/form-button/form-button.component';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { validateConfirmPassword, validatePassword } from '../../../utils/validators';

@Component({
  selector: 'app-create-new-password',
  imports: [AccountFormComponent, FormInputComponent, FormButtonComponent],
  templateUrl: './create-new-password.component.html',
  styleUrl: './create-new-password.component.css'
})
export class CreateNewPasswordComponent {
  email: string = ''
  password: string = ''
  confirmPassword: string = '';

  errors: {
    password?: string;
    confirmPassword?: string;
  } = {}
  constructor(private authService: AuthService, private alertService: AlertService, private route: ActivatedRoute, private router: Router) { }


  ngOnInit(): void {
    this.email = this.route.snapshot.paramMap.get('email') || '';
  }

  validate(): boolean {
    this.errors = {}

    const passwordError = validatePassword(this.password)
    if (passwordError) this.errors.password = passwordError

     const confirmPasswordError = validateConfirmPassword(this.password, this.confirmPassword, false);
        if (confirmPasswordError) this.errors.confirmPassword = confirmPasswordError;

    return Object.keys(this.errors).length == 0
  }

  createNewPassword() {
    if (!this.validate()) return;

    this.authService.createNewPassword(this.email, this.password).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.alertService.success("Cập nhật mật khẩu thành công")
          this.router.navigate(['/app/admin/dashBoard']);
        } else if (res.code === 4006) {
          this.alertService.error("Email không tồn tại")
        } else {
          this.alertService.error("Xác thực thất bại")
        }
      },
      error: (error) => {
        this.alertService.error("Xác thực thất bại")
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/account/login']);
  }
}
