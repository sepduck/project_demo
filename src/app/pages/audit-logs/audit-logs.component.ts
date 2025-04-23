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
  filterState: 'all' | 'searchUsername' | 'searchActivity' | 'searchBrowser' | 'searchDateRange' | 'searchService' | 'searchDate' = 'all'

  username: string = '';
  activity: string = '';
  browser: string = '';
  serviceName: string = '';
  rangeDates: Date[] = [];

  constructor(private auditLogService: AuditLogService) { }
  ngOnInit(): void {
    this.loadAuditLog();
  }

  loadAuditLog(): void {
    this.auditLogService.getUsers(this.pageNumber, this.pageSize).subscribe(res => {
      this.activityLogs = res.result.contents;
      this.totalRecords = res.result.totalRecords;
    })
  }
  activeTab: string = 'tab1';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  toggleAdvancedFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }
  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value);
    this.pageNumber = 1; // Reset về trang đầu tiên khi thay đổi pageSize
    this.loadAuditLog();
  }
  onPageChange(event: any) {
    this.pageNumber = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    this.pageSize = event.rows || 10;
    this.loadAuditLog();

  }
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }
  refreshData(): void {
    this.pageNumber = 1;
    this.loadAuditLog();
  }

  searchActivityLogByUsername(resetPage: boolean = true): void {
    if (resetPage) { this.pageNumber = 1; }
    this.filterState = 'searchUsername';
    if (!this.username || this.username.trim() === '') {
      this.filterState = 'all';
      this.loadAuditLog();
      return;
    }
    this.auditLogService.searchActivityByUsername(this.username, this.pageNumber, this.pageSize).subscribe(res => {
      if (res.code === 200) {
        this.activityLogs = res.result.contents;
        this.totalRecords = res.result.totalRecords;
        this.pageNumber = res.result.pageNumber;
        this.pageSize = res.result.pageSize;
      } else {
        console.log('Không thể tải dữ liệu người dùng');
      }
    });
  }

  searchActivityLogByActivity(resetPage: boolean = true): void {
    if (resetPage) { this.pageNumber = 1; }
    this.filterState = 'searchActivity';
    if (!this.activity || this.activity.trim() === '') {
      this.filterState = 'all';
      this.loadAuditLog();
      return;
    }
    this.auditLogService.searchActivityByActivity(this.activity, this.pageNumber, this.pageSize).subscribe(res => {
      if (res.code === 200) {
        this.activityLogs = res.result.contents;
        this.totalRecords = res.result.totalRecords;
        this.pageNumber = res.result.pageNumber;
        this.pageSize = res.result.pageSize;
      } else {
        console.log('Không thể tải dữ liệu người dùng');
      }
    });
  }

  searchActivityLogByBrowser(resetPage: boolean = true): void {
    if (resetPage) { this.pageNumber = 1; }
    this.filterState = 'searchActivity';
    if (!this.browser || this.browser.trim() === '') {
      this.filterState = 'all';
      this.loadAuditLog();
      return;
    }
    this.auditLogService.searchActivityByBrowser(this.browser, this.pageNumber, this.pageSize).subscribe(res => {
      if (res.code === 200) {
        this.activityLogs = res.result.contents;
        this.totalRecords = res.result.totalRecords;
        this.pageNumber = res.result.pageNumber;
        this.pageSize = res.result.pageSize;
      } else {
        console.log('Không thể tải dữ liệu người dùng');
      }
    });
  }

  searchActivityLogByService(resetPage: boolean = true): void {
    if (resetPage) { this.pageNumber = 1; }
    this.filterState = 'searchService';
    if (!this.serviceName || this.serviceName.trim() === '') {
      this.filterState = 'all';
      this.loadAuditLog();
      return;
    }
    this.auditLogService.searchActivityByService(this.serviceName, this.pageNumber, this.pageSize).subscribe(res => {
      if (res.code === 200) {
        this.activityLogs = res.result.contents;
        this.totalRecords = res.result.totalRecords;
        this.pageNumber = res.result.pageNumber;
        this.pageSize = res.result.pageSize;
      } else {
        console.log('Không thể tải dữ liệu người dùng');
      }
    });
  }
  searchActivityLogByDateRange(resetPage: boolean = true): void {
    if (resetPage) this.pageNumber = 1;
    this.filterState = 'searchDate';

    // Kiểm tra đủ 2 ngày
    if (!this.rangeDates || this.rangeDates.length !== 2 || !this.rangeDates[0] || !this.rangeDates[1]) {
      this.filterState = 'all';
      this.loadAuditLog();
      return;
    }

    const startDate = this.formatDateToString(this.rangeDates[0]);
    const endDate = this.formatDateToString(this.rangeDates[1]);

    this.auditLogService
      .searchActivityByDateRange(startDate, endDate, this.pageNumber, this.pageSize)
      .subscribe(res => {
        if (res.code === 200) {
          this.activityLogs = res.result.contents;
          this.totalRecords = res.result.totalRecords;
          this.pageNumber = res.result.pageNumber;
          this.pageSize = res.result.pageSize;
        } else {
          console.log('Không thể tải dữ liệu theo ngày');
        }
      });
  }

  private formatDateToString(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

}
