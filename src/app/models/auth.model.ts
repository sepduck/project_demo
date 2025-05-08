export interface JwtPayload {
    nameid: string;
    email: string;
    unique_name: string;
    role: string;
    permission: string[];
    nbf: number;
    exp: number;
    iat: number;
    iss: string;
    aud: string;
}