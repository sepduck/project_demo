interface ActivityLogs {
    id: number;
    username: string;
    serviceName: string;
    activity: string;
    executionTime: number;
    ipAddress: string;
    browser: string;
    createdAt: string;
    isError: boolean;
}

export interface ApiResponse {
    code: number;
    message: string;
    result: {
        contents: ActivityLogs[];
        totalRecords: number;
        totalPages: number;
        pageNumber: number;
        pageSize: number;
    }
}