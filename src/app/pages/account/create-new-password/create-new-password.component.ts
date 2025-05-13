import { Component, OnInit, ViewChild } from '@angular/core';
import { AccountFormComponent } from '../../../components/account-form/account-form.component';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { FormButtonComponent } from '../../../components/common/form-button/form-button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { validateConfirmPassword, validatePassword } from '../../../utils/validators';
import { DASHBOARD, LOGIN } from '../../../constants/path-valiable';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { CHANGE_PASSWORD_FAILED } from '../../../constants/error-message';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { SettingServiceService } from '../../../services/setting-service.service';

@Component({
  selector: 'app-create-new-password',
  imports: [AccountFormComponent, FormInputComponent, FormButtonComponent, RecaptchaModule],
  templateUrl: './create-new-password.component.html',
  styleUrl: './create-new-password.component.css'
})
export class CreateNewPasswordComponent implements OnInit {
  email: string = ''
  password: string = ''
  confirmPassword: string = '';

  errors: {
    password?: string;
    confirmPassword?: string;
  } = {}
  captchaToken: string | null = null;
  useCaptchaOnResetPassword: boolean = false;

  constructor(private authService: AuthService, private alertService: AlertService, private route: ActivatedRoute, private router: Router, private settingService: SettingServiceService) { }
  @ViewChild('captchaRef') captchaRef!: RecaptchaComponent;
  ngOnInit(): void {
    this.settingService.getSetting().subscribe({
      next: (res) => {
        if (res.code === 200) {
          const setting = res.result;
          this.useCaptchaOnResetPassword = setting.useCaptchaOnResetPassword
        }

      },
      error: (err) => {
        console.error(err);
      }
    });
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
  onCaptchaResolved(captchaResponse: string | null) {
    if (captchaResponse) {
      this.captchaToken = captchaResponse;
    } else {
      this.captchaToken = null;
    }
  }
  createNewPassword() {
    if (!this.validate()) return;
    if (!this.captchaToken && this.useCaptchaOnResetPassword) {
      this.alertService.error("Please complete the CAPTCHA.");
      return;
    }
    this.authService.createNewPassword(this.email, this.password).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.alertService.success(res?.message)
          this.router.navigate([DASHBOARD]);
        } else if (res.code === 4006) {
          this.alertService.error(res?.message)
          if (this.useCaptchaOnResetPassword) {
            this.captchaRef.reset();
          }
        } else {
          this.alertService.error(CHANGE_PASSWORD_FAILED)
          if (this.useCaptchaOnResetPassword) {
            this.captchaRef.reset();
          }
        }
      },
      error: (error) => {
        this.alertService.error(CHANGE_PASSWORD_FAILED)
        if (this.useCaptchaOnResetPassword) {
          this.captchaRef.reset();
        }
      }
    });
  }

  goToLogin() {
    this.router.navigate([LOGIN]);
  }
}
