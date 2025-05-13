import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountFormComponent } from "../../../components/account-form/account-form.component";
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { validateEmail, validatePassword } from '../../../utils/validators';
import { ButtonModule } from 'primeng/button';
import { CREATE_NEW_PASSWORD, DASHBOARD, EMAIL_VALIDATION } from '../../../constants/path-valiable';
import { AuthService } from '../../../services/auth.service';
import { SettingServiceService } from '../../../services/setting-service.service';
import { AlertService } from '../../../services/alert.service';
import { MUST_CHANGE_PASSWORD } from '../../../constants/status-enum';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha'
import { OAuthConfig, OAuthFacebookConfig } from '../../../constants/oauth-config';
import { CAPTCHA_INVALID, CAPTCHA_REQUIRED } from '../../../constants/error-message';

export interface LoginResult {
  token: string;
  emailConfirmationRequired: boolean;
  useCaptchaOnLogin: boolean;
  mustChangePassword: boolean;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, HttpClientModule, AccountFormComponent, FormInputComponent, ButtonModule, RecaptchaModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = 'cutexinhzai2018@gmail.com'
  password: string = "Ducnhung2020@";
  captchaToken: string | null = null;

  errors: {
    email?: string;
    password?: string;
  } = {};

  selfRegister: boolean = false;
  useCaptchaOnLogin: boolean = false;
  mustChangePassword: boolean = false;
  isSubmitting: boolean = false;

  constructor(private authService: AuthService, private router: Router, private settingService: SettingServiceService, private alertService: AlertService) { }
  @ViewChild('captchaRef') captchaRef!: RecaptchaComponent;

  ngOnInit(): void {
    this.settingService.getSetting().subscribe({
      next: (res) => {
        if (res.code === 200) {
          const setting = res.result;
          this.selfRegister = setting.selfRegister
          this.useCaptchaOnLogin = setting.useCaptchaOnLogin
        }
      },
      error: (err) => {
        console.error(err);
      }
    });


  }

  onCaptchaResolved(captchaResponse: string | null) {
    if (captchaResponse) {
      this.captchaToken = captchaResponse;
    } else {
      console.warn(CAPTCHA_INVALID);
      this.captchaToken = null;
    }
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

    if (!this.captchaToken && this.useCaptchaOnLogin) {
      this.alertService.error(CAPTCHA_REQUIRED);
      return;
    }

    this.isSubmitting = true;

    this.authService.login(this.email, this.password, this.captchaToken).subscribe({
      next: (res: { code: number, message: string, result?: LoginResult }) => {
        if (res.code === 200 && res.result) {
          this.authService.saveToken(res.result.token);
          this.alertService.success(res.message);
          if (res.result.emailConfirmationRequired) {
            localStorage.setItem(MUST_CHANGE_PASSWORD, String(res.result.mustChangePassword));
            this.router.navigate([EMAIL_VALIDATION(this.email)]);
          } else if (res.result.mustChangePassword) {
            this.router.navigate([CREATE_NEW_PASSWORD(this.email)]);
          } else {
            this.router.navigate([DASHBOARD]);
          }
        } else if (res.code === 4003) {
          this.isSubmitting = false;
          this.errors.email = res.message
          if (this.useCaptchaOnLogin) {
            this.captchaRef.reset();
          }
        } else {
          this.isSubmitting = false;
          this.errors.password = res.message
          if (this.useCaptchaOnLogin) {
            this.captchaRef.reset();
          }
        }
      },
      error: (error: any) => {
        if (this.useCaptchaOnLogin) {
          this.captchaRef.reset();
        }
        this.isSubmitting = false;
      }
    });
  }

  loginWithOAuth(provider: 'google' | 'facebook', link: 'true' | 'false') {
    let authUrl = '';
    let authUri = '';
    let callbackUrl = '';
    let clientId = '';
    const state = JSON.stringify({provider, link});
    const encodeState = encodeURIComponent(state)

    if (provider === 'google') {
      authUri = OAuthConfig.authUri;
      callbackUrl = OAuthConfig.redirectUri;
      clientId = OAuthConfig.clientId;
      authUrl = `${authUri}?redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&client_id=${clientId}&scope=openid%20profile%20email&state=${encodeState}`;

    } else if (provider === 'facebook') {
      callbackUrl = OAuthFacebookConfig.redirectUri;
      clientId = OAuthFacebookConfig.clientId;
      authUri = OAuthFacebookConfig.authUri;
      authUrl = `${authUri}?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=email,public_profile&state=${encodeState}`;

    }
    window.location.href = authUrl;
  }



}

