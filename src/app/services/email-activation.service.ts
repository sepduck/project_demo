import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmailActionType } from '../models/email.model';
import { API_V1_AUTH_CONFIRM_EMAIL } from '../constants/api-endpoints';


@Injectable({
  providedIn: 'root'
})
export class EmailActivationService {
  constructor(private http: HttpClient) { }

  emailConfirmation(email: string, token: string) {
    return this.http.post<{ code: number; message: string; result?: EmailActionType }>(
      API_V1_AUTH_CONFIRM_EMAIL, { email, token }
    )
  }
}