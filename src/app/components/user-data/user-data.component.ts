import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { validateConfirmPassword, validateEmail, validateFirstName, validateLastName, validatePassword, validateUsername } from '../../utils/validators';
import { FormInputComponent } from '../common/form-input/form-input.component';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
@Component({
  selector: 'app-user-data',
  imports: [CommonModule, NgIf, FormsModule, FormInputComponent, ButtonModule, PanelModule, CheckboxModule],
  templateUrl: './user-data.component.html',
  styleUrl: './user-data.component.css'
})
export class UserDataComponent implements OnInit {
  @Input() isEditMode = false;
  @Input() userId: number | null = null;
  @Output() formSubmitted = new EventEmitter<any>();
  @Output() cancelClicked = new EventEmitter<void>();

  rolesSelect: any[] = [];
  activeTab: string = 'tab1';

  // Form fields
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  phoneNumber: string = '';
  verifyToken: boolean = false;
  thumbnail: string = '';
  isRandomPassword: boolean = false;
  errorMessage: string = '';
  isPasswordVisible: boolean = false;
  mustChangePassword: boolean = false;
  isAction: boolean = false;
  isLockedOut: boolean = false;
  previewImageUrl: string | ArrayBuffer | null = null;
  roles: number[] = [];
  isSubmitting: boolean = false;
  baseImageUrl: string = 'http://localhost:5293/api/v1/images/view/';
  defaultImageUrl: string = '/images/default-profile-picture.png';
  showPasswordSection: boolean = false;

  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  } = {}
  showPassword: boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadRolesSelect();

    if (this.isEditMode && this.userId) {
      this.getUserDetail(this.userId);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  loadRolesSelect(): void {
    this.userService.getRolesSelect().subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.rolesSelect = res.result;

          // Nếu đang ở chế độ edit và đã load user thì cập nhật roles
          if (this.isEditMode && this.userId) {
            this.updateSelectedRoles();
          }
        }
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải danh sách vai trò: ' + err.message;
      }
    });
  }

  getUserDetail(id: number): void {
    this.userService.getFindUserById(id).subscribe({
      next: (res) => {
        console.log(res);

        if (res.code === 200) {
          const user = res.result;
          this.firstName = user.firstName;
          this.lastName = user.lastName;
          this.email = user.email;
          this.username = user.username;
          this.phoneNumber = user.phoneNumber ?? '';
          this.thumbnail = user.thumbnail ?? '';
          this.verifyToken = user.verifyToken;
          this.isRandomPassword = user.isRandomPassword;
          this.mustChangePassword = user.mustChangePassword;
          this.isAction = user.isAction;
          this.isLockedOut = user.isLockedOut;

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

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.password = '';
      this.confirmPassword = '';
      this.isRandomPassword = false;
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

    const passwordError = validatePassword(this.password)
    if (passwordError) this.errors.password = passwordError

    const usernameError = validateUsername(this.username)
    if (usernameError) this.errors.username = usernameError

    if (this.showPasswordSection || !this.isEditMode) {
      const confirmPasswordError = validateConfirmPassword(this.password, this.confirmPassword, this.isRandomPassword);
      if (confirmPasswordError) this.errors.confirmPassword = confirmPasswordError;
    }

    if (this.roles.length === 0) {
      this.errorMessage = 'Vui lòng chọn ít nhất một vai trò';
    }
    return Object.keys(this.errors).length === 0;
  }

  saveUser(): void {
    if (!this.validateForm()) return;


    this.isSubmitting = true;
    const input = this.fileInput.nativeElement;
    const file = input.files && input.files[0];

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.userService.uploadImage(formData).subscribe({
        next: (res) => {
          if (res.code === 200) {
            console.log(res);

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
    const userData = {
      id: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      username: this.username,
      password: this.password || null,
      phoneNumber: this.phoneNumber,
      verifyToken: this.verifyToken,
      thumbnail: this.thumbnail,
      isRandomPassword: this.isRandomPassword,
      roles: this.roles,
      mustChangePassword: this.mustChangePassword,
      isAction: this.isAction,
      isLockedOut: this.isLockedOut,
      showPasswordSection: this.showPasswordSection
    };

    this.formSubmitted.emit(userData);
    this.isSubmitting = false;
  }

  cancel(): void {
    this.cancelClicked.emit();
  }

  resetForm(): void {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.phoneNumber = '';
    this.verifyToken = false;
    this.thumbnail = '';
    this.isRandomPassword = false;
    this.previewImageUrl = null;
    this.roles = [];
    this.rolesSelect.forEach(role => role.isSelected = false);

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}