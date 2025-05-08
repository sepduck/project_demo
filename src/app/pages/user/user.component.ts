import { InputGroupModule } from 'primeng/inputgroup';
import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginResult } from '../account/login/login.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginatorModule } from 'primeng/paginator';
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
import { PermissionTreeComponent } from '../../components/permission-tree/permission-tree.component';
import { MenuItem } from 'primeng/api';
import * as XLSX from 'xlsx';
import { AvatarModule } from 'primeng/avatar';
import { DASHBOARD, USERS_CREATE, USERS_ID } from '../../constants/path-valiable';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { AlertService } from '../../services/alert.service';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-user',
  imports: [DialogModule, AutoCompleteModule, PermissionTreeComponent, AvatarModule, CommonModule, NgIf, FormsModule, DialogModule, TreeModule, NgxPaginationModule, MenuModule, DropdownModule, PanelModule, SelectModule, PaginatorModule, InputGroupAddonModule, TableModule, ButtonModule, BadgeModule, InputGroupModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  // Khởi tạo
  users: any[] = [];
  rolesSelect: any[] = [];
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;
  activeTab: string = 'tab1';
  showAdvancedFilter: boolean = false;
  errorMessage: string = '';

  // Form Variables
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  userName: string = '';
  password: string = '';
  phoneNumber: string = '';
  verifyToken: boolean = false;
  thumbnail: string = '';
  isRandomPassword: boolean = false;
  isPasswordVisible: boolean = false;
  first = 0;

  // Permissions and Roles
  roles: any[] = [];
  permissions: any[] = [];
  selectedPermissionIds: number[] = [];

  // Search and Filter
  name: string = '';
  selectedRoleId: number = 0;
  filterState: 'all' | 'search' | 'role' | 'permissions' = 'all'

  // Dialog visibility
  visible: boolean = false;
  items: MenuItem[] | undefined;
  excelOperations: MenuItem[] = [];
  
  constructor(private userService: UserService, private router: Router, public authService: AuthService, private roleService: RoleService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRolesSelect();
    this.loadPermissions();
    this.setupExcelOperations()

  }

  setupExcelOperations(): void {
    this.excelOperations = [
      {
        label: 'Xuất sang Excel',
        icon: 'bi bi-download',
        command: () => this.exportToExcel(),
        visible: this.authService.hasPermission('mgmt.user')
      },
      {
        label: 'Nhập từ Excel',
        icon: 'pi pi-sign-in',
        command: () => this.showImportDialog(),
        visible: this.authService.hasPermission('mgmt.user.create')
      },
      {
        label: 'Download tệp nhập mẫu',
        icon: 'bi bi-file-arrow-down',
        command: () => this.downloadTemplateFile(),
        visible: this.authService.hasPermission('mgmt.user.create')
      }
    ];
  }

  importDialogVisible: boolean = false;

  showImportDialog(): void {
    this.importDialogVisible = true;
  }

  get totalPages(): number { return Math.ceil(this.totalRecords / this.pageSize); }

  loadUsers(resetPage: boolean = true): void {
    if (resetPage) this.pageNumber = 1;

    // Xác định trạng thái filter dựa trên các tham số hiện tại
    if (this.selectedPermissionIds && this.selectedPermissionIds.length > 0) {
      this.filterState = 'permissions';
    } else if (this.selectedRoleId && this.selectedRoleId > 0) {
      this.filterState = 'role';
    } else if (this.name && this.name.trim() !== '') {
      this.filterState = 'search';
    } else {
      this.filterState = 'all';
    }

    const permissionIds = this.selectedPermissionIds ? [...this.selectedPermissionIds] : [];

    // Sử dụng searchUser cho tất cả các trường hợp
    this.userService.getUsers(
      permissionIds,
      this.name || '',
      this.selectedRoleId || 0,
      this.pageNumber,
      this.pageSize
    ).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.users = res.result.contents;
          this.totalRecords = res.result.totalRecords;
          this.pageNumber = res.result.pageNumber;
          this.pageSize = res.result.pageSize;
        } else {
          this.errorMessage = 'Không thể tải dữ liệu người dùng';
          this.alertService.error(res.message || 'Lỗi không xác định khi tải dữ liệu người dùng');
        }
      },
      error: (err) => {
        this.errorMessage = 'Lỗi kết nối khi tải dữ liệu người dùng';
        this.alertService.error("Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.");
      }
    });
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.loadUsers();
          this.alertService.success("Xoá người dùng thành công!")
        } else if (res.code === 4022) {
          this.alertService.error(res.message)
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
          this.router.navigate([DASHBOARD]).then(() => window.location.reload())
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

  onPageChange(event: any) {
    this.pageNumber = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    this.pageSize = event.rows || 10;
    this.loadUsers(false);
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value, 10);
    this.pageNumber = 1;
    this.loadUsers();
  }

  refreshData(): void {
    this.name = '';
    this.selectedRoleId = 0;
    this.selectedPermissionIds = [];
    this.pageNumber = 1;
    this.loadUsers();
  }

  loadRolesSelect(): void {
    this.userService.getRolesSelect().subscribe(res => {
      if (res.code === 200) {
        this.rolesSelect = res.result;
      }
    });
  }

  loadPermissions(): void {
    this.roleService.getPermissions().subscribe(res => {
      if (res.result && Array.isArray(res.result)) {
        this.permissions = res.result;
      } else {
        this.permissions = [];
      }
    });
  }

  setActiveTab(tab: string): void { this.activeTab = tab }
  showDialog() { this.visible = true }
  toggleAdvancedFilter(): void { this.showAdvancedFilter = !this.showAdvancedFilter }
  goToUpdate(id: string): void { this.router.navigate([USERS_ID(id)]) }
  goToCreate(): void { this.router.navigate([USERS_CREATE]) }
  onPermissionsChange(permissions: number[]): void { this.selectedPermissionIds = [...permissions] }



  exportToExcel(): void {
    this.userService.getUsers([], '', null, 1, 1000).subscribe({
      next: (res) => {
        if (res.code === 200) {
          const users = res.result.contents;

          const exportData = users.map(user => ({
            'Tên người dùng': user.username,
            'Họ': user.lastName,
            'Tên': user.firstName,
            'Email': user.email,
            'Vai trò': user.role,
            'Đã xác thực': user.verifyToken ? 'Có' : 'Không',
            'Hoạt động': user.isAction ? 'Có' : 'Không',
            'Ngày tạo': new Date(user.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }));

          const worksheet = XLSX.utils.json_to_sheet(exportData);

          const range = XLSX.utils.decode_range(worksheet['!ref']!);
          for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cell_address = { c: C, r: R };
              const cell_ref = XLSX.utils.encode_cell(cell_address);
              if (!worksheet[cell_ref]) continue;

              worksheet[cell_ref].s = {
                alignment: { horizontal: "center", vertical: "center" },
                font: {
                  bold: R === 0,
                }
              };
            }
          }

          // Set độ rộng từng cột (optional)
          worksheet['!cols'] = [
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 30 },
            { wch: 15 },
            { wch: 12 },
            { wch: 12 },
            { wch: 20 },
          ];

          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

          // Xuất file
          XLSX.writeFile(workbook, 'UserList.xlsx');
          this.alertService.success('Xuất danh sách người dùng thành công!');
        } else {
          this.alertService.error('Không thể xuất dữ liệu người dùng!');
        }
      },
      error: (err) => {
        console.error('Lỗi khi xuất file Excel:', err);
        this.alertService.error('Không thể xuất dữ liệu người dùng. Vui lòng thử lại sau.');
      }
    });
  }

  downloadTemplateFile(): void {
    const templateData = [{
      'Tên': 'Văn A',
      'Họ': 'Nguyễn',
      'Email': 'nguyenvana@example.com',
      'Tên đăng nhập': 'nguyenvana',
      'Mật khẩu': 'password123',
      'Số điện thoại': '0123456789',
      'Vai trò': 'user'
    }];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: 0 };
      const cell_ref = XLSX.utils.encode_cell(cell_address);
      if (!worksheet[cell_ref]) continue;

      worksheet[cell_ref].s = {
        font: { bold: true },
        alignment: { horizontal: "center" }
      };
    }

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    XLSX.writeFile(workbook, 'ImportUsersSampleFile.xlsx');
    this.alertService.success('Tải xuống tệp mẫu thành công!');
  }

  // Biến để lưu trữ thông tin import
  importFile: File | null = null;
  importData: any[] = [];
  showImportPreview: boolean = false;
  importProgress: number = 0;
  totalImportItems: number = 0;
  processedItems: number = 0;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.importFile = file;
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const excelData = XLSX.utils.sheet_to_json(worksheet);

          this.importData = excelData.map((row: any) => {
            return {
              firstName: row['Tên'] || '',
              lastName: row['Họ'] || '',
              email: row['Email'] || '',
              username: row['Tên đăng nhập'] || '',
              password: row['Mật khẩu'] || '',
              phoneNumber: row['Số điện thoại'] ? ('0' + row['Số điện thoại'].toString().trim()) : '',
              role: row['Vai trò'] || ''
            };
          });

          this.showImportPreview = true;
          this.totalImportItems = this.importData.length;

          this.importProgress = 0;
          this.processedItems = 0;

          this.alertService.success(`Đã đọc ${this.importData.length} bản ghi từ file.`);
        } catch (error) {
          console.error('Lỗi khi đọc file Excel:', error);
          this.alertService.error('Không thể đọc dữ liệu từ file. Vui lòng kiểm tra định dạng file.');
        }
      };

      reader.readAsArrayBuffer(file);
    }
  }
  importUsers(): void {
    if (this.importData.length === 0) {
      this.alertService.error('Không có dữ liệu để import.');
      return;
    }

    this.userService.createUsers(this.importData).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.alertService.success(`Đã import ${this.importData.length} người dùng thành công.`);
        } else {
          this.alertService.error(`${res.message}`);
        }
      },
      error: (err) => {
        console.log(err);
        this.alertService.error(`${err?.error?.message || 'Lỗi không xác định'}`);
      },
      complete: () => {
        this.showImportPreview = false;
        this.loadUsers();
      }
    });
  }
  cancelImport(): void {
    this.showImportPreview = false;
    this.importData = [];
    this.importFile = null;
  }

}
