import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingServiceService } from '../../services/setting-service.service';
import { validateMinPasswordLength } from '../../utils/validators';
import { PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-setting',
  imports: [CommonModule, FormsModule, PanelModule, CheckboxModule, InputNumberModule, ButtonModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent implements OnInit {
  selfRegister: boolean = false;
  defaultUserActivation: boolean = false;
  useCaptchaOnRegister: boolean = false;
  useCaptchaOnResetPassword: boolean = false;
  useCaptchaOnEmailActivation: boolean = false;
  useCaptchaOnLogin: boolean = false;
  cookieConsentEnabled: boolean = false;
  sessionTimeoutControlEnabled: boolean = false;
  emailConfirmationRequired: boolean = false;
  allowGravatar: boolean = false;
  userDefaultSetting: boolean = false;
  hasLowercase: boolean = false;
  hasSpecialChar: boolean = false;
  hasUppercase: boolean = false;
  hasNumber: boolean = false;
  minPasswordLength: number = 6;
  errorMessage: string = '';

  isSubmitting: boolean = false;

  errors: {
    minPasswordLength?: string
  } = {};

  constructor(
    private settingService: SettingServiceService, private alertService: AlertService, public authService: AuthService) { }
  ngOnInit(): void {
    this.settingService.getSetting().subscribe({
      next: (res) => {
        if (res.code === 200) {
          const setting = res.result;
          this.selfRegister = setting.selfRegister;
          this.defaultUserActivation = setting.defaultUserActivation;
          this.useCaptchaOnRegister = setting.useCaptchaOnRegister;
          this.useCaptchaOnResetPassword = setting.useCaptchaOnResetPassword;
          this.useCaptchaOnEmailActivation = setting.useCaptchaOnEmailActivation;
          this.useCaptchaOnLogin = setting.useCaptchaOnLogin;
          this.cookieConsentEnabled = setting.cookieConsentEnabled;
          this.sessionTimeoutControlEnabled = setting.sessionTimeoutControlEnabled;
          this.emailConfirmationRequired = setting.emailConfirmationRequired;
          this.allowGravatar = setting.allowGravatar;
          this.userDefaultSetting = setting.userDefaultSetting;
          this.hasLowercase = setting.hasLowercase,
            this.hasSpecialChar = setting.hasSpecialChar,
            this.hasUppercase = setting.hasUppercase,
            this.hasNumber = setting.hasNumber,
            this.minPasswordLength = setting.minPasswordLength
        }
      },
      error: (err) => {
        console.error('Lỗi lấy setting trong Register:', err);
      }
    });
  }

  onDefaultSettingChange() {
    if (this.userDefaultSetting) {
      this.hasNumber = false;
      this.hasLowercase = false;
      this.hasSpecialChar = false;
      this.hasUppercase = false;
      this.minPasswordLength = 8;
    } else {
      this.minPasswordLength = 6;
    }
  }

  validate(): boolean {
    this.errors = {}

    const minPasswordLengthError = validateMinPasswordLength(this.minPasswordLength, 6)
    if (minPasswordLengthError) this.errors.minPasswordLength = minPasswordLengthError

    return Object.keys(this.errors).length === 0;
  }

  updateSetting(): void {
    if (!this.validate()) return;

    this.isSubmitting = true;
    this.settingService.putSetting(
      this.selfRegister,
      this.defaultUserActivation,
      this.useCaptchaOnRegister,
      this.useCaptchaOnResetPassword,
      this.useCaptchaOnEmailActivation,
      this.useCaptchaOnLogin,
      this.cookieConsentEnabled,
      this.sessionTimeoutControlEnabled,
      this.emailConfirmationRequired,
      this.allowGravatar,
      this.userDefaultSetting,
      this.hasLowercase,
      this.hasSpecialChar,
      this.hasUppercase,
      this.hasNumber,
      this.minPasswordLength
    ).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.code === 200) {
          this.alertService.success("Sửa cài đặt thành công!")
          this.settingService.getSetting()
        } else {
          this.alertService.success("Sửa cài đặt thất bại!")
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.alertService.success("Sửa cài đặt thất bại!")
      }
    });
  }
}
