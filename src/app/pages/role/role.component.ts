import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormInputComponent } from '../../components/common/form-input/form-input.component';
import { validateRoleName } from '../../utils/validators';
import { FormViewComponent } from '../../components/form-view/form-view.component';
import { DialogModule } from 'primeng/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { MenuModule } from 'primeng/menu';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { InputGroupModule } from 'primeng/inputgroup';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { Router } from '@angular/router';
import { PermissionTreeComponent } from '../../components/permission-tree/permission-tree.component';
import { LOGIN } from '../../constants/path-valiable';
import { CreatedRole } from '../../models/role.model';
import { RoleService } from '../../services/role.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { CheckboxModule } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { CANNOT_DELETE_OWN_ROLE, CONFIRM_DELETE_ROLE_WITH_USERS, CREATE_ROLE_FAILED, CREATE_ROLE_SUCCESS, CURRENT_ROLE_CHANGED, DELETE_ROLE_SUCCESS, DELETE_USER_ERROR, DELETE_USER_FAILED, GET_ROLE_INFO_INVALID_DATA, ROLE_NAME_ALREADY_EXISTS, ROLE_NOT_FOUND, SELF_ROLE_CHANGE_RELOGIN_WARNING, SYSTEM_ROLE_ACTION_FORBIDDEN, UPDATE_ROLE_ERROR, UPDATE_ROLE_SUCCESS } from '../../constants/error-message';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [FormsModule, TabsModule, CommonModule, CheckboxModule, FormInputComponent, CommonModule, NgIf, FormsModule, DialogModule, NgxPaginationModule, MenuModule, DropdownModule, PanelModule, SelectModule, PaginatorModule, InputGroupAddonModule, TableModule, ButtonModule, BadgeModule, InputGroupModule, PermissionTreeComponent],
  templateUrl: './role.component.html',
  styleUrl: './role.component.css'
})
export class RoleComponent {
  roles: any[] = [];
  permissions: any[] = [];
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;

  newRole: CreatedRole = {
    name: '',
    status: false,
    permissions: []
  };

  activeTab: string | number = '0';
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  selectedRoleId: number | null = null;

  description = SELF_ROLE_CHANGE_RELOGIN_WARNING
  errors: {
    name?: string
  } = {}
  visible: boolean = false;
  first = 0;

  showDialog() { this.visible = true; }
  constructor(private roleService: RoleService, public authService: AuthService, private router: Router, private alertService: AlertService) { }

  ngOnInit(): void {
    this.loadRole();
    this.loadPermissions();
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.onHideModal();
      });
    }
  }

  onPageChange(event: any) {
    this.pageNumber = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    this.pageSize = event.rows || 10;
    this.loadRole();
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  loadRole(): void {
    this.roleService.getRoles(this.pageNumber, this.pageSize).subscribe(res => {
      this.roles = res.result.contents;
      this.totalRecords = res.result.totalRecords;
    });
  }
  onHideModal(): void {
    this.errors = {};
    this.resetForm();
  }

  loadPermissions(): void {
    this.roleService.getPermissions().subscribe(res => {
      if (res.result && Array.isArray(res.result)) {
        this.permissions = res.result;
      } else {
        console.error("Invalid response format:", res.result);
        this.permissions = [];
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  validate(): boolean {
    this.errors = {}

    const nameError = validateRoleName(this.newRole.name)
    if (nameError) this.errors.name = nameError

    return Object.keys(this.errors).length === 0;
  }

  // Handler for permission changes from PermissionTreeComponent
  onPermissionsChange(permissions: number[]): void {
    this.newRole.permissions = permissions;
  }

  // Phương thức để mở modal tạo mới vai trò
  openCreateModal(): void {
    this.resetForm();
    this.isEditMode = false;
    this.selectedRoleId = null;
    this.setActiveTab('0');
    // Mở modal bằng Bootstrap
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      const bsModal = new (window as any).bootstrap.Modal(modalElement);
      bsModal.show();
    }
  }

  // Phương thức để mở modal chỉnh sửa vai trò
  openEditModal(roleId: number): void {
    this.resetForm();
    this.isEditMode = true;
    this.selectedRoleId = roleId;
    this.setActiveTab('0');

    // Lấy thông tin vai trò cần chỉnh sửa
    this.roleService.getRoleById(roleId).subscribe({
      next: (response) => {
        if (!response || !response.result) {
          this.alertService.error(GET_ROLE_INFO_INVALID_DATA)
          return;
        }

        const roleData = response.result;
        this.newRole.name = roleData.name;
        this.newRole.status = roleData.status;

        if (Array.isArray(roleData.permissions)) {
          this.newRole.permissions = roleData.permissions.map((p: any) => p.id);
        } else {
          this.newRole.permissions = [];
        }
        const modalElement = document.getElementById('exampleModal');
        if (modalElement) {
          const bsModal = new (window as any).bootstrap.Modal(modalElement);
          bsModal.show();
        }
      },
      error: (error) => {
        let errorMessage = "Không xác định";

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        this.alertService.error("Không thể lấy thông tin vai trò")
      }
    });
  }

  resetForm(): void {
    this.newRole = {
      name: '',
      status: false,
      permissions: []
    };
    this.isSubmitting = false;
    this.isEditMode = false;
    this.errors = {};
  }

  saveRole(): void {
    if (!this.validate()) {
      if (this.activeTab === '1' && Object.keys(this.errors).length > 0) {
        this.setActiveTab('0');
        return;
      }
      return;
    }

    this.isSubmitting = true

    const roleData = {
      name: this.newRole.name,
      status: this.newRole.status,
      permissions: this.newRole.permissions.filter(id => id !== null && id !== undefined),
    };

    if (this.isEditMode && this.selectedRoleId) {
      // Cập nhật vai trò
      this.roleService.updateRole(this.selectedRoleId, roleData).subscribe({
        next: (res) => {
          if (res.code === 200) {
            this.alertService.success(UPDATE_ROLE_SUCCESS)
            this.loadRole();
            // Đóng modal
            const modalElement = document.getElementById('exampleModal');
            if (modalElement) {
              const bsModal = (window as any).bootstrap.Modal.getInstance(modalElement);
              if (bsModal) {
                bsModal.hide();
              }
            }
            const currentUser = this.authService.getCurrentUser();

            let userRoles = [];
            if (currentUser && currentUser.role) {
              if (typeof currentUser.role === 'string') {
                userRoles = currentUser.role.split(',').map((role: string) => role.trim());
              } else if (Array.isArray(currentUser.role)) {
                userRoles = currentUser.role;
              } else if (typeof currentUser.role === 'object') {
                console.log("Role object:", currentUser.role);
              }
            }

            if (userRoles.length > 0 && userRoles.includes(roleData.name)) {
              this.alertService.warning(CURRENT_ROLE_CHANGED)
              this.authService.logout().subscribe({
                next: () => {
                  localStorage.removeItem('jwtToken')
                  this.router.navigate([LOGIN])
                },
                error: err => {
                  localStorage.removeItem('token');
                  this.router.navigate([LOGIN]);
                }
              })
            }
          } else if (res.code === 4012) {
            this.alertService.error(res?.message)
            this.isSubmitting = false;
          } else if (res.code === 4016) {
            this.alertService.error(res?.message)
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.alertService.error(UPDATE_ROLE_ERROR)
        }
      });
    } else {
      // Tạo mới vai trò
      this.roleService.createRole(roleData).subscribe({
        next: (res) => {
          if (res.code === 200) {
            this.alertService.success(CREATE_ROLE_SUCCESS)
            this.loadRole();

            // Đóng modal
            const modalElement = document.getElementById('exampleModal');
            if (modalElement) {
              const bsModal = (window as any).bootstrap.Modal.getInstance(modalElement);
              if (bsModal) {
                bsModal.hide();
              }
            }

          } else if (res.code === 4015) {
            this.errors.name = ROLE_NAME_ALREADY_EXISTS;
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          this.alertService.error(CREATE_ROLE_FAILED)
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteRole(roleId: number): void {
    const confirmDelete = confirm(CONFIRM_DELETE_ROLE_WITH_USERS);
    if (!confirmDelete) return;

    const currentUser = this.authService.getCurrentUser();
    const roleToDelete = this.roles.find(role => role.id === roleId);

    if (!currentUser || !roleToDelete) {
      return;
    }
    let userHasRole = false;

    if (currentUser.role) {
      if (typeof currentUser.role === 'string') {
        const userRoles = currentUser.role.split(',').map((role: string) => role.trim());
        userHasRole = userRoles.includes(roleToDelete.name);
      } else if (Array.isArray(currentUser.role)) {
        userHasRole = currentUser.role.includes(roleToDelete.name);
      } else if (typeof currentUser.role === 'object') {
        console.log("Role object:", currentUser.role);
      }
    }
    if (userHasRole) {
      this.alertService.error(CANNOT_DELETE_OWN_ROLE);
      return;
    }

    this.roleService.deleteRole(roleId).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.loadRole();
          this.alertService.success(DELETE_ROLE_SUCCESS)
        } else if (res.code === 4012) {
          this.alertService.error(ROLE_NOT_FOUND)
        } else if (res.code === 4016) {
          this.alertService.error(SYSTEM_ROLE_ACTION_FORBIDDEN)
        }
      },
      error: (err) => {
        this.alertService.error(DELETE_USER_FAILED)
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('jwtToken')
        this.router.navigate([LOGIN])
      },
      error: err => {
        localStorage.removeItem('token');
        this.router.navigate([LOGIN]);
      }
    })
  }
}