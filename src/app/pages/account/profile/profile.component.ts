import { JwtPayload } from './../../../models/auth.model';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RoleService } from '../../../services/role.service';
import { AlertService } from '../../../services/alert.service';
import { USERS } from '../../../constants/path-valiable';
import { validateEmail, validateFirstName, validateLastName, validatePhoneNumber, validateUsername } from '../../../utils/validators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { OAuthConfig, OAuthFacebookConfig } from '../../../constants/oauth-config';

@Component({
  selector: 'profile',
  imports: [FormInputComponent, ButtonModule, CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  userId: number | null = null;
  rolesSelect: any[] = [];
  activeTab: string = 'tab1';

  @Input() isProfile: boolean = false;
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  username: string = '';
  phoneNumber: string = '';
  verifyToken: boolean = false;
  thumbnail: string = '';
  errorMessage: string = '';
  isAction: boolean = false;
  isLockedOut: boolean = false;
  previewImageUrl: string | ArrayBuffer | null = null;
  roles: number[] = [];
  isSendEmail: boolean = false;
  isSubmitting: boolean = false;
  googleProvider: string | null = null;
  googleFirstName: string | null = null;
  googleLastName: string | null = null;
  facebookProvider: string | null = null;
  facebookFirstName: string | null = null;
  facebookLastName: string | null = null;
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    username?: string;
  } = {}
  @Output() updateSuccess = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  onCancelEmit() {
    this.cancel.emit();
  }
  getCurrentUserId(): number | null {
    const token = this.getToken();
    if (!token) return null
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return parseInt(decoded.nameid);
    } catch (e) {
      return null;
    }
  }
  ngOnInit(): void {
    const currentUser = this.getCurrentUserId();
    if (currentUser) {
      this.userId = currentUser;
      if (this.userId != null) {
        this.getUserDetail(this.userId);
      }
    } else {
      this.router.navigate([USERS]);
    }
  }

  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute, private alertService: AlertService, public authService: AuthService) { }
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }



  getUserDetail(id: number): void {
    if (id === null) return;

    this.userService.getFindUserById(id).subscribe({
      next: (res) => {
        if (res.code === 200) {
          console.log(res);

          const user = res.result;
          this.firstName = user.firstName;
          this.lastName = user.lastName;
          this.email = user.email;
          this.username = user.username;
          this.phoneNumber = user.phoneNumber ?? '';
          this.thumbnail = user.thumbnail ?? '';
          this.verifyToken = user.verifyToken;
          this.isAction = user.isAction;
          this.isLockedOut = user.isLockedOut;
          this.isSendEmail = user.isSendEmail;
          const facebook = user.providers.find(p => p.provider === 'facebook')
          const google = user.providers.find(p => p.provider === 'google')
          this.googleProvider = google ? google.providerEmail : null;
          this.googleFirstName = google?.firstName ?? '';
          this.googleLastName = google?.lastName ?? '';
          this.facebookProvider = facebook ? facebook.providerEmail : null;
          this.facebookFirstName = facebook?.firstName ?? '';
          this.facebookLastName = facebook?.lastName ?? '';
          if (user.thumbnail) {
            this.previewImageUrl = user.thumbnail;
          }
        }
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải thông tin người dùng: ' + err.message;
      }
    });
  }
  onImageClick(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Kích thước file không được vượt quá 5MB';
        return;
      }

      if (!file.type.match('image.*')) {
        this.errorMessage = 'Chỉ chấp nhận file hình ảnh';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => { this.previewImageUrl = reader.result; };
      reader.readAsDataURL(file);
    }
  }

  validateForm(): boolean {
    this.errors = {}
    this.errorMessage = '';

    const firstNameError = validateFirstName(this.firstName)
    if (firstNameError) this.errors.firstName = firstNameError;

    const lastNameError = validateLastName(this.lastName)
    if (lastNameError) this.errors.lastName = lastNameError;

    const emailError = validateEmail(this.email)
    if (emailError) this.errors.email = emailError;

    const phoneError = validatePhoneNumber(this.phoneNumber);
    if (phoneError) this.errors.phone = phoneError;

    const usernameError = validateUsername(this.username)
    if (usernameError) this.errors.username = usernameError

    return Object.keys(this.errors).length === 0 && !this.errorMessage;
  }

  updateProfile(): void {


    this.isSubmitting = true;
    const input = this.fileInput.nativeElement;
    const file = input.files && input.files[0];

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.userService.uploadImage(formData).subscribe({
        next: (res) => {
          if (res.code === 200) {
            this.thumbnail = res.result;
            this._processFormSubmission();
          } else {
            this.errorMessage = 'Tải ảnh lên thất bại!';
            this.isSubmitting = false;
          }
        },
        error: (err) => {
          this.errorMessage = 'Lỗi tải ảnh lên: ' + err.message;
          this.isSubmitting = false;
        }
      });
    } else {
      this._processFormSubmission();
    }
  }

  private _processFormSubmission(): void {
    if (!this.userId) return;
    if (!this.validateForm()) {
      this.isSubmitting = false;
      return;
    }

    this.userService.updateUser(
      this.userId,
      this.firstName,
      this.lastName,
      this.email,
      this.username,
      this.phoneNumber,
      this.isSendEmail,
      this.thumbnail,
      this.roles,
      this.isAction,
      this.isLockedOut
    ).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.alertService.success(res.message)
          this.isProfile = false
          this.updateSuccess.emit();
        } else if (res.code === 4018) {
          this.errors.phone = res.message
        } else {
          this.isSubmitting = false;
          this.errorMessage = 'Cập nhật tài khoản thất bại!';
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMessage = 'Lỗi cập nhật tài khoản: ' + err.message;
        this.isSubmitting = false;
      }
    });
  }



  unlinkOutbound(provider: string): void {
    this.authService.unlinkOutbound(provider).subscribe({
      next: (res) => {
        if (res.code === 200) {
          if (provider === 'google') 
            this.googleProvider = null;
          if (provider === 'facebook') 
            this.facebookProvider = null;
          
          this.alertService.success(res.message)
        } else if (res.code === 4019) {
          this.alertService.error(res.message)
        }
        this.errorMessage = res.message;
      },
      error: (err) => {
        console.error('Lỗi xoá người dùng:', err);
        this.alertService.error("Không thể xoá người dùng. Vui lòng thử lại sau.")
      }
    });
  }

  linkOutbound(provider: 'google' | 'facebook', link: 'true' | 'false') {
    let authUrl = '';
    let authUri = '';
    let callbackUrl = '';
    let clientId = '';
    const state = JSON.stringify({ provider, link });
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