// create-user.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { UserService } from '../../../services/user.service';
import { validateConfirmPassword, validateEmail, validateFirstName, validateLastName, validatePassword, validatePhoneNumber, validateUsername } from '../../../utils/validators';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule, FormInputComponent],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  phoneNumber: string = '';
  isSendEmail: boolean = false;
  thumbnail: string = '';
  isRandomPassword: boolean = false;
  mustChangePassword: boolean = false;
  isAction: boolean = false;
  isLockedOut: boolean = false;
  
  activeTab: string = 'tab1';
  errorMessage: string = '';
  isSubmitting: boolean = false;
  previewImageUrl: string | ArrayBuffer | null = null;
  defaultImageUrl: string = '/images/default-profile-picture.png';
  
  rolesSelect: any[] = [];
  roles: number[] = [];
  
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    phone?:string;
    confirmPassword?: string;
  } = {};

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRolesSelect();
  }

  loadRolesSelect(): void {
    this.userService.getRolesSelect().subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.rolesSelect = res.result;
        }
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải danh sách vai trò: ' + err.message;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
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
    this.errors = {};
    this.errorMessage = '';

    const firstNameError = validateFirstName(this.firstName);
    if (firstNameError) this.errors.firstName = firstNameError;

    const lastNameError = validateLastName(this.lastName);
    if (lastNameError) this.errors.lastName = lastNameError;

    const emailError = validateEmail(this.email);
    if (emailError) this.errors.email = emailError;

    const phoneError = validatePhoneNumber(this.phoneNumber);
    if (phoneError) this.errors.phone = phoneError;

    const usernameError = validateUsername(this.username);
    if (usernameError) this.errors.username = usernameError;

    const passwordError = validatePassword(this.password);
    if (passwordError) this.errors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(this.password, this.confirmPassword, this.isRandomPassword);
    if (confirmPasswordError) this.errors.confirmPassword = confirmPasswordError;

    if (this.roles.length === 0) {
      this.errorMessage = 'Vui lòng chọn ít nhất một vai trò';
      return false;
    }

    return Object.keys(this.errors).length === 0;
  }

  saveUser(): void {
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
    this.userService.createUser(
      this.firstName,
      this.lastName,
      this.email,
      this.username,
      this.password,
      this.phoneNumber,
      this.isSendEmail,
      this.thumbnail,
      this.isRandomPassword,
      this.roles,
      this.mustChangePassword,
      this.isAction,
      this.isLockedOut
    ).subscribe({
      next: (res) => {
        if (res.code === 200) {
          alert('Tạo tài khoản thành công!');
          this.router.navigate(['/app/admin/users']);
        } else if (res.code === 4001) {
          this.errors.email = "Email đã tồn tại";
          this.isSubmitting = false;
        } else if (res.code === 4002) {
          this.errors.username = "Tên người dùng đã tồn tại";
          this.isSubmitting = false;
        } else {
          this.errorMessage = 'Tạo tài khoản thất bại!';
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        this.errorMessage = 'Lỗi tạo tài khoản: ' + err.message;
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/app/admin/users']);
  }

}