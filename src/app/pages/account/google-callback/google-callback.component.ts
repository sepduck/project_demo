import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-google-callback',
  imports: [ProgressSpinnerModule],
  templateUrl: './google-callback.component.html',
  styleUrl: './google-callback.component.css'
})
export class GoogleCallbackComponent implements OnInit {
  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router, private alertService: AlertService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const rawState = params['state']

      if (code && rawState) {
        this.loginGoogle(code, rawState);
      }
    });
  }

  loginGoogle(code: string, rawState: string) {
    let stateData: any = {};

    try {
      stateData = JSON.parse(decodeURIComponent(rawState));
    } catch (e) {
      console.error('Invalid state data', e);
    }
    const { provider, link } = stateData;
    if (link === 'true') {
      const loginFn = provider === 'google'
        ? this.authService.linkGoogle(code)
        : this.authService.loginWithFacebook(code)

      loginFn.subscribe({
        next: (res) => {
          this.router.navigate(['/app/admin/dashBoard']);
          this.alertService[res.code === 200 ? 'success' : 'error'](res.message)
        },
        error: (err) => {
          console.error(err);
        }
      });
    } else {
      const loginFn = provider === 'google'
        ? this.authService.loginWithGoogle(code)
        : this.authService.loginWithFacebook(code)

      loginFn.subscribe({
        next: (res) => {
          localStorage.setItem('jwtToken', res.result.token);
          this.router.navigate(['/app/admin/dashBoard']);
          this.alertService[res.code === 200 ? 'success' : 'error'](res.message)
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }
}
