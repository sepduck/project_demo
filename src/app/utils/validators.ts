export interface ValidationErrors {
    [key: string]: string;
}

export function validateEmail(email: string): string | null {
    if (!email.trim()) return 'Vui lòng nhập email';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Email không đúng định dạng';
    }
    return null;
}
export function validatePhoneNumber(phone: string): string | null {
    if (!phone.trim()) return 'Vui lòng nhập số điện thoại';

    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
        return 'Số điện thoại không đúng định dạng';
    }

    return null;
}

export function validatePassword(password: string): string | null {
    if (!password.trim()) return 'Mật khẩu không được để trống';
    return null;
}
export function validateFirstName(firstName: string): string | null {
    if (!firstName.trim()) return 'Họ không được để trống';
    return null;
}
export function validateLastName(lastName: string): string | null {
    if (!lastName.trim()) return 'Tên không được để trống';
    return null;
}
export function validateUsername(username: string): string | null {
    if (!username.trim()) return 'Tên người dùng không được để trống';
    return null;
}
export function validateMinPasswordLength(minPasswordLength: number, minLength: number): string | null {
    if (minPasswordLength < minLength) return `Mật khẩu phải có ít nhất ${minLength} ký tự`;
    return null;
}
export function validateConfirmPassword(password: string, confirmPassword: string, isRandomPassword: boolean): string | null {
    if (!isRandomPassword && password !== confirmPassword) return 'Mật khẩu xác nhận không khớp';
    return null;
}

export function validateRoleName(name: string): string | null {
    if (!name.trim()) return 'Tên vai trò không được để trống';
    return null;
}

export function validateTokenEmail(token: string): string | null {
    if (!token.trim()) return 'Mã xác thực không được để trống';
    return null;
}