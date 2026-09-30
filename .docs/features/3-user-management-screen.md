# Màn hình Quản lý Người dùng

## Chức năng: Lấy danh sách User

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Table danh sách User. Có phân trang (Pagination) ở dưới cùng. Ô tìm kiếm (Search) theo tên/email.
- **UI Phân quyền:** Phải có quyền `user:read` mới được truy cập màn hình này. Nếu không có, hiển thị màn hình 403 (Access Denied).
- **Validate Form:** Tham số `page` > 0, `pageSize` mặc định 20.

### 2. API & Logic Backend
- **Xử lý:** Query bảng `users`. Trả về `totalItems`, `totalPages`.
- **Phân quyền API:** Quyền `user:read`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L210-L226)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L73-L86)

---

## Chức năng: Thêm User mới

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Form gồm `Username`, `Password tạm`, `Họ tên`, và Dropdown chọn `Roles` (Nhóm quyền).
- **Dropdown API:** Gọi API `GET /roles` để lấy danh sách Roles đổ vào Dropdown.
- **Validate Form:** Username (min 5 ký tự, không trùng lặp), Password (có chữ hoa, số, min 8 ký tự).
- **UI Phân quyền:** Nút 'Thêm User' chỉ hiển thị khi `permissions` của user hiện tại có chứa `user:create`.

### 2. API & Logic Backend
- **Xử lý:** Backend validate username chưa tồn tại. Hash password. 
- **Lưu trữ:** Insert 1 record vào bảng `users`. Vòng lặp insert các `roleId` vào bảng `user_roles`.
- **Phân quyền API:** Cần token của Admin.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L228-L239)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L73-L86)

---

## Chức năng: Cập nhật User

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Modal Edit User, lấy data cũ điền sẵn vào form.
- **UI Phân quyền:** Nút 'Sửa' (hoặc icon Edit) trên mỗi dòng chỉ hiển thị khi có quyền `user:update`.
- **Validate Form:** Không được đổi Username. Tên không được rỗng.

### 2. API & Logic Backend
- **Xử lý:** Update bảng `users`. Xóa data cũ ở `user_roles` và Insert data Role mới.
- **Phân quyền API:** Quyền `user:update`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L241-L250)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L73-L86)

---

## Chức năng: Đặt lại mật khẩu

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Nút 'Reset Password' trong menu dropdown của dòng User tương ứng.
- **UI Phân quyền:** Menu 'Reset Password' chỉ hiển thị khi có quyền `user:update` (hoặc `user:reset_pwd`).
- **Validate:** Modal confirm 'Bạn có chắc chắn?'.

### 2. API & Logic Backend
- **Xử lý:** Tạo mật khẩu ngẫu nhiên hoặc mặc định. Hash bcrypt và update vào `users`.

### 3. Liên kết tham chiếu
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L73-L86)

---

## Chức năng: Xóa User

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Nút 'Xóa' màu đỏ. Có Confirm Dialog yêu cầu nhập chữ (vd: 'XÓA' hoặc tên user) vào ô input để xác nhận thao tác.
- **UI Phân quyền:** Nút 'Xóa' chỉ hiển thị khi có quyền `user:delete`.

### 2. API & Logic Backend
- **Xử lý:** Soft delete (set `is_active = false`) hoặc xóa cứng.
- **Phân quyền API:** Quyền `user:delete`.

### 3. Liên kết tham chiếu
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L73-L86)

---

