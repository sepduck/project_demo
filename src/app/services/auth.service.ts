import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthUtils } from '../utils/api/auth-utils';
import { API_V1_AUTH_LOGIN, API_V1_AUTH_CREATE_NEW_PASSWORD, API_V1_AUTH_FORGOT_PASSWORD, API_V1_AUTH_LOGOUT, API_V1_AUTH_REFRESH_TOKEN, API_V1_AUTH_REGISTER, API_V1_AUTH_LOGIN_GOOGLE, API_V1_AUTH_LOGIN_FACEBOOK, API_V1_AUTH_UNLINK_OUTBOUND, API_V1_AUTH_LINK_GOOGLE } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { this.loadUserFromToken() }

  login(email: string, password: string, captchaToken: string | null): Observable<any> {
    return this.http.post<any>(API_V1_AUTH_LOGIN, { email, password, captchaToken });
  }

  saveToken(token: string) { localStorage.setItem('jwtToken', token) }
  getToken(): string | null { return localStorage.getItem('jwtToken') }

  logout() {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.post(API_V1_AUTH_LOGOUT, {}, { headers })
  }

  register(firstName: string, lastName: string, email: string, username: string, password: string, captchaToken: string | null) {
    return this.http.post<{ code: number, message: string }>(
      API_V1_AUTH_REGISTER, { firstName, lastName, email, username, password , captchaToken}
    )
  }

  private currentUser: any;


  private loadUserFromToken() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUser = payload;
    } catch (e) {
      this.currentUser = null;
    }
  }

  getCurrentUser(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      return null;
    }
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (user?.permission && Array.isArray(user.permission)) {
      return user.permission.map((p: string) => p.trim()).includes(permission.trim());
    }
    if (user?.permission && typeof user.permission === 'string') {
      return user.permission.trim() === permission.trim();
    }
    return false;
  }


  hasAnyPermission(permissions: string[]): boolean {
    const user = this.getCurrentUser();
    if (user?.permission && Array.isArray(user.permission)) {
      const userPermissions: string[] = user.permission.map((p: string) => p.trim());
      return permissions.some((p: string) => userPermissions.includes(p.trim()));
    }
    return false;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('jwtToken');
    return this.http.post<{ code: number, message: string }>(API_V1_AUTH_REFRESH_TOKEN, { token: refreshToken })
  }

  forgotPassword(email: string) {
    return this.http.post<{ code: number, message: string }>(
      API_V1_AUTH_FORGOT_PASSWORD, { email }
    )
  }

  createNewPassword(email: string, password: string) {
    return this.http.post<{ code: number, message: string }>(
      API_V1_AUTH_CREATE_NEW_PASSWORD, { email, password }
    )
  }

  loginWithGoogle(code: string): Observable<any> {
    return this.http.post(API_V1_AUTH_LOGIN_GOOGLE, { code });
  }

  loginWithFacebook(code: string): Observable<any> {
    return this.http.post(API_V1_AUTH_LOGIN_FACEBOOK, { code });
  }

  unlinkOutbound(provider: string): Observable<any> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.delete<{code: number, message: string }>(API_V1_AUTH_UNLINK_OUTBOUND + `/${provider}`, {headers})
  }

  linkGoogle(code: string): Observable<any> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.post<{code: number, message: string }>(API_V1_AUTH_LINK_GOOGLE, {code}, {headers})
  }

}
