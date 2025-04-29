import { HttpHeaders } from '@angular/common/http';

export class AuthUtils {
  /**
   * @returns HttpHeaders với token Bearer
   */
  public static getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders().set('Authorization', 'Bearer ' + token);
  }
  
  /**
   * @returns true nếu đã đăng nhập, false nếu chưa
   */
  public static isAuthenticated(): boolean {
    return !!localStorage.getItem('jwtToken');
  }
  
  public static saveToken(token: string): void {
    localStorage.setItem('jwtToken', token);
  }

  public static clearToken(): void {
    localStorage.removeItem('jwtToken');
  }
}