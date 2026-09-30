# Màn hình Đăng nhập

## Chức năng: Đăng nhập (Login)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Form Đăng nhập gồm ô `Username`, `Password`, nút `Đăng nhập`.
- **Validate Form:** Username không được bỏ trống, không chứa ký tự đặc biệt. Password không được bỏ trống.
- **UI Phân quyền:** Nếu login thành công, Frontend lưu token vào localStorage và redirect sang Dashboard tùy theo role.

### 2. API & Logic Backend
- **Xử lý:** Hash password nhập vào bằng Bcrypt, so sánh với `hashed_password` trong bảng `users`.
- **Lưu trữ:** Cấp 2 token (JWT) và lưu hành động vào log (nếu có).
- **Phân quyền API:** Public (Không cần token).

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L12-L29)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L73-L86)

---

## Chức năng: Lấy lại Token (Refresh Token)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Hoạt động ngầm:** Khi API trả về 401 Unauthorized, Axios Interceptor tự động bắn API refresh-token. 
- Không có UI hiển thị.

### 2. API & Logic Backend
- **Xử lý:** Check refreshToken trong header/cookie còn hạn không. 
- **Lưu trữ:** Cấp lại AccessToken mới. Nếu dùng Redis có thể check token bị thu hồi chưa.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L31-L47)

---

