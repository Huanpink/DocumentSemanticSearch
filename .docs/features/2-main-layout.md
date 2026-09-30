# Khung giao diện chính (Header/Sidebar)

## Chức năng: Xem thông tin cá nhân (Get Me)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Hoạt động ngầm:** Gọi ngay khi ứng dụng (React) vừa tải xong để lấy Profile.
- **Render UI:** Lưu `permissions` vào Zustand store để ẩn hiện các Menu (Ví dụ: Ẩn menu 'Quản trị User' nếu không có quyền).

### 2. API & Logic Backend
- **Xử lý:** Lấy userId từ JWT. Join bảng `users`, `user_roles`, `roles` để gom tất cả mảng `permissions`.
- **Lưu trữ:** Trả về JSON chứa profile và mảng quyền.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L49-L62)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L73-L86)

---

## Chức năng: Đăng xuất (Logout)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Nút 'Đăng xuất' trên Header/Avatar dropdown.
- **Hoạt động:** Xóa token khỏi localStorage/cookie và redirect về trang `/login`.

### 2. API & Logic Backend
- **Xử lý:** Xóa session (nếu dùng cookie) hoặc đưa token vào blacklist (nếu JWT lưu Redis).
- **Phân quyền API:** Cần token hiện tại.

### 3. Liên kết tham chiếu

---

