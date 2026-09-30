# Hướng dẫn Setup Backend — Document Semantic Search

> **Phiên bản:** 0.1.0
> **Cập nhật:** 29/09/2026
> **Đường dẫn source:** `apps/backend/`

---

## Mục lục

1. [Tổng quan Tech Stack](#1-tổng-quan-tech-stack)
2. [Kiến trúc hệ thống (Architecture)](#2-kiến-trúc-hệ-thống-architecture)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Yêu cầu hệ thống](#4-yêu-cầu-hệ-thống)
5. [Hướng dẫn cài đặt từng bước](#5-hướng-dẫn-cài-đặt-từng-bước)
6. [Cấu hình biến môi trường](#6-cấu-hình-biến-môi-trường)
7. [Database & Migration](#7-database--migration)
8. [Chạy ứng dụng](#8-chạy-ứng-dụng)
9. [Các lệnh phát triển](#9-các-lệnh-phát-triển)
10. [Chi tiết từng module](#10-chi-tiết-từng-module)
11. [Xử lý lỗi thường gặp](#11-xử-lý-lỗi-thường-gặp)

---

## 1. Tổng quan Tech Stack

### 1.1 Ngôn ngữ & Runtime

| Thành phần | Phiên bản | Mô tả |
|---|---|---|
| **Python** | ≥ 3.12 | Ngôn ngữ chính, tận dụng cú pháp type hint hiện đại |
| **uv** | latest | Trình quản lý package & virtual environment cực nhanh (thay thế pip + venv) |

### 1.2 Framework & Thư viện chính

| Thư viện | Phiên bản | Vai trò |
|---|---|---|
| **FastAPI** | ≥ 0.115 | Web framework bất đồng bộ (async), tự động sinh OpenAPI docs |
| **Uvicorn** | ≥ 0.30 | ASGI server chạy ứng dụng FastAPI (hỗ trợ HTTP/1.1, WebSocket) |
| **Pydantic** | ≥ 2.0 | Xác thực (validation) dữ liệu đầu vào/đầu ra bằng type hint |
| **pydantic-settings** | ≥ 2.0 | Đọc cấu hình từ biến môi trường / file `.env` |

### 1.3 Database

| Thư viện | Phiên bản | Vai trò |
|---|---|---|
| **SQLAlchemy** | ≥ 2.0 (async) | ORM bất đồng bộ, sử dụng `DeclarativeBase` mới |
| **asyncpg** | ≥ 0.30 | Driver PostgreSQL async hiệu suất cao (viết bằng C) |
| **Alembic** | ≥ 1.14 | Quản lý database migration (hỗ trợ async) |
| **PostgreSQL** | ≥ 15 | Cơ sở dữ liệu quan hệ chính |

### 1.4 Bảo mật & Xác thực

| Thư viện | Phiên bản | Vai trò |
|---|---|---|
| **PyJWT** | ≥ 2.9 | Tạo và xác thực JSON Web Token (JWT) |
| **pwdlib** | ≥ 0.2 (Argon2) | Băm mật khẩu bằng thuật toán Argon2id (khuyến nghị OWASP) |

### 1.5 Công cụ khác

| Thư viện | Vai trò |
|---|---|
| **httpx** | HTTP client bất đồng bộ (gọi API bên ngoài/nội bộ) |
| **Ruff** | Linting + Format code (thay thế flake8, black, isort) |
| **Pyright** | Kiểm tra kiểu tĩnh (static type checking) |
| **Hatchling** | Build backend cho Python package |

---

## 2. Kiến trúc hệ thống (Architecture)

### 2.1 Tổng quan kiến trúc

Hệ thống backend được xây dựng theo mô hình **Layered Architecture** (kiến trúc phân tầng), kết hợp các design pattern phổ biến:

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (React)                    │
│              Gọi API qua HTTP/JSON                  │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              FASTAPI APPLICATION                    │
│          (app/main.py → create_app())               │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │          API Layer (Routers)                   │  │
│  │   app/api/v1/router.py                        │  │
│  │   • Nhận request, validate input (Pydantic)   │  │
│  │   • Gọi xuống Service Layer                   │  │
│  │   • Trả response JSON                        │  │
│  └───────────────────┬───────────────────────────┘  │
│                      │                              │
│  ┌───────────────────▼───────────────────────────┐  │
│  │        Dependency Injection (DI)              │  │
│  │   app/api/deps.py                             │  │
│  │   • DbSession (inject async DB session)       │  │
│  │   • Các dependency dùng chung                 │  │
│  └───────────────────┬───────────────────────────┘  │
│                      │                              │
│  ┌───────────────────▼───────────────────────────┐  │
│  │         Service Layer (Business Logic)        │  │
│  │   app/services/                               │  │
│  │   • Chứa logic nghiệp vụ                     │  │
│  │   • Không phụ thuộc vào framework             │  │
│  └───────────────────┬───────────────────────────┘  │
│                      │                              │
│  ┌───────────────────▼───────────────────────────┐  │
│  │          Data Layer (ORM + DB)                │  │
│  │   app/models/     → SQLAlchemy ORM models     │  │
│  │   app/schemas/    → Pydantic schemas (DTO)    │  │
│  │   app/database.py → Engine & Session factory  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │        Cross-cutting Concerns                 │  │
│  │   app/config.py   → Cấu hình tập trung       │  │
│  │   app/security.py → JWT + Password hashing    │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              │   (asyncpg)     │
              └─────────────────┘
```

### 2.2 Các Design Pattern được áp dụng

| Pattern | Nơi áp dụng | Giải thích |
|---|---|---|
| **Factory Pattern** | `main.py → create_app()` | Tạo instance FastAPI qua hàm factory, dễ test và tái cấu hình |
| **Dependency Injection** | `api/deps.py → DbSession` | FastAPI tự động inject database session vào route handler |
| **Repository / Unit of Work** | `database.py → get_db()` | Session tự động commit khi thành công, rollback khi lỗi |
| **Async Lifespan** | `main.py → lifespan()` | Quản lý vòng đời startup/shutdown (giải phóng connection pool) |
| **Settings Pattern** | `config.py → Settings` | Tập trung cấu hình, đọc từ env vars, validate bằng Pydantic |

### 2.3 Luồng xử lý một request

```
Request HTTP → Uvicorn → FastAPI Router → Dependency Injection
    → Route Handler → Service (logic) → SQLAlchemy (DB query)
    → Pydantic Schema (serialize) → Response JSON
```

### 2.4 API Versioning

API được tổ chức theo version:
- Prefix: `/api/v1/...`
- Khi cần thay đổi breaking change, tạo thêm `/api/v2/` mà không ảnh hưởng client cũ

---

## 3. Cấu trúc thư mục

```
apps/backend/
├── .env.example          # Mẫu biến môi trường
├── .venv/                # Virtual environment (uv tạo tự động)
├── pyproject.toml        # Cấu hình project, dependencies, tools
├── uv.lock               # Lock file đảm bảo version nhất quán
├── alembic.ini           # Cấu hình Alembic (migration tool)
│
├── alembic/              # Database migrations
│   ├── env.py            #   Môi trường chạy migration (async)
│   ├── script.py.mako    #   Template tạo file migration mới
│   └── versions/         #   Chứa các file migration
│       └── .gitkeep
│
└── src/
    └── app/              # Package chính của ứng dụng
        ├── __init__.py
        ├── main.py       #   Entry point — Factory tạo FastAPI app
        ├── config.py     #   Cấu hình tập trung (đọc từ .env)
        ├── database.py   #   Async engine + session factory
        ├── security.py   #   JWT token + Argon2 password hash
        │
        ├── api/          #   Tầng API (nhận/trả HTTP request)
        │   ├── __init__.py
        │   ├── deps.py   #     Dependency injection dùng chung
        │   └── v1/       #     API version 1
        │       ├── __init__.py
        │       └── router.py  # Tổng hợp endpoints v1
        │
        ├── models/       #   Tầng ORM (SQLAlchemy models)
        │   ├── __init__.py    # Import tất cả models cho Alembic
        │   └── base.py        # Base class + TimestampMixin
        │
        ├── schemas/      #   Tầng DTO (Pydantic schemas)
        │   └── __init__.py
        │
        └── services/     #   Tầng Business Logic
            └── __init__.py
```

> **Quy ước đặt tên:**
> - `models/` → Các class ORM mapping với bảng database
> - `schemas/` → Các class Pydantic dùng validate request/response
> - `services/` → Logic nghiệp vụ, không phụ thuộc FastAPI
> - `api/` → Route handlers, chỉ gọi service + trả response

---

## 4. Yêu cầu hệ thống & Cài đặt phần mềm

> **Hệ điều hành tham chiếu:** Ubuntu 24.04 LTS (Noble Numbat) — x86_64.
> Các lệnh bên dưới dùng `apt`. Nếu bạn dùng Fedora/RHEL thì thay bằng `dnf`, macOS thay bằng `brew`.

### 4.1 Tổng quan phần mềm cần cài

| Phần mềm | Phiên bản tối thiểu | Bắt buộc? | Cách kiểm tra |
|---|---|---|---|
| **Git** | 2.x | ✅ Có | `git --version` |
| **Python** | 3.12 | ✅ Có | `python3 --version` |
| **uv** | latest | ✅ Có | `uv --version` |
| **PostgreSQL** | 15 | ✅ Có | `psql --version` |
| **Docker** | 20+ | ⬜ Tùy chọn | `docker --version` |

---

### 4.2 Cài đặt Git

```bash
# Cập nhật danh sách package
sudo apt update

# Cài Git
sudo apt install -y git

# Xác nhận
git --version
# → git version 2.43.0
```

---

### 4.3 Cài đặt Python 3.12+

Ubuntu 24.04 đã đi kèm Python 3.12. Kiểm tra trước:

```bash
python3 --version
# → Python 3.12.3
```

**Nếu chưa có hoặc cần phiên bản cao hơn:**

```bash
# Thêm PPA deadsnakes (chứa nhiều phiên bản Python)
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update

# Cài Python 3.12 (hoặc 3.13)
sudo apt install -y python3.12 python3.12-venv python3.12-dev

# Xác nhận
python3.12 --version
```

**Cài thêm các gói hỗ trợ build (cần cho một số dependency native):**

```bash
sudo apt install -y build-essential libpq-dev libffi-dev libssl-dev
```

| Gói | Lý do cần |
|---|---|
| `build-essential` | Compiler C/C++ để build các package có extension native |
| `libpq-dev` | Header PostgreSQL — cần cho `asyncpg` (driver PostgreSQL) |
| `libffi-dev` | Foreign Function Interface — cần cho `cffi`, `argon2-cffi` |
| `libssl-dev` | OpenSSL headers — cần cho `cryptography`, `httpx` |

---

### 4.4 Cài đặt uv (Python Package Manager)

`uv` là trình quản lý package Python cực nhanh (viết bằng Rust), thay thế `pip` + `venv` + `pip-tools`.

```bash
# Cách 1 (Khuyến nghị): Script cài đặt chính thức
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Sau khi cài, thêm `uv` vào PATH (script sẽ hướng dẫn, thường là thêm vào `~/.bashrc`):

```bash
# Thêm vào ~/.bashrc (nếu chưa tự thêm)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Xác nhận
uv --version
# → uv 0.7.x
```

**Các cách cài thay thế:**

```bash
# Cách 2: Dùng pip
pip install uv

# Cách 3: Dùng pipx (cách ly khỏi system Python)
pipx install uv

# Cách 4: Dùng Homebrew (macOS / Linux)
brew install uv
```

---

### 4.5 Cài đặt PostgreSQL

#### Cách A: Cài trực tiếp trên máy (Native)

```bash
# 1. Cài PostgreSQL server + client
sudo apt install -y postgresql postgresql-contrib

# 2. Kiểm tra service đang chạy
sudo systemctl status postgresql
# → Active: active (exited)

# 3. Nếu chưa chạy, bật lên
sudo systemctl start postgresql
sudo systemctl enable postgresql    # Tự khởi động cùng hệ thống

# 4. Xác nhận phiên bản
psql --version
# → psql (PostgreSQL) 16.x
```

**Tạo database và user cho dự án:**

```bash
# Đăng nhập vào PostgreSQL shell bằng user mặc định "postgres"
sudo -u postgres psql
```

Trong PostgreSQL shell, chạy các lệnh sau:

```sql
-- Tạo database cho ứng dụng
CREATE DATABASE app;

-- Đặt mật khẩu cho user postgres (hoặc tạo user mới)
ALTER USER postgres WITH PASSWORD 'postgres';

-- Cấp toàn quyền trên database "app" cho user "postgres"
GRANT ALL PRIVILEGES ON DATABASE app TO postgres;

-- Thoát
\q
```

**Cấu hình cho phép đăng nhập bằng password (nếu cần):**

```bash
# Mở file cấu hình xác thực
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Tìm dòng:
```
local   all   all   peer
```

Đổi `peer` thành `md5` (hoặc `scram-sha-256`):
```
local   all   all   md5
```

Khởi động lại PostgreSQL:
```bash
sudo systemctl restart postgresql
```

**Kiểm tra kết nối:**

```bash
# Đăng nhập thử với password
psql -U postgres -d app -h localhost -W
# Nhập password: postgres
# Nếu vào được shell "app=#" là thành công

# Thoát
\q
```

#### Cách B: Dùng Docker (Khuyến nghị cho môi trường dev)

```bash
# 1. Chạy PostgreSQL container
docker run -d \
  --name postgres-dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app \
  -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

# 2. Kiểm tra container đang chạy
docker ps
# → CONTAINER ID   IMAGE              STATUS    PORTS                    NAMES
# → abc123         postgres:16-alpine Up 5s     0.0.0.0:5432->5432/tcp   postgres-dev

# 3. Kiểm tra kết nối
docker exec -it postgres-dev psql -U postgres -d app -c "SELECT 1;"
# → 1

# 4. Xem logs (nếu cần debug)
docker logs postgres-dev
```

**Các lệnh quản lý Docker container:**

```bash
# Dừng container
docker stop postgres-dev

# Khởi động lại container
docker start postgres-dev

# Xóa container (dữ liệu vẫn giữ trong volume pgdata)
docker rm postgres-dev

# Xóa cả volume (MẤT DỮ LIỆU)
docker volume rm pgdata
```

#### Cách C: Dùng Docker Compose

Tạo file `docker-compose.yml` ở thư mục gốc project (nếu chưa có):

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: postgres-dev
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

```bash
# Khởi chạy
docker compose up -d

# Xem trạng thái
docker compose ps

# Dừng
docker compose down

# Dừng + xóa dữ liệu
docker compose down -v
```

---

### 4.6 Kiểm tra tất cả đã cài đặt thành công

Chạy lệnh sau để kiểm tra nhanh toàn bộ:

```bash
echo "=== Kiểm tra môi trường ==="
echo ""
echo "Git:        $(git --version 2>/dev/null || echo '❌ CHƯA CÀI')"
echo "Python:     $(python3 --version 2>/dev/null || echo '❌ CHƯA CÀI')"
echo "uv:         $(uv --version 2>/dev/null || echo '❌ CHƯA CÀI')"
echo "PostgreSQL: $(psql --version 2>/dev/null || echo '❌ CHƯA CÀI (hoặc dùng Docker)')"
echo "Docker:     $(docker --version 2>/dev/null || echo '⬜ Không bắt buộc')"
echo ""
echo "=== Kết thúc ==="
```

**Kết quả mong đợi:**

```
=== Kiểm tra môi trường ===

Git:        git version 2.43.0
Python:     Python 3.12.3
uv:         uv 0.7.x
PostgreSQL: psql (PostgreSQL) 16.x
Docker:     Docker version 29.x (hoặc "Không bắt buộc")

=== Kết thúc ===
```

---

## 5. Hướng dẫn cài đặt từng bước

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd DocumentSemanticSearch
```

### Bước 2: Di chuyển vào thư mục backend

```bash
cd apps/backend
```

### Bước 3: Tạo virtual environment và cài dependencies

```bash
# uv sẽ tự tạo .venv và cài tất cả dependencies từ pyproject.toml
uv sync
```

> **Giải thích:** Lệnh `uv sync` sẽ:
> 1. Tạo thư mục `.venv/` (nếu chưa có)
> 2. Cài Python 3.12+ vào `.venv/`
> 3. Cài tất cả dependencies (bao gồm cả dev dependencies)
> 4. Đảm bảo version khớp với `uv.lock`

### Bước 4: Tạo file cấu hình môi trường

```bash
cp .env.example .env
```

Sau đó mở file `.env` và chỉnh sửa theo môi trường của bạn (xem [mục 6](#6-cấu-hình-biến-môi-trường)).

### Bước 5: Tạo database PostgreSQL

```bash
# Đăng nhập vào PostgreSQL
sudo -u postgres psql

# Tạo database và user (trong psql shell)
CREATE DATABASE app;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE app TO postgres;

# Thoát
\q
```

### Bước 6: Chạy database migration

```bash
# Tạo migration đầu tiên (nếu đã có models)
uv run alembic revision --autogenerate -m "initial"

# Áp dụng migration vào database
uv run alembic upgrade head
```

### Bước 7: Khởi chạy server

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8484
```

### Bước 8: Kiểm tra

Mở trình duyệt và truy cập:

| URL | Mô tả |
|---|---|
| `http://localhost:8484/api/v1/health` | Health check — phải trả về `{"status": "ok"}` |
| `http://localhost:8484/docs` | Swagger UI — tài liệu API tương tác |
| `http://localhost:8484/redoc` | ReDoc — tài liệu API dạng đọc |

---

## 6. Cấu hình biến môi trường

Tất cả cấu hình được quản lý qua file `.env` tại `apps/backend/.env`:

```env
# ────────── Database ──────────
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/app

# ────────── JWT ──────────
JWT_SECRET_KEY=change-me-in-production    # ⚠ BẮT BUỘC đổi ở production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# ────────── App ──────────
APP_ENV=development                       # development | staging | production
APP_DEBUG=true                            # true: bật SQL echo log
```

### Giải thích chi tiết từng biến

| Biến | Mặc định | Mô tả |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://...` | Connection string đến PostgreSQL. Format: `postgresql+asyncpg://<user>:<password>@<host>:<port>/<dbname>` |
| `JWT_SECRET_KEY` | `change-me-in-production` | Khóa bí mật để ký JWT token. **Phải thay đổi** ở môi trường production |
| `JWT_ALGORITHM` | `HS256` | Thuật toán mã hóa JWT |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Thời gian hết hạn của access token (phút) |
| `APP_ENV` | `development` | Môi trường chạy. Khi = `development`: bật SQL echo log |
| `APP_DEBUG` | `false` | Bật/tắt chế độ debug |

> [!CAUTION]
> **Không bao giờ commit file `.env` lên Git!** File này chứa thông tin nhạy cảm (mật khẩu DB, JWT secret). Chỉ commit `.env.example` làm mẫu.

---

## 7. Database & Migration

### 7.1 Cách Alembic hoạt động

Alembic quản lý schema database thông qua các file migration (giống Git cho database):

```
alembic/
├── env.py            # Đọc config từ app.config.settings, chạy migration async
├── script.py.mako    # Template tạo file migration
└── versions/         # Các file migration được sinh ra
    ├── 001_initial.py
    ├── 002_add_users.py
    └── ...
```

### 7.2 Các lệnh migration thường dùng

```bash
# Tạo migration mới từ thay đổi ORM models (autogenerate)
uv run alembic revision --autogenerate -m "mô tả thay đổi"

# Áp dụng TẤT CẢ migration chưa chạy
uv run alembic upgrade head

# Xem migration hiện tại
uv run alembic current

# Xem lịch sử migration
uv run alembic history

# Rollback 1 migration
uv run alembic downgrade -1

# Rollback về trạng thái ban đầu
uv run alembic downgrade base
```

### 7.3 Quy trình khi thêm model mới

1. Tạo file model trong `src/app/models/` (kế thừa `Base`)
2. Import model vào `src/app/models/__init__.py` (để Alembic phát hiện)
3. Chạy `uv run alembic revision --autogenerate -m "add xxx table"`
4. Kiểm tra file migration sinh ra trong `alembic/versions/`
5. Chạy `uv run alembic upgrade head` để áp dụng

### 7.4 Database Session & Transaction

Hệ thống sử dụng pattern **Unit of Work** cho database session:

```python
# Trong route handler, inject DbSession:
from app.api.deps import DbSession

@router.post("/items")
async def create_item(db: DbSession):
    # db là AsyncSession, tự động:
    #   - commit() khi handler kết thúc thành công
    #   - rollback() khi có exception
    ...
```

---

## 8. Chạy ứng dụng

### 8.1 Chế độ Development (có hot reload)

```bash
cd apps/backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8484
```

| Flag | Ý nghĩa |
|---|---|
| `--reload` | Tự động restart khi code thay đổi |
| `--host 0.0.0.0` | Cho phép truy cập từ máy khác trong mạng LAN |
| `--port 8484` | Cổng lắng nghe (mặc định 8484) |

### 8.2 Chế độ Production

```bash
uv run uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8484 \
    --workers 4 \
    --no-access-log
```

| Flag | Ý nghĩa |
|---|---|
| `--workers 4` | Chạy 4 worker processes (nên = số CPU cores) |
| `--no-access-log` | Tắt log mỗi request để tăng hiệu suất |

---

## 9. Các lệnh phát triển

### 9.1 Quản lý dependencies

```bash
# Cài tất cả dependencies (bao gồm dev)
uv sync

# Thêm dependency mới
uv add <package-name>

# Thêm dev dependency
uv add --group dev <package-name>

# Xóa dependency
uv remove <package-name>
```

### 9.2 Kiểm tra chất lượng code

```bash
# Lint — tìm lỗi code style
uv run ruff check src/

# Lint — tự động sửa lỗi
uv run ruff check src/ --fix

# Format code
uv run ruff format src/

# Type checking
uv run pyright
```

### 9.3 Cấu hình Ruff (đã thiết lập sẵn)

Ruff được cấu hình trong `pyproject.toml` với các rule:

| Rule Group | Mô tả |
|---|---|
| `E`, `W` | pycodestyle (PEP8 errors & warnings) |
| `F` | pyflakes (lỗi logic) |
| `I` | isort (sắp xếp import) |
| `N` | PEP8 naming conventions |
| `UP` | pyupgrade (nâng cấp syntax Python cũ) |
| `B` | flake8-bugbear (phát hiện bug tiềm ẩn) |
| `S` | flake8-bandit (bảo mật) |
| `T20` | flake8-print (cảnh báo dùng `print()`) |
| `SIM` | flake8-simplify (đơn giản hóa code) |
| `RUF` | Ruff-specific rules |

---

## 10. Chi tiết từng module

### 10.1 `main.py` — Entry Point

- Sử dụng **Factory Pattern** (`create_app()`) để tạo instance FastAPI
- **Lifespan** context manager quản lý vòng đời: giải phóng database connection pool khi shutdown
- Mount router v1 tại prefix `/api/v1`

### 10.2 `config.py` — Cấu hình tập trung

- Dùng `pydantic-settings` để đọc biến môi trường
- Tự động load file `.env` (nếu có)
- Property `is_development` → bật SQL echo log khi đang phát triển
- Singleton pattern: `settings = Settings()` — import ở bất kỳ đâu đều dùng chung 1 instance

### 10.3 `database.py` — Database Layer

- **Async Engine** (`create_async_engine`) — kết nối PostgreSQL qua `asyncpg`
- `pool_pre_ping=True` — tự động kiểm tra connection còn sống trước khi dùng
- **Session Factory** (`async_sessionmaker`) — tạo `AsyncSession` cho mỗi request
- `get_db()` — FastAPI dependency, tự động commit/rollback

### 10.4 `security.py` — Bảo mật

- **Password Hashing:** Argon2id (khuyến nghị OWASP 2023), qua thư viện `pwdlib`
  - `hash_password(password)` → trả về hash string
  - `verify_password(plain, hashed)` → `True/False`
- **JWT Token:**
  - `create_access_token(data, expires_delta)` → tạo JWT có hạn
  - `decode_access_token(token)` → giải mã và xác thực JWT

### 10.5 `api/deps.py` — Dependency Injection

- `DbSession` — Type alias tiêm `AsyncSession` vào route handler
- Tập trung các dependency dùng chung để tránh import rải rác

### 10.6 `models/base.py` — ORM Base

- `Base` — DeclarativeBase cho tất cả ORM model kế thừa
- `TimestampMixin` — Mixin thêm `created_at`, `updated_at` tự động

### 10.7 `api/v1/router.py` — API Endpoints

- Hiện tại có endpoint health check: `GET /api/v1/health` → `{"status": "ok"}`
- Các endpoint mới sẽ được thêm vào đây hoặc tách file riêng rồi include

---

## 11. Xử lý lỗi thường gặp

### Lỗi 1: Không kết nối được PostgreSQL

```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Nguyên nhân:** PostgreSQL chưa chạy hoặc sai thông tin kết nối.

**Cách sửa:**
```bash
# Kiểm tra PostgreSQL đang chạy
sudo systemctl status postgresql

# Kiểm tra database tồn tại
sudo -u postgres psql -l

# Kiểm tra lại DATABASE_URL trong .env
```

### Lỗi 2: Module not found khi chạy Alembic

```
ModuleNotFoundError: No module named 'app'
```

**Nguyên nhân:** Chưa kích hoạt virtual environment hoặc chạy sai thư mục.

**Cách sửa:**
```bash
# Đảm bảo đang ở thư mục apps/backend/
cd apps/backend

# Dùng uv run để tự kích hoạt .venv
uv run alembic upgrade head
```

### Lỗi 3: Port 8484 đã bị chiếm

```
ERROR: [Errno 98] Address already in use
```

**Cách sửa:**
```bash
# Tìm process đang dùng port 8484
lsof -i :8484

# Kill process đó
kill -9 <PID>

# Hoặc đổi port
uv run uvicorn app.main:app --reload --port 8001
```

### Lỗi 4: Alembic migration conflict

```
alembic.util.exc.CommandError: Target database is not up to date
```

**Cách sửa:**
```bash
# Xem trạng thái migration hiện tại
uv run alembic current

# Stamp database ở revision hiện tại (nếu schema đã đúng)
uv run alembic stamp head

# Hoặc upgrade lần lượt
uv run alembic upgrade head
```

---

## Tóm tắt Quick Start

```bash
# 1. Vào thư mục backend
cd apps/backend

# 2. Cài dependencies
uv sync

# 3. Cấu hình môi trường
cp .env.example .env
# (chỉnh sửa .env nếu cần)

# 4. Tạo database PostgreSQL
sudo -u postgres createdb app

# 5. Chạy migration
uv run alembic upgrade head

# 6. Khởi động server
uv run uvicorn app.main:app --reload

# 7. Mở trình duyệt → http://localhost:8484/docs
```
