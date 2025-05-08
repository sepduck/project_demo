import { Routes } from '@angular/router';
import { LoginComponent } from './pages/account/login/login.component';
import { RegisterComponent } from './pages/account/register/register.component';
import { EmailActivationComponent } from './pages/account/email-activation/email-activation.component';
import { RoleComponent } from './pages/role/role.component';
import { UserComponent } from './pages/user/user.component';
import { SettingComponent } from './pages/setting/setting.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { AuditLogsComponent } from './pages/audit-logs/audit-logs.component';
import { UpdateUserComponent } from './pages/user/update-user/update-user.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './pages/account/forgot-password/forgot-password.component';
import { CreateUserComponent } from './pages/user/create-user/create-user.component';
import { AuthGuard } from './guards/auth.guard';
import { CreateNewPasswordComponent } from './pages/account/create-new-password/create-new-password.component';
import { GoogleCallbackComponent } from './pages/account/google-callback/google-callback.component';

export const routes: Routes = [
    { path: 'account/login', component: LoginComponent },
    { path: 'account/register', component: RegisterComponent },
    { path: 'account/email-validation/:email', component: EmailActivationComponent },
    { path: 'account/email-validation', component: EmailActivationComponent },
    { path: 'account/forgot-password', component: ForgotPasswordComponent },
    { path: 'account/create-new-password/:email', component: CreateNewPasswordComponent },
    { path: 'account/google/callback', component: GoogleCallbackComponent },

    {
        path: 'app/admin',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'dashBoard', component: DashboardComponent },
            { path: 'roles', component: RoleComponent },
            { path: 'users', component: UserComponent },
            { path: 'users/create', component: CreateUserComponent },
            { path: 'users/:id', component: UpdateUserComponent },
            { path: 'auditLogs', component: AuditLogsComponent },
            { path: 'tenantSettings', component: SettingComponent }

        ]
    },
];
