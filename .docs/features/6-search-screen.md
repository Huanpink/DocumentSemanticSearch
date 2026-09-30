# Màn hình Tìm kiếm Ngữ nghĩa (Semantic Search)

Màn hình này đóng vai trò cốt lõi trong hệ thống, cho phép người dùng nhập nội dung văn bản (từ khóa, cụm từ hoặc một đoạn văn) và tìm ra các tài liệu (files) chứa đoạn văn bản có ý nghĩa tương đồng nhất.

## Chức năng: Tìm kiếm (Search Bar)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** 
  - Khu vực trên cùng của màn hình chứa một **Ô nhập liệu (Search Input)** lớn ở vị trí trung tâm.
  - Cạnh ô tìm kiếm có một **Dropdown "Lọc theo thư mục"** để giới hạn phạm vi tìm kiếm (chỉ tìm trong 1 folder cụ thể).
  - Có nút **"Tìm kiếm"** (hoặc nhấn Enter để search).
- **Validate Form:** 
  - Ô tìm kiếm không được để trống khi submit.
  - Hỗ trợ nhập liệu tối đa 200 ký tự (tránh gửi quá dài gây quá tải AI Model).
- **Trạng thái:** Trong lúc chờ API trả về, hiển thị màn hình Loading Skeleton ở khu vực danh sách kết quả bên dưới.

### 2. API & Logic Backend
- **Xử lý:** Backend sẽ nhận chuỗi query, chuyển chuỗi đó thành Vector (thông qua Embedding Model), sau đó sử dụng extension `pgvector` với toán tử Cosine Distance (`<=>`) để query trong bảng `document_chunks`.
- **Lọc (Filter):** Nếu có truyền `parentId` từ Dropdown, Backend sẽ thêm điều kiện `WHERE node_id IN (SELECT id FROM nodes WHERE parent_id = ?)`.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#41-tìm-kiếm-ngữ-nghĩa)
- **Database Schema:** [database-schema.md](../schema/database-schema.md#23-bảng-document_chunks)

---

## Chức năng: Danh sách Kết quả Tìm kiếm

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện hiển thị (List View):** 
  - Các kết quả được hiển thị ngay bên dưới ô tìm kiếm dưới dạng **Danh sách (List) các Card kết quả**.
  - Mỗi Card kết quả đại diện cho một File (hoặc một đoạn trích trong File), bao gồm:
    - **Tên File (File Name):** Tên tài liệu (VD: `Quy_che_cong_ty.pdf`).
    - **Đoạn trích dẫn (Snippet):** Hiển thị đoạn văn bản (`content`) được trích xuất từ file khớp với ngữ nghĩa tìm kiếm. Hệ thống Frontend có thể in đậm (bold) các từ khóa nếu trùng khớp.
    - **Số trang (Page Number):** Hiển thị vị trí đoạn văn bản đó nằm ở trang số mấy.
    - **Độ tương đồng (Match Score):** Hiển thị phần trăm mức độ liên quan (VD: `89% match`).
- **Tương tác (Interaction):** Khi click vào một Card kết quả, màn hình sẽ mở giao diện Trình xem PDF (PDF Viewer).

### 2. API & Logic Backend
- **Xử lý:** Backend thực hiện Join bảng `document_chunks` với bảng `nodes` để trả về đầy đủ thông tin: ID của file, Tên file, Nội dung text, Số trang và Điểm tương đồng (Score).
- **Phân quyền UI/API:** Kết quả tìm kiếm tự động loại trừ (không hiển thị) các file mà User đó không có quyền truy cập.

### 3. Liên kết tham chiếu
- **API Endpoint:** [endpoints.md](../apis/endpoints.md#41-tìm-kiếm-ngữ-nghĩa)

---

## Chức năng: Trình xem PDF & Nhảy trang (PDF Viewer)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **Giao diện:** 
  - Khi người dùng click vào một kết quả trong danh sách, có thể mở file dưới dạng **Split View** (chia đôi màn hình: nửa trái là danh sách tìm kiếm, nửa phải là PDF Viewer) hoặc dạng **Modal/Dialog** toàn màn hình.
  - Sử dụng thư viện `react-pdf-viewer` để render file PDF vật lý.
- **Tự động nhảy trang (Jump to Page):** Khi load xong file PDF, Frontend tự động trigger lệnh `jumpToPage(pageNumber)` để đưa người dùng tới chính xác trang chứa nội dung.
- **Highlight (Tô vàng văn bản):** Gọi plugin Search Controller của `pdf.js` truyền chuỗi `content` để nó tự động quét và bôi vàng mặt giấy, giúp người dùng nhận diện ngay đoạn text cần tìm.

### 2. API & Logic Backend
- **Xử lý:** Trình xem PDF sẽ gọi API tải nội dung file dạng Stream. Backend đọc `storagePath` từ DB, stream file trả về với định dạng `application/pdf`.

### 3. Liên kết tham chiếu
- **API Endpoint (Xem file):** [endpoints.md](../apis/endpoints.md#24-tải--xem-file-tĩnh-preview)
