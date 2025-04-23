import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { CreatedRole, RoleService } from '../../services/role.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FormInputComponent } from '../../components/common/form-input/form-input.component';
import { validateRoleName } from '../../utils/validators';
import { FormViewComponent } from '../../components/form-view/form-view.component';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
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

@Component({
  selector: 'app-role',
  imports: [FormsModule, CommonModule, FormInputComponent, FormViewComponent, TreeModule, CommonModule, NgIf, FormsModule, DialogModule, TreeModule, NgxPaginationModule, MenuModule, DropdownModule, PanelModule, SelectModule, PaginatorModule, InputGroupAddonModule, TableModule, ButtonModule, BadgeModule, InputGroupModule],
  templateUrl: './role.component.html',
  styleUrl: './role.component.css'
})
export class RoleComponent {
  roles: any[] = [];
  permissions: any[] = [];
  permissionTree: TreeNode[] = [];
  selectedPermissions: TreeNode[] = [];
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;

  newRole: CreatedRole = {
    name: '',
    status: false,
    permissions: []
  };

  activeTab: string = 'tab1';
  isEditMode: boolean = false;
  selectedRoleId: number | null = null;

  description = 'Nếu bạn đang thay đổi quyền của riêng bạn, bạn có thể cần phải làm mới trang (F5) để có hiệu lực của các thay đổi quyền trên màn hình của riêng bạn!'
  errors: {
    name?: string
  } = {}
  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }
  constructor(private roleService: RoleService, public authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.loadRole();
    this.loadPermissions();
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

  loadPermissions(): void {
    this.roleService.getPermissions().subscribe(res => {
      if (res.result && Array.isArray(res.result)) {
        this.permissions = res.result;
        this.permissionTree = this.buildPrimeNGTree(res.result);
      } else {
        console.error("Invalid response format:", res.result);
        this.permissions = [];
        this.permissionTree = [];
      }
    });
  }

  // Chuyển đổi dữ liệu permission sang định dạng TreeNode của PrimeNG
  buildPrimeNGTree(data: any[]): TreeNode[] {
    let tree: TreeNode[] = [];

    // Tạo map để lưu trữ các node dựa trên path
    const nodeMap = new Map<string, TreeNode>();

    data.forEach(item => {
      let parts: string[] = item.name.split(".");
      let slug: string = item.slug ? item.slug.trim() : "";
      let id: number = item.id;
      let path = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const currentPath = path ? `${path}.${part}` : part;

        if (!nodeMap.has(currentPath)) {
          const isLeaf = i === parts.length - 1;
          const newNode: TreeNode = {
            key: isLeaf ? id.toString() : currentPath,
            label: part,
            data: {
              id: isLeaf ? id : null,
              slug: isLeaf ? slug : "",
              fullPath: currentPath
            },
            selectable: isLeaf && slug !== "",
            leaf: isLeaf && slug !== "",
            children: []
          };

          if (path === '') {
            // Nút gốc
            tree.push(newNode);
          } else {
            // Nút con
            const parentNode = nodeMap.get(path);
            if (parentNode && parentNode.children) {
              parentNode.children.push(newNode);
            }
          }

          nodeMap.set(currentPath, newNode);
        }

        path = currentPath;
      }
    });

    return tree;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;

    // Khi chuyển sang tab quyền, cập nhật trạng thái chọn của Tree
    if (tab === 'tab2' && this.isEditMode) {
      setTimeout(() => {
        this.updateTreeSelection();
      }, 100);
    }
  }

  validate(): boolean {
    this.errors = {}
    const nameError = validateRoleName(this.newRole.name)
    if (nameError) this.errors.name = nameError
    return Object.keys(this.errors).length === 0;
  }

  // Xử lý khi chọn một node
  nodeSelect(event: any) {
    const node = event.node;
    if (node.data && node.data.id) {
      if (!this.newRole.permissions.includes(node.data.id)) {
        this.newRole.permissions.push(node.data.id);
      }
    }
  }

  // Xử lý khi bỏ chọn một node
  nodeUnselect(event: any) {
    const node = event.node;
    if (node.data && node.data.id) {
      this.newRole.permissions = this.newRole.permissions.filter(id => id !== node.data.id);
    }
  }

  // Cập nhật lựa chọn trên Tree dựa trên permissions đã chọn
  updateTreeSelection() {
    this.selectedPermissions = [];

    const findAndSelectNodes = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.data && node.data.id && this.newRole.permissions.includes(node.data.id)) {
          this.selectedPermissions.push(node);
        }

        if (node.children && node.children.length > 0) {
          findAndSelectNodes(node.children);
        }
      }
    };

    findAndSelectNodes(this.permissionTree);
  }

  // Phương thức để mở modal tạo mới vai trò
  openCreateModal(): void {
    this.resetForm();
    this.isEditMode = false;
    this.selectedRoleId = null;
    this.setActiveTab('tab1');
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
    this.setActiveTab('tab1');

    // Lấy thông tin vai trò cần chỉnh sửa
    this.roleService.getRoleById(roleId).subscribe({
      next: (response) => {
        if (!response || !response.result) {
          alert("Không thể lấy thông tin vai trò: Dữ liệu không hợp lệ");
          return;
        }

        const roleData = response.result;
        this.newRole.name = roleData.name;
        this.newRole.status = roleData.status;

        // Xử lý permissions là mảng các đối tượng
        if (Array.isArray(roleData.permissions)) {
          // Chuyển đổi mảng đối tượng permissions thành mảng id
          this.newRole.permissions = roleData.permissions.map((p: any) => p.id);
        } else {
          console.warn("Permissions is not an array:", roleData.permissions);
          this.newRole.permissions = [];
        }

        // Mở modal sau khi đã load dữ liệu
        const modalElement = document.getElementById('exampleModal');
        if (modalElement) {
          const bsModal = new (window as any).bootstrap.Modal(modalElement);
          bsModal.show();
        }
      },
      error: (error) => {
        console.error("Error detail:", error);
        let errorMessage = "Không xác định";

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }

        alert(`Không thể lấy thông tin vai trò: ${errorMessage}`);
      }
    });
  }

  // Phương thức để reset form
  resetForm(): void {
    this.newRole = {
      name: '',
      status: false,
      permissions: []
    };
    this.selectedPermissions = [];
  }

  // Phương thức lưu thông tin (cả tạo mới và cập nhật)
  saveRole(): void {
    if (!this.validate()) return

    const roleData = {
      name: this.newRole.name,
      status: this.newRole.status,
      permissions: this.newRole.permissions,
    };

    if (this.isEditMode && this.selectedRoleId) {
      // Cập nhật vai trò
      this.roleService.updateRole(this.selectedRoleId, roleData).subscribe({
        next: (res) => {
          if (res.code === 200) {
            alert("Vai trò đã được cập nhật thành công!");
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
            console.log(currentUser);

            if (currentUser?.role === roleData.name) {
              alert('Vai trò hiện tại của bạn đã được thay đổi. Vui lòng đăng nhập lại để áp dụng quyền mới.');
              this.logout()
             
            }
          } else if (res.code === 4012) {
            alert('Vai trò không tồn tại');
          } else if (res.code === 4016) {
            alert('Không thể thực hiện với vai trò của hệ thống')
          }
        },
        error: (error) => {
          console.error("Lỗi khi cập nhật vai trò:", error);
          alert(`Lỗi khi cập nhật vai trò: ${error.error?.message || "Không xác định"}`);
        }
      });
    } else {
      // Tạo mới vai trò
      this.roleService.createRole(roleData).subscribe({
        next: (res) => {
          if (res.code === 200) {
            alert("Vai trò đã được tạo thành công!");
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
            this.errors.name = "Tên người dùng đã tồn tại";
          }
        },
        error: (error) => {
          console.error("Lỗi khi tạo vai trò:", error);
          alert(`Lỗi khi tạo vai trò: ${error.error?.message || "Không xác định"}`);
        }
      });
    }
  }
  deleteRole(roleId: number): void {
    const confirmDelete = confirm('Nếu xóa vai trò này thì tất cả người dùng có vai trò cũng bị xóa, bạn có muốn xóa không?');
    if (!confirmDelete) return;

    this.roleService.deleteRole(roleId).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.loadRole();
          alert('Xoá vai trò thành công thành công!');
        } else if (res.code === 4012) {
          alert('Vai trò không tồn tại');
        } else if (res.code === 4016) {
          alert('Không thể thực hiện với vai trò của hệ thống')
        }
      },
      error: (err) => {
        console.error('Lỗi xoá người dùng:', err);
        alert('Không thể xoá người dùng. Vui lòng thử lại sau.');
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('jwtToken')
        this.router.navigate(['account/login'])
      },
      error: err => {
        console.error('Logout failed:', err);
        localStorage.removeItem('token');
        this.router.navigate(['account/login']);
      }
    })
  }
}