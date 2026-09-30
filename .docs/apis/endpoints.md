# API Endpoints Documentation

Dựa trên yêu cầu từ `PRD.md` và `schema/database-schema.md` mới nhất, dưới đây là danh sách các API Endpoint cần thiết cho hệ thống **DocumentSemanticSearch**. Các API được thiết kế theo chuẩn RESTful.

*Base URL: `/api/v1`*

---

## 1. Authentication (Xác thực & Phân quyền)
Hệ thống sử dụng JWT Token cho việc xác thực và kiểm tra Permission động dựa trên Role của người dùng.

### 1.1. Đăng nhập
- **Endpoint:** `POST /auth/login`
- **Mô tả:** Xác thực người dùng và trả về JWT access token.
- **Request Body (application/json):**
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "tokenType": "bearer"
  }
  ```

### 1.2. Refresh Token
- **Endpoint:** `POST /auth/refresh`
- **Mô tả:** Lấy lại Access Token mới khi token cũ hết hạn.
- **Request Body:**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1Ni..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "tokenType": "bearer"
  }
  ```

### 1.3. Lấy thông tin user hiện tại
- **Endpoint:** `GET /auth/me`
- **Mô tả:** Lấy thông tin user và danh sách các quyền (permissions) dựa trên các role mà user đang giữ.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "admin",
    "fullName": "Quản trị viên",
    "roles": [
      {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "name": "Admin"
      }
    ],
    "permissions": ["file:view", "file:add", "folder:delete", "file:search"]
  }
  ```

---

## 2. Quản lý File & Thư mục (Nodes)
Do kiến trúc gộp chung File và Folder vào bảng `nodes`, các API thao tác sẽ đồng nhất. Việc phân quyền (Thêm, Sửa, Xóa) sẽ được check dựa trên `permissions` của user.

### 2.1. Lấy danh sách nội dung (Thư mục & File cùng cấp)
- **Endpoint:** `GET /nodes`
- **Mô tả:** Trả về danh sách các thư mục con và tài liệu nằm trực tiếp trong một thư mục. Hỗ trợ phân trang theo chuẩn chung, rất phù hợp để Frontend làm hiệu ứng **Load More (Infinite Scroll)** dựa vào cờ `hasNextPage`.
- **Query Params:** `?parentId=550e8400-e29b-41d4-a716-446655440000&page=1&pageSize=50` (Nếu không truyền `parentId` hoặc truyền `null`, API sẽ trả về các node ở thư mục gốc).
- **Response (200 OK):**
  ```json
  {
    "data": [
      {
        "id": "333e4567-e89b-12d3-a456-426614174002",
        "name": "Quy chế nội bộ",
        "type": "folder",
        "parentId": null,
        "metadata": {
          "color": "#FF5733"
        },
        "createdAt": "2026-09-29T10:00:00Z",
        "updatedAt": "2026-09-29T10:00:00Z",
        "createdBy": "123e4567-e89b-12d3-a456-426614174000",
        "updatedBy": "123e4567-e89b-12d3-a456-426614174000"
      },
      {
        "id": "444e4567-e89b-12d3-a456-426614174003",
        "name": "Quy_che_NS.pdf",
        "type": "file",
        "parentId": null,
        "metadata": {
          "docId": "a1b2c3d4...",
          "storagePath": "/storage/documents/a1b2c3d4.pdf",
          "extension": ".pdf",
          "mimeType": "application/pdf",
          "sizeBytes": 1048576,
          "totalPages": 15
        },
        "createdAt": "2026-09-29T10:05:00Z",
        "updatedAt": "2026-09-29T10:05:00Z",
        "createdBy": "123e4567-e89b-12d3-a456-426614174000",
        "updatedBy": "123e4567-e89b-12d3-a456-426614174000"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "totalItems": 120,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
  ```

### 2.2. Tạo thư mục mới
- **Endpoint:** `POST /nodes/folder`
- **Mô tả:** Tạo một thư mục mới.
- **Request Body:**
  ```json
  {
    "name": "Hợp đồng 2026",
    "parentId": "333e4567-e89b-12d3-a456-426614174002",
    "metadata": {
      "color": "#00FF00"
    }
  }
  ```
- **Response (201 Created):** Trả về thông tin thư mục vừa tạo.

### 2.3. Upload và Index tài liệu (File)
- **Endpoint:** `POST /nodes/file/upload`
- **Mô tả:** Upload file PDF vào một thư mục. 
  - *Lưu trữ vật lý:* File sẽ được băm MD5 nội dung và lưu vào một thư mục dùng chung (Flat Storage) dưới tên là mã băm nhằm chống trùng lặp dữ liệu (Deduplication).
  - *Xử lý ngầm:* File được đưa vào Background Worker để bóc tách (parse), chia nhỏ (chunking), gọi model tạo vector và lưu vào PostgreSQL (pgvector).
- **Headers:** `Content-Type: multipart/form-data`
- **Request Form-Data:**
  - `file`: File PDF vật lý (Tối đa 50MB)
  - `parentId`: ID của thư mục chứa (UUID). Nếu để trống sẽ nằm ở thư mục gốc.
- **Response (202 Accepted / 201 Created):**
  ```json
  {
    "message": "File đã được xử lý và index thành công.",
    "node": {
      "id": "555e4567-e89b-12d3-a456-426614174005",
      "name": "Hop_dong_lao_dong.pdf",
      "type": "file",
      "parentId": "333e4567-e89b-12d3-a456-426614174002"
    }
  }
  ```

### 2.4. Tải / Xem file tĩnh (Preview)
- **Endpoint:** `GET /nodes/{id}/file`
- **Mô tả:** Trả về luồng dữ liệu (stream) của file vật lý để Frontend hiển thị trên `pdf.js` hoặc cho user tải về. Hệ thống sẽ đọc `storagePath` từ `metadata` để lấy file.
- **Response (200 OK):** Trả về stream file có header `Content-Type: application/pdf`.

### 2.5. Đổi tên / Chuyển vị trí (Move) Node
- **Endpoint:** `PUT /nodes/{id}`
- **Mô tả:** Đổi tên thư mục/file hoặc chuyển thư mục/file sang một thư mục khác bằng cách thay đổi `parentId`.
- **Request Body:**
  ```json
  {
    "name": "Hợp đồng 2026 (Đã chốt)",
    "parentId": "666e4567-e89b-12d3-a456-426614174006"
  }
  ```
- **Response (200 OK):** Thông tin node sau khi cập nhật.

### 2.6. Xóa File hoặc Thư mục (Soft Delete)
- **Endpoint:** `DELETE /nodes/{id}`
- **Mô tả:** Chuyển file hoặc thư mục vào thùng rác bằng cách cập nhật `deleted_at = Now()` và `deleted_by = user_id`. Không xóa file vật lý hay dữ liệu vector.
- **Response (200 OK):** Thành công.



---

---

## 3. Quản lý Thùng rác (Trash)
Do yêu cầu bảo mật, toàn bộ các thao tác liên quan tới Thùng rác được bóc tách ra một tập API riêng. Các API này đều yêu cầu kiểm tra quyền thuộc nhóm `trash:*`.

### 3.1. Lấy danh sách thùng rác
- **Endpoint:** `GET /trash`
- **Mô tả:** Lấy danh sách các file/folder có `deleted_at IS NOT NULL`. (Hỗ trợ phân trang).
- **Phân quyền:** Cần quyền `trash:read`.
- **Response (200 OK):** Tương tự `GET /nodes` nhưng chỉ chứa các item đã xóa và có thêm thông tin `deletedBy`.

### 3.2. Khôi phục File/Thư mục
- **Endpoint:** `PUT /trash/{id}/restore`
- **Mô tả:** Khôi phục file/folder từ thùng rác. Cập nhật vị trí lưu trữ mới dựa vào `parentId` do client chỉ định. Backend sẽ set `deleted_at = NULL`, `deleted_by = NULL` và update `parent_id`.
- **Request Body:**
  ```json
  {
    "parentId": "UUID của thư mục đích (hoặc null nếu muốn đẩy ra Root)"
  }
  ```
- **Phân quyền:** Cần quyền `trash:restore`.
- **Response (200 OK):** Thành công.

### 3.3. Xóa vĩnh viễn 1 File/Thư mục
- **Endpoint:** `DELETE /trash/{id}`
- **Mô tả:** Xóa cứng record khỏi bảng `nodes` (đệ quy xóa con). Tự động xóa cascade các vector liên quan. Kích hoạt xóa file PDF vật lý.
- **Phân quyền:** Cần quyền `trash:delete`.
- **Response (200 OK):** Thành công.

### 3.4. Làm sạch thùng rác (Empty Trash)
- **Endpoint:** `DELETE /trash`
- **Mô tả:** Xóa vĩnh viễn toàn bộ file/folder đang có trong thùng rác (những item có `deleted_at IS NOT NULL`).
- **Phân quyền:** Cần quyền `trash:delete`.
- **Response (200 OK):** Thành công.

## 4. Trải nghiệm Tìm kiếm (Semantic Search)

### 4.1. Tìm kiếm ngữ nghĩa
- **Endpoint:** `POST /search`
- **Mô tả:** Tìm kiếm thông tin dựa trên ngữ nghĩa của nội dung nhập vào.
- **Request Body:**
  ```json
  {
    "query": "Quy định làm thêm giờ trong công ty là gì?",
    "page": 1,
    "pageSize": 5,
    "parentId": "333e4567-e89b-12d3-a456-426614174002"
  }
  ```
  *(Truyền `parentId` nếu chỉ muốn tìm kiếm nội bộ trong 1 thư mục cụ thể)*
- **Response (200 OK):**
  ```json
  {
    "query": "Quy định làm thêm giờ trong công ty là gì?",
    "data": [
      {
        "score": 0.89,
        "content": "Nhân viên làm thêm giờ vào ngày cuối tuần sẽ được tính 200% lương cơ bản...",
        "node": {
          "id": "444e4567-e89b-12d3-a456-426614174003",
          "name": "So_tay_nhan_vien_2026.pdf"
        },
        "pageNumber": 15
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 5,
      "totalItems": 15,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
  ```

---

## 5. Quản lý Người dùng & RBAC

### 5.1. Lấy danh sách người dùng
- **Endpoint:** `GET /users`
- **Mô tả:** Xem danh sách toàn bộ người dùng (Hỗ trợ phân trang và lọc).
- **Query Params:** `?page=1&pageSize=10&roleId=...`
- **Response (200 OK):**
  ```json
  {
    "data": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "nguyenvana",
        "fullName": "Nguyễn Văn A",
        "isActive": true,
        "roles": [{"id": "223e4567-e89b-12d3-a456-426614174001", "name": "User"}],
        "createdAt": "2026-09-29T10:00:00Z",
        "updatedAt": "2026-09-29T10:00:00Z",
        "createdBy": "123e4567-e89b-12d3-a456-426614174000",
        "updatedBy": "123e4567-e89b-12d3-a456-426614174000"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 150,
      "totalPages": 15,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
  ```

### 5.2. Tạo tài khoản người dùng
- **Endpoint:** `POST /users`
- **Request Body:**
  ```json
  {
    "username": "tranvanb",
    "password": "TempPassword123!",
    "fullName": "Trần Văn B",
    "roleIds": ["223e4567-e89b-12d3-a456-426614174001"]
  }
  ```

### 5.3. Cập nhật thông tin & Gán Role
- **Endpoint:** `PUT /users/{id}`
- **Request Body:**
  ```json
  {
    "fullName": "Nguyễn Văn A (Marketing)",
    "isActive": true,
    "roleIds": ["223e4567-e89b-12d3-a456-426614174001", "777e4567-e89b-12d3-a456-426614174007"]
  }
  ```

### 5.4. Quản lý Roles
- Danh sách các quyền hạn (Permissions) thực tế sẽ được **hardcode trực tiếp trên Backend** (ví dụ: `file:add`, `file:view`, `folder:delete`).
- Sẽ có thêm các endpoint như `GET /roles`, `POST /roles`, `PUT /roles/{id}` để Admin tự định nghĩa các nhóm quyền (Roles) và lưu trữ trực tiếp danh sách permissions dưới dạng JSON mảng. (Các API GET danh sách đều bắt buộc phân trang với `?page=1&pageSize=20`).
