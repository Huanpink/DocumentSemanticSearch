# Các tiến trình xử lý ngầm

## Chức năng: Kiểm tra tính hợp lệ của File

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Nếu sai định dạng, Toast báo lỗi đỏ chót xuất hiện ngay không cần gọi tải lên.

### 2. API & Logic Backend
- **Xử lý:** Check Mime Type `application/pdf`, check file size, check file password-protected bằng thư viện `PyMuPDF`.

### 3. Liên kết tham chiếu

---

## Chức năng: Chống trùng lặp File

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** Trả về lỗi 'File đã tồn tại' nếu băm ra mã MD5 trùng.

### 2. API & Logic Backend
- **Xử lý:** Tính MD5 hash của luồng byte file. Query JSONB `metadata->>'doc_id'`. Nếu có -> Reject.

### 3. Liên kết tham chiếu
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---

## Chức năng: Bóc tách Văn bản (Extract Text)

### 1. Giao diện & Trải nghiệm (UI/UX)
- Không có giao diện (Chạy ngầm ở Backend Worker/Celery).

### 2. API & Logic Backend
- **Xử lý:** Dùng thư viện `pdfplumber` hoặc `fitz` lặp qua từng trang (Page). Trích xuất Text, lưu biến số trang `page_number`.

### 3. Liên kết tham chiếu
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L131-L145)

---

## Chức năng: Chia đoạn Văn bản (Chunking)

### 1. Giao diện & Trải nghiệm (UI/UX)
- Không có giao diện.

### 2. API & Logic Backend
- **Xử lý:** Chia đoạn text dài thành mảng các đoạn ngắn (500 chữ), set `overlap=50` chữ để không đứt nghĩa câu.

### 3. Liên kết tham chiếu
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L131-L145)

---

## Chức năng: Sinh Vector (Embedding)

### 1. Giao diện & Trải nghiệm (UI/UX)
- Không có giao diện.

### 2. API & Logic Backend
- **Xử lý:** Gửi từng chunk vào Embedding Model Tiếng Việt (Sentence Transformers). Nhận về vector mảng số thực.

### 3. Liên kết tham chiếu
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L131-L145)

---

## Chức năng: Lưu trữ Vector

### 1. Giao diện & Trải nghiệm (UI/UX)
- Không có giao diện.

### 2. API & Logic Backend
- **Xử lý:** Insert mảng dữ liệu (node_id, page_number, content, embedding) vào bảng `document_chunks` của PostgreSQL.

### 3. Liên kết tham chiếu
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L131-L145)

---


## Chức năng: Tự động dọn rác (Auto Clean Trash)

### 1. Giao diện & Trải nghiệm (UI/UX)
- Không có giao diện trực tiếp. Người dùng sẽ thấy các file trong thùng rác tự động biến mất nếu đã quá 30 ngày kể từ ngày xóa.
- Trên giao diện màn hình Thùng rác có thể có dòng ghi chú: *"Các mục ở thùng rác sẽ bị xóa vĩnh viễn sau 30 ngày."*

### 2. API & Logic Backend
- **Xử lý:** Một Background Worker (vd: Cronjob, Celery Beat, hoặc apscheduler) chạy định kỳ mỗi ngày 1 lần vào lúc nửa đêm (00:00).
- **Logic Query:** Tìm toàn bộ các bản ghi trong bảng `nodes` thỏa mãn điều kiện `deleted_at < Now() - INTERVAL '30 days'`.
- **Logic Xóa:** Kích hoạt hàm **Xóa vĩnh viễn** cho các bản ghi tìm được (Đệ quy lấy toàn bộ con -> xóa vật lý trên ổ đĩa bằng `os.remove` -> xóa record khỏi DB -> FK CASCADE xóa chunks).

### 3. Liên kết tham chiếu
- **Database Schema:** [database-schema.md](../schema/database-schema.md#L86-L130)

---
