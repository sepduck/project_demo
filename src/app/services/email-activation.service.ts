import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

interface EmailActionType {
  actionType: string
}
@Injectable({
  providedIn: 'root'
})
export class EmailActivationService {
  private apiUrl = 'http://localhost:5293/api/v1/auth/confirm-email';

  constructor(private http: HttpClient) { }

  emailConfirmation(email: string, token: string) {
    return this.http.post<{ code: number; message: string; result?: EmailActionType }>(
      this.apiUrl, { email, token }
    )
  }
}