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
import { AlertService } from '../../services/alert.service';

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
  isSubmitting: boolean = false;
  selectedRoleId: number | null = null;

  description = 'Nếu bạn đang thay đổi quyền của riêng bạn, bạn có thể cần phải làm mới trang (F5) để có hiệu lực của các thay đổi quyền trên màn hình của riêng bạn!'
  errors: {
    name?: string
  } = {}
  visible: boolean = false;

  showDialog() { this.visible = true; }
  constructor(private roleService: RoleService, public authService: AuthService, private router: Router, private alertService: AlertService) { }

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

  buildPrimeNGTree(data: any[]): TreeNode[] {
    let tree: TreeNode[] = [];
    const nodeMap = new Map<string, TreeNode>();

    // Sắp xếp dữ liệu để đảm bảo node cha được xử lý trước
    const sortedData = [...data].sort((a, b) => a.name.split('.').length - b.name.split('.').length);
    sortedData.forEach(item => {
      const parts: string[] = item.name.split(".");
      const slug: string = item.slug ? item.slug.trim() : "";
      const id: number = item.id;
      let currentPath = "";

      // Tạo hoặc cập nhật node cho mỗi phần của path
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        currentPath = currentPath ? `${currentPath}.${part}` : part;

        // Kiểm tra xem item hiện tại có khớp với đường dẫn đầy đủ không
        const isExactMatch = currentPath === item.name;

        if (!nodeMap.has(currentPath)) {
          // Tạo node mới
          const newNode: TreeNode = {
            key: id.toString(), // Mỗi node đều có key riêng
            label: part,
            data: {
              id: isExactMatch ? id : null, // Chỉ gán id khi đúng node
              slug: isExactMatch ? slug : "",
              fullPath: currentPath
            },
            selectable: true, // Tất cả các node đều có thể chọn
            children: []
          };

          // Thêm vào tree hoặc node cha
          if (i === 0) {
            tree.push(newNode);
          } else {
            const parentPath = currentPath.substring(0, currentPath.lastIndexOf('.'));
            const parentNode = nodeMap.get(parentPath);
            if (parentNode && parentNode.children) {
              parentNode.children.push(newNode);
            }
          }

          nodeMap.set(currentPath, newNode);
        } else if (isExactMatch) {
          // Cập nhật node đã tồn tại với dữ liệu từ item hiện tại
          const existingNode = nodeMap.get(currentPath);
          if (existingNode) {
            existingNode.key = id.toString();
            existingNode.data = {
              ...existingNode.data,
              id: id,
              slug: slug
            };
          }
        }
      }
    });

    // Cập nhật node dựa trên data thực tế
    data.forEach(item => {
      const node = nodeMap.get(item.name);
      if (node) {
        node.data = {
          id: item.id,
          slug: item.slug,
          fullPath: item.name
        };
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

    // Add the current node to permissions if it has an id
    if (node.data && node.data.id) {
      if (!this.newRole.permissions.includes(node.data.id)) {
        this.newRole.permissions.push(node.data.id);
      }
    }

    // If node is a parent - select all children
    if (node.children && node.children.length > 0) {
      this.selectAllChildren(node);
    }

    // Select all parent nodes and make them fully checked
    this.selectAllParents(node);

    // Force update the selection model to ensure UI representation is correct
    this.selectedPermissions = [...this.selectedPermissions];
  }
  // Hàm mới để chọn tất cả node cha
  selectAllParents(node: TreeNode): void {
    if (!node.data || !node.data.fullPath) return;

    const fullPath = node.data.fullPath;
    const pathParts = fullPath.split('.');

    // Skip if this is a root node
    if (pathParts.length <= 1) return;

    const findAndSelectParent = (nodes: TreeNode[], currentPathLevel: number): boolean => {
      for (const currentNode of nodes) {
        if (!currentNode.data || !currentNode.data.fullPath) continue;

        const expectedPath = pathParts.slice(0, currentPathLevel).join('.');

        if (currentNode.data.fullPath === expectedPath) {
          // This is a parent node, select it
          if (currentNode.data.id && !this.newRole.permissions.includes(currentNode.data.id)) {
            this.newRole.permissions.push(currentNode.data.id);
          }

          // Ensure the node is in selectedPermissions
          if (!this.selectedPermissions.some(p => p === currentNode)) {
            this.selectedPermissions.push(currentNode);
          }

          // Continue to find parent at higher level
          if (currentPathLevel > 1) {
            findAndSelectParent(this.permissionTree, currentPathLevel - 1);
          }

          return true;
        }

        // Search in children
        if (currentNode.children && currentNode.children.length > 0) {
          if (findAndSelectParent(currentNode.children, currentPathLevel)) {
            return true;
          }
        }
      }
      return false;
    };

    // Start finding from the highest level minus 1
    findAndSelectParent(this.permissionTree, pathParts.length - 1);
  }
  // Hàm đệ quy chọn tất cả node con
  selectAllChildren(node: TreeNode): void {
    if (node.children && node.children.length > 0) {
      node.children.forEach(childNode => {
        // Nếu node con là node lá có id
        if (childNode.data && childNode.data.id) {
          if (!this.newRole.permissions.includes(childNode.data.id)) {
            this.newRole.permissions.push(childNode.data.id);
          }
          // Thêm node vào selectedPermissions nếu chưa có
          if (!this.selectedPermissions.includes(childNode)) {
            this.selectedPermissions.push(childNode);
          }
        }
        // Nếu node con có các node con khác, tiếp tục đệ quy
        this.selectAllChildren(childNode);
      });
    }
  }

  // Xử lý khi bỏ chọn một node
  nodeUnselect(event: any) {
    const node = event.node;

    // Chỉ xóa node hiện tại khỏi danh sách permissions
    if (node.data && node.data.id) {
      this.newRole.permissions = this.newRole.permissions.filter(id => id !== node.data.id);
    }

    // Bỏ chọn tất cả các node con nếu có
    if (node.children && node.children.length > 0) {
      this.unselectAllChildren(node);
    }

    // Quan trọng: Không bỏ chọn node cha
    // PrimeNG mặc định sẽ làm điều này, nhưng chúng ta sẽ ghi đè bằng cách cập nhật lại selectedPermissions

    // Đảm bảo tất cả node cha vẫn được giữ lại trong selectedPermissions
    setTimeout(() => {
      // Tìm và thêm lại các node cha vào selectedPermissions nếu chúng có trong permissions
      this.permissionTree.forEach(rootNode => {
        this.checkAndRestoreParentSelection(rootNode);
      });
    }, 0);
  }

  // Hàm mới để kiểm tra và khôi phục trạng thái chọn của các node cha
  checkAndRestoreParentSelection(node: TreeNode): void {
    if (node.data && node.data.id && this.newRole.permissions.includes(node.data.id)) {
      // Nếu node này có trong permissions, đảm bảo nó được chọn
      if (!this.selectedPermissions.includes(node)) {
        this.selectedPermissions.push(node);
      }
    }

    // Kiểm tra các node con
    if (node.children && node.children.length > 0) {
      node.children.forEach(childNode => {
        this.checkAndRestoreParentSelection(childNode);
      });
    }
  }
  // Hàm đệ quy bỏ chọn tất cả node con
  unselectAllChildren(node: TreeNode): void {
    if (node.children && node.children.length > 0) {
      node.children.forEach(childNode => {
        // Nếu node con là node lá có id
        if (childNode.data && childNode.data.id) {
          this.newRole.permissions = this.newRole.permissions.filter(id => id !== childNode.data.id);
          // Xóa node khỏi selectedPermissions
          this.selectedPermissions = this.selectedPermissions.filter(p => p !== childNode);
        }
        // Nếu node con có các node con khác, tiếp tục đệ quy
        this.unselectAllChildren(childNode);
      });
    }
  }

  // Cập nhật lựa chọn trên Tree dựa trên permissions đã chọn
  updateTreeSelection() {
    this.selectedPermissions = [];

    // Helper function to find nodes by ID
    const findNodesById = (nodes: TreeNode[], ids: number[]): TreeNode[] => {
      let result: TreeNode[] = [];

      for (const node of nodes) {
        if (node.data && node.data.id && ids.includes(node.data.id)) {
          result.push(node);
        }

        if (node.children && node.children.length > 0) {
          result = [...result, ...findNodesById(node.children, ids)];
        }
      }

      return result;
    };

    // First, find all nodes that match our permissions
    const selectedNodes = findNodesById(this.permissionTree, this.newRole.permissions);

    // For each node, make sure all its parents are selected too
    for (const node of selectedNodes) {
      this.selectedPermissions.push(node);

      if (node.data && node.data.fullPath && node.data.fullPath.includes('.')) {
        this.selectAllParents(node);
      }
    }

    // Force update the selection model
    this.selectedPermissions = [...this.selectedPermissions];
  }
  // Kiểm tra xem node hoặc tất cả các con của nó có được chọn không
  isNodeOrChildrenSelected(node: TreeNode): boolean {
    // Nếu node có id và được chọn
    if (node.data && node.data.id && this.newRole.permissions.includes(node.data.id)) {
      return true;
    }

    // Nếu có children, kiểm tra tất cả các con
    if (node.children && node.children.length > 0) {
      return node.children.every(child => this.isNodeOrChildrenSelected(child));
    }

    return false;
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
          this.alertService.error("Không thể lấy thông tin vai trò: Dữ liệu không hợp lệ")
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
    this.selectedPermissions = [];
  }

  // Phương thức lưu thông tin (cả tạo mới và cập nhật)
  saveRole(): void {
    if (!this.validate()) return

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
            this.alertService.success("Vai trò đã được cập nhật thành công!")
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
              this.alertService.warning("Vai trò hiện tại của bạn đã được thay đổi. Vui lòng đăng nhập lại để áp dụng quyền mới.")
              this.logout()

            }
          } else if (res.code === 4012) {
            this.alertService.error("Vai trò không tồn tại")
          } else if (res.code === 4016) {
            this.alertService.error("Không thể thực hiện với vai trò của hệ thống")
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.alertService.error("Lỗi khi cập nhật vai trò")
        }
      });
    } else {
      // Tạo mới vai trò
      this.roleService.createRole(roleData).subscribe({
        next: (res) => {
          if (res.code === 200) {
            this.alertService.success("Vai trò đã được tạo thành công!")
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
          this.alertService.error("Lỗi khi tạo vai trò")

        }
      });
    }
  }
  deleteRole(roleId: number): void {
    const confirmDelete = confirm('Nếu xóa vai trò này thì tất cả người dùng có vai trò cũng bị xóa, bạn có muốn xóa không?');
    if (!confirmDelete) return;

    const currentUser = this.authService.getCurrentUser();
    const roleToDelete = this.roles.find(role => role.id === roleId);

    if (currentUser && roleToDelete && currentUser.role === roleToDelete.name) {
      this.alertService.error("Bạn không thể xóa vai trò của chính mình!");
      return;
    }

    this.roleService.deleteRole(roleId).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.loadRole();
          this.alertService.success("Xoá vai trò thành công thành công!")


        } else if (res.code === 4012) {
          this.alertService.error("Vai trò không tồn tại")
        } else if (res.code === 4016) {
          this.alertService.error("Không thể thực hiện với vai trò của hệ thống")
        }
      },
      error: (err) => {
        this.alertService.error("Không thể xoá người dùng. Vui lòng thử lại sau.")
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
        localStorage.removeItem('token');
        this.router.navigate(['account/login']);
      }
    })
  }
}