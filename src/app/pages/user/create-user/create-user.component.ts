// create-user.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { UserService } from '../../../services/user.service';
import { validateConfirmPassword, validateEmail, validateFirstName, validateLastName, validatePassword, validatePasswordCreateUser, validatePhoneNumber, validateRole, validateUsername } from '../../../utils/validators';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { USERS } from '../../../constants/path-valiable';
import { ToggleSwitchModule} from 'primeng/toggleswitch'
import { TabsModule } from 'primeng/tabs';
import { PasswordModule } from 'primeng/password';
import { CREATE_USER_FAILED, IMAGE_FILE_TOO_LARGE, LOAD_ROLE_LIST_FAILED, ONLY_IMAGE_FILES_ALLOWED, UPLOAD_IMAGE_FAILED } from '../../../constants/error-message';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule, FormInputComponent, TabsModule, PasswordModule, CheckboxModule, ToggleSwitchModule],
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
  thumbnail: string | null = null;
  isRandomPassword: boolean = false;
  mustChangePassword: boolean = false;
  isAction: boolean = false;
  isLockedOut: boolean = false;

  activeTab: string | number = '0';
  errorMessage: string = '';
  isSubmitting: boolean = false;
  previewImageUrl: string | ArrayBuffer | null = null;

  rolesSelect: any[] = [];
  roles: number[] = [];

  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    password?: string;
    phone?: string;
    confirmPassword?: string;
  } = {};

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private userService: UserService, private router: Router, private alertService: AlertService, public authService: AuthService) { }

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
        this.errorMessage = LOAD_ROLE_LIST_FAILED;
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
        this.errorMessage = IMAGE_FILE_TOO_LARGE;
        return;
      }

      if (!file.type.match('image.*')) {
        this.errorMessage = ONLY_IMAGE_FILES_ALLOWED;
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

    const passwordError = validatePasswordCreateUser(this.password, this.isRandomPassword);
    if (passwordError) this.errors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(this.password, this.confirmPassword, this.isRandomPassword);
    if (confirmPasswordError) this.errors.confirmPassword = confirmPasswordError;

    const rolesError = validateRole(this.roles);
    if (rolesError) {
      this.errorMessage = rolesError;
      return false;
    }


    return Object.keys(this.errors).length === 0;
  }

  saveUser(): void {
    if (!this.validateForm()) {
      if (this.activeTab === '1' && Object.keys(this.errors).length > 0) {
        this.setActiveTab('0');
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
            this.errorMessage = UPLOAD_IMAGE_FAILED;
            this.isSubmitting = false;
          }
        },
        error: (err) => {
          this.errorMessage = UPLOAD_IMAGE_FAILED;
          this.isSubmitting = false;
        }
      });
    } else {
      this.thumbnail = null;
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

          this.alertService.success(res?.message)
          this.router.navigate([USERS]);
        } else if (res.code === 4001) {

          this.errors.email = res?.message;
          this.isSubmitting = false;
          if (this.activeTab === '1' && Object.keys(this.errors).length > 0) {
            this.setActiveTab('0');
            return;
          }
        } else if (res.code === 4002) {
          this.errors.username = res.message;
          this.isSubmitting = false;
        } else if (res.code === 4018) {
          this.errors.phone = res.message;
          this.isSubmitting = false;
        } else if (res.code === 4004) {
          this.errors.password = res.message;
          this.isSubmitting = false;
        } else {
          this.errorMessage = res.message;
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        this.alertService.error(CREATE_USER_FAILED)
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate([USERS]);
  }

}