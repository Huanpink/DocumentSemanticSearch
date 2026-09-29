# Document Semantic Search (Internal PDF Search Engine)

![Status](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Architecture](https://img.shields.io/badge/Architecture-Local%20First-orange)

Phần mềm tìm kiếm tài liệu PDF thông minh (AI Semantic Search) dành cho doanh nghiệp. Hệ thống cho phép tìm kiếm ngữ nghĩa nội dung trong các tệp PDF lớn bằng ngôn ngữ tự nhiên (Tiếng Việt) với độ chính xác cao. Đặc biệt, ứng dụng hoạt động 100% offline (Local), đảm bảo bảo mật tuyệt đối cho dữ liệu doanh nghiệp.

## 🌟 Tính năng nổi bật

- **Semantic Search (Tìm kiếm ngữ nghĩa):** Tìm kiếm nội dung dựa trên ý nghĩa của câu thay vì từ khóa chính xác (Keyword).
- **Trải nghiệm UX/UI tối ưu:** Hiển thị kết quả tìm kiếm gồm Tên file, Số trang và Đoạn trích dẫn. Đặc biệt tích hợp PDF Viewer mở trực tiếp file và tự động scroll/highlight đến đúng vị trí có đoạn văn bản.
- **Hoạt động 100% Offline (Local):** Không gửi dữ liệu ra ngoài Internet, đảm bảo an toàn thông tin 100%. Toàn bộ mô hình AI và Vector Database chạy trên máy chủ nội bộ.
- **Quản lý thư mục & Tài liệu:** Tải lên hàng loạt PDF, tạo thư mục lưu trữ khoa học. Xử lý indexing và chunking PDF hoàn toàn tự động.

## 🛠️ Công nghệ sử dụng (Tech Stack)

Dự án được xây dựng dựa trên kiến trúc hiện đại, phân tách rõ ràng giữa Frontend và Backend.

### Frontend
- **Framework:** React 18, Vite, TypeScript
- **UI Components:** Tailwind CSS, Radix UI (shadcn/ui)
- **State/API:** React Query, Axios
- **PDF Viewer:** Tích hợp trình xem PDF tùy chỉnh.

### Backend
- **Framework:** FastAPI, Python 3.10+
- **AI/ML:** LangChain, Sentence-Transformers (`keepitreal/vietnamese-sbert` hoặc tương tự)
- **Vector Database:** ChromaDB (Lưu trữ vector nhúng)
- **PDF Parsing:** pdfplumber / PyMuPDF
- **Database (Metadata):** SQLite (Qua SQLAlchemy / Alembic)

### Orchestration
- **.NET Aspire:** Sử dụng để quản lý, cấu hình và khởi chạy các dịch vụ (Frontend, Backend) đồng bộ trong quá trình phát triển (Local Development).

## 📁 Cấu trúc thư mục dự án

```text
DocumentSemanticSearch/
├── apps/
│   ├── backend/          # Chứa source code FastAPI (Python), AI, Database
│   └── frontend/         # Chứa source code ReactJS (TypeScript, Vite)
├── aspire-app/           # Chứa dự án .NET Aspire đóng vai trò AppHost quản lý chạy các dịch vụ
├── .docs/                # Tài liệu hướng dẫn cài đặt chi tiết
├── PRD.md                # Tài liệu Yêu cầu Sản phẩm (Product Requirements Document)
└── README.md             # File tổng quan dự án (File bạn đang đọc)
```

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

Dự án có thể được chạy theo 2 cách: Chạy thông qua .NET Aspire (Khuyến nghị) hoặc Chạy thủ công từng dịch vụ.

### Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/en) (v18+)
- [Python](https://www.python.org/downloads/) (v3.10+)
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download) (Nếu sử dụng Aspire)
- Khuyến nghị máy tính có RAM >= 8GB.

### Cách 1: Chạy bằng .NET Aspire (Khuyến nghị)
.NET Aspire đóng vai trò là "nhạc trưởng" tự động khởi chạy cả Frontend và Backend, gộp chung logs và hiển thị trên một Dashboard chuyên nghiệp.

1. Chạy file batch:
   ```bash
   ./run-aspire-app.bat
   ```
   *(Hoặc truy cập thư mục `aspire-app` và chạy lệnh `dotnet run`)*
2. Hệ thống sẽ cấp một đường dẫn (link) tới **Aspire Dashboard** trên terminal. Truy cập link đó để xem trạng thái của các dịch vụ, log, và truy cập Frontend/Backend trực tiếp từ dashboard.

### Cách 2: Chạy thủ công Frontend & Backend độc lập

**1. Khởi chạy Backend:**
```bash
cd apps/backend
python -m venv .venv
# Kích hoạt venv (Windows: .venv\Scripts\activate, Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt
cp .env.example .env # (Cấu hình lại nếu cần)
uvicorn src.app.main:app --reload --port 8000
```
Backend sẽ chạy tại: `http://localhost:8000` (Swagger UI: `http://localhost:8000/docs`)

**2. Khởi chạy Frontend:**
```bash
cd apps/frontend
npm install
cp .env.example .env # (Cấu hình lại nếu cần)
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173`

> 📖 **Xem thêm hướng dẫn chi tiết:** Vui lòng tham khảo các file hướng dẫn chi tiết trong thư mục `.docs/setup/`.

## 📜 Quy định đóng góp (Contributing)

- **Branching Model:** Tạo nhánh mới từ `main` với tiền tố tính năng (VD: `feature/upload-pdf`, `bugfix/fix-ui-crash`).
- **Commit Message:** Ghi rõ ràng, ngắn gọn và sử dụng chuẩn Conventional Commits nếu có thể.

## 📄 Bản quyền (License)

Dự án nội bộ của doanh nghiệp. Mọi hành vi sao chép, phân phối mã nguồn ra bên ngoài đều không được phép trừ khi có sự đồng ý của Ban Quản trị.
