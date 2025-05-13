import { LOAD_ROLE_LIST_FAILED, LOAD_USER_INFO_FAILED } from './../../../constants/error-message';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { FormInputComponent } from '../../../components/common/form-input/form-input.component';
import { UserService } from '../../../services/user.service';
import { validateEmail, validateFirstName, validateLastName, validatePhoneNumber, validateRole, validateUsername } from '../../../utils/validators';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth.service';
import { USERS } from '../../../constants/path-valiable';
import { TabsModule } from 'primeng/tabs';
import { PasswordModule } from 'primeng/password';
import { IMAGE_FILE_TOO_LARGE, ONLY_IMAGE_FILES_ALLOWED, UPDATE_USER_FAILED, UPLOAD_IMAGE_FAILED } from '../../../constants/error-message';


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
  activeTab: string | number = '0'

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
        this.errorMessage = LOAD_ROLE_LIST_FAILED;
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
            this.previewImageUrl = user.thumbnail;
          }

          if (user.roleName && this.rolesSelect.length > 0) {
            this.updateSelectedRoles(user.roleName);
          }
        }
      },
      error: (err) => {
        this.errorMessage = LOAD_USER_INFO_FAILED;
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
        this.errorMessage = IMAGE_FILE_TOO_LARGE
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

    const rolesError = validateRole(this.roles);
    if (rolesError) {
      this.errorMessage = rolesError;
      return false;
    }
    return Object.keys(this.errors).length === 0 && !this.errorMessage;
  }

  updateUser(): void {
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
          this.alertService.success(res.message)
          this.router.navigate([USERS]);
        } else if (res.code === 4018) {
          this.errors.phone = res.message
        } else {
          this.errorMessage = UPDATE_USER_FAILED;
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMessage = UPDATE_USER_FAILED;
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate([USERS]);
  }
}