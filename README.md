# Mô phỏng tương tác chuẩn độ acid–base

Ứng dụng web tĩnh (HTML, CSS, JavaScript thuần, không cần cài đặt, không cần máy chủ) gồm:

- **Phòng thí nghiệm tự do**: chọn chất trong bình nón và trên buret, chọn 1–3 chỉ thị, nhỏ từng giọt, xem màu dung dịch, đường cong chuẩn độ, bảng điểm tương đương và sai số chỉ thị.
- **Bài học 5E**: đề ngẫu nhiên theo mã đề, 5 bước (gắn kết, khám phá, giải thích, mở rộng, đánh giá 10 câu thang 10), có lời giải chi tiết, xem lại các bước đã làm, xuất phiếu kết quả có mã kiểm tra.
- **Chế độ giảng viên** (nút "Giảng viên" cuối trang, có mật khẩu): tra đề theo mã đề, kiểm tra phiếu kết quả, ngân hàng câu hỏi kèm lời giải (sửa được), bảng hằng số và công thức.

Khoa Hóa phân tích và Kiểm nghiệm thuốc – Trường Đại học Dược Hà Nội.

## Cấu trúc thư mục

```
index.html                 Trang chính (nạp CSS và các file JS theo thứ tự)
css/app.css                Toàn bộ giao diện
assets/img/                Logo trường, logo khoa
assets/fonts/              Font Montserrat (có tiếng Việt), nhúng sẵn, không cần mạng
data/hang-so.js            HẰNG SỐ: thư viện chất và thư viện chỉ thị  ← hay sửa
data/loi-giai-sua.js       LỜI GIẢI ĐÃ SỬA (ghi đè lời giải tự sinh)   ← hay sửa
js/engine.js               Tính pH (bảo toàn điện tích), điểm tương đương, màu chỉ thị
js/lab.js                  Phòng thí nghiệm tự do: giao diện, đồ thị, bảng điểm tương đương
js/lesson-de.js            Bài học: sinh đề theo mã đề, đáp án, ký hiệu toán
js/lesson-loi-giai.js      Bài học: lời giải chi tiết các câu tính toán
js/lesson-cau-hoi.js       Bài học: câu hỏi thông hiểu – vận dụng ở bước 5
js/lesson-ui.js            Bài học: giao diện các bước, chấm điểm, xem lại, phiếu kết quả
js/teacher.js              Chế độ giảng viên: mật khẩu, tra mã đề, kiểm tra phiếu
js/teacher-bank.js         Chế độ giảng viên: ngân hàng câu hỏi, sửa lời giải, hằng số, công thức
js/main.js                 Khởi động
tools/doi-mat-khau.mjs     Tạo mật khẩu giảng viên mới
```

Các file JS là script thường (không phải module), dùng chung biến toàn cục và phải nạp đúng thứ tự như trong `index.html`.

## Chạy thử trên máy

Mở thẳng `index.html` bằng Chrome/Edge là chạy được. Nếu muốn giống môi trường thật, chạy một máy chủ tĩnh trong thư mục này, ví dụ `npx serve .` rồi mở địa chỉ được in ra.

## Đưa lên GitHub và Vercel

1. Tạo repo **riêng tư** trên GitHub, tải toàn bộ thư mục này lên (giữ nguyên cấu trúc, `index.html` nằm ở gốc repo).
2. Trên Vercel: *Add New → Project → Import* repo vừa tạo. *Framework Preset*: **Other**. Không cần lệnh build, *Output Directory* để trống (thư mục gốc). Bấm *Deploy*.
3. Đưa sinh viên đường dẫn `https://<tên-dự-án>.vercel.app`. Repo riêng tư nhưng trang web vẫn công khai.

Mỗi lần sửa file trên GitHub (sửa trực tiếp trên web hoặc tải file mới lên), Vercel tự cập nhật trang sau khoảng 1 phút. Sinh viên đang mở trang cần tải lại (F5) để thấy bản mới.

## Sửa lời giải

1. Mở trang → "Giảng viên" → nhập mật khẩu → tab **Ngân hàng câu hỏi**.
2. Chọn phần (bước 1–3, bước 4 hoặc loại câu của bước 5) và tham số để xem câu hỏi, đáp án, cách chấm, lời giải.
3. Bấm **Sửa lời giải** → sửa ở ô "Soạn trực tiếp" (chữ) hoặc "Mã HTML" (cả công thức MathML) → **Lưu bản nháp**. Bản nháp chỉ nằm trên trình duyệt của máy đang dùng; mở bài học trên máy đó sẽ thấy ngay lời giải mới để kiểm tra.
4. Bấm **Xuất bản sửa** → **Tải file loi-giai-sua.js** (hoặc Chép) → trên GitHub thay file `data/loi-giai-sua.js` bằng file vừa tải. Sau khi Vercel cập nhật, mọi sinh viên thấy lời giải mới. Có thể bấm "Xoá bản nháp trên máy này".

Lưu ý:
- Mỗi lời giải được nhận diện bằng **mã câu hỏi** (hiện cạnh tiêu đề "Lời giải chi tiết", ví dụ `pheq|hcl`, `err|acoh-pp|0.1`, `mix|HCl+H3PO4|0.035|0.045|10`).
- Bản sửa thay **chữ hiển thị**. Đáp số, cách chấm điểm và các phần tự sinh theo đề (dòng "Đáp án đúng", lý do loại từng phương án, danh sách chỉ thị trong câu chọn chỉ thị) không đổi. Nếu phát hiện **đáp số hoặc cách chấm sai**, cần sửa trong mã nguồn (`js/lesson-*.js`).
- Muốn bỏ một bản sửa: xoá dòng tương ứng trong `data/loi-giai-sua.js`, hoặc dùng nút "Khôi phục lời giải gốc" rồi xuất lại.

## Sửa hằng số

`data/hang-so.js` chứa thư viện chất (`library`: số nấc, pKa, điện tích, dạng đưa vào, ion đối) và thư viện chỉ thị (`indicatorLibrary`: pK, khoảng đổi màu, pT mặc định, màu các dạng, dung dịch chỉ thị). Sửa ở đây thì mô phỏng, đồ thị, bảng, đáp án và phép tính trong lời giải cập nhật theo. Tab **Hằng số** trong chế độ giảng viên hiển thị các giá trị đang dùng.

Một số đề và lời giải ghi sẵn giá trị bằng chữ hoặc dùng hằng số riêng. Khi đổi pKa của các chất dưới đây, tìm và sửa thêm trong `js/lesson-de.js`, `js/lesson-loi-giai.js`, `js/lesson-cau-hoi.js`, `js/lesson-ui.js` (tìm cả dạng `4,73` lẫn `4.73`):

| Chất | Giá trị đang dùng |
|---|---|
| CH₃COOH | pKa 4,73 |
| NH₄⁺ / NH₃ | pKa 9,25 (pKb 4,75) |
| H₃PO₄ | pKa 2,15; 7,20; 12,4 |
| H₂CO₃ (Na₂CO₃, NaHCO₃) | pKa 6,35; 10,33 |
| H₂C₂O₄ | pKa 1,25; 4,27 |
| H₃BO₃ | pKa 9,24 |
| Đỏ methyl, da cam methyl, phenolphtalein, lục bromocresol (câu màu chỉ thị) | pK 5,0; 3,46; 9,4; 4,7 |

## Mật khẩu giảng viên

Mật khẩu hiện tại: `HPT1-2026`. Mã nguồn chỉ lưu giá trị băm của mật khẩu, không lưu mật khẩu.

Đổi mật khẩu: cài Node.js, chạy `node tools/doi-mat-khau.mjs "MatKhauMoi"`, thay dòng `const T_SALT = ...` trong `js/teacher.js` bằng dòng lệnh in ra, rồi đẩy lên GitHub. Không đổi `R_SECRET` nếu muốn tiếp tục kiểm tra được các phiếu kết quả cũ.

## Lưu ý

- Toàn bộ đề, đáp án và chấm điểm chạy trên trình duyệt. Mật khẩu chỉ chặn trên giao diện; người rành lập trình vẫn đọc được đáp án trong mã JavaScript tải về trình duyệt. Ứng dụng phù hợp cho luyện tập và đánh giá thường xuyên, không dùng cho thi chính thức.
- Không có đăng nhập, không thu thập dữ liệu. Phòng thí nghiệm tự do nhớ thiết lập gần nhất trong trình duyệt (localStorage); bài học không lưu giữa các lần tải trang.
