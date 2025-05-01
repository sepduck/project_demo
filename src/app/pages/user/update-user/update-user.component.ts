import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { UserService } from '../../../services/user.service';
import { validateEmail, validateFirstName, validateLastName, validatePhoneNumber, validateUsername } from '../../../utils/validators';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { USERS } from '../../../constants/path-valiable';
import { TabsModule } from 'primeng/tabs';
import { PasswordModule } from 'primeng/password';


@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [CommonModule, FormsModule, FormInputComponent, ButtonModule, PanelModule, CheckboxModule, TabsModule, PasswordModule],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.css'
})
export class UpdateUserComponent implements OnInit {
  userId: number | null = null;
  rolesSelect: any[] = [];
  activeTab: string = 'tab1';

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
  baseImageUrl: string = 'http://localhost:5293/api/v1/images/view/';
  defaultImageUrl: string = '/images/default-profile-picture.png';

  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    username?: string;
  } = {}

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute, private alertService: AlertService, public authService: AuthService) { }
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.userId = +idParam;
        this.loadRolesSelect();
        this.getUserDetail(this.userId);
      } else {
        this.router.navigate([USERS]);
      }
    });
  }

  loadRolesSelect(): void {
    this.userService.getRolesSelect().subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.rolesSelect = res.result;
          if (this.userId !== null) {
            this.getUserDetail(this.userId);
          }
        }
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải danh sách vai trò: ' + err.message;
      }
    });
  }



  getUserDetail(id: number): void {
    if (id === null) return;

    this.userService.getFindUserById(id).subscribe({
      next: (res) => {
        if (res.code === 200) {
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

          if (user.thumbnail) {
            this.previewImageUrl = this.baseImageUrl + user.thumbnail;
          }

          if (user.roleName && this.rolesSelect.length > 0) {
            this.updateSelectedRoles(user.roleName);
          }
        }
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải thông tin người dùng: ' + err.message;
      }
    });
  }

  updateSelectedRoles(roleName?: string | null): void {
    if (this.rolesSelect.length > 0) {
      if (!roleName) {
        this.rolesSelect.forEach(role => { role.isSelected = false });
      } else {
        const roleNames = roleName.split(',');
        this.rolesSelect.forEach(role => { role.isSelected = roleNames.includes(role.name) });
      }
      this.onRoleChange();
    }
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

  onRoleChange(): void {
    this.roles = this.rolesSelect.filter(role => role.isSelected).map(role => role.id);
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

    if (this.roles.length === 0) {
      this.errorMessage = 'Vui lòng chọn ít nhất một vai trò';
    }
    return Object.keys(this.errors).length === 0 && !this.errorMessage;
  }

  updateUser(): void {
    if (!this.validateForm()) {
      if (this.activeTab === 'tab2' && Object.keys(this.errors).length > 0) {
        this.setActiveTab('tab1');
        return;
      }
      return;
    }

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
          this.alertService.success("Cập nhật tài khoản thành công!")
          this.router.navigate([USERS]);
        } else if (res.code === 4018) {
          this.errors.phone = res.message
        } else {
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

  cancel(): void {
    this.router.navigate([USERS]);
  }
}