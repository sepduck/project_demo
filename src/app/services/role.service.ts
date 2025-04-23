import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Role {
  id: number;
  name: string;
  status: boolean;
  systemReserve: boolean;
  createdAt: string;
}

interface ApiResponse {
  code: number;
  message: string;
  result: {
    contents: Role[];
    totalRecords: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
  }
}

interface Permission {
  id: number;
  name: string;
  slug: string;
}

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
  private apiUrl = "http://localhost:5293/api/v1/role";
  private apiUrlPermission = "http://localhost:5293/api/v1/permissions/tree";

  constructor(private http: HttpClient) { }

  getRoles(pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }

  getPermissions(): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrlPermission}`, { headers });
  }

  createRole(role: CreatedRole): Observable<any> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<{ code: number, message: string }>(this.apiUrl, role, { headers });
  }
  updateRole(id: number, role: UpdateRole): Observable<any> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.put<{code: number, message: string}>(`${this.apiUrl}/${id}`, role, { headers });
  }

  getRoleById(id: number): Observable<any> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
  }

  deleteRole(id: number): Observable<any> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }


}
