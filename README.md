# Crystal Interior QS — Phần Mềm Dự Toán Nhân Công & Điều Phối Thợ Fitout - Nội Thất

🌐 **Domain chính thức:** [https://qs.crystal-interior.com](https://qs.crystal-interior.com)  
📦 **GitHub Repository:** [https://github.com/crystall2026/QS-construction](https://github.com/crystall2026/QS-construction)

## 1. Tính năng cốt lõi dành cho Sếp & Phòng Dự Toán (QS)
- **Nhập nhanh khối lượng tổng (Quick Volume Estimator):** Điền trực tiếp các hạng mục phổ biến (VD: `100m² tường thạch cao`, `200m² sơn nước`, `60m² ốp lát`, `100m² điện MEP`...) để tính ngay số công, số ngày và số lượng thợ mỗi tổ đội.
- **Đọc tự động file BOQ (`.xlsx`, `.xls`, `.csv`, `.pdf`):** Tải lên bảng khối lượng dự toán Excel hoặc PDF, hệ thống kết hợp bộ khớp định mức tốc độ cao và **Google Gemini AI** để phân loại vào 7 tổ đội chuyên môn.
- **3 Bảng Báo Cáo Trực Quan Trình Sếp:**
  1. **Bảng 1 — Tổng hợp Phân bổ Thợ theo Tổ đội chuyên môn:** Cho biết rõ cần gọi những tổ đội nào (Tháo dỡ, Xây tô - Ốp lát, Trần vách Thạch cao, Điện nước MEP, Sơn bả, Sàn gỗ, Mộc & Nội thất), mỗi đội cần bao nhiêu người/ngày, vào việc từ ngày nào đến ngày nào và tổng chi phí nhân công.
  2. **Bảng 2 — Biểu đồ Kế hoạch Điều phối Thợ theo từng ngày (Gantt Matrix):** Ma trận quân số từng tổ đội từ Ngày 1 đến Ngày hoàn thành và tổng số thợ trên công trường mỗi ngày.
  3. **Bảng 3 — Bảng Dự toán Chi tiết từng Hạng mục BOQ:** Cho phép chỉnh sửa trực tiếp Khối lượng, Định mức năng suất (`KL/công`) và Số thợ/ngày ngay trên bảng.
- **Xuất Báo cáo Excel (`.xlsx`) 3 Sheet & In PDF A4 trình Sếp.**

## 2. Cấu hình DNS cho Domain `qs.crystal-interior.com`
Để kết nối tên miền phụ `qs.crystal-interior.com` về GitHub Pages:
1. Vào trang quản trị DNS của tên miền `crystal-interior.com` (Cloudflare / Nhân Hòa / Mắt Bão / PA Việt Nam...).
2. Tạo bản ghi **CNAME**:
   - **Host / Name:** `qs`
   - **Target / Value:** `crystall2026.github.io`
   - **TTL:** Auto (nếu dùng Cloudflare, chọn chế độ **DNS Only** đám mây xám để GitHub cấp chứng chỉ SSL HTTPS tự động, sau đó có thể bật đám mây cam).
3. Trong GitHub Repo `crystall2026/QS-construction` ➔ **Settings** ➔ **Pages**:
   - Chọn **Source**: `Deploy from a branch` ➔ Branch `main` / `/ (root)` (hoặc `GitHub Actions`).
   - Ô **Custom domain** đã được tự động điền `qs.crystal-interior.com` thông qua file `CNAME`. Tick chọn **Enforce HTTPS**.
