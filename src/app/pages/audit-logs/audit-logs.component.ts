import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { DialogModule } from 'primeng/dialog';
import { AuditLogService } from '../../services/audit-log.service';
import { AuthService } from '../../services/auth.service';
import { E_ACTIVITY, E_ADVANCED, E_ALL, E_BROWSER, E_DATE, E_SERVICE, E_USERNAME } from '../../constants/status-enum';
import { UNABLE_LOAD_DATA_ON_FILTER } from '../../constants/error-message';

@Component({
  selector: 'app-audit-logs',
  imports: [CommonModule, DialogModule, NgIf, FormsModule, NgxPaginationModule, BadgeModule, ButtonModule, TableModule, PanelModule, DatePicker, InputTextModule, InputGroupModule],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css'
})
export class AuditLogsComponent {
  activityLogs: any[] = [];
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;
  showAdvancedFilter: boolean = false;
  visible: boolean = false;
  selectedActivityLog: any = {};

  showDialog(activityLog: any) {
    this.selectedActivityLog = activityLog;
    this.visible = true;
  }
  filterState: 'all' | 'username' | 'date' | 'activity' | 'browser' | 'service' | 'advanced' = 'all';

  username: string = '';
  activity: string = '';
  browser: string = '';
  serviceName: string = '';
  rangeDates: Date[] = [];

  first = 0;

  constructor(private auditLogService: AuditLogService, public authService: AuthService) { }

  ngOnInit(): void {
    this.loadActivityLogs();
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
    this.applyCurrentFilter(false);
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
    this.loadActivityLogs();
  }

  determineFilterState(): void {
    if (this.username && !this.activity && !this.browser && !this.serviceName && this.rangeDates.length === 0) {
      this.filterState = E_USERNAME;
    } else if (this.rangeDates.length > 0 && !this.username && !this.activity && !this.browser && !this.serviceName) {
      this.filterState = E_DATE;
    } else if (this.activity && !this.username && !this.browser && !this.serviceName && this.rangeDates.length === 0) {
      this.filterState = E_ACTIVITY;
    } else if (this.browser && !this.username && !this.activity && !this.serviceName && this.rangeDates.length === 0) {
      this.filterState = E_BROWSER;
    } else if (this.serviceName && !this.username && !this.activity && !this.browser && this.rangeDates.length === 0) {
      this.filterState = E_SERVICE;
    } else if (this.username || this.activity || this.browser || this.serviceName || this.rangeDates.length > 0) {
      this.filterState = E_ADVANCED;
    } else {
      this.filterState = E_ALL;
    }
  }

  applyCurrentFilter(resetPage: boolean = true): void {
    this.loadActivityLogs(resetPage);

  }

  loadActivityLogs(resetPage: boolean = true): void {
    if (resetPage) this.pageNumber = 1;


    const params = this.buildSearchParams();
    this.auditLogService
      .getActivityLogs(
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
          this.activityLogs = res.result.contents;
          this.totalRecords = res.result.totalRecords;
          this.pageNumber = res.result.pageNumber;
          this.pageSize = res.result.pageSize;
        } else {
          console.error(UNABLE_LOAD_DATA_ON_FILTER);
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