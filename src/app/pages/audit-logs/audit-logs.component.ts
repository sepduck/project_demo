import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../services/audit-log.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-audit-logs',
  imports: [CommonModule, NgIf, FormsModule, NgxPaginationModule, BadgeModule, ButtonModule, TableModule, PanelModule, DatePicker, InputTextModule, InputGroupModule],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css'
})
export class AuditLogsComponent {
  activityLogs: any[] = [];
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;
  showAdvancedFilter: boolean = false;

  // Khai báo rõ ràng kiểu cho filterState
  filterState: 'all' | 'username' | 'date' | 'activity' | 'browser' | 'service' | 'advanced' = 'all';

  username: string = '';
  activity: string = '';
  browser: string = '';
  serviceName: string = '';
  rangeDates: Date[] = [];

  constructor(private auditLogService: AuditLogService, public authService: AuthService) { }

  ngOnInit(): void {
    this.loadAuditLog();
  }

  loadAuditLog(): void {
    this.auditLogService.getUsers(this.pageNumber, this.pageSize).subscribe(res => {
      this.activityLogs = res.result.contents;
      this.totalRecords = res.result.totalRecords;
    });
  }

  activeTab: string = 'tab1';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleAdvancedFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
    if (this.showAdvancedFilter) {
      this.filterState = 'advanced';
    } else if (this.filterState === 'advanced') {
      this.determineFilterState();
    }
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value);
    this.pageNumber = 1;
    this.applyCurrentFilter();
  }

  onPageChange(event: any) {
    this.pageNumber = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    this.pageSize = event.rows || 10;
    this.applyCurrentFilter();
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  refreshData(): void {
    this.pageNumber = 1;
    this.rangeDates = [];
    this.username = '';
    this.serviceName = '';
    this.activity = '';
    this.browser = '';
    this.filterState = 'all';
    this.loadAuditLog();
  }

  // Xác định trạng thái filter dựa trên các trường đã nhập
  determineFilterState(): void {
    if (this.username && !this.activity && !this.browser && !this.serviceName && this.rangeDates.length === 0) {
      this.filterState = 'username';
    } else if (this.rangeDates.length > 0 && !this.username && !this.activity && !this.browser && !this.serviceName) {
      this.filterState = 'date';
    } else if (this.activity && !this.username && !this.browser && !this.serviceName && this.rangeDates.length === 0) {
      this.filterState = 'activity';
    } else if (this.browser && !this.username && !this.activity && !this.serviceName && this.rangeDates.length === 0) {
      this.filterState = 'browser';
    } else if (this.serviceName && !this.username && !this.activity && !this.browser && this.rangeDates.length === 0) {
      this.filterState = 'service';
    } else if (this.username || this.activity || this.browser || this.serviceName || this.rangeDates.length > 0) {
      this.filterState = 'advanced';
    } else {
      this.filterState = 'all';
    }
  }

  // Áp dụng filter hiện tại khi chuyển trang hoặc thay đổi kích thước trang
  applyCurrentFilter(): void {
    if (this.filterState === 'all') {
      this.loadAuditLog();
    } else {
      this.searchActivityLogs(false);
    }
  }

  searchActivityLogs(resetPage: boolean = true): void {
    if (resetPage) this.pageNumber = 1;

    // Xác định trạng thái filter dựa trên các trường đã nhập
    this.determineFilterState();

    // Nếu không có điều kiện filter nào, quay lại tải tất cả dữ liệu
    if (this.filterState === 'all') {
      this.loadAuditLog();
      return;
    }

    const params = this.buildSearchParams();
    this.auditLogService
      .searchActivityLogs(
        params.username,
        params.activity,
        params.browser,
        params.serviceName,
        params.startDate,
        params.endDate,
        params.pageNumber,
        params.pageSize
      )
      .subscribe(res => {
        if (res.code === 200) {
          console.log('API request params:', params.startDate);

          this.activityLogs = res.result.contents;
          this.totalRecords = res.result.totalRecords;
          this.pageNumber = res.result.pageNumber;
          this.pageSize = res.result.pageSize;
        } else {
          console.error('Không thể tải dữ liệu theo điều kiện lọc');
        }
      });
  }

  private buildSearchParams() {
    const startDate = this.rangeDates[0] ? this.formatDateToString(this.rangeDates[0]) : '';
    const endDate = this.rangeDates[1] ? this.formatDateToString(this.rangeDates[1]) : '';

    return {
      username: this.username,
      activity: this.activity,
      browser: this.browser,
      serviceName: this.serviceName,
      startDate,
      endDate,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
    };
  }

  private formatDateToString(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}