const HOST = 'http://localhost:5293';

const API = `${HOST}/api`;
const V1 = `/v1`;
const API_V1 = API + V1;

export const API_V1_AUTH = `${API_V1}/auth`;
export const API_V1_AUTH_LOGIN = `${API_V1_AUTH}/login`;
export const API_V1_AUTH_LOGOUT = `${API_V1_AUTH}/logout`;
export const API_V1_AUTH_REGISTER = `${API_V1_AUTH}/register`;
export const API_V1_AUTH_REFRESH_TOKEN = `${API_V1_AUTH}/refresh-token`;
export const API_V1_AUTH_FORGOT_PASSWORD = `${API_V1_AUTH}/forgot-password`;
export const API_V1_AUTH_CREATE_NEW_PASSWORD = `${API_V1_AUTH}/create-new-password`;
export const API_V1_AUTH_LOGIN_AS_USER = `${API_V1_AUTH}/login-as-user`;
export const API_V1_AUTH_CONFIRM_EMAIL = `${API_V1_AUTH}/confirm-email`;
export const API_V1_AUTH_LOGIN_GOOGLE = `${API_V1_AUTH}/login-google`;
export const API_V1_AUTH_LOGIN_FACEBOOK = `${API_V1_AUTH}/login-facebook`;
export const API_V1_AUTH_UNLINK_OUTBOUND = `${API_V1_AUTH}/unlink-outbound`;
export const API_V1_AUTH_LINK_GOOGLE = `${API_V1_AUTH}/link-google`;

export const API_V1_ACTIVITY_LOG = `${API_V1}/activity-log`;
export const API_V1_ACTIVITY_LOG_SEARCH = `${API_V1_ACTIVITY_LOG}/search`;

export const API_V1_USER = `${API_V1}/user`;
export const API_V1_USER_PROFILE = `${API_V1_USER}/profile`;
export const API_V1_USER_CHANGE_PASSWORD = `${API_V1_USER}/change-password`;
export const API_V1_USER_SEARCH = `${API_V1_USER}/search`;
export const API_V1_USER_IMPORT = `${API_V1_USER}/import`;

export const API_V1_IMAGES = `${API_V1}/images`;
export const API_V1_IMAGES_UPLOAD = `${API_V1_IMAGES}/upload`;

export const API_V1_ROLE = `${API_V1}/role`;
export const API_V1_ROLE_SELECT = `${API_V1_ROLE}/select`;

export const API_V1_PERMISSIONS = `${API_V1}/permissions`;
export const API_V1_PERMISSIONS_TREE = `${API_V1_PERMISSIONS}/tree`;

export const API_V1_SETTING = `${API_V1}/setting`;

