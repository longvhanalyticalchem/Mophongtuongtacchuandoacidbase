// CHẾ ĐỘ GIẢNG VIÊN: mật khẩu, tra mã đề, kiểm tra phiếu kết quả.
// Các file js/ là script thường (không dùng module), nạp theo thứ tự trong index.html và dùng chung biến toàn cục.

// ===== CHẾ ĐỘ GIẢNG VIÊN =====
// Mật khẩu không lưu trong mã: chỉ lưu giá trị băm (SHA-256 lặp 20 000 lần có muối).
// Đáp án không lưu sẵn: được tính lại từ mã đề sau khi mở khoá.
function sha256hex(str) {
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const bytes = new TextEncoder().encode(str), len = bytes.length, nb = ((len + 9 + 63) >> 6) << 6, m = new Uint8Array(nb);
  m.set(bytes); m[len] = 0x80; const bl = len * 8; m[nb - 4] = bl >>> 24; m[nb - 3] = bl >>> 16 & 255; m[nb - 2] = bl >>> 8 & 255; m[nb - 1] = bl & 255;
  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64), rotr = (x, n) => x >>> n | x << 32 - n;
  for (let o = 0; o < nb; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = m[o + 4 * i] << 24 | m[o + 4 * i + 1] << 16 | m[o + 4 * i + 2] << 8 | m[o + 4 * i + 3];
    for (let i = 16; i < 64; i++) { const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ w[i - 15] >>> 3, s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ w[i - 2] >>> 10; w[i] = w[i - 16] + s0 + w[i - 7] + s1 | 0; }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + (e & f ^ ~e & g) + K[i] + w[i] | 0, t2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + (a & b ^ a & c ^ b & c) | 0;
      h = g; g = f; f = e; e = d + t1 | 0; d = c; c = b; b = a; a = t1 + t2 | 0;
    }
    H = [H[0] + a | 0, H[1] + b | 0, H[2] + c | 0, H[3] + d | 0, H[4] + e | 0, H[5] + f | 0, H[6] + g | 0, H[7] + h | 0];
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
const T_SALT = 'd59217df2527eeab', T_HASH = 'f267cae6eefca60171fb87592e8cd2a632c718ebbfbed35e907b89a5a85e1b6f', T_ITER = 20000, R_SECRET = 'b4944377c4e72c2403d823224aa99bd9';
function passHash(pw) { let h = sha256hex(T_SALT + ':' + pw); for (let i = 0; i < T_ITER; i++) h = sha256hex(T_SALT + h); return h; }
function resultCheck(body) { return sha256hex(R_SECRET + String(body).replace(/\r/g, '').trim()).slice(0, 10).toUpperCase(); }
let teacherOpen = false, teacherTab = 'code';
function teacherExamHTML(code) {
  const ex = genExam(code), E = ex.explore, A = exploreAnswer(ex), Q = explainQ(ex);
  const letters = 'ABCD';
  let h = `<h4>Mã đề ${code}</h4><p><b>Bước 1–3</b> (không tính điểm).  ${EXPLORE_TEXT[E.kind](E)}<br>
    Bước nhảy quan sát được: <b>${A.obs.length}</b> (${A.obs.map(e => `V = ${fmt(e.Veq)} mL, pH = ${fmt(e.pH)}`).join('; ')}).<br>
    Câu giải thích: ${Q.q} Đáp án: <b>${letters[Q.opts.findIndex(o => o[1])]}</b> (phương án thứ ${Q.opts.findIndex(o => o[1]) + 1}).</p>`;
  h += '<p><b>Bước 4</b> (luyện tập, không tính điểm; sinh viên kiểm tra từng ô, làm lại không giới hạn). Tiêu chí ô đúng: V₂ lệch ≤ 0,3 mL; V₁ lệch ≤ 0,3 mL (với bài dùng phenolphtalein: ≤ max(0,3 mL; 5 %)); nồng độ lệch ≤ 2 % so với giá trị tính từ V₁, V₂ sinh viên nhập hoặc giá trị thật.</p><ol>' + ex.mix.map(p => {
    const M = MIX_INFO[p.type], [V1, V2] = mixVolumes(p);
    return `<li>${M.names.join(' + ')} (${fmt(p.V0, 2)} mL), chuẩn bằng ${M.titrant} ${fmtC(p.Ct)} M: V₁ = ${fmt(V1)} mL, V₂ = ${fmt(V2)} mL; C(${M.names[0]}) = ${fmtC(p.c1)} M, C(${M.names[1]}) = ${fmtC(p.c2)} M.</li>`;
  }).join('') + '</ol>';
  h += '<p><b>Bước 5</b> (thang 10 điểm, mỗi câu 1 điểm, chấm từng ý).</p><ol>' + ex.q5.map(q => {
    const a = q5Answer(q);
    if (NEWQ[q.t]) return `<li>${a.text} <b>${ABCD[a.k]}. ${a.opts[a.k][0]}</b> – 1 điểm.</li>`;
    if (q.t === 'ind') return `<li>Chọn chỉ thị khi ${a.S.label} (s = ± ${a.S.s === 0.01 ? '1' : '0,1'} %; bước nhảy ${fmt(a.info.L)} – ${fmt(a.info.U)}). ${a.opts.map(o => `${o.n} (${o.r})`).join('; ')}. <b>Dùng được: ${a.correct.join(', ') || 'không có'}</b>. Mỗi chỉ thị xét đúng: ${fmt(1 / a.opts.length, 2)} điểm.</li>`;
    if (q.t === 'err') return `<li>${a.text}. (a) <b>${a.typeName}</b> – 0,5 điểm. (b) <b>${fmt(a.quick, a.quick < 1 ? 3 : 2)} %</b> theo công thức tính nhanh; ${(a.exact < 0 ? '−' : '+') + fmt(Math.abs(a.exact), Math.abs(a.exact) < 1 ? 3 : 2)} % theo đại số đầy đủ (V cuối ${fmt(a.Vend, 4)} mL) – 0,5 điểm, chấp nhận lệch ≤ 10 % so với một trong hai.</li>`;
    if (q.t === 'pct') return `<li>${a.text} (a) <b>${a.pair}</b> – 0,5 điểm. (b) <b>${fmt(a.val, 1)} %</b> – 0,5 điểm, chấp nhận ± 1,5.</li>`;
    if (q.t === 'color') return `<li>${a.c.q} <b>${a.c.ans}</b> – 1 điểm.</li>`;
    return `<li>${a.text} <b>${a.ok ? 'Có' : 'Không'}</b> (cần Δpk ≥ ${a.need}) – 1 điểm.</li>`;
  }).join('') + '</ol>';
  return h;
}
function renderTeacher() {
  const box = $('teacher-panel');
  if (!teacherOpen) {
    box.innerHTML = `<div class="l-top"><h3 class="heading" style="margin:0">Chế độ giảng viên</h3><button id="t-close">Đóng</button></div>
      <p class="caption">Nhập mật khẩu giảng viên để xem đề và đáp án theo mã đề, kiểm tra tệp kết quả của sinh viên, rà soát ngân hàng câu hỏi và lời giải, xem hằng số và công thức.</p>
      <form id="t-login" class="l-actions" style="align-items:end"><div class="field" style="max-width:260px"><label for="t-pass">Mật khẩu</label><input id="t-pass" type="password" autocomplete="current-password"></div><button class="primary" type="submit">Mở khoá</button></form>
      <div id="t-msg"></div>`;
    $('t-login').onsubmit = ev => {
      ev.preventDefault(); const pw = $('t-pass').value;
      $('t-msg').innerHTML = '<p class="caption">Đang kiểm tra…</p>';
      setTimeout(() => { if (passHash(pw) === T_HASH) { teacherOpen = true; renderTeacher(); } else $('t-msg').innerHTML = fb('Mật khẩu chưa đúng.', false); }, 20);
    };
  } else {
    box.innerHTML = `<div class="l-top"><h3 class="heading" style="margin:0">Chế độ giảng viên</h3><div class="l-actions" style="margin:0"><button id="t-lock">Khoá lại</button><button id="t-close">Đóng</button></div></div>
      <div class="t-tabs" role="tablist">${[['code', 'Mã đề và phiếu kết quả'], ['bank', 'Ngân hàng câu hỏi'], ['const', 'Hằng số'], ['formula', 'Công thức']].map(([k, l]) => `<button role="tab" data-tab="${k}" class="${teacherTab === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div id="t-tab-code" class="${teacherTab === 'code' ? '' : 'hidden'}"><div class="t-grid"><div><h4>Xem đề và đáp án</h4><div class="l-actions" style="align-items:end;margin-top:0"><div class="field" style="max-width:180px"><label for="t-code">Mã đề</label><input id="t-code" maxlength="6" style="text-transform:uppercase"></div><button class="primary" id="t-show">Xem</button></div><div id="t-exam"></div></div>
      <div><h4>Kiểm tra tệp kết quả</h4><div class="field"><label for="t-res">Dán toàn bộ nội dung tệp kết quả</label><textarea id="t-res" class="l-result" rows="8"></textarea></div><div class="l-actions"><button class="primary" id="t-verify">Kiểm tra</button></div><div id="t-vres"></div></div></div></div>
      <div id="t-tab-bank" class="${teacherTab === 'bank' ? '' : 'hidden'}">${bankHTML()}</div>
      <div id="t-tab-const" class="${teacherTab === 'const' ? '' : 'hidden'}">${constHTML()}</div>
      <div id="t-tab-formula" class="${teacherTab === 'formula' ? '' : 'hidden'}">${formulaHTML()}</div>`;
    box.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { teacherTab = b.dataset.tab; box.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === b)); ['code', 'bank', 'const', 'formula'].forEach(k => $('t-tab-' + k).classList.toggle('hidden', k !== teacherTab)); });
    bindBank();
    $('t-lock').onclick = () => { teacherOpen = false; renderTeacher(); };
    $('t-show').onclick = () => {
      const code = val('t-code').trim().toUpperCase();
      if (!/^[A-Z2-9]{6}$/.test(code) || [...code].some(ch => !CODE_ABC.includes(ch))) { $('t-exam').innerHTML = fb('Mã đề gồm 6 ký tự (chữ in hoa và số 2–9, không có I, O, 0, 1).', false); return; }
      $('t-exam').innerHTML = teacherExamHTML(code);
    };
    $('t-verify').onclick = () => {
      const t = val('t-res').replace(/^﻿/, ''), m = t.match(/Mã kiểm tra:\s*([0-9A-F]{10})/), c = t.match(/Mã đề:\s*([A-Z2-9]{6})/);
      if (!m) { $('t-vres').innerHTML = fb('Không tìm thấy dòng "Mã kiểm tra" trong nội dung đã dán.', false); return; }
      const body = t.slice(0, t.indexOf('Mã kiểm tra:'));
      const ok = resultCheck(body) === m[1];
      $('t-vres').innerHTML = fb(ok ? `Hợp lệ: nội dung chưa bị sửa${c ? ' (mã đề ' + c[1] + ')' : ''}.` : 'Không hợp lệ: nội dung đã bị sửa sau khi xuất, hoặc dán thiếu.', ok)
        + (ok && c ? `<details class="l-hint"><summary>Xem đáp án của mã đề ${c[1]}</summary>${teacherExamHTML(c[1])}</details>` : '');
    };
  }
  $('t-close').onclick = () => { box.classList.add('hidden'); };
}

$('teacher-open').addEventListener('click', () => { const b = $('teacher-panel'); b.classList.remove('hidden'); renderTeacher(); b.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
