import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/activity-log.model';
import { AuthUtils } from '../utils/api/auth-utils';
import { API_V1_ACTIVITY_LOG, API_V1_ACTIVITY_LOG_SEARCH } from '../constants/api-endpoints';
@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  constructor(private http: HttpClient) { }

  getActivityLogs(username: string, activity: string, browser: string, serviceName: string, startDate: string, endDate: string, pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const headers = AuthUtils.getAuthHeaders();
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (username && username.trim() !== '') { params = params.set('username', username); }
    if (activity && activity.trim() !== '') { params = params.set('activity', activity); }
    if (browser && browser.trim() !== '') { params = params.set('browser', browser); }
    if (serviceName && serviceName.trim() !== '') { params = params.set('serviceName', serviceName); }
    if (startDate && startDate.trim() !== '') { params = params.set('startDate', startDate); }
    if (endDate && endDate.trim() !== '') { params = params.set('endDate', endDate); }

    return this.http.get<ApiResponse>(API_V1_ACTIVITY_LOG, { headers, params })
  }
  
}
