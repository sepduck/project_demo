import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthUtils } from '../utils/api/auth-utils';
import { ApiResponse, ApiResponse2, ApiResponseRoles, ApiResponseUserDetail } from '../models/user.model';
import { API_V1_AUTH_LOGIN_AS_USER, API_V1_IMAGES_UPLOAD, API_V1_ROLE_SELECT, API_V1_USER, API_V1_USER_CHANGE_PASSWORD, API_V1_USER_CREATE_USER_LIST, API_V1_USER_PROFILE, API_V1_USER_SEARCH } from '../constants/api-endpoints';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {

  }
  getUsers(name: string, roleId: number | null, pageNumber: number, pageSize: number): Observable<ApiResponse> {
    const headers = AuthUtils.getAuthHeaders();
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    if (name && name.trim() !== '') { params = params.set('name', name); }
    if (roleId && roleId > 0) { params = params.set('roleId', roleId.toString()); }

    return this.http.get<ApiResponse>(API_V1_USER, { headers, params });
  }
  createUser(
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string,
    phoneNumber: string,
    isSendEmail: boolean,
    thumbnail: string | null,
    isRandomPassword: boolean,
    roles: number[],
    mustChangePassword: boolean,
    isAction: boolean,
    isLockedOut: boolean
  ) {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.post<{ code: number, message: string }>(
      API_V1_USER, { firstName, lastName, email, username, password, phoneNumber, isSendEmail, thumbnail, isRandomPassword, roles, mustChangePassword, isAction, isLockedOut }, { headers }
    )
  }
  uploadImage(formData: FormData) {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.post<{ code: number, message: string, result: string }>(API_V1_IMAGES_UPLOAD, formData, { headers });
  }
  getRolesSelect(): Observable<ApiResponseRoles> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.get<ApiResponseRoles>(API_V1_ROLE_SELECT, { headers })
  }
  getFindUserById(id: number): Observable<ApiResponseUserDetail> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.get<ApiResponseUserDetail>(API_V1_USER + `/${id}`, { headers })
  }
  updateUser(id: number, firstName: string, lastName: string, email: string, username: string, phoneNumber: string, isSendEmail: boolean, thumbnail: string, roles: number[], isAction: boolean, isLockedOut: boolean) {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.put<{ code: number, message: string }>(
      API_V1_USER + `/${id}`, { firstName, lastName, email, username, phoneNumber, isSendEmail, thumbnail, roles, isAction, isLockedOut }, { headers }
    )
  }

  updateProfile(id: number, firstName: string, lastName: string, email: string, username: string, phoneNumber: string, isSendEmail: boolean, thumbnail: string, roles: number[], isAction: boolean, isLockedOut: boolean) {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.put<{ code: number, message: string }>(
      API_V1_USER_PROFILE + `/${id}`, { firstName, lastName, email, username, phoneNumber, isSendEmail, thumbnail, roles, isAction, isLockedOut }, { headers }
    )
  }
  deleteUser(id: number) {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.delete<{ code: number, message: string }>(API_V1_USER + `/${id}`, { headers })
  }
  loginAsUser(id: number) {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.post<{ code: number, message: string }>(API_V1_AUTH_LOGIN_AS_USER, { id }, { headers });
  }
  getCurrentUser(): Observable<ApiResponseUserDetail> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.get<ApiResponseUserDetail>(API_V1_USER_PROFILE, { headers })
  }
  changePassword(currentPassword: string, newPassword: string) {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.post<{ code: number, message: string }>(
      API_V1_USER_CHANGE_PASSWORD, { currentPassword, newPassword }, { headers }
    )
  }

  createUsers(data: any[]): Observable<ApiResponse2<string>> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.post<ApiResponse2<string>>(API_V1_USER_CREATE_USER_LIST, data, { headers });
  }

}
