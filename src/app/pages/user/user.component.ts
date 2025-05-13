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
import { MenuItem } from 'primeng/api';
import * as XLSX from 'xlsx';
import { AvatarModule } from 'primeng/avatar';
import { DASHBOARD, USERS_CREATE, USERS_ID } from '../../constants/path-valiable';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { AlertService } from '../../services/alert.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ACCOUNT_NOT_ACTIVATED, DELETE_USER_ERROR, DELETE_USER_FAILED, DELETE_USER_SUCCESS, EXPORT_USER_DATA_FAILED, EXPORT_USER_DATA_SUCCESS, FILE_READ_ERROR, FILE_READ_SUCCESS, IMPORT_NO_DATA, IMPORT_USERS_SUCCESS, LOAD_USER_DATA_FAILED, LOGIN_FAILED, LOGIN_USER_FAILED, TEMPLATE_DOWNLOAD_SUCCESS, USER_NOT_FOUND } from '../../constants/error-message';
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-user',
  imports: [DialogModule, InputTextModule, AutoCompleteModule, AvatarModule, CommonModule, NgIf, FormsModule, DialogModule, NgxPaginationModule, MenuModule, DropdownModule, PanelModule, SelectModule, PaginatorModule, InputGroupAddonModule, TableModule, ButtonModule, BadgeModule, InputGroupModule],
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
  errorMessage: string = '';

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

  roles: any[] = [];
  selectedPermissionIds: number[] = [];

  name: string = '';
  selectedRoleId: number = 0;
  filterState: 'all' | 'search' | 'role' = 'all'
  importErrors: string[] = [];
  visible: boolean = false;
  items: MenuItem[] | undefined;
  excelOperations: MenuItem[] = [];
  constructor(private userService: UserService, private router: Router, public authService: AuthService, private roleService: RoleService, private alertService: AlertService) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRolesSelect();
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

  showImportDialog(): void { this.importDialogVisible = true; }
  get totalPages(): number { return Math.ceil(this.totalRecords / this.pageSize); }

  loadUsers(resetPage: boolean = true): void {
    if (resetPage) this.pageNumber = 1;

    if (this.selectedRoleId && this.selectedRoleId > 0)
      this.filterState = 'role';
    else if (this.name && this.name.trim() !== '')
      this.filterState = 'search';
    else
      this.filterState = 'all';

    this.userService.getUsers(
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
          this.alertService.error(res.message);
        }
      },
      error: (err) => {
        this.alertService.error(LOAD_USER_DATA_FAILED);
      }
    });
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.loadUsers();
          this.alertService.success(DELETE_USER_SUCCESS)
        } else if (res.code === 4022) {
          this.alertService.error(res.message)
        }
        this.errorMessage = DELETE_USER_ERROR;
      },
      error: (err) => {
        this.alertService.error(DELETE_USER_FAILED)
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
          this.alertService.error(ACCOUNT_NOT_ACTIVATED)
        } else if (res.code === 4009) {
          this.alertService.error(USER_NOT_FOUND)
        }
        this.alertService.error(LOGIN_USER_FAILED)
      },
      error: (err) => {
        this.alertService.error(LOGIN_FAILED)
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

  setActiveTab(tab: string): void { this.activeTab = tab }
  showDialog() { this.visible = true }
  toggleAdvancedFilter(): void { this.showAdvancedFilter = !this.showAdvancedFilter }
  goToUpdate(id: string): void { this.router.navigate([USERS_ID(id)]) }
  goToCreate(): void { this.router.navigate([USERS_CREATE]) }

  exportToExcel(): void {
    const name = this.name || '';
    const roleId = this.selectedRoleId || 0;
    this.userService.getUsers(name, roleId, 1, this.totalRecords).subscribe({
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
          this.alertService.success(EXPORT_USER_DATA_SUCCESS);
        } else {
          this.alertService.error(EXPORT_USER_DATA_FAILED);
        }
      },
      error: (err) => {
        this.alertService.error(EXPORT_USER_DATA_FAILED);
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
    this.alertService.success(TEMPLATE_DOWNLOAD_SUCCESS);
  }

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

          this.alertService.success(FILE_READ_SUCCESS(this.importData.length));
        } catch (error) {
          this.alertService.error(FILE_READ_ERROR);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  }
  importUsers(): void {
    // Kiểm tra dữ liệu trước khi import
    if (this.importData.length === 0) {
      this.alertService.error('Không có dữ liệu để import');
      return;
    }

    // Validate toàn bộ dữ liệu trước khi gửi
    this.importErrors = this.validateImportData(this.importData);

    // Nếu có lỗi, hiển thị chi tiết lỗi
    if (this.importErrors.length > 0) {
      this.displayImportErrors();
      return;
    }

    // Nếu không có lỗi, thực hiện import
    this.userService.createUsers(this.importData).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.alertService.success(`Đã import thành công ${this.importData.length} người dùng`);
          this.resetImport();
        } else {
          this.alertService.error(res.message);
        }
      },
      error: (err) => {
        // Xử lý lỗi từ server
        const errorMessage = err?.error?.message || 'Lỗi không xác định';
        this.alertService.error(errorMessage);
      }
    });
  }

  validateImportData(data: any[]): string[] {
    const errorSet = new Set<string>();

    data.forEach((user, index) => {
      // Validate vai trò
      if (!user.role || user.role.trim() === '') {
        errorSet.add('Vai trò không được để trống');
      }

      // Validate email
      if (!user.email) {
        errorSet.add('Email không được để trống');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
          errorSet.add('Email không đúng định dạng');
        }
      }

      // Validate tên
      if (!user.firstName || user.firstName.trim() === '') {
        errorSet.add('Tên không được để trống');
      }

      // Validate họ
      if (!user.lastName || user.lastName.trim() === '') {
        errorSet.add('Họ không được để trống');
      }

      // Validate mật khẩu
      if (!user.password || user.password.trim() === '') {
        errorSet.add('Mật khẩu không được để trống');
      }

      // Validate tên người dùng
      if (!user.username || user.username.trim() === '') {
        errorSet.add('Tên người dùng không được để trống');
      }

      // Validate số điện thoại
      if (!user.phone || user.phone.trim() === '') {
        errorSet.add('Số điện thoại không được để trống');
      }
    });

    // Chuyển Set thành mảng
    return Array.from(errorSet);
  }
  displayImportErrors(): void {
    let errorMessage = 'Có lỗi trong quá trình import:\n';
    this.importErrors.forEach(error => {
      errorMessage += `• ${error}\n`;
    });
    this.alertService.error(errorMessage);
  }

  // Reset trạng thái import
  resetImport(): void {
    this.showImportPreview = false;
    this.importData = [];
    this.importFile = null;
    this.importErrors = [];
  }



  cancelImport(): void {
    this.showImportPreview = false;
    this.importData = [];
    this.importFile = null;
  }

}
