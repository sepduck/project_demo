import { CONFIRM_PASSWORD_NOT_MATCH, EMAIL_INVALID, EMAIL_REQUIRED, FIRST_NAME_MAX_LENGTH, LAST_NAME_MAX_LENGTH, LAST_NAME_MIN_LENGTH, LAST_NAME_REQUIRED, PASSWORD_MIN_LENGTH, PASSWORD_REQUIRED, PHONE_NUMBER_INVALID, PHONE_NUMBER_REQUIRED, ROLE_NAME_INVALID, ROLE_NAME_REQUIRED, ROLE_SELECTION_REQUIRED, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_REQUIRED, VERIFICATION_CODE_REQUIRED } from './../constants/error-message';
import { FIRST_NAME_MIN_LENGTH, FIRST_NAME_REQUIRED } from "../constants/error-message";

export interface ValidationErrors {
    [key: string]: string;
}

export function validateEmail(email: string): string | null {
    if (!email.trim()) return EMAIL_REQUIRED;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return EMAIL_INVALID;
    }
    return null;
}
export function validatePhoneNumber(phone: string): string | null {
    if (!phone.trim()) return PHONE_NUMBER_REQUIRED;

    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
        return PHONE_NUMBER_INVALID;
    }

    return null;
}

export function validatePassword(password: string): string | null {
    if (!password.trim()) return PASSWORD_REQUIRED;
    return null;
}
export function validateFirstName(firstName: string): string | null {
    if (!firstName.trim()) return FIRST_NAME_REQUIRED;
    if (firstName.trim().length < 2) return FIRST_NAME_MIN_LENGTH
    if (firstName.trim().length > 50) return FIRST_NAME_MAX_LENGTH
    return null;
}
export function validateLastName(lastName: string): string | null {
    if (!lastName.trim()) return LAST_NAME_REQUIRED;
    if (lastName.trim().length < 2) return LAST_NAME_MIN_LENGTH;
    if (lastName.trim().length > 50) return LAST_NAME_MAX_LENGTH;
    return null;
}
export function validateUsername(username: string): string | null {
    if (!username.trim()) return USERNAME_REQUIRED;
    if (username.trim().length < 4) return USERNAME_MIN_LENGTH;
    if (username.trim().length > 20) return USERNAME_MAX_LENGTH;
    return null;
}
export function validateMinPasswordLength(minPasswordLength: number, minLength: number): string | null {
    if (minPasswordLength < minLength) return PASSWORD_MIN_LENGTH(minLength);
    return null;
}
export function validateConfirmPassword(password: string, confirmPassword: string, isRandomPassword: boolean): string | null {
    if (!isRandomPassword && password !== confirmPassword) return CONFIRM_PASSWORD_NOT_MATCH;
    return null;
}

export function validatePasswordCreateUser(password: string, isRandomPassword: boolean): string | null {
    if (!isRandomPassword && !password.trim()) return PASSWORD_REQUIRED;
    return null;
}

export function validateRoleName(name: string): string | null {
    if (!name.trim()) return ROLE_NAME_REQUIRED;

    const englishPattern = /^[a-zA-Z0-9_-]+$/;

    if (!englishPattern.test(name)) {
        return ROLE_NAME_INVALID;
    }
    return null;
}

export function validateTokenEmail(token: string): string | null {
    if (!token.trim()) return VERIFICATION_CODE_REQUIRED;
    return null;
}

export function validateRole(roles: number[]): string | null {
    if (roles.length === 0) return ROLE_SELECTION_REQUIRED;
    return null;
}