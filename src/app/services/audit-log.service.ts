import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface ActivityLogs {
  id: number;
  username: string;
  serviceName: string;
  activity: string;
  executionTime: number;
  ipAddress: string;
  browser: string;
  createdAt: string;
}

interface ApiResponse {
  code: number;
  message: string;
  result: {
    contents: ActivityLogs[];
    totalRecords: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
  }
}
@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private apiUrl = "http://localhost:5293/api/v1/activity-log";

  constructor(private http: HttpClient) { }

  getUsers(pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }

  searchActivityByUsername(username: string, pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrl}/username/${username}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }

  searchActivityByActivity(activity: string, pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrl}/activity/${activity}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }

  searchActivityByBrowser(browser: string, pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrl}/browser/${browser}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }

  searchActivityByService(serviceName: string, pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrl}/service/${serviceName}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }

  searchActivityByDateRange(startDate: string, endDate: string, pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrl}/date?startDate=${startDate}&endDate=${endDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }

  searchActivityLogs(username: string, activity: string, browser: string, serviceName: string, startDate: string, endDate: string, pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrl}/search?username=${username}&activity=${activity}&browser=${browser}&serviceName=${serviceName}&startDate=${startDate}&endDate=${endDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }
}
