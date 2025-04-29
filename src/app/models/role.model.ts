export interface Role {
    id: number;
    name: string;
    status: boolean;
    systemReserve: boolean;
    createdAt: string;
}

export interface ApiResponse {
    code: number;
    message: string;
    result: {
        contents: Role[];
        totalRecords: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
    }
}

export interface Permission {
    id: number;
    name: string;
    slug: string;
}

export interface UpdateRole {
    name: string;
    status: boolean;
    permissions: number[]
}

export interface CreatedRole {
    id?: number;
    name: string;
    status: boolean;
    permissions: number[];
}