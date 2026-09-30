---
type: prd
feature: pdf-semantic-search
status: draft
version: 1.0.0
updated: 2026-09-25
links: []
---

# PRD — Phần mềm tìm kiếm tài liệu PDF thông minh (AI Semantic Search)

| Hạng mục | Nội dung |
|---|---|
| Dự án | Internal-PDF-Search-Engine |
| Mã feature | `pdf-semantic-search` |
| Loại tài liệu | Product Requirements Document (PRD) |
| Ngày lập | 25/09/2026 |
| Người lập | AI Assistant |
| Phương pháp | Agile MVP, timebox 2 tuần |
| Ràng buộc kỹ thuật | Dùng công nghệ AI mã nguồn mở chạy local (Không dùng API ngoài), bảo mật dữ liệu 100%, Backend Python (FastAPI) kết hợp Frontend ReactJS. |

---

## 1. Bài toán kinh doanh (Business Problem)

### 1.1 Bối cảnh

Doanh nghiệp hiện tại đang lưu trữ hàng ngàn tài liệu dưới dạng PDF (hợp đồng, quy chế nội bộ, tài liệu kỹ thuật, hướng dẫn sử dụng). Việc tra cứu thông tin hiện tại gặp rất nhiều khó khăn và mất thời gian.

| Cách làm hiện tại | Hạn chế cốt lõi |
|---|---|
| Mở từng file và Ctrl+F | Chỉ tìm được trên 1 file mỗi lần. Mất thời gian mở từng file nếu không nhớ rõ nội dung nằm ở file nào. |
| Dùng công cụ tìm kiếm của Windows/Google Drive | Chỉ tìm kiếm chính xác từ khóa (Keyword match). Không hiểu được ngữ nghĩa (Ví dụ: tìm "quy định nghỉ đẻ" sẽ không ra kết quả nếu tài liệu ghi "chế độ thai sản"). |
| Hỏi đáp lẫn nhau qua nhóm chat | Mất thời gian của người khác, thông tin truyền miệng có thể bị tam sao thất bản, không có nguồn (source) đối chứng. |

### 1.2 Pain points

| Đối tượng | Nỗi đau | Hệ quả kinh doanh |
|---|---|---|
| Nhân viên / Chuyên viên | Mất hàng giờ chỉ để tìm một điều khoản nhỏ trong kho hợp đồng 500 trang. | Lãng phí thời gian làm việc, giảm năng suất, phản hồi khách hàng chậm trễ. |
| Quản lý / HR | Phải liên tục trả lời những câu hỏi lặp đi lặp lại về quy chế, quy trình từ nhân viên mới. | Mất tập trung vào công việc chính. |
| Ban Giám đốc | Thông tin doanh nghiệp bị phân mảnh, nhân viên ra quyết định sai do không tìm được tài liệu quy chuẩn cập nhật nhất. | Rủi ro vận hành, giảm tính đồng bộ của tổ chức. |

### 1.3 Mục tiêu kinh doanh & thước đo

| ID | Mục tiêu kinh doanh | Thước đo thành công (sau 1 tháng chạy thật) |
|---|---|---|
| BO-pdf-search-01 | Rút ngắn thời gian tra cứu thông tin tài liệu. | Thời gian tra cứu trung bình giảm từ >15 phút xuống dưới 10 giây/truy vấn. |
| BO-pdf-search-02 | Tăng độ chính xác khi tìm kiếm bằng ngôn ngữ tự nhiên. | 80% câu trả lời đúng nằm trong Top 3 kết quả trả về đầu tiên. |
| BO-pdf-search-03 | Đảm bảo an toàn thông tin tuyệt đối. | 100% dữ liệu được xử lý nội bộ (Local/Offline), không có API call nào ra máy chủ bên ngoài. |

### 1.4 Giá trị mang lại

- **Nhanh chóng:** Tìm kiếm xuyên suốt hàng ngàn trang tài liệu chỉ trong vài giây.
- **Thông minh:** Tìm bằng câu hỏi tự nhiên (Semantic search), không cần nhớ chính xác từ khóa.
- **Minh bạch:** Kết quả trả về luôn trỏ thẳng đến tên file và số trang chứa thông tin.
- **Bảo mật:** Kiến trúc 100% Local, phù hợp cho tài liệu mật của doanh nghiệp.

---

## 2. Đối tượng người dùng (User Personas & Roles)

| Vai trò | Mô tả | Truy cập | Ước lượng số lượng |
|---|---|---|---|
| **Admin/Quản trị viên** | Người quản lý kho tài liệu, tải file lên hệ thống. | Giao diện quản trị (Web) | 1–2 người |
| **Nhân viên (User)** | Người sử dụng hệ thống để tìm kiếm tài liệu hàng ngày. | Giao diện tìm kiếm (Web) | Toàn bộ nhân sự |

### 2.1 Persona 1 — Admin

| Khía cạnh | Nội dung |
|---|---|
| Hồ sơ | Cán bộ hành chính / IT nội bộ. |
| Mục tiêu | Đưa tài liệu mới lên hệ thống nhanh chóng để mọi người có thể tìm kiếm. |
| Mong muốn | Giao diện upload kéo-thả đơn giản, có thông báo báo lỗi rõ ràng nếu file hỏng. Quản lý được danh sách các file đã đưa lên. |
| Nỗi sợ | Hệ thống xử lý quá lâu khi up file PDF nặng 500 trang, bị sập hệ thống (Crash). |
| Tần suất dùng | Vài lần/tuần khi có tài liệu mới ban hành. |

### 2.2 Persona 2 — Nhân viên

| Khía cạnh | Nội dung |
|---|---|
| Hồ sơ | Nhân viên các phòng ban (Sales, HR, Kế toán, Kỹ thuật). |
| Mục tiêu | Đặt câu hỏi hoặc gõ từ khóa và nhận được ngay đoạn văn bản chứa câu trả lời. |
| Mong muốn | Giao diện giống Google Search: 1 ô tìm kiếm, hiển thị ngay kết quả gồm (Tên file, Số trang, Đoạn trích dẫn chứa câu trả lời). |
| Nỗi sợ | Kết quả trả về không liên quan (Hallucination/Bad search) hoặc đưa ra thông tin cũ/sai. |
| Tần suất dùng | Nhiều lần trong ngày. |

### 2.3 Ma trận quyền (RBAC tối giản cho MVP)

| Chức năng | Admin | Nhân viên |
|---|---|---|
| Upload file PDF mới | Có | Không |
| Xóa file PDF khỏi hệ thống | Có | Không |
| Xem danh sách file trên hệ thống | Có | Có |
| Nhập truy vấn tìm kiếm | Có | Có |
| Xem lịch sử tìm kiếm toàn hệ thống | Có | Không |

### 2.4 Tech Stack (Công nghệ sử dụng)

Hệ thống được thiết kế theo hướng 100% Local (Không gọi API ngoài), sử dụng các công cụ Python mã nguồn mở:

| Lớp (Layer) | Công nghệ / Thư viện | Ghi chú |
|---|---|---|
| **Frontend UI** | `ReactJS` | Xây dựng giao diện Single Page Application mượt mà, linh hoạt và dễ mở rộng. |
| **Backend Framework**| `FastAPI` | Xây dựng API RESTful tốc độ cao để Frontend (React) gọi tới. |
| **AI Orchestration** | `LangChain` | Quản lý luồng từ lúc đọc file PDF -> Chia đoạn (Chunking) -> Đưa vào Vector DB. |
| **PDF Parser** | `pdfplumber` hoặc `PyMuPDF`| Đọc và bóc tách chữ từ file PDF gốc tốc độ cao. |
| **Embedding Model** | `sentence-transformers` | Dùng model chuyên dụng cho tiếng Việt (VD: `keepitreal/vietnamese-sbert` hoặc `bkai-foundation-models/vietnamese-bi-encoder`) để đạt độ chính xác cao nhất. |
| **Database** | `PostgreSQL` + `pgvector` | Hệ quản trị CSDL duy nhất lưu trữ cả siêu dữ liệu và Vector nhúng. |

---

## 3. Phạm vi dự án (Project Scope)

### 3.1 In-Scope (Thuộc phạm vi MVP)

| Nhóm | Hạng mục | Mức ưu tiên |
|---|---|---|
| **M1. Quản lý Tài liệu** | Quản lý cây thư mục (Tạo mới, đổi tên, xóa thư mục). | P0 |
| | Upload file PDF vào một thư mục cụ thể được chọn. | P0 |
| | Hiển thị danh sách file theo cấu trúc thư mục (Folder/Tree view). | P0 |
| | Nút xóa file khỏi hệ thống (xóa cả file gốc lẫn dữ liệu index). | P1 |
| **M2. Xử lý & Indexing** | Đọc và trích xuất văn bản (Text) từ file PDF. | P0 |
| | Chia nhỏ văn bản (Chunking) theo đoạn (khoảng 500-1000 ký tự/chunk) có overlap. | P0 |
| | Sinh Vector (Embedding) bằng mô hình AI chuyên tiếng Việt (vd: `keepitreal/vietnamese-sbert`). | P0 |
| | Lưu trữ Vector và siêu dữ liệu (metadata: tên file, số trang) vào CSDL PostgreSQL (pgvector). | P0 |
| **M3. Tìm kiếm & Giao diện** | Màn hình chính với ô nhập câu hỏi tìm kiếm (UI như Google). | P0 |
| | Xử lý truy vấn: Sinh vector cho câu hỏi và Similarity Search trong Vector DB. | P0 |
| | Hiển thị Top K kết quả (mặc định K=5) bao gồm: Tên file, Số trang, và Đoạn trích. | P0 |
| | Tích hợp trình xem PDF (PDF Viewer, ví dụ: pdf.js) trực tiếp trên giao diện web. | P0 |
| | Khi người dùng xem kết quả, hệ thống hiển thị luôn file PDF gốc, tự động nhảy đến đúng số trang và highlight (bôi vàng) trực tiếp đoạn văn bản trích xuất trên mặt giấy PDF. | P0 |
| **M4. Nền tảng** | Ứng dụng Frontend ReactJS kết nối qua API với Backend FastAPI. | P0 |
| | Chạy hoàn toàn offline trên máy tính công ty không cần kết nối API ngoài. | P0 |

### 3.2 Out-of-Scope (Hoãn sang giai đoạn sau)

| Hạng mục hoãn | Lý do | Dự kiến |
|---|---|---|
| Tổng hợp câu trả lời tự động (RAG Generative) | Cần chạy LLM nội bộ tốn rất nhiều tài nguyên (RAM/GPU), MVP chỉ làm Truy xuất đoạn văn bản. | Giai đoạn 2 |
| Đọc PDF dạng ảnh scan (OCR) | Tích hợp Tesseract làm chậm Indexing, độ chính xác tiếng Việt hên xui. | Giai đoạn 2 |
| Phân quyền truy cập từng file (Row-level security) | Đòi hỏi hệ thống tài khoản phức tạp. MVP coi kho tài liệu là dùng chung. | Giai đoạn 2 |
| Trích xuất Bảng biểu (Tables) phức tạp | Khó thực hiện bằng thư viện cơ bản, dễ rác dữ liệu. | Giai đoạn 3 |

### 3.3 Yêu cầu đối với file PDF đầu vào
Để hệ thống AI xử lý tốt nhất trong Giai đoạn 1, các file PDF cần đáp ứng:
1. **Định dạng:** Chuẩn `.pdf`, dung lượng tối đa **50MB** mỗi file.
2. **Text-based (Có lớp văn bản):** File được xuất ra từ Word, Excel, Docs... (có thể dùng chuột bôi đen chữ). Hệ thống sẽ bỏ qua các file/trang là ảnh chụp hoặc ảnh scan toàn bộ (vì chưa có OCR).
3. **Mã hóa chữ (Font):** Dùng font Unicode chuẩn. Tránh các font VNI/TCVN3 cũ hoặc lỗi nhúng font khiến chữ bị biến dạng khi trích xuất.
4. **Bảo mật:** File không được cài đặt mật khẩu khóa (Unencrypted).
5. **Ngôn ngữ:** Hỗ trợ tốt nhất cho tài liệu thuần **Tiếng Việt**. (Do hệ thống sử dụng Embedding Model chuyên biệt cho tiếng Việt để tối ưu độ chính xác, MVP Giai đoạn 1 chưa hỗ trợ tìm kiếm tài liệu thuần các ngoại ngữ khác).

---

## 4. Luồng nghiệp vụ chính (Core User Flows)

### 4.1 Luồng 1 — Admin Upload & Index Tài liệu (Quá trình Offline)

**Tiền điều kiện:** Admin truy cập màn hình Upload.

| Bước | Tác nhân | Thao tác | Hệ thống phản hồi |
|---|---|---|---|
| 1 | Admin | Chọn thư mục đích (hoặc tạo thư mục mới), kéo thả file PDF vào. | Hiển thị thanh tiến trình xử lý. |
| 2 | Hệ thống | — | Kiểm tra định dạng (.pdf) và dung lượng (< 50MB). Nếu hợp lệ, chuyển tiếp. |
| 3 | Hệ thống | — | Đọc text từng trang bằng thư viện đọc PDF. Bỏ qua trang rỗng. |
| 4 | Hệ thống | — | Chia text thành các Chunk nhỏ (500 ký tự), gắn metadata (tên file, số trang). |
| 5 | Hệ thống | — | Gọi Embedding Model biến các Chunk thành Vector. |
| 6 | Hệ thống | — | Lưu Vector và Text vào PostgreSQL bằng pgvector. |
| 7 | Hệ thống | — | Hiển thị thông báo "Thành công", cập nhật danh sách file hiển thị trên màn hình. |

**Ngoại lệ:**
- File không phải PDF -> Báo lỗi "Chỉ hỗ trợ định dạng PDF".
- File bị mã hóa mật khẩu -> Báo lỗi "Không thể đọc file có mật khẩu bảo vệ".

### 4.2 Luồng 2 — Nhân viên Tìm kiếm (Quá trình Online)

**Tiền điều kiện:** Nhân viên vào màn hình Tìm kiếm. Hệ thống đã có ít nhất 1 file được Index.

| Bước | Tác nhân | Thao tác | Hệ thống phản hồi |
|---|---|---|---|
| 1 | Nhân viên | Nhập câu hỏi (VD: "Quy định làm thêm giờ") và bấm nút Tìm kiếm. | Hiển thị trạng thái đang tìm kiếm (loading). |
| 2 | Hệ thống | — | Gọi Embedding Model chuyển câu hỏi thành Vector truy vấn. |
| 3 | Hệ thống | — | Query vào Vector DB lấy ra Top 5 chunk có độ tương đồng cao nhất. |
| 4 | Hệ thống | — | Định dạng lại kết quả và trả về cho giao diện (UI). |
| 5 | Nhân viên | Xem kết quả. | Màn hình hiển thị 5 thẻ kết quả. Mỗi thẻ hiện: Tên file (vd: So_tay_nhan_vien.pdf), Số trang (Trang 15), Nội dung đoạn trích. |

---

## 5. Mô hình dữ liệu cơ bản (Data Requirements)

Hệ thống sử dụng cơ sở dữ liệu kết hợp:
1.  **Hệ điều hành:** Lưu file PDF vật lý tại thư mục `uploads/`.
2.  **Database (PostgreSQL + pgvector):** Lưu trữ metadata, cấu trúc thư mục, các Vector nhúng và Text Chunk.

### 5.1 Danh sách thực thể và trường thông tin

**Folder (Cấu trúc thư mục)**

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| id | Định danh | Có | Khoá chính của thư mục. |
| name | Chuỗi | Có | Tên thư mục (VD: Hợp đồng 2026, Quy chế nội bộ). |
| parent_id | Tham chiếu | Không | Trỏ đến ID thư mục cha để tạo cấu trúc cây (Tree). |

**Document (Dữ liệu Metadata)**

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| doc_id | Định danh | Có | Mã băm (hash MD5) của file để tránh index trùng lặp. |
| folder_id | Tham chiếu | Có | Thuộc thư mục nào. |
| filename | Chuỗi | Có | Tên file gốc (vd: Hop_dong_v1.pdf). |
| total_pages | Số nguyên| Có | Tổng số trang có thể trích xuất chữ. |
| uploaded_at | Thời điểm| Có | Ngày giờ file được xử lý. |

**Vector Chunk (Dữ liệu lưu bằng pgvector)**

| Trường | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| id | Định danh | Có | Khoá chính của đoạn text (vd: `doc123_page5_chunk1`). |
| embedding | Array(Float)| Có | Mảng số thực do mô hình AI trả về (thường 384 hoặc 768 chiều). |
| document | Chuỗi | Có | Nội dung đoạn văn bản gốc (để hiển thị lên màn hình). |
| metadatas | JSON | Có | Chứa các khóa: `doc_id`, `filename`, `page_number`. Dùng để làm nguồn trích dẫn. |

---

## 6. Tiêu chí hoàn thành (Acceptance Criteria)

### M1 & M2 — Quản lý và Xử lý dữ liệu
- [ ] AC-01: Admin tạo được thư mục, tải file PDF lên đúng thư mục đã chọn. Hệ thống đọc trích xuất được văn bản (không bị vỡ font Tiếng Việt cơ bản), thực hiện chia chunk và lưu vào PostgreSQL mà không sinh lỗi.
- [ ] AC-02: Nếu tải lên file đã từng tải lên trước đó (trùng mã hash hoặc tên file), hệ thống từ chối xử lý và báo đã tồn tại.
- [ ] AC-03: Tính năng Xóa file sẽ xóa file PDF gốc trên ổ cứng VÀ xóa toàn bộ các chunks liên quan của file đó trong cơ sở dữ liệu.

### M3 — Tìm kiếm và Giao diện
- [ ] AC-04: User gõ câu hỏi bằng Tiếng Việt, hệ thống trả về kết quả tìm kiếm trong vòng tối đa 3-5 giây.
- [ ] AC-05: Giao diện kết quả hiển thị thông tin cơ bản: Tên tài liệu, Số trang, Nội dung trích xuất.
- [ ] AC-05b: Điểm nhấn UX: Khi bấm vào một kết quả, tích hợp trình xem PDF (như `pdf.js`) để mở luôn file gốc, tự động nhảy (scroll) đến đúng trang và highlight (bôi vàng) trực tiếp đoạn văn bản đó trên mặt giấy PDF (tương tự trải nghiệm của ứng dụng ChatApp1).
- [ ] AC-06: Nếu nhập truy vấn vô nghĩa (ví dụ: "asdfqwer"), hệ thống báo "Không tìm thấy nội dung liên quan" (cài đặt ngưỡng điểm Similarity Score tối thiểu).

### M4 — Nền tảng và Phi chức năng
- [ ] AC-07: Backend FastAPI khởi động thành công, Frontend ReactJS hiển thị tốt trên Desktop và kết nối API trơn tru.
- [ ] AC-08: Sau lần đầu tiên chạy và hệ thống đã tải (download) thành công AI Model về máy, rút dây mạng Internet ứng dụng vẫn Upload và Tìm kiếm bình thường 100%.
