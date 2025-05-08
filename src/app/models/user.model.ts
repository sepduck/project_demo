export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    thumbnail: string;
    role: string;
    verifyToken: boolean;
    isAction: boolean;
    createdAt: string;
}
export interface Role {
    id: number;
    name: string;
}

export interface ApiResponse {
    code: number;
    message: string;
    result: {
        contents: User[];
        totalRecords: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
    }
}
interface Providers {
    avatar: string;
    provider: string;
    providerEmail: string;
    providerUserId: string;
    firstName: string;
    lastName: string;
}
export interface UserDetail {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phoneNumber: string;
    thumbnail: string;
    verifyToken: boolean;
    isRandomPassword: boolean;
    roleName: string;
    mustChangePassword: boolean;
    isAction: boolean;
    isLockedOut: boolean;
    isSendEmail: boolean;
    providers: Providers[]
}
export interface ApiResponseUserDetail {
    code: number;
    message: string;
    result: UserDetail;
}
export interface ApiResponseRoles {
    code: number;
    message: string;
    result: Role[];
}

export interface PermissionIdsRequest {
    permissionIds: number[]
}

export interface ApiResponse2<T> {
    code: number;
    message: string;
    data?: T;
}