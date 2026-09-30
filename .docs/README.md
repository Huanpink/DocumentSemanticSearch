# Document Semantic Search (DSS)

Dự án **Document Semantic Search** là một hệ thống tìm kiếm thông tin tài liệu thông minh, cho phép người dùng upload file (PDF), bóc tách nội dung và tìm kiếm dựa trên ngữ nghĩa (Semantic Search) bằng ngôn ngữ tự nhiên. 

Hệ thống được thiết kế theo mô hình Client-Server hiện đại, có quản lý phân quyền (RBAC), quản lý cấu trúc cây thư mục tài liệu và xử lý ngầm (background processing) với AI Models để sinh Vector Embeddings.

---

## 1. Công nghệ & Kiến trúc (Tech Stack)

Dự án được điều phối tập trung thông qua **.NET Aspire (Node.js AppHost)**.
- **Frontend (`apps/frontend`):** React 19, TypeScript, Vite 8, Tailwind CSS v4, shadcn/ui, Zustand, Axios. 
- **Backend (`apps/backend`):** Python 3.12+, FastAPI, SQLAlchemy (async), Uvicorn, Pydantic, JWT Auth, uv (package manager).
- **Database:** PostgreSQL (với `pgvector` extension để lưu trữ và truy vấn vector nội dung), Alembic cho Migration.
- **AI Processing:** PyMuPDF / pdfplumber (trích xuất text), Tiếng Việt Sentence Transformers (Sinh Embedding - Vectorization).

---

## 2. Các Tính năng Chính (Key Features)

Dựa trên các tài liệu phân tích trong thư mục `.docs/features/`:
1. **Xác thực & Phân quyền (Authentication & RBAC):** Đăng nhập bằng JWT, phân quyền chức năng và Row-Level Security. (Ref: `1-login-screen.md`, `3-user-management-screen.md`, `4-role-management-screen.md`)
2. **Quản lý Thư mục & Tài liệu (Document Management):** Tạo, đổi tên, di chuyển, xóa thư mục và upload file PDF. Hỗ trợ xem trước PDF tích hợp. (Ref: `5-document-management-screen.md`)
3. **Tìm kiếm Ngữ nghĩa (Semantic Search):** Nhập nội dung văn bản bất kỳ để tìm kiếm các đoạn text tương đồng nhất (Cosine Similarity) trong các tài liệu nội bộ; hỗ trợ tự động nhảy đến trang chứa kết quả. (Ref: `6-search-screen.md`)
4. **Thùng rác & Xóa mềm (Trash Management):** Xóa file vào thùng rác (Soft Delete) và hệ thống dọn rác tự động. (Ref: `8-trash-screen.md`)
5. **Background Processing:** Hệ thống chạy ngầm để parse text, chunking (chia đoạn), gọi mô hình nhúng (Embedding) và lưu mảng vector xuống pgvector PostgreSQL mà không làm chậm trải nghiệm UI. (Ref: `7-background-processing.md`)

---

## 3. Cấu trúc Tài liệu Dự án (`.docs`)

Thư mục `.docs` lưu trữ toàn bộ các tài liệu phân tích, kiến trúc và thiết kế hệ thống của dự án:

- **`setup/`** - Hướng dẫn thiết lập môi trường:
  - `setup-guide.md`: Hướng dẫn tổng quan và cách khởi chạy bằng Aspire AppHost.
  - `backend-setup.md`: Hướng dẫn chi tiết setup môi trường Python, PostgreSQL, uv, FastAPI.
  - `frontend-setup.md`: Hướng dẫn setup React SPA, cấu hình Vite và Tailwind.
- **`schema/`** - Cơ sở dữ liệu:
  - `database-schema.md`: Bảng ERD, chi tiết các bảng `users`, `nodes` (file/folder), `document_chunks` (vector).
  - `database-schema.sql`: Mã nguồn định nghĩa bảng.
- **`apis/`** - Cổng giao tiếp:
  - `endpoints.md`: Đặc tả chi tiết các RESTful API endpoints, Request/Response payload.
- **`features/`** - Phân tích chi tiết UI/UX và Logic:
  - Các file từ `1-login-screen.md` đến `8-trash-screen.md` định nghĩa từng màn hình và tính năng cụ thể.

---

## 4. Bắt đầu nhanh (Quick Start)

Dự án sử dụng .NET Aspire (Node.js AppHost) để khởi động toàn bộ môi trường (cả DB Container, Backend và Frontend).

**Yêu cầu hệ thống:** `Node.js >= 20.19`, `Python >= 3.12`, `uv`, và `Docker Desktop` (đang chạy).

**Khởi chạy hệ thống:**
1. Mở terminal ở gốc dự án.
2. Cài đặt các gói cho AppHost: `cd aspire-app && npm install`
3. Chạy lệnh khởi động: `npm run dev` (hoặc chạy file `run-aspire-app.bat`).
4. Truy cập **Aspire Dashboard** tại link được in ra trên Terminal để theo dõi logs và truy cập vào giao diện Web Frontend, Swagger Backend, pgAdmin.

> Để xem chi tiết hơn về cách cài đặt từng dịch vụ riêng biệt, vui lòng xem [Hướng dẫn Cài đặt](setup/setup-guide.md).
