// Tạo mật khẩu giảng viên mới.
// Cách dùng (cần Node.js 18 trở lên):  node tools/doi-mat-khau.mjs "MatKhauMoi"
// Lệnh in ra một dòng "const T_SALT = ..." – thay dòng tương ứng trong js/teacher.js rồi đẩy lên GitHub.
// Phiếu kết quả sinh viên nộp trước đó vẫn kiểm tra được vì R_SECRET được giữ nguyên.
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
const pw = process.argv[2];
if (!pw) { console.error('Hãy nhập mật khẩu mới: node tools/doi-mat-khau.mjs "MatKhauMoi"'); process.exit(1); }
const salt = randomBytes(8).toString('hex');
const sha = s => createHash('sha256').update(s, 'utf8').digest('hex');
let h = sha(salt + ':' + pw);
for (let i = 0; i < 20000; i++) h = sha(salt + h);
let r = '';
try { r = readFileSync(new URL('../js/teacher.js', import.meta.url), 'utf8').match(/R_SECRET = '([0-9a-f]+)'/)[1]; } catch (e) { r = randomBytes(16).toString('hex'); }
console.log(`const T_SALT = '${salt}', T_HASH = '${h}', T_ITER = 20000, R_SECRET = '${r}';`);
