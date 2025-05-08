import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormInputComponent } from "../../../components/common/form-input/form-input.component";
import { AccountFormComponent } from '../../../components/account-form/account-form.component';
import { validateEmail, validateFirstName, validateLastName, validatePassword, validateUsername } from '../../../utils/validators';
import { ButtonModule } from 'primeng/button';
import { EMAIL_VALIDATION, LOGIN } from '../../../constants/path-valiable';
import { AuthService } from '../../../services/auth.service';
import { SettingServiceService } from '../../../services/setting-service.service';
import { AlertService } from '../../../services/alert.service';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, FormInputComponent, FormInputComponent, AccountFormComponent, ButtonModule, RecaptchaModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  // Khai báo register
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  username: string = '';
  errorMessage: string = '';
  captchaToken: string | null = null;

  // Khai báo Error
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
  } = {};

  // Check setting
  selfRegister: boolean = false;
  userDefaultSetting: boolean = false;
  hasLowercase: boolean = false;
  hasSpecialChar: boolean = false;
  hasUppercase: boolean = false;
  hasNumber: boolean = false;
  minPasswordLength: number = 0;
  useCaptchaOnRegister: boolean = false;
  isSubmitting: boolean = false

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private settingService: SettingServiceService, private alertService: AlertService) { }
  @ViewChild('captchaRef') captchaRef!: RecaptchaComponent;

  ngOnInit(): void {
    this.settingService.getSetting().subscribe({
      next: (res) => {
        if (res.code === 200) {
          const setting = res.result;
          this.selfRegister = setting.selfRegister
          this.useCaptchaOnRegister = setting.useCaptchaOnRegister
        }
      },
      error: (err) => {
        console.error('Lỗi lấy setting trong Register:', err);
      }
    });


  }

  onCaptchaResolved(captchaResponse: string | null) {
    if (captchaResponse) {
      console.log('Captcha token:', captchaResponse);
      this.captchaToken = captchaResponse;
    } else {
      console.warn('Captcha không hợp lệ');
      this.captchaToken = null;
    }
  }

  goToLogin() {
    this.router.navigate([LOGIN]);
  }

  validate(): boolean {
    this.errors = {};

    const firstNameError = validateFirstName(this.firstName);
    if (firstNameError) this.errors.firstName = firstNameError;

    const lastNameError = validateLastName(this.lastName);
    if (lastNameError) this.errors.lastName = lastNameError;

    const emailError = validateEmail(this.email);
    if (emailError) this.errors.email = emailError;

    const usernameError = validateUsername(this.username);
    if (usernameError) this.errors.username = usernameError;

    if (!this.password || this.password.trim() === '') {
      this.errors.password = 'Vui lòng nhập mật khẩu';
    } else {
      const requirements: string[] = [];

      if (!this.userDefaultSetting) {
        if (this.hasLowercase && !/[a-z]/.test(this.password)) {
          requirements.push('chữ thường');
        }
        if (this.hasUppercase && !/[A-Z]/.test(this.password)) {
          requirements.push('chữ hoa');
        }
        if (this.hasNumber && !/[0-9]/.test(this.password)) {
          requirements.push('chữ số');
        }
        if (this.hasSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(this.password)) {
          requirements.push('ký tự đặc biệt');
        }
        if (this.password.length < this.minPasswordLength) {
          requirements.push(`ít nhất ${this.minPasswordLength} ký tự`);
        }
      } else {
        if (this.password.length < 6) {
          requirements.push('ít nhất 6 ký tự');
        }
      }

      if (requirements.length > 0) {
        this.errors.password = `Mật khẩu phải bao gồm ${requirements.join(', ')}`;
      }
    }
    return Object.keys(this.errors).length === 0;
  }


  register() {
    if (!this.validate()) return;

    this.isSubmitting = true

    if (!this.captchaToken && this.useCaptchaOnRegister) {
      this.alertService.error("Please complete the CAPTCHA.");
      return;
    }

    this.authService.register(this.firstName, this.lastName, this.email, this.username, this.password, this.captchaToken).subscribe({
      next: (res: { code: number, message: string }) => {
        if (res.code === 200) {
          this.alertService.success(res?.message)
          this.router.navigate([EMAIL_VALIDATION(this.email)]);
        } else if (res.code === 4001) {
          this.errors.email = res.message
          if (this.useCaptchaOnRegister) {
            this.captchaRef.reset();
          }
        } else if (res.code === 4002) {
          this.errors.username = res.message
          if (this.useCaptchaOnRegister) {
            this.captchaRef.reset();
          }
        } else if (res.code === 4011) {
          this.errorMessage = res.message
          if (this.useCaptchaOnRegister) {
            this.captchaRef.reset();
          }
        } else if (res.code === 400) {
          this.errors.password = res.message;
          if (this.useCaptchaOnRegister) {
            this.captchaRef.reset();
          }
        } else {
          console.log(res.message);
          if (this.useCaptchaOnRegister) {
            this.captchaRef.reset();
          }
        }
        this.isSubmitting = false
      },
      error: (error: any) => {
        this.isSubmitting = false
        if (this.useCaptchaOnRegister) {
          this.captchaRef.reset();
        }
        this.errorMessage = error.error?.message || "Đã xảy ra lỗi!";
      }
    });
  }






}
