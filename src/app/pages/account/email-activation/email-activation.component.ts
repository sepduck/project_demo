import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailActivationService } from '../../../services/email-activation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountFormComponent } from '../../../components/account-form/account-form.component';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { FormButtonComponent } from '../../../components/common/form-button/form-button.component';
import { validateEmail, validateTokenEmail } from '../../../utils/validators';
import { AlertService } from '../../../services/alert.service';


@Component({
  selector: 'app-email-activation',
  imports: [FormsModule, CommonModule, AccountFormComponent, FormInputComponent, FormButtonComponent],
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

  description: string = 'Một liên kết sẽ được gửi đến email của bạn để kích hoạt địa chỉ email của bạn. Nếu bạn không nhận được email trong vòng vài phút, vui lòng thử lại.'

  constructor(
    private emailService: EmailActivationService,
    private route: ActivatedRoute,
    private router: Router, private alertService: AlertService
  ) { }

  ngOnInit(): void {
    const emailParam = this.route.snapshot.paramMap.get('email') || '';
    if (emailParam) {
      this.email = emailParam;
      this.emailReadOnly = true;
    } else {
      this.emailReadOnly = false;
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

    this.emailService.emailConfirmation(this.email, this.token).subscribe({
      next: (res) => {
        console.log(this.email);

        if (res.code === 200, res.result?.actionType === 'login') {
          this.alertService.success("Xác thực email thành công")
          const mustChangePassword = localStorage.getItem('mustChangePassword') === 'true';
          console.log("mustChangePassword: " + mustChangePassword);

          if (mustChangePassword) {
            this.router.navigate([`/account/create-new-password/${this.email}`]);
          } else {
            this.router.navigate(['/app/admin/dashBoard']);
          }
        } else if (res.code === 200, res.result?.actionType === 'register') {
          this.alertService.success("Xác thực email thành công! Vui lòng đăng nhập")
          this.router.navigate(['/account/login']);
        } else if (res.code === 4006) {
          this.errors.email = "Email không tồn tại";
        } else if (res.code === 4007) {
          this.errors.token = "Không tìm thấy mã thông báo hoặc mã thông báo không khớp với email.";
        } else if (res.code === 4008) {
          this.errors.token = "Mã đã hết hạn.";
        } else {
          this.alertService.error("Xác thực thất bại")
        }
      },
      error: (error) => {
        this.alertService.error("Xác thực thất bại")
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/account/login']);
  }
}
