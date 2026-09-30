# Màn hình Quản lý Tài liệu

## Chức năng: Lấy danh sách cây thư mục (List Nodes)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Hiển thị dạng Cây (Tree View) hoặc Lưới (Grid/List View) như Google Drive. Hiệu ứng Infinite Scroll (Load More).
- **API gọi:** Bắn `GET /nodes?parentId=...&page=1`.

### 2. API & Logic Backend
- **Xử lý:** Query bảng `nodes` điều kiện `parent_id = ?` và `deleted_at IS NULL`. Trả về list gồm cả type 'folder' và 'file'.
- **Phân quyền:** Token hợp lệ.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L71-L105)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Thêm thư mục (Create Folder)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Modal 'Tạo thư mục mới' với Input `Tên thư mục`, và Color Picker chọn màu.
- **Validate Form:** Tên thư mục không được rỗng, không chứa ký tự đặc biệt `\ / : * ? " < > |`.
- **Hoạt động:** Nếu đang đứng ở thư mục A, biến `parentId` tự động gắn bằng ID của A.
- **UI Phân quyền:** Nút 'Tạo thư mục' chỉ hiện khi có quyền `folder:create`.

### 2. API & Logic Backend
- **Xử lý:** Validate tên thư mục không trùng trong cùng 1 `parentId`.
- **Lưu trữ:** Insert vào bảng `nodes` với `type = 'folder'`, `metadata = {'color': '...'}`.
- **Phân quyền API:** Cần token, yêu cầu quyền `folder:create`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L107-L119)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Đổi tên thư mục (Rename Folder)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Right-click -> Đổi tên. 
- **Validate Form:** Không chứa ký tự đặc biệt.

### 2. API & Logic Backend
- **Xử lý:** Update cột `name` của `nodes` nơi `type = 'folder'`. Check trùng tên ở cùng cấp.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L137-L147)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Di chuyển thư mục (Move Folder)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Kéo thả (Drag & Drop) folder này vào folder khác (Sử dụng thư viện `@dnd-kit/core`).
- **Hoạt động:** Lấy ID thư mục đích gán thành `parentId`.

### 2. API & Logic Backend
- **Xử lý:** Update cột `parent_id` trong bảng `nodes`. Cần check cycle (không được chuyển cha vào con).

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L137-L147)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Xóa thư mục (Delete Folder)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Right-click -> Xóa. Bật Modal xác nhận yêu cầu nhập chữ (vd: tên thư mục) vào ô input để xác thực.

### 2. API & Logic Backend
- **Xử lý:** Chỉ thực hiện Soft Delete cho chính thư mục được chọn (cập nhật `deleted_at = Now()` và `deleted_by = user_id`). KHÔNG cập nhật đệ quy cho các node con. Khi Backend query danh sách, sẽ dùng CTE (hoặc join) để tự động ẩn toàn bộ các node con nằm trong thư mục cha đã bị xóa.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L149-L151)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Upload File PDF

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Khu vực Kéo thả (Drag & Drop) hoặc nút 'Chọn File' (Sử dụng thư viện `react-dropzone`). Có thanh Progress Bar hiển thị % upload.
- **Validate Form:** Chỉ nhận file `.pdf`. Dung lượng <= 50MB.
- **UI Phân quyền:** Vùng Upload chỉ hiện với Admin hoặc User có quyền `file:upload`.

### 2. API & Logic Backend
- **Xử lý:** Backend nhận file multipart/form-data. Cần tính toán MD5 băm nội dung để chống trùng lặp (docId).
- **Cơ chế lưu trữ vật lý (Storage Mechanism):**
  - **Tên file:** File không được lưu bằng tên gốc của người dùng, mà lưu bằng mã băm MD5 của chính nội dung file đó (Ví dụ: `8b1a9953c4611296a827abf8c47804d7.pdf`).
  - **Vị trí lưu:** Toàn bộ file lưu chung trong một thư mục phẳng duy nhất trên server (Flat Storage, ví dụ: `/storage/documents/`). Cấu trúc cây thư mục (folder cha/con) mà người dùng thấy chỉ là cấu trúc ảo (logical) được quản lý thông qua cột `parent_id` trong DB.
  - **Lợi ích:** Tránh trùng lặp dữ liệu (Deduplication - nếu 2 người tải lên cùng 1 nội dung thì server chỉ lưu 1 bản vật lý), chống lỗi hệ điều hành do tên file có ký tự lạ/tiếng Việt, và giúp thao tác đổi tên/di chuyển file cực nhanh (chỉ cần update DB).
- **Lưu trữ:** Insert bản ghi vào bảng `nodes` với `type = 'file'` và lưu vị trí file vào `metadata->>'storagePath'`. Sau đó kích hoạt Background Worker để đọc text -> chia chunk -> gọi Embedding -> lưu vector vào bảng `document_chunks`.
- **Phân quyền API:** Cần token, quyền `file:upload`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#23-upload-và-index-tài-liệu-file)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#22-bảng-nodes-files--folders)

---

## Chức năng: Đổi tên File

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Right-click lên file -> Đổi tên.

### 2. API & Logic Backend
- **Xử lý:** Chỉ update trường `name` trong `nodes`. Không can thiệp vật lý vào ổ cứng.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L137-L147)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Di chuyển File

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Drag & Drop file vào folder (Sử dụng thư viện `@dnd-kit/core`).

### 2. API & Logic Backend
- **Xử lý:** Cập nhật `parent_id` của record file trong `nodes`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L137-L147)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Xem/Tải File gốc

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Double click vào file để mở Modal xem trước PDF.

### 2. API & Logic Backend
- **Xử lý:** Truy vấn `storagePath` từ `metadata`. Đọc file bằng FileSystem và Stream (phản hồi `application/pdf`).

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L153-L157)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Xóa File

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Bấm nút Xóa file. Bật Modal xác nhận yêu cầu nhập chữ (vd: tên file) vào ô input để xác thực.

### 2. API & Logic Backend
- **Xử lý:** Chuyển file vào thùng rác (Soft Delete) bằng cách cập nhật `deleted_at = Now()` và `deleted_by = user_id` trong bảng `nodes`. Chưa xóa vật lý và chưa xóa vector.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#L149-L151)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)
