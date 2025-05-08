import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountFormComponent } from '../../../components/account-form/account-form.component';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { FormButtonComponent } from '../../../components/common/form-button/form-button.component';
import { validateEmail, validateTokenEmail } from '../../../utils/validators';
import { CREATE_NEW_PASSWORD, DASHBOARD, LOGIN } from '../../../constants/path-valiable';
import { EmailActivationService } from '../../../services/email-activation.service';
import { AlertService } from '../../../services/alert.service';
import { E_LOGIN, E_REGISTER, MUST_CHANGE_PASSWORD } from '../../../constants/status-enum';
import { AUTHENTICATION_FAILED } from '../../../constants/error-message';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { SettingServiceService } from '../../../services/setting-service.service';


@Component({
  selector: 'app-email-activation',
  imports: [FormsModule, CommonModule, AccountFormComponent, FormInputComponent, FormButtonComponent, RecaptchaModule],
  templateUrl: './email-activation.component.html',
  styleUrls: ['./email-activation.component.css'],
})
export class EmailActivationComponent implements OnInit {
  email: string = '';
  token: string = '';
  emailReadOnly: boolean = false;
  errors: {
    token?: string
    email?: string
  } = {}
  captchaToken: string | null = null;
  useCaptchaOnEmailActivation: boolean = false;

  description: string = 'Một liên kết sẽ được gửi đến email của bạn để kích hoạt địa chỉ email của bạn. Nếu bạn không nhận được email trong vòng vài phút, vui lòng thử lại.'

  constructor(
    private emailService: EmailActivationService,
    private route: ActivatedRoute, private settingService: SettingServiceService,
    private router: Router, private alertService: AlertService
  ) { }
  @ViewChild('captchaRef') captchaRef!: RecaptchaComponent;

  ngOnInit(): void {
    this.settingService.getSetting().subscribe({
      next: (res) => {
        if (res.code === 200) {
          const setting = res.result;
          this.useCaptchaOnEmailActivation = setting.useCaptchaOnEmailActivation
        }
      },
      error: (err) => {
        console.error('Lỗi lấy setting trong Register:', err);
      }
    });
    const emailParam = this.route.snapshot.paramMap.get('email') || '';
    if (emailParam) {
      this.email = emailParam;
      this.emailReadOnly = true;
    } else {
      this.emailReadOnly = false;
    }
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
  validate(): boolean {
    this.errors = {}

    const emailError = validateEmail(this.email)
    if (emailError) this.errors.email = emailError

    const tokenError = validateTokenEmail(this.token)
    if (tokenError) this.errors.token = tokenError

    return Object.keys(this.errors).length == 0
  }

  emailConfirm() {
    if (!this.validate()) return;
    if (!this.captchaToken && this.useCaptchaOnEmailActivation) {
      this.alertService.error("Please complete the CAPTCHA.");
      return;
    }
    this.emailService.emailConfirmation(this.email, this.token).subscribe({
      next: (res) => {
        if (res.code === 200, res.result?.actionType === E_LOGIN) {
          this.alertService.success(res?.message)
          const mustChangePassword = localStorage.getItem(MUST_CHANGE_PASSWORD) === 'true';
          if (mustChangePassword) {
            this.router.navigate([CREATE_NEW_PASSWORD((this.email))]);
          } else {
            this.router.navigate([DASHBOARD]);
          }
        } else if (res.code === 200, res.result?.actionType === E_REGISTER) {
          this.alertService.success(res?.message)
          this.router.navigate([LOGIN]);
        } else if (res.code === 4006) {
          this.errors.email = res?.message;
          if (this.useCaptchaOnEmailActivation) {
            this.captchaRef.reset();
          }
        } else if (res.code === 4007) {
          this.errors.token = res?.message;
          if (this.useCaptchaOnEmailActivation) {
            this.captchaRef.reset();
          }
        } else if (res.code === 4008) {
          this.errors.token = res?.message;
          if (this.useCaptchaOnEmailActivation) {
            this.captchaRef.reset();
          }
        } else {
          this.alertService.error(AUTHENTICATION_FAILED)
        }
      },
      error: (error) => {
        this.alertService.error(AUTHENTICATION_FAILED)
        if (this.useCaptchaOnEmailActivation) {
          this.captchaRef.reset();
        }
      }
    });
  }

  goToRegister() {
    this.router.navigate([LOGIN]);
  }
}
