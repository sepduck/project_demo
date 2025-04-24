import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, map, Observable, shareReplay, tap } from 'rxjs';

interface Setting {
  id: number;
  selfRegister: boolean;
  defaultUserActivation: boolean;
  useCaptchaOnRegister: boolean;
  useCaptchaOnResetPassword: boolean;
  useCaptchaOnEmailActivation: boolean;
  useCaptchaOnLogin: boolean;
  cookieConsentEnabled: boolean;
  sessionTimeoutControlEnabled: boolean;
  emailConfirmationRequired: boolean;
  allowGravatar: boolean;
  userDefaultSetting: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  minPasswordLength: number;
}
interface ApiResponseSetting {
  code: number;
  message: string;
  result: Setting;
}

@Injectable({
  providedIn: 'root'
})
export class SettingServiceService {
  private apiUrl = "http://localhost:5293/api/v1/setting";

  constructor(private http: HttpClient) { }

  getSetting(): Observable<ApiResponseSetting> {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<ApiResponseSetting>(`${this.apiUrl}`, { headers })
  }

  putSetting(
    selfRegister: boolean,
    defaultUserActivation: boolean,
    useCaptchaOnRegister: boolean,
    useCaptchaOnResetPassword: boolean,
    useCaptchaOnEmailActivation: boolean,
    useCaptchaOnLogin: boolean,
    cookieConsentEnabled: boolean,
    sessionTimeoutControlEnabled: boolean,
    emailConfirmationRequired: boolean,
    allowGravatar: boolean,
    userDefaultSetting: boolean,
    hasLowercase: boolean,
    hasSpecialChar: boolean,
    hasUppercase: boolean,
    hasNumber: boolean,
    minPasswordLength: number
  ) {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.put<{ code: number, message: string }>(`${this.apiUrl}`, {
      selfRegister,
      defaultUserActivation,
      useCaptchaOnRegister,
      useCaptchaOnResetPassword,
      useCaptchaOnEmailActivation,
      useCaptchaOnLogin,
      cookieConsentEnabled,
      sessionTimeoutControlEnabled,
      emailConfirmationRequired,
      allowGravatar,
      userDefaultSetting,
      hasLowercase,
      hasSpecialChar,
      hasUppercase,
      hasNumber,
      minPasswordLength
    }, { headers })
  }

  // updateUser(
  //   id: number,
  //   firstName: string,
  //   lastName: string, email: string, username: string, password: string, phoneNumber: string, verifyToken: boolean, thumbnail: string, isRandomPassword: boolean, roles: number[], mustChangePassword: boolean, activationToken: boolean, isLockedOut: boolean) {
  //   const token = localStorage.getItem('jwtToken');
  //   const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
  //   return this.http.put<{ code: number, message: string }>(
  //     `${this.apiUrl}/${id}`, { firstName, lastName, email, username, password, phoneNumber, verifyToken, thumbnail, isRandomPassword, roles, mustChangePassword, activationToken, isLockedOut }, { headers }
  //   )
  // }
}
