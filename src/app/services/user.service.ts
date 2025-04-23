import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  verifyToken: boolean;
  isAction: boolean;
  createdAt: string;
}
interface Role {
  id: number;
  name: string;
}

interface ApiResponse {
  code: number;
  message: string;
  result: {
    contents: User[];
    totalRecords: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
  }
}

interface UserDetail {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  thumbnail: string;
  verifyToken: boolean;
  isRandomPassword: boolean;
  roleName: string;
  mustChangePassword: boolean;
  isAction: boolean;
  isLockedOut: boolean;
  isSendEmail: boolean;
}
interface ApiResponseUserDetail {
  code: number;
  message: string;
  result: UserDetail;
}
interface ApiResponseRoles {
  code: number;
  message: string;
  result: Role[];
}

interface PermissionIdsRequest {
  permissionIds: number[]
}
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = "http://localhost:5293/api/v1/user";
  private apiUrlImage = "http://localhost:5293/api/v1/images/upload";
  private apiUrlRoleSelect = "http://localhost:5293/api/v1/role/select";
  private apiUrlLoginAsUser = "http://localhost:5293/api/v1/auth/login-as-user";


  constructor(private http: HttpClient) { }

  getUsers(pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }

  createUser(
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string,
    phoneNumber: string,
    isSendEmail: boolean,
    thumbnail: string,
    isRandomPassword: boolean,
    roles: number[],
    mustChangePassword: boolean,
    isAction: boolean,
    isLockedOut: boolean
  ) {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<{ code: number, message: string }>(
      this.apiUrl, { firstName, lastName, email, username, password, phoneNumber, isSendEmail, thumbnail, isRandomPassword, roles, mustChangePassword, isAction, isLockedOut }, { headers }
    )
  }

  uploadImage(formData: FormData) {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<{ code: number, message: string, result: string }>(this.apiUrlImage, formData, { headers });
  }

  getRolesSelect(): Observable<ApiResponseRoles> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponseRoles>(`${this.apiUrlRoleSelect}`, { headers })
  }

  getFindUserById(id: number): Observable<ApiResponseUserDetail> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponseUserDetail>(`${this.apiUrl}/${id}`, { headers })
  }

  updateUser(id: number, firstName: string, lastName: string, email: string, username: string, phoneNumber: string, isSendEmail: boolean, thumbnail: string, roles: number[], isAction: boolean, isLockedOut: boolean) {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.put<{ code: number, message: string }>(
      `${this.apiUrl}/${id}`, { firstName, lastName, email, username, phoneNumber, isSendEmail, thumbnail, roles, isAction, isLockedOut }, { headers }
    )
  }

  deleteUser(id: number) {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.delete<{ code: number, message: string }>(`${this.apiUrl}/${id}`, { headers })
  }

  loginAsUser(id: number) {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<{ code: number, message: string }>(`${this.apiUrlLoginAsUser}`, { id }, { headers });
  }

  searchUserByName(name: string, pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrl}/name/${name}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }

  filterByRole(roleId: number, pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponse>(`${this.apiUrl}/role/${roleId}?pageNumber=${pageNumber}&pageSize=${pageSize}`, { headers })
  }

  getCurrentUser(): Observable<ApiResponseUserDetail> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponseUserDetail>(`${this.apiUrl}/profile`, { headers })
  }

  changePassword(currentPassword: string, newPassword: string) {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    console.log(currentPassword, newPassword);

    return this.http.post<{ code: number, message: string }>(
      `${this.apiUrl}/change-password`, { currentPassword, newPassword }, { headers }
    )
  }

  filterByPermissions(permissionIds: number[], pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);

    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize)
    permissionIds.forEach(id => {
      params = params.append('permissionIds', id)
    })
    return this.http.get<ApiResponse>(`${this.apiUrl}/permissions`, { headers, params })
  }

}
