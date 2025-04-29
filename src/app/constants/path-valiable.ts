export const APP = "/app"
export const ADMIN = `${APP}/admin`
export const ACCOUNT = '/account'

export const LOGIN = `${ACCOUNT}/login`
export const CREATE_NEW_PASSWORD = (email: string) => `${ACCOUNT}/create-new-password/${email}`
export const EMAIL_VALIDATION = (email: string) => `${ACCOUNT}/email-validation/${email}`

export const DASHBOARD = `${ADMIN}/dashBoard`;
export const USERS = `${ADMIN}/users`;
export const USERS_CREATE = `${USERS}/create`;
export const USERS_ID = (id: string) => `${USERS}/${id}`;


