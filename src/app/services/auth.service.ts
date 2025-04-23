import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5293/api/v1/auth/login';
  private apiUrlLogout = 'http://localhost:5293/api/v1/auth/logout';
  private apiRefreshToken = 'http://localhost:5293/api/v1/auth/refresh-token'
  private apiForgotPassword = 'http://localhost:5293/api/v1/auth/forgot-password'
  private apiCreateNewPassword = 'http://localhost:5293/api/v1/auth/create-new-password'

  constructor(private http: HttpClient) { this.loadUserFromToken() }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { email, password });
  }

  saveToken(token: string) {
    localStorage.setItem('jwtToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  logout() {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(this.apiUrlLogout, {}, { headers })
  }

  register(firstName: string, lastName: string, email: string, username: string, password: string) {
    return this.http.post<{ code: number, message: string }>(
      'http://localhost:5293/api/v1/auth/register',
      { firstName, lastName, email, username, password }
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

  refreshToken():Observable<any> {
    const refreshToken = localStorage.getItem('jwtToken');
    return this.http.post<{code: number, message: string}>(this.apiRefreshToken, {token: refreshToken})
  }

  forgotPassword(email: string) {
    return this.http.post<{ code: number, message: string }>(
      `${this.apiForgotPassword}`, { email }
    )
  }

  createNewPassword(email: string, password: string) {
    return this.http.post<{ code: number, message: string }>(
      `${this.apiCreateNewPassword}`, { email, password }
    )
  }
}
