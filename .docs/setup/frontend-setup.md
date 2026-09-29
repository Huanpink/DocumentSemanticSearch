# 📘 Hướng Dẫn Setup Frontend — Document Semantic Search

> **Phiên bản:** MVP 1.0  
> **Đường dẫn source:** `apps/frontend/`  
> **Cập nhật lần cuối:** 2026-09-29

---

## Mục Lục

1. [Tổng Quan](#1-tổng-quan)
2. [Technology Stack](#2-technology-stack)
3. [Kiến Trúc (Architecture)](#3-kiến-trúc-architecture)
4. [Cấu Trúc Thư Mục](#4-cấu-trúc-thư-mục)
5. [Yêu Cầu Hệ Thống](#5-yêu-cầu-hệ-thống)
6. [Hướng Dẫn Cài Đặt](#6-hướng-dẫn-cài-đặt)
7. [Cấu Hình Environment](#7-cấu-hình-environment)
8. [Chạy Ứng Dụng](#8-chạy-ứng-dụng)
9. [Chi Tiết Các Module](#9-chi-tiết-các-module)
10. [UI Component System (shadcn/ui)](#10-ui-component-system-shadcnui)
11. [Theming & Styling](#11-theming--styling)
12. [API Client Layer](#12-api-client-layer)
13. [Quy Ước Code & Convention](#13-quy-ước-code--convention)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Tổng Quan

Frontend của **Document Semantic Search** là một **Single Page Application (SPA)** được xây dựng bằng **React 19** + **TypeScript 6**, đóng vai trò là giao diện người dùng cho hệ thống tìm kiếm tài liệu PDF bằng AI (Semantic Search).

### Chức năng chính:
- Giao diện tìm kiếm tài liệu bằng ngôn ngữ tự nhiên
- Upload & quản lý tài liệu PDF
- Hiển thị kết quả tìm kiếm với highlight đoạn văn bản, trỏ đến tên file & số trang
- Responsive trên desktop & mobile

### Mối quan hệ trong hệ thống:

```
┌─────────────────────────────────────────────────────────┐
│                    Trình duyệt (Browser)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │          Frontend (React SPA - Vite)              │  │
│  │  Port: 5173 (dev)                                 │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTP (Axios)
                          │ VITE_API_BASE_URL
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend (FastAPI + LangChain)               │
│              Port: 8000                                  │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  REST API   │  │  AI/Embedding │  │  File Storage   │  │
│  │  /api/*     │  │  vietnamese-  │  │  (PDF uploads)  │  │
│  │             │  │  sbert        │  │                 │  │
│  └──────┬──────┘  └──────────────┘  └─────────────────┘  │
│         │                                                │
│  ┌──────┴──────────────────────────────────────────────┐ │
│  │         ChromaDB (Vector) + SQLite (Metadata)       │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Core Framework

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **React** | `^19.2.8` | UI library chính |
| **TypeScript** | `~6.0.2` | Type-safe JavaScript |
| **Vite** | `^8.3.0` | Build tool & dev server (HMR cực nhanh) |

### Styling & UI

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **Tailwind CSS** | `^4.3.3` | Utility-first CSS framework |
| **shadcn/ui** | `^4.21.0` (CLI) / `^0.3.1` (React) | Component library (copy-paste, không phải npm dependency) |
| **@base-ui/react** | `^1.8.0` | Headless UI primitives (Radix UI kế nhiệm) |
| **Lucide React** | `^1.48.0` | Icon library |
| **tw-animate-css** | `^1.4.0` | CSS animations cho Tailwind |
| **Inter Variable** | `^5.3.0` | Font chữ chính |
| **class-variance-authority** | `^0.7.1` | Tạo component variants |

### Routing & State Management

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **React Router DOM** | `^7.18.4` | Client-side routing (Browser Router) |
| **Zustand** | `^5.0.15` | Lightweight state management |

### Data Fetching & Forms

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **Axios** | `^1.20.0` | HTTP client với interceptors |
| **React Hook Form** | `^7.89.0` | Form management (performant) |
| **@hookform/resolvers** | `^5.9.1` | Schema validation resolvers |
| **Zod** | `^4.6.5` | Schema validation & type inference |

### Các thư viện bổ trợ

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **Recharts** | `^3.8.0` | Biểu đồ / Data visualization |
| **cmdk** | `^1.1.1` | Command palette (⌘+K) |
| **date-fns** | `^4.4.0` | Xử lý date/time |
| **react-day-picker** | `^10.0.1` | Date picker component |
| **embla-carousel-react** | `^8.6.0` | Carousel / Slider |
| **react-resizable-panels** | `^4.14.1` | Resizable panel layout |
| **input-otp** | `^1.5.0` | OTP input component |

### Dev Tools

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **ESLint** | `^10.10.0` | Linting |
| **typescript-eslint** | `^8.69.0` | TypeScript ESLint rules |
| **eslint-plugin-react-hooks** | `^7.1.1` | React Hooks rules |
| **eslint-plugin-react-refresh** | `^0.5.6` | Fast Refresh safety |
| **@vitejs/plugin-react** | `^6.1.1` | React support cho Vite (Babel) |

---

## 3. Kiến Trúc (Architecture)

### 3.1 Tổng quan kiến trúc

Frontend tuân theo mô hình **Component-Based Architecture** kết hợp với **Feature-Sliced** (pages + shared components):

```
┌─────────────────────────────────────────────────────────┐
│                     Entry Point                          │
│                   index.html → main.tsx                  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Global Providers                       │ │
│  │  StrictMode → TooltipProvider → App → Toaster       │ │
│  └─────────────────────┬───────────────────────────────┘ │
│                        │                                 │
│  ┌─────────────────────▼───────────────────────────────┐ │
│  │              Router (createBrowserRouter)            │ │
│  │                                                     │ │
│  │  "/" ─────→ Layout (shared shell)                   │ │
│  │              └── Outlet                             │ │
│  │                   ├── "/" (index) → Home             │ │
│  │                   └── ... (future routes)           │ │
│  │                                                     │ │
│  │  "*" ─────→ 404 Not Found                           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────────┐  ┌──────────┐  ┌───────────────┐  │
│  │   UI Components   │  │  Hooks   │  │     Lib       │  │
│  │  (shadcn/ui)      │  │          │  │  api.ts       │  │
│  │  60+ components   │  │useMobile │  │  utils.ts     │  │
│  └──────────────────┘  └──────────┘  └───────────────┘  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           State Management (Zustand)                │ │
│  │           (stores sẽ được thêm khi cần)             │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Luồng dữ liệu (Data Flow)

```
User Action (click, type, submit)
        │
        ▼
   Page / Component
        │
        ├──→ Zustand Store (global state)
        │
        └──→ API Client (Axios)
                │
                ├── Request Interceptor
                │   └── Attach Bearer Token (nếu có)
                │
                ├──→ Backend API (FastAPI)
                │        │
                │        ▼
                │    Response
                │
                ├── Response Interceptor
                │   ├── Bóc tách response.data
                │   └── Xử lý lỗi (401, 403, 404, 413, 500)
                │
                ▼
        Update State / UI
```

### 3.3 Component Architecture

```
                    shadcn/ui Components
                   ┌────────────────────┐
                   │   Primitives       │
                   │  (@base-ui/react)  │  ← Headless (logic only)
                   └────────┬───────────┘
                            │ wraps
                   ┌────────▼───────────┐
                   │   UI Components    │
                   │  (src/components/  │  ← Styled (Tailwind + CVA)
                   │        ui/)        │
                   └────────┬───────────┘
                            │ composes
                   ┌────────▼───────────┐
                   │  Feature Components│
                   │  (src/components/) │  ← Business logic
                   └────────┬───────────┘
                            │ used in
                   ┌────────▼───────────┐
                   │      Pages         │
                   │  (src/pages/)      │  ← Route endpoints
                   └────────────────────┘
```

---

## 4. Cấu Trúc Thư Mục

```
apps/frontend/
├── index.html                 # HTML entry point
├── package.json               # Dependencies & scripts
├── package-lock.json          # Lock file
├── vite.config.ts             # Vite configuration (React + Tailwind + path alias)
├── tsconfig.json              # TypeScript project references
├── tsconfig.app.json          # TypeScript config cho app code (ES2023, React JSX)
├── tsconfig.node.json         # TypeScript config cho Node tooling (Vite config)
├── components.json            # shadcn/ui configuration (style: base-maia)
├── eslint.config.js           # ESLint flat config
├── .env                       # Environment variables (local)
├── .env.example               # Template environment variables
├── .gitignore                 # Git ignore rules
├── public/                    # Static assets (served as-is)
│   ├── favicon.svg
│   └── icons.svg
└── src/                       # Source code
    ├── main.tsx               # App bootstrap (React root + Providers)
    ├── App.tsx                # Router definition + Layout shell
    ├── index.css              # Global CSS (Tailwind imports + theme variables)
    ├── pages/                 # Route-level components (page per route)
    │   └── Home.tsx           # Landing page (Hero + Value Props + Tech Stack)
    ├── components/            # Reusable components
    │   └── ui/                # shadcn/ui components (60+ components)
    │       ├── accordion.tsx
    │       ├── alert.tsx
    │       ├── alert-dialog.tsx
    │       ├── aspect-ratio.tsx
    │       ├── attachment.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── bubble.tsx
    │       ├── button.tsx
    │       ├── button-group.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── combobox.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── direction.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── empty.tsx
    │       ├── field.tsx
    │       ├── hover-card.tsx
    │       ├── input.tsx
    │       ├── input-group.tsx
    │       ├── input-otp.tsx
    │       ├── item.tsx
    │       ├── kbd.tsx
    │       ├── label.tsx
    │       ├── marker.tsx
    │       ├── menubar.tsx
    │       ├── message.tsx
    │       ├── message-scroller.tsx
    │       ├── native-select.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── questionnaire.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── spinner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toggle.tsx
    │       ├── toggle-group.tsx
    │       └── tooltip.tsx
    ├── hooks/                 # Custom React hooks
    │   └── use-mobile.ts      # Responsive breakpoint detection (768px)
    └── lib/                   # Shared utilities & configurations
        ├── api.ts             # Axios client (interceptors, error handling)
        └── utils.ts           # Utility functions (cn helper)
```

---

## 5. Yêu Cầu Hệ Thống

### Bắt buộc

| Phần mềm | Phiên bản tối thiểu | Ghi chú |
|---|---|---|
| **Node.js** | `>= 20.x` (khuyến nghị `24.x`) | Runtime để chạy Vite dev server & build |
| **npm** | `>= 10.x` (khuyến nghị `11.x`) | Package manager |
| **Git** | `>= 2.x` | Quản lý source code |

### Tùy chọn

| Phần mềm | Mục đích |
|---|---|
| **VS Code** | IDE khuyến nghị |
| VS Code Extensions | `ESLint`, `Tailwind CSS IntelliSense`, `TypeScript`, `Prettier` |

### Kiểm tra phiên bản hiện tại:

```bash
node -v    # Kỳ vọng: v20.x trở lên
npm -v     # Kỳ vọng: 10.x trở lên
git --version
```

---

## 6. Hướng Dẫn Cài Đặt

### Bước 1: Clone Repository

```bash
git clone <repository-url> DocumentSemanticSearch
cd DocumentSemanticSearch
```

### Bước 2: Di chuyển vào thư mục Frontend

```bash
cd apps/frontend
```

### Bước 3: Cài đặt Dependencies

```bash
npm install
```

> Lệnh này sẽ cài tất cả dependencies được liệt kê trong `package.json`, bao gồm cả `devDependencies`.

### Bước 4: Cấu hình Environment Variables

```bash
# Copy file mẫu
cp .env.example .env

# Chỉnh sửa nếu cần
nano .env    # hoặc dùng editor bất kỳ
```

Xem mục [7. Cấu Hình Environment](#7-cấu-hình-environment) để biết chi tiết.

### Bước 5: Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt tại **http://localhost:5173**

---

## 7. Cấu Hình Environment

### File `.env`

```env
# API URL của Backend (FastAPI)
# Khi chạy local dev thì thường là localhost
VITE_API_BASE_URL=http://localhost:8000/api
```

### Quy tắc:
- Tất cả biến môi trường phải có prefix `VITE_` để Vite inject vào client bundle.
- Truy cập trong code qua `import.meta.env.VITE_API_BASE_URL`.
- File `.env` **KHÔNG** được commit lên Git (đã có trong `.gitignore`).
- File `.env.example` là template mẫu, **PHẢI** commit lên Git.

### Các môi trường:

| Môi trường | `VITE_API_BASE_URL` |
|---|---|
| Local Development | `http://localhost:8000/api` |
| Staging | `https://staging-api.example.com/api` |
| Production | `https://api.example.com/api` |

---

## 8. Chạy Ứng Dụng

### Các npm scripts có sẵn:

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Khởi chạy Vite dev server với HMR (Hot Module Replacement) |
| `npm run build` | Type-check (`tsc -b`) rồi build production bundle |
| `npm run preview` | Preview bản build production locally |
| `npm run lint` | Chạy ESLint kiểm tra code |

### Development

```bash
npm run dev
```

- Dev server chạy tại: **http://localhost:5173**
- HMR: Thay đổi code → trình duyệt tự động cập nhật (không cần reload)
- Tailwind CSS: Tự động scan class và generate CSS

### Production Build

```bash
# Build
npm run build

# Output tại: dist/
# Preview bản build
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 9. Chi Tiết Các Module

### 9.1 Entry Point — `main.tsx`

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>     {/* Global tooltip context */}
      <App />             {/* Router + Layout */}
      <Toaster />         {/* Toast notification container */}
    </TooltipProvider>
  </StrictMode>,
)
```

**Provider hierarchy:**
1. `StrictMode` — React development checks
2. `TooltipProvider` — Shared tooltip context cho toàn app
3. `App` — Router & layout
4. `Toaster` — Hiển thị toast notifications

### 9.2 Router & Layout — `App.tsx`

Sử dụng **React Router v7** với `createBrowserRouter`:

```tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,       // Shared layout shell
    children: [
      { index: true, element: <Home /> },
      // Thêm routes mới tại đây
    ]
  },
  {
    path: "*",
    element: <div>404 Not Found</div>
  }
])
```

**Layout component**: Flex container full-height với khu vực nội dung responsive (`p-6` mobile, `p-10` desktop). Có chỗ dành sẵn cho Sidebar/Header.

### 9.3 State Management — Zustand

Zustand đã được cài đặt sẵn (`^5.0.15`) nhưng chưa có store nào được tạo. Khi cần, tạo store tại `src/stores/`:

```tsx
// src/stores/useSearchStore.ts
import { create } from 'zustand'

interface SearchState {
  query: string
  results: SearchResult[]
  isLoading: boolean
  setQuery: (query: string) => void
  search: (query: string) => Promise<void>
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  results: [],
  isLoading: false,
  setQuery: (query) => set({ query }),
  search: async (query) => {
    set({ isLoading: true })
    // gọi API...
    set({ results: [...], isLoading: false })
  },
}))
```

### 9.4 Custom Hooks

#### `useIsMobile()` — `src/hooks/use-mobile.ts`

Detect responsive breakpoint (mobile < 768px):

```tsx
const isMobile = useIsMobile()
// true nếu viewport width < 768px
```

Sử dụng `window.matchMedia` + event listener, cleanup tự động khi unmount.

---

## 10. UI Component System (shadcn/ui)

### Tổng quan

Dự án sử dụng **shadcn/ui** (style: `base-maia`) — một component library theo mô hình **copy-paste**. Components được generate vào `src/components/ui/` và trở thành source code của project (không phải `node_modules`).

### Cấu hình (`components.json`)

```json
{
  "style": "base-maia",
  "rsc": false,           // Không dùng React Server Components
  "tsx": true,             // TypeScript JSX
  "tailwind": {
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Thêm component mới

```bash
# Từ thư mục apps/frontend/
npx shadcn@latest add <component-name>

# Ví dụ:
npx shadcn@latest add date-picker
npx shadcn@latest add data-table
```

### Danh sách 60+ components đã cài

Components được phân nhóm theo chức năng:

| Nhóm | Components |
|---|---|
| **Layout** | `card`, `separator`, `resizable`, `aspect-ratio`, `scroll-area`, `collapsible`, `sidebar` |
| **Navigation** | `breadcrumb`, `navigation-menu`, `menubar`, `tabs`, `pagination` |
| **Form** | `input`, `textarea`, `select`, `native-select`, `checkbox`, `radio-group`, `switch`, `slider`, `combobox`, `field`, `label`, `input-group`, `input-otp`, `calendar` |
| **Data Display** | `table`, `badge`, `avatar`, `chart`, `progress`, `skeleton`, `empty`, `marker`, `kbd` |
| **Feedback** | `alert`, `alert-dialog`, `dialog`, `drawer`, `sheet`, `toast`, `tooltip`, `hover-card`, `popover`, `spinner` |
| **Action** | `button`, `button-group`, `toggle`, `toggle-group`, `dropdown-menu`, `context-menu`, `command` |
| **Communication** | `message`, `message-scroller`, `bubble`, `attachment`, `questionnaire` |
| **Media** | `carousel` |
| **Accessibility** | `direction` |

---

## 11. Theming & Styling

### CSS Architecture

```
src/index.css
  ├── @import "tailwindcss"          # Tailwind CSS v4 base
  ├── @import "tw-animate-css"       # Animation utilities
  ├── @import "shadcn/tailwind.css"  # shadcn base styles
  ├── @import "@fontsource-variable/inter"  # Font
  │
  ├── @custom-variant dark           # Dark mode via .dark class
  ├── @theme inline { ... }          # Tailwind theme extensions
  │
  ├── :root { ... }                  # Light theme CSS variables (oklch)
  ├── .dark { ... }                  # Dark theme CSS variables (oklch)
  │
  └── @layer base { ... }            # Base element styles
```

### Design Tokens (CSS Variables)

Dự án sử dụng **oklch color space** cho tất cả design tokens:

| Token | Light | Dark | Mục đích |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | Nền chính |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Text chính |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Brand color |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Nền phụ |
| `--destructive` | `oklch(0.577 ...)` | `oklch(0.704 ...)` | Cảnh báo/Lỗi |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Viền |
| `--radius` | `0.625rem` | `0.625rem` | Border radius gốc |

### Sử dụng trong component

```tsx
// Dùng semantic color tokens qua Tailwind
<div className="bg-background text-foreground">
  <h1 className="text-primary">Tiêu đề</h1>
  <p className="text-muted-foreground">Mô tả phụ</p>
  <button className="bg-destructive">Xóa</button>
</div>
```

### Dark Mode

Chuyển đổi dark mode bằng cách thêm/bớt class `dark` trên element cha:

```tsx
document.documentElement.classList.toggle('dark')
```

### Font

**Inter Variable** — sans-serif font được load local (không CDN), cấu hình qua `@fontsource-variable/inter`.

---

## 12. API Client Layer

### Cấu hình (`src/lib/api.ts`)

Axios instance được cấu hình sẵn với:

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 30000,  // 30 giây
  headers: { 'Content-Type': 'application/json' },
})
```

### Request Interceptor
- Tự động attach `Authorization: Bearer <token>` từ `localStorage.access_token`

### Response Interceptor
- **Thành công**: Tự động bóc `response.data` — caller nhận data trực tiếp
- **Lỗi**: Xử lý theo HTTP status code:

| Status | Hành vi |
|---|---|
| `401` | Log lỗi, xóa token (có thể redirect `/login`) |
| `403` | Log "Không có quyền" |
| `404` | Log "Không tìm thấy" |
| `413` | Log "File quá lớn" |
| `500` | Log "Lỗi máy chủ" |
| Network Error | Log "Không thể kết nối" |

### Sử dụng API client

```tsx
import apiClient from '@/lib/api'

// GET
const documents = await apiClient.get('/documents')

// POST (upload file)
const formData = new FormData()
formData.append('file', file)
const result = await apiClient.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})

// POST (search)
const results = await apiClient.post('/search', { query: 'tìm hợp đồng lao động' })
```

### Path Alias

Dự án cấu hình path alias `@/` trỏ đến `src/`:

```tsx
import { Button } from "@/components/ui/button"   // → src/components/ui/button.tsx
import apiClient from "@/lib/api"                   // → src/lib/api.ts
import { useIsMobile } from "@/hooks/use-mobile"    // → src/hooks/use-mobile.ts
```

Cấu hình tại cả 2 nơi:
- **Vite**: `vite.config.ts` → `resolve.alias`
- **TypeScript**: `tsconfig.json` + `tsconfig.app.json` → `paths`

---

## 13. Quy Ước Code & Convention

### Naming Convention

| Loại | Quy tắc | Ví dụ |
|---|---|---|
| Components | PascalCase | `Home.tsx`, `SearchResults.tsx` |
| Hooks | camelCase, prefix `use` | `use-mobile.ts`, `useSearchStore.ts` |
| Utilities | camelCase | `utils.ts`, `api.ts` |
| UI Components | kebab-case file, PascalCase export | `button.tsx` → `<Button />` |
| CSS Variables | kebab-case | `--primary-foreground` |
| Env Variables | SCREAMING_SNAKE + `VITE_` prefix | `VITE_API_BASE_URL` |

### Import Order (khuyến nghị)

```tsx
// 1. React & framework
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. UI Components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 3. Hooks & stores
import { useIsMobile } from '@/hooks/use-mobile'

// 4. Lib & utils
import apiClient from '@/lib/api'
import { cn } from '@/lib/utils'

// 5. Types
import type { SearchResult } from '@/types'
```

### Thêm trang mới

1. Tạo file trong `src/pages/`:
   ```tsx
   // src/pages/Search.tsx
   export default function Search() {
     return <div>Search Page</div>
   }
   ```

2. Đăng ký route trong `App.tsx`:
   ```tsx
   import Search from './pages/Search'

   // Trong children array:
   { path: "search", element: <Search /> }
   ```

### Thêm shadcn component

```bash
npx shadcn@latest add <tên-component>
```

Component sẽ được tạo tại `src/components/ui/<tên-component>.tsx`. Có thể tùy chỉnh trực tiếp vì đây là source code của project.

---

## 14. Troubleshooting

### Lỗi thường gặp

#### ❌ `npm install` thất bại

```bash
# Xóa cache và cài lại
rm -rf node_modules package-lock.json
npm install
```

#### ❌ Port 5173 đã bị chiếm

```bash
# Tìm process
lsof -i :5173

# Hoặc chạy trên port khác
npm run dev -- --port 3000
```

#### ❌ Không kết nối được Backend API

1. Kiểm tra Backend đang chạy tại port 8000
2. Kiểm tra `VITE_API_BASE_URL` trong `.env`
3. Kiểm tra CORS trên Backend cho phép `http://localhost:5173`

#### ❌ TypeScript path alias không resolve

Đảm bảo cả 2 file cấu hình đều có `@/*` mapping:
- `tsconfig.json` (hoặc `tsconfig.app.json`) → `paths`
- `vite.config.ts` → `resolve.alias`

#### ❌ shadcn component báo lỗi import

```bash
# Cài lại component
npx shadcn@latest add <component-name> --overwrite
```

#### ❌ Tailwind classes không hoạt động

Đảm bảo `@tailwindcss/vite` plugin đã được load trong `vite.config.ts` và `src/index.css` có `@import "tailwindcss"`.

---

> **Lưu ý:** Backend cần chạy đồng thời để Frontend hoạt động đầy đủ. Xem hướng dẫn setup Backend tại [`.docs/backend-setup.md`](./backend-setup.md).
