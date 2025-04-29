import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponseSetting } from '../models/setting.model';
import { AuthUtils } from '../utils/api/auth-utils';
import { API_V1_SETTING } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class SettingServiceService {
  constructor(private http: HttpClient) { }

  getSetting(): Observable<ApiResponseSetting> {
    const headers = AuthUtils.getAuthHeaders();
    return this.http.get<ApiResponseSetting>(API_V1_SETTING, { headers })
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
    const headers = AuthUtils.getAuthHeaders();
    return this.http.put<{ code: number, message: string }>(API_V1_SETTING, {
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


}
