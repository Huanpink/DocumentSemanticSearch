# Màn hình Thùng rác (Trash)

## Chức năng: Lấy danh sách Thùng rác

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Quy định:** Các file/folder nằm trong thùng rác quá **30 ngày** sẽ bị hệ thống tự động dọn dẹp (xóa vĩnh viễn).
- **Giao diện:** Bảng (Table) hoặc Danh sách hiển thị các File và Thư mục đã bị xóa. Hiển thị thông tin người xóa (`deleted_by`) và thời gian xóa (`deleted_at`).
- **Ràng buộc UI:** Tuyệt đối **không cho phép click/Double-click vào thư mục** để xem các node con bên trong. Ở màn hình Thùng rác, người dùng chỉ được xem thư mục dưới dạng 1 dòng (row) và thực hiện 2 thao tác: Khôi phục hoặc Xóa vĩnh viễn.
- **UI Phân quyền:** Phải có quyền `trash:read` mới được truy cập màn hình này.

### 2. API & Logic Backend
- **Xử lý:** Truy vấn bảng `nodes` với điều kiện `deleted_at IS NOT NULL`. Nếu chỉ soft delete node cha, danh sách này chỉ hiện các thư mục/file gốc lúc người dùng bấm xóa, không hiện các file con bên trong (trừ khi file con đó bị bấm xóa riêng).
- **Phân quyền API:** Quyền `trash:read`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#3-quản-lý-thùng-rác-trash)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Khôi phục (Restore) File/Thư mục

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Khi bấm nút 'Khôi phục' (Restore), hiển thị **một Modal dùng chung**:
  - Trong Modal luôn có một component Select (hoặc Tree Select) để người dùng chọn "Nơi khôi phục". Mặc định Select này sẽ chọn sẵn thư mục cha gốc (nếu còn tồn tại).
  - Nếu `parent_id` cũ không tìm thấy (do cha đã bị thùng rác hoặc xóa vĩnh viễn): Modal sẽ hiện thêm 1 dòng Alert cảnh báo (vd: *"Không tìm thấy thư mục cha gốc, vui lòng chọn nơi khôi phục mới"*).
- **UI Phân quyền:** Nút hiển thị nếu có quyền `trash:restore`.

### 2. API & Logic Backend
- **Xử lý:** API Khôi phục sẽ nhận thêm `parentId` từ body do UI gửi lên. Cập nhật `deleted_at = NULL`, `deleted_by = NULL` và `parent_id = {parentId truyền lên}`.
- **Lưu ý:** Nếu `parentId` truyền lên là `null`, item sẽ được khôi phục ra thẳng thư mục gốc (Root). Backend cần validate `parentId` đích này phải đang hợp lệ (không nằm trong thùng rác).

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#3-quản-lý-thùng-rác-trash)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Xóa vĩnh viễn (Permanent Delete)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Nút 'Xóa vĩnh viễn' trên mỗi dòng. Bật Modal cảnh báo xác nhận, yêu cầu nhập chữ vào ô input để tránh bấm nhầm.
- **UI Phân quyền:** Nút chỉ hiển thị khi có quyền `trash:delete`.

### 2. API & Logic Backend
- **Xử lý:**
  1. Duyệt đệ quy tìm toàn bộ node con nằm trong thư mục này.
  2. Xóa vật lý toàn bộ các file PDF đính kèm trên ổ cứng (dùng `os.remove` theo đường dẫn `storagePath`).
  3. Thực thi lệnh DELETE cứng các record khỏi bảng `nodes`. 
  4. Database nhờ `FK CASCADE` sẽ tự động xóa sạch các vector dữ liệu trong `document_chunks`.
- **Phân quyền API:** Quyền `trash:delete`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#3-quản-lý-thùng-rác-trash)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Làm sạch thùng rác (Empty Trash)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Nút 'Làm sạch thùng rác' trên góc trên cùng. Có cảnh báo mức độ cao (Red Warning), bắt buộc nhập chữ 'XÓA TOÀN BỘ' vào ô input để xác nhận.
- **UI Phân quyền:** Chỉ hiển thị với quyền `trash:delete`.

### 2. API & Logic Backend
- **Xử lý:** Tương tự như Xóa vĩnh viễn, nhưng áp dụng vòng lặp cho **tất cả** các record có `deleted_at IS NOT NULL`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#3-quản-lý-thùng-rác-trash)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)
