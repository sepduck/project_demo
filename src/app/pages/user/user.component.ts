import { InputGroupModule } from 'primeng/inputgroup';
import { CommonModule, NgIf } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginResult } from '../account/login/login.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginatorModule } from 'primeng/paginator'; // 
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { RoleService } from '../../services/role.service';
import { AlertService } from '../../services/alert.service';


@Component({
  selector: 'app-user',
  imports: [CommonModule, NgIf, FormsModule, DialogModule, TreeModule, NgxPaginationModule, MenuModule, DropdownModule, PanelModule, SelectModule, PaginatorModule, InputGroupAddonModule, TableModule, ButtonModule, BadgeModule, InputGroupModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  users: any[] = [];
  rolesSelect: any[] = [];
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;
  activeTab: string = 'tab1';
  showAdvancedFilter: boolean = false;

  firstName: string = '';
  lastName: string = '';
  email: string = '';
  userName: string = '';
  password: string = '';
  phoneNumber: string = '';
  verifyToken: boolean = false;
  thumbnail: string = '';
  isRandomPassword: boolean = false;
  errorMessage: string = '';
  isPasswordVisible: boolean = false;
  roles: any[] = [];
  previewImageUrl: string | ArrayBuffer | null = null;
  permissionTree: TreeNode[] = [];
  selectedPermissions: TreeNode[] = [];

  name: string = '';
  selectedRoleId: number = 0;
  filterState: 'all' | 'search' | 'role' | 'permissions' = 'all'
  permissions: any[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  constructor(private userService: UserService, private router: Router, public authService: AuthService, private roleService: RoleService, private alertService: AlertService) { }

  onPageChange(event: any) {
    this.pageNumber = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    this.pageSize = event.rows || 10;

    if (this.filterState === 'search' && this.name) {
      this.searchUserByName(false); // Truyền false để ngăn reset về trang 1
    } else if (this.filterState === 'role' && this.selectedRoleId) {
      this.filterUserByRole(false); // Truyền false để ngăn reset về trang 1
    } else if (this.filterState === 'permissions' && this.selectedPermissionIds.length > 0) {
      this.filterUserByPermissions(false); // Truyền false để ngăn reset về trang 1
    } else {
      this.loadUser();
    }
  }
  // Add a computed property for totalPages
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }
  ngOnInit(): void {
    this.loadUser();
    this.loadRolesSelect();
    this.loadPermissions();

  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleAdvancedFilter(): void {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  loadUser(): void {
    this.userService.getUsers(this.pageNumber, this.pageSize).subscribe(res => {
      if (res.code === 200) {
        this.users = res.result.contents;
        this.totalRecords = res.result.totalRecords;
        this.pageNumber = res.result.pageNumber;
        this.pageSize = res.result.pageSize;
      } else {
        this.errorMessage = 'Không thể tải dữ liệu người dùng';
      }
    });
  }
  searchUserByName(resetPage: boolean = true): void {
    if (resetPage) {
      this.pageNumber = 1;
    }
    this.filterState = 'search';
    if (!this.name || this.name.trim() === '') {
      this.filterState = 'all';
      this.loadUser();
      return;
    }
    this.userService.searchUserByName(this.name, this.pageNumber, this.pageSize).subscribe(res => {
      if (res.code === 200) {
        this.users = res.result.contents;
        this.totalRecords = res.result.totalRecords;
        this.pageNumber = res.result.pageNumber;
        this.pageSize = res.result.pageSize;
      } else {
        this.errorMessage = 'Không thể tải dữ liệu người dùng';
      }
    });
  }

  filterUserByRole(resetPage: boolean = true): void {
    if (resetPage) {
      this.pageNumber = 1;
    }

    this.filterState = 'role';

    if (this.selectedRoleId === null) {
      this.filterState = 'all';
      this.loadUser();
      return;
    }

    this.userService.filterByRole(this.selectedRoleId, this.pageNumber, this.pageSize).subscribe(res => {
      if (res.code === 200) {
        this.users = res.result.contents;
        this.totalRecords = res.result.totalRecords;
        this.pageNumber = res.result.pageNumber;
        this.pageSize = res.result.pageSize;
      } else {
        this.errorMessage = 'Không thể tải dữ liệu người dùng';
      }
    });
  }
  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value, 10);
    this.pageNumber = 1; // Reset về trang đầu tiên
    this.loadUser();
  }
  loadRolesSelect(): void {
    this.userService.getRolesSelect().subscribe(res => {
      if (res.code === 200) {
        this.rolesSelect = res.result;
      }
    });
  }

  goToUpdate(id: string): void {
    this.router.navigate(['/app/admin/users/', id]);
  }
  goToCreate(): void {
    this.router.navigate(['/app/admin/user/create']);
  }


  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.loadUser();
          this.alertService.success("Xoá người dùng thành công!")
        }
        this.errorMessage = 'Xóa người dùng thất bại';
      },
      error: (err) => {
        console.error('Lỗi xoá người dùng:', err);
        this.alertService.error("Không thể xoá người dùng. Vui lòng thử lại sau.")
      }
    });
  }

  loginAsUser(id: number): void {
    this.userService.loginAsUser(id).subscribe({
      next: (res: { code: number, message: string, result?: LoginResult }) => {
        if (res.code === 200 && res.result) {
          this.authService.saveToken(res.result.token);
          this.router.navigate(['/app/admin/dashBoard']).then(() => window.location.reload())
        } else if (res.code === 4014) {
          this.alertService.error("Tài khoản chưa được kích hoạt")
        } else if (res.code === 4009) {
          this.alertService.error("Người dùng không tồn tại")
        }
        this.alertService.error("Đăng nhập người dùng thất bại")
      },
      error: (err) => {
        this.alertService.error("Không thể đăng nhập người dùng. Vui lòng thử lại sau.")
      }
    });
  }

  refreshData(): void {
    this.name = '';
    this.selectedRoleId = 0;
    this.selectedPermissions = [];
    this.selectedPermissionIds = [];
    this.filterState = 'all';
    this.pageNumber = 1;
    this.loadUser();
  }

  // ---------------------------------------------------------------------------------------------------------------------
  selectedPermissionIds: number[] = [];

  // Phương thức khởi tạo cây permission từ danh sách phẳng
  initPermissionTree(permissions: any[]): TreeNode[] {
    const root: TreeNode[] = [];
    const map: { [key: string]: TreeNode } = {};

    // Xử lý từng permission
    permissions.forEach(perm => {
      // Tách slug để tạo cấu trúc cây
      const parts = perm.slug.split('.');
      let currentLevel = root;
      let currentPath = '';

      // Xử lý từng phần của slug để tạo cây
      parts.forEach((part: string, index: number) => {
        const isLast = index === parts.length - 1;
        currentPath += (index > 0 ? '.' : '') + part;

        // Tìm hoặc tạo node cho phần hiện tại
        const existingNode = currentLevel.find(node => node.key === currentPath);

        if (existingNode) {
          // Nếu node đã tồn tại, cập nhật nó
          if (isLast) {
            existingNode.data = perm; // Gán dữ liệu permission cho node cuối cùng
          }
          currentLevel = existingNode.children || [];
        } else {
          // Tạo node mới
          const newNode: TreeNode = {
            key: currentPath,
            label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
            children: [],
            data: isLast ? perm : null, // Chỉ gán dữ liệu nếu là node cuối
            selectable: isLast // Chỉ cho phép chọn node cuối
          };

          currentLevel.push(newNode);
          map[currentPath] = newNode;
          currentLevel = newNode.children as TreeNode[];
        }
      });
    });

    return root;
  }

  // Phương thức để lấy permission từ API và chuyển thành cây
  loadPermissions(): void {
    this.roleService.getPermissions().subscribe(res => {
      if (res.result && Array.isArray(res.result)) {
        this.permissions = res.result;
        this.permissionTree = this.buildPrimeNGTree(res.result);
        console.log("PrimeNG Tree:", this.permissionTree);
      } else {
        console.error("Invalid response format:", res.result);
        this.permissions = [];
        this.permissionTree = [];
      }
    });
  }

  // Trong file user.component.ts, chỉnh sửa phương thức buildPrimeNGTree:
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
              fullPath: currentPath,
              isParent: !isLeaf || slug === ""
            },
            // Parent nodes are selectable but will trigger special handling
            selectable: true,
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

  // Thêm phương thức để xử lý khi click vào node cha
  handleParentNodeSelection(event: any): void {
    const node = event.node;

    // Kiểm tra xem node có phải là node cha không
    if (node.data && node.data.isParent) {
      // Nếu là node cha, chọn/bỏ chọn tất cả các node con
      this.toggleSelectionForAllChildren(node, event.originalEvent.checked);

      // Cập nhật lại selectedPermissions
      this.updateSelectedPermissionIds();
    }
  }

  // Phương thức để đệ quy chọn/bỏ chọn tất cả các node con
  toggleSelectionForAllChildren(node: TreeNode, select: boolean): void {
    if (!node.children || node.children.length === 0) return;

    node.children.forEach(child => {
      // Chỉ xử lý nếu node có thể được chọn
      if (child.selectable) {
        // Thêm hoặc xóa khỏi selectedPermissions
        const index = this.selectedPermissions.findIndex(p => p.key === child.key);

        if (select && index === -1) {
          // Nếu cần chọn và chưa có trong danh sách
          this.selectedPermissions.push(child);
        } else if (!select && index !== -1) {
          // Nếu cần bỏ chọn và đã có trong danh sách
          this.selectedPermissions.splice(index, 1);
        }
      }

      // Đệ quy cho các node con
      this.toggleSelectionForAllChildren(child, select);
    });
  }

  // Sửa lại phương thức extractSelectedPermissionIds để chỉ lấy node lá
  extractSelectedPermissionIds(nodes: TreeNode[]): number[] {
    const ids: number[] = [];

    // Đảm bảo nodes không rỗng
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return ids;
    }

    // Duyệt qua các node đã chọn
    nodes.forEach(node => {
      // Chỉ lấy ID của node lá (không phải parent node)
      if (node.data && !node.data.isParent && node.data.id && !isNaN(Number(node.data.id))) {
        ids.push(Number(node.data.id));
      }
      // Có thể cũng kiểm tra key nếu cần
      else if (!node.data?.isParent && node.key && !isNaN(Number(node.key))) {
        ids.push(Number(node.key));
      }
    });

    console.log('Selected Permission IDs (leaf nodes only):', ids);
    return ids;
  }

  // Phương thức gọi khi chọn hoặc bỏ chọn permission
  onNodeSelect(event: any): void {
    this.updateSelectedPermissionIds();
  }

  onNodeUnselect(event: any): void {
    this.updateSelectedPermissionIds();
  }

  // Cập nhật danh sách ID permission đã chọn
  updateSelectedPermissionIds(): void {
    this.selectedPermissionIds = this.extractSelectedPermissionIds(this.selectedPermissions);
  }

  // Trích xuất ID từ các node đã chọn
  // extractSelectedPermissionIds(nodes: TreeNode[]): number[] {
  //   const ids: number[] = [];

  //   const extractIds = (nodes: TreeNode[]) => {
  //     if (!nodes) return;

  //     nodes.forEach(node => {
  //       if (node.data && node.data.id) {
  //         ids.push(node.data.id);
  //       }
  //       if (node.children) {
  //         extractIds(node.children);
  //       }
  //     });
  //   };

  //   extractIds(nodes);
  //   return ids;
  // }

  applyPermissionFilter(): void {
    this.visible = false;

    // Cập nhật lại selectedPermissionIds từ selectedPermissions
    this.updateSelectedPermissionIds();

    // Gọi filterUserByPermissions bất kể có permissions được chọn hay không
    this.filterUserByPermissions(true);
  }
  // Điều chỉnh phương thức filterUserByPermissions trong UserComponent
  filterUserByPermissions(resetPage: boolean = true): void {
    if (resetPage) {
      this.pageNumber = 1;
    }

    this.filterState = 'permissions';

    // Kiểm tra nếu không có quyền nào được chọn
    if (this.selectedPermissionIds.length === 0) {
      this.filterState = 'all';
      this.loadUser();
      return;
    }

    // Hiển thị loading hoặc thông báo nếu cần

    this.userService.filterByPermissions(this.selectedPermissionIds, this.pageNumber, this.pageSize)
      .subscribe({
        next: (res) => {
          if (res.code === 200) {
            console.log(this.selectedPermissionIds);

            this.users = res.result.contents;
            this.totalRecords = res.result.totalRecords;
            this.pageNumber = res.result.pageNumber;
            this.pageSize = res.result.pageSize;
          } else {
            this.errorMessage = 'Không thể lọc người dùng theo quyền';
            console.error('Lỗi: ', res.message || 'Không xác định');
          }
        },
        error: (err) => {
          console.error('Lỗi khi lọc người dùng theo quyền:', err);
          this.errorMessage = 'Lỗi kết nối khi lọc người dùng theo quyền';
          // Có thể hiển thị thông báo lỗi
        },
        complete: () => {
          // Xử lý khi hoàn thành (tắt loading nếu cần)
        }
      });
  }
}
