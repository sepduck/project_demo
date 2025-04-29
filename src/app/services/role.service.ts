import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/role.model';
import { AuthUtils } from '../utils/api/auth-utils';
import { API_V1_PERMISSIONS_TREE, API_V1_ROLE } from '../constants/api-endpoints';

export interface UpdateRole {
  name: string;
  status: boolean;
  permissions: number[]
}

export interface CreatedRole {
  id?: number;
  name: string;
  status: boolean;
  permissions: number[];
}
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private http: HttpClient) { }

  getRoles(pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const headers = AuthUtils.getAuthHeaders();
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse>(API_V1_ROLE, { headers, params })
  }

  getPermissions(): Observable<ApiResponse> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.get<ApiResponse>(API_V1_PERMISSIONS_TREE, { headers });
  }

  createRole(role: CreatedRole): Observable<any> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.post<{ code: number, message: string }>(API_V1_ROLE, role, { headers });
  }
  updateRole(id: number, role: UpdateRole): Observable<any> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.put<{ code: number, message: string }>(API_V1_ROLE + `/${id}`, role, { headers });
  }

  getRoleById(id: number): Observable<any> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.get<any>(API_V1_ROLE + `/${id}`, { headers });
  }

  deleteRole(id: number): Observable<any> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.delete<any>(API_V1_ROLE + `/${id}`, { headers });
  }


}
