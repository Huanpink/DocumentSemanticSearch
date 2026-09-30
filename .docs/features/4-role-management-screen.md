# Màn hình Quản lý Phân quyền (Roles)

## Chức năng: Lấy danh sách Roles

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Bảng danh sách các Role. Mỗi dòng hiển thị danh sách các nhãn (Tag) mã quyền.
- **UI Phân quyền:** Phải có quyền `role:read` mới xem được màn hình này.

### 2. API & Logic Backend
- **Xử lý:** Query bảng `roles`. Trả về JSON array cho cột `permissions`.
- **Phân quyền API:** Quyền `role:read`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L252-L275)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L146-L163)

---

## Chức năng: Thêm Role mới

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Form gồm Input `Tên Role`, Checkbox Group (chọn các mã quyền `file:add`, `file:view`...).
- **UI Phân quyền:** Nút 'Thêm Role' chỉ hiển thị khi có quyền `role:create`.
- **Validate Form:** Tên Role không được trùng.

### 2. API & Logic Backend
- **Xử lý:** Insert vào `roles`. Mảng mã quyền lưu vào cột JSONB `permissions`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L252-L275)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L146-L163)

---

## Chức năng: Sửa Role

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Modal chứa Checkbox Group load sẵn các quyền đang có.
- **UI Phân quyền:** Nút 'Sửa' chỉ hiển thị khi có quyền `role:update`.

### 2. API & Logic Backend
- **Xử lý:** Update cột `permissions` dạng JSONB của `roles`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L252-L275)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L146-L163)

---

## Chức năng: Xóa Role

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Nút 'Xóa'. Có Modal xác nhận, yêu cầu nhập chữ vào ô input để xác nhận thao tác.
- **UI Phân quyền:** Nút 'Xóa' chỉ hiển thị khi có quyền `role:delete`.

### 2. API & Logic Backend
- **Xử lý:** Validate xem có user nào đang giữ Role này không (bảng `user_roles`). Nếu có, cấm xóa.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L252-L275)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L146-L163)

---

