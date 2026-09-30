# Hướng dẫn Cài đặt & Kiến trúc Dự án (Setup Guide & Architecture)

Tài liệu này mô tả chi tiết về stack công nghệ, kiến trúc tổng quan và hướng dẫn cài đặt dự án `DocumentSemanticSearch`. Toàn bộ dự án được điều phối tập trung thông qua **Aspire TypeScript AppHost** (`aspire-app`).

---

## 1. Tổng quan Kiến trúc (Architecture Overview)

Dự án sử dụng mô hình Client-Server kết hợp với cơ sở dữ liệu hỗ trợ Vector Search, được đóng gói và điều phối bởi công cụ **.NET Aspire (Node.js AppHost)**.

Các thành phần chính (Services):

1. **Database (`db`)**: 
   - Chạy qua Docker container sử dụng image `pgvector/pgvector:pg17`.
   - Lưu trữ dữ liệu cấu trúc và dữ liệu vector embeddings cho tính năng Semantic Search.
   - Volume: `doc-pg-data`.
2. **pgAdmin (`pgadmin`)**:
   - Giao diện quản lý CSDL trực quan trên nền web.
   - Chạy trên Docker container với cổng `5050`.
3. **Backend (`backend`)**:
   - Tọa lạc tại: `apps/backend`
   - Đảm nhận xử lý logic, API Server kết nối trực tiếp đến Postgres database.
   - Tự động nhận biến môi trường `DATABASE_URL` từ Aspire AppHost.
4. **Frontend (`frontend`)**:
   - Tọa lạc tại: `apps/frontend`
   - Giao diện người dùng (SPA) kết nối tới Backend API.
   - Tự động nhận biến môi trường `VITE_API_BASE_URL` (trỏ tới Backend) từ Aspire AppHost.

---

## 2. Công nghệ sử dụng (Tech Stack)

### Orchestration & Tooling (`aspire-app`)
- **Runtime**: Node.js (>= 20.19.0)
- **AppHost**: Aspire TypeScript AppHost
- **Containerization**: Docker & Docker Compose (cho CSDL)

### Backend (`apps/backend`)
- **Ngôn ngữ**: Python 3.12+
- **Package Manager**: `uv`
- **Framework**: FastAPI (với Uvicorn)
- **Database & ORM**: 
  - SQLAlchemy (async) cùng `asyncpg`
  - Alembic (Migration)
  - `pgvector` (Vector extension cho Postgres)
- **Xác thực (Auth)**: `pyjwt`, `pwdlib[argon2]`
- **Dev Tools**: Ruff (Linter & Formatter), Pyright (Type Checker), Hatchling (Build system).

### Frontend (`apps/frontend`)
- **Ngôn ngữ**: TypeScript
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4, `shadcn/ui`, Base UI
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Data Fetching / Network**: Axios
- **Form & Validation**: React Hook Form, Zod
- **Icons & Components**: Lucide React, Radix UI (thông qua shadcn), v.v.

---

## 3. Hướng dẫn Cài đặt (Setup Instructions)

### 3.1 Yêu cầu hệ thống (Prerequisites)
Để chạy được toàn bộ dự án, bạn cần cài đặt:
- **Node.js** (>= 20.19.0, >= 22.13.0, hoặc >= 24)
- **Python** (>= 3.12)
- Công cụ **uv** (Python package manager): Dùng để cài đặt dependencies cho backend.
- **Docker Desktop** / **Docker Engine**: Phải đang chạy ngầm để Aspire có thể khởi tạo các database containers.

### 3.2 Khởi chạy toàn bộ hệ thống (Được khuyến nghị)
Sử dụng Aspire là cách đơn giản và đồng bộ nhất. Aspire sẽ tự động start Docker container (DB + pgAdmin) và cấp phát các biến môi trường cần thiết cho Frontend/Backend để chúng kết nối với nhau.

1. **Khởi động Docker**: Đảm bảo Docker đang chạy.
2. Mở terminal tại thư mục gốc của dự án.
3. Chuyển vào thư mục AppHost:
   ```bash
   cd aspire-app
   ```
4. Cài đặt dependencies cho AppHost (nếu chạy lần đầu):
   ```bash
   npm install
   ```
5. Chạy dự án:
   ```bash
   npm run dev
   ```
   *(Mẹo: Bạn có thể chạy file `run-aspire-app.bat` ở thư mục gốc nếu dùng Windows, hoặc chạy lệnh trên nếu trên Linux/macOS).*

Khi chạy thành công, Aspire CLI sẽ cung cấp cho bạn một đường link truy cập vào **Aspire Dashboard**. Từ bảng điều khiển này, bạn có thể theo dõi Logs, Môi trường và Mở nhanh các ứng dụng Frontend, Backend, và pgAdmin.

### 3.3 Khởi chạy thủ công từng phần (Nếu không dùng Aspire)

Trong trường hợp bạn cần chạy hoặc debug độc lập từng service:

#### Chạy Backend (Python/FastAPI)
1. Mở terminal mới:
   ```bash
   cd apps/backend
   ```
2. Cài đặt các gói bằng `uv`:
   ```bash
   uv sync
   ```
3. Khởi động server (sử dụng thư mục gốc):
   ```bash
   uv run fastapi dev src/app/main.py --port 8484
   ```
   *Lưu ý: Bạn sẽ cần thiết lập file `.env` chứa `DATABASE_URL` thủ công vì không có Aspire tự động gán biến.*

#### Chạy Frontend (React/Vite)
1. Mở terminal mới:
   ```bash
   cd apps/frontend
   ```
2. Cài đặt dependencies:
   ```bash
   npm install
   ```
3. Khởi động dev server:
   ```bash
   npm run dev
   ```
   *Lưu ý: Mặc định frontend sẽ chạy trên `localhost:5115`. Bạn cần thiết lập file `.env` chứa `VITE_API_BASE_URL` để gọi đúng sang port của backend.*
