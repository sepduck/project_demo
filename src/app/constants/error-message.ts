export const CHANGE_PASSWORD_FAILED = "Cập nhật mật khẩu thất bại";
export const AUTHENTICATION_FAILED = "Xác thực thất bại"
export const UNABLE_LOAD_DATA_ON_FILTER = 'Không thể tải dữ liệu theo điều kiện lọc'

// Validate
export const FIRST_NAME_REQUIRED = "Họ không được để trống";
export const FIRST_NAME_MIN_LENGTH = "Họ phải có ít nhất 2 ký tự";
export const FIRST_NAME_MAX_LENGTH = "Họ không được vượt quá 50 ký tự";

export const LAST_NAME_REQUIRED = "Tên không được để trống";
export const LAST_NAME_MIN_LENGTH = "Tên phải có ít nhất 2 ký tự";
export const LAST_NAME_MAX_LENGTH = "Tên không được vượt quá 50 ký tự";

export const USERNAME_REQUIRED = "Tên người dùng không được để trống";
export const USERNAME_MIN_LENGTH = "Tên người dùng phải có ít nhất 4 ký tự";
export const USERNAME_MAX_LENGTH = "Tên người dùng không được vượt quá 20 ký tự";

export const EMAIL_REQUIRED = "Email không được để trống";
export const EMAIL_INVALID = "Email không đúng định dạng";

export const PHONE_NUMBER_REQUIRED = "Số điện thoại không được để trống";
export const PHONE_NUMBER_INVALID = "Số điện thoại không đúng định dạng";

export const PASSWORD_MIN_LENGTH = (minLength: number) => `Mật khẩu phải có ít nhất ${minLength} ký tự`
export const CONFIRM_PASSWORD_NOT_MATCH = "Mật khẩu xác nhận không khớp";
export const PASSWORD_REQUIRED = 'Mật khẩu không được để trống'

export const ROLE_NAME_REQUIRED = 'Tên vai trò không được để trống';
export const ROLE_NAME_INVALID = "Tên vai trò chỉ được phép chứa chữ cái tiếng Anh, số và dấu gạch dưới/gạch ngang";
export const ROLE_SELECTION_REQUIRED = "Vui lòng chọn ít nhất một vai trò";

export const VERIFICATION_CODE_REQUIRED = "Mã xác thực không được để trống";

export const IMPORT_USERS_SUCCESS = (count: number) => `Đã import ${count} người dùng thành công.`;
export const FILE_READ_ERROR = "Không thể đọc dữ liệu từ file. Vui lòng kiểm tra định dạng file.";
export const FILE_READ_SUCCESS = (count: number) => `Đã đọc ${count} bản ghi từ file.`;
export const IMPORT_NO_DATA = "Không có dữ liệu để import.";
export const TEMPLATE_DOWNLOAD_SUCCESS = "Tải xuống tệp mẫu thành công!";
export const EXPORT_USER_DATA_FAILED = "Không thể xuất dữ liệu người dùng. Vui lòng thử lại sau.";
export const EXPORT_USER_DATA_SUCCESS = "Xuất danh sách người dùng thành công!";

export const LOGIN_FAILED = "Không thể đăng nhập người dùng. Vui lòng thử lại sau.";
export const LOGIN_USER_FAILED = "Đăng nhập người dùng thất bại";
export const USER_NOT_FOUND = "Người dùng không tồn tại";
export const ACCOUNT_NOT_ACTIVATED = "Tài khoản chưa được kích hoạt";

export const DELETE_USER_FAILED = "Không thể xoá người dùng. Vui lòng thử lại sau.";
export const DELETE_USER_ERROR = "Xóa người dùng thất bại";
export const DELETE_USER_SUCCESS = "Xoá người dùng thành công!";
export const LOAD_USER_DATA_FAILED = "Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.";

export const CREATE_USER_FAILED = "Tạo tài khoản thất bại!";

export const UPLOAD_IMAGE_FAILED = "Tải ảnh lên thất bại!";
export const ONLY_IMAGE_FILES_ALLOWED = "Chỉ chấp nhận file hình ảnh";
export const IMAGE_FILE_TOO_LARGE = "Kích thước file không được vượt quá 5MB";

export const LOAD_ROLE_LIST_FAILED = "Không thể tải danh sách vai trò";

export const UPDATE_USER_FAILED = "Cập nhật tài khoản thất bại!";

export const LOAD_USER_INFO_FAILED = "Không thể tải thông tin người dùng";

export const UPDATE_SETTING_FAILED = "Sửa cài đặt thất bại!";
export const UPDATE_SETTING_SUCCESS = "Sửa cài đặt thành công!";

export const SYSTEM_ROLE_ACTION_FORBIDDEN = "Không thể thực hiện với vai trò của hệ thống";
export const ROLE_NOT_FOUND = "Vai trò không tồn tại";
export const DELETE_ROLE_SUCCESS = "Xoá vai trò thành công!";
export const CANNOT_DELETE_OWN_ROLE = "Bạn không thể xóa vai trò của chính mình!";
export const CONFIRM_DELETE_ROLE_WITH_USERS = "Nếu xóa vai trò này thì tất cả người dùng có vai trò cũng bị xóa, bạn có muốn xóa không?";

export const CREATE_ROLE_FAILED = "Lỗi khi tạo vai trò";
export const ROLE_NAME_ALREADY_EXISTS = "Tên vai trò đã tồn tại";
export const CREATE_ROLE_SUCCESS = "Vai trò đã được tạo thành công!";
export const UPDATE_ROLE_ERROR = "Lỗi khi cập nhật vai trò";
export const CURRENT_ROLE_CHANGED = "Vai trò hiện tại của bạn đã được thay đổi. Vui lòng đăng nhập lại để áp dụng quyền mới.";
export const UPDATE_ROLE_SUCCESS = "Vai trò đã được cập nhật thành công!";
export const GET_ROLE_INFO_INVALID_DATA = "Không thể lấy thông tin vai trò: Dữ liệu không hợp lệ";
export const SELF_ROLE_CHANGE_RELOGIN_WARNING = "Nếu bạn đang thay đổi quyền của riêng bạn, bạn sẽ phải đăng nhập lại để có hiệu lực của các thay đổi quyền trên màn hình của riêng bạn!";

export const CAPTCHA_REQUIRED = "Vui lòng hoàn thành CAPTCHA.";
export const CAPTCHA_INVALID = 'Captcha không hợp lệ';


export const LOWERCASE_REQUIRED = 'chữ thường';
export const UPPERCASE_REQUIRED  = 'chữ hoa';
export const NUMBER_REQUIRED = 'chữ số';
export const SPECIAL_CHAR_REQUIRED = 'ký tự đặc biệt';
export const PASSWORD_MIN_LENGTH_MESSAGE = (minLength: number) => `ít nhất ${minLength} ký tự`;

export const MIN_6_CHAR = 'ít nhất 6 ký tự';

export const RESET_PASSWORD_LINK_INSTRUCTION = "Liên kết đặt lại mật khẩu sẽ được gửi đến email của bạn để đặt lại mật khẩu của bạn. Nếu bạn không nhận được email trong vòng vài phút, vui lòng thử lại.";
export const CHANGE_PASSWORD_SUCCESS = "Thay đổi mật khẩu thành công!";
export const NEW_PASSWORD_CONFIRM_MISMATCH = 'Mật khẩu mới và nhập lại mật khẩu không khớp';
export const CURRENT_PASSWORD_REQUIRED = 'Vui lòng nhập mật khẩu hiện tại';
export const NEW_PASSWORD_REQUIRED = 'Vui lòng nhập mật khẩu mới';
export const NEW_PASSWORD_NOT_SAME_AS_OLD = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';

