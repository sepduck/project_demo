import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AccountFormComponent } from "../../../components/account-form/account-form.component";
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { validateEmail, validatePassword } from '../../../utils/validators';
import { SettingServiceService } from '../../../services/setting-service.service';
import { AlertService } from '../../../services/alert.service';
export interface LoginResult {
  token: string;
  emailConfirmationRequired: boolean;
  useCaptchaOnLogin: boolean;
  mustChangePassword: boolean;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, HttpClientModule, AccountFormComponent, FormInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = 'cutexinhzai2018@gmail.com'
  password: string = "Ducnhung2020@";

  errors: {
    email?: string;
    password?: string;
  } = {};

  selfRegister: boolean = false;
  mustChangePassword: boolean = false;

  constructor(private authService: AuthService, private router: Router, private settingService: SettingServiceService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.settingService.getSetting().subscribe({
      next: (res) => {
        if (res.code === 200) {
          const setting = res.result;
          this.selfRegister = setting.selfRegister
        }
      },
      error: (err) => {
        console.error('Lỗi lấy setting trong Register:', err);
      }
    });
  }

  validate(): boolean {
    this.errors = {};

    const emailError = validateEmail(this.email);
    if (emailError) this.errors.email = emailError

    const passwordError = validatePassword(this.password);
    if (passwordError) this.errors.password = passwordError

    return Object.keys(this.errors).length === 0;
  }

  login() {
    if (!this.validate()) return;

    this.authService.login(this.email, this.password).subscribe({
      next: (res: { code: number, message: string, result?: LoginResult }) => {

        if (res.code === 200 && res.result) {
          this.authService.saveToken(res.result.token);
          this.alertService.success('Đăng nhập thành công!');
          if (res.result.emailConfirmationRequired) {
            localStorage.setItem('mustChangePassword', String(res.result.mustChangePassword));
            this.router.navigate([`/account/email-validation/${this.email}`]);
          } else if (res.result.mustChangePassword) {
            this.router.navigate(['/account/change-password']);
          } else {
            this.router.navigate(['/app/admin/dashBoard']);
          }
        }
      },
      error: (error: any) => {
        const code = error?.error?.code;
        if (code === 4003) {
          this.errors.email = 'Email không tồn tại';
        }
        if (code === 4004) {
          this.errors.password = 'Mật khẩu không đúng';
        }
        if (code === 4014) {
          this.alertService.error('Tài khoản chưa được kích hoạt');
        }
      }
    });
  }

}

