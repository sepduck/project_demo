export interface Setting {
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
export interface ApiResponseSetting {
    code: number;
    message: string;
    result: Setting;
}