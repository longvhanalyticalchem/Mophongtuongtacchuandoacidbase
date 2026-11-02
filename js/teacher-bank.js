// CHẾ ĐỘ GIẢNG VIÊN: ngân hàng câu hỏi, sửa lời giải, bảng hằng số và công thức.
// Các file js/ là script thường (không dùng module), nạp theo thứ tự trong index.html và dùng chung biến toàn cục.

// ===== LỜI GIẢI ĐÃ SỬA (ghi đè lời giải tự sinh) =====
// Nguồn 1: data/loi-giai-sua.js (LOI_GIAI_SUA) – áp dụng cho mọi người dùng.
// Nguồn 2: bản nháp trên trình duyệt của giảng viên (localStorage) – chỉ máy đó thấy.
const OV_LS = 'loi-giai-sua-nhap';
const E1 = '<!--E1-->', E2 = '<!--E2-->';            // đánh dấu phần lời giải được phép sửa
function ovFile() { return (typeof LOI_GIAI_SUA === 'object' && LOI_GIAI_SUA) || {}; }
function ovLocal() { try { return JSON.parse(localStorage.getItem(OV_LS)) || {}; } catch (e) { return {}; } }
function ovSaveLocal(o) { try { localStorage.setItem(OV_LS, JSON.stringify(o)); } catch (e) { alertT('Trình duyệt không cho lưu bản nháp.'); } }
function ovAll() { return { ...ovFile(), ...ovLocal() }; }
function editPart(html) { const i = html.indexOf(E1), j = html.indexOf(E2); return i >= 0 && j > i ? html.slice(i + E1.length, j) : html; }
function applyOv(key, html) {
  const o = ovAll()[key]; if (o == null) return html;
  const i = html.indexOf(E1), j = html.indexOf(E2);
  return i >= 0 && j > i ? html.slice(0, i + E1.length) + o + html.slice(j) : o;
}
function q5Key(q) {
  switch (q.t) {
    case 'ind': return 'ind|' + q.sys;
    case 'err': return 'err|' + q.case + '|' + q.C;
    case 'pct': return 'pct|' + q.sys + '|' + q.pH;
    case 'color': return 'color|' + q.case;
    case 'dpk': return 'dpk|' + q.a + '|' + q.b + '|' + q.lim;
    case 'conc': return 'conc|' + q.v;
    case 'str': return 'str|' + q.v + (q.v === 'two' ? '|' + q.a + '|' + q.b : '');
    case 'pheq': return 'pheq|' + q.v;
    case 'sign': return 'sign|' + q.case;
    case 'graph': return 'graph|' + q.v + '|' + (q.v === 'pka' ? q.pka : q.sys);
  }
  return q.t;
}
const mixKey = p => 'mix|' + p.type + '|' + p.c1 + '|' + p.c2 + '|' + p.V0;
function q5Sol(q, A) {
  if (NEWQ[q.t]) return A.sol;
  return { ind: () => solInd(A), err: () => solErr(A), pct: () => solPct(q, A), color: () => solColor(A.c), dpk: () => solDpk(q, A) }[q.t]();
}
function alertT(msg) { const el = $('tb-msg'); if (el) { el.innerHTML = fb(msg, null); setTimeout(() => { if (el) el.innerHTML = ''; }, 3500); } }

// ===== NGÂN HÀNG CÂU HỎI (chế độ giảng viên) =====
const range = (a, b, st) => { const o = []; for (let x = a; x <= b + 1e-9; x += st) o.push(+x.toFixed(4)); return o; };
const NUMOPT = arr => arr.map(v => [String(v), fmt(v, String(v).split('.')[1]?.length || 0)]);
const TB_PARTS = [['explore', 'Bước 1–3 · Gắn kết, khám phá, giải thích'], ['mix', 'Bước 4 · Mở rộng (hỗn hợp)'],
  ...['pheq', 'conc', 'str', 'color', 'sign', 'graph', 'ind', 'dpk', 'err', 'pct'].map(t => [t, 'Bước 5 · ' + Q5_LABEL[t][0].toUpperCase() + Q5_LABEL[t].slice(1)])];
const COLOR_LAB = { 'tashiro-before': 'Tashiro, trước điểm tương đương', 'tashiro-after': 'Tashiro, sau điểm tương đương', bcgpp: 'Lục bromocresol + phenolphtalein (H₃PO₄)', warder: 'NaOH + Na₂CO₃: phenolphtalein rồi da cam methyl' };
const CONC_LAB = { hcl: 'HCl – NaOH (0,1 M → 0,01 M)', acoh: 'CH₃COOH – NaOH (0,1 M → 0,01 M)', nh3: 'NH₃ – HCl (0,1 M → 0,01 M)', why: 'Giải thích: vì sao dung dịch đặc thì bước nhảy dài' };
const STR_LAB = { 'hcl-acoh': 'HCl so với CH₃COOH', 'naoh-nh3': 'NaOH so với NH₃', two: 'Hai acid HX, HY', weak: 'H₃BO₃ (acid quá yếu)' };
let TB = { part: 'pheq', p: {} };
function tbSpec(part) {
  const P = TB.p;
  if (part === 'explore') return [['kind', 'Hệ chất', ['H3PO4', 'H2C2O4', 'CH3COOH', 'NH3'].map(k => [k, NAME[k] || { H3PO4: 'H₃PO₄', H2C2O4: 'H₂C₂O₄' }[k]])],
    ['C', 'Nồng độ (M)', NUMOPT(P.kind === 'H3PO4' ? range(0.06, 0.10, 0.01) : range(0.05, 0.10, 0.01))]];
  if (part === 'mix') return [['type', 'Hỗn hợp', Object.keys(MIX_INFO).map(k => [k, MIX_INFO[k].names.join(' + ')])],
    ['c1', 'C chất 1 (M)', NUMOPT(range(0.02, 0.08, 0.005))], ['c2', 'C chất 2 (M)', NUMOPT(range(0.02, 0.08, 0.005))], ['V0', 'V₀ (mL)', [['10', '10,00'], ['20', '20,00']]]];
  if (part === 'ind') return [['sys', 'Phép chuẩn độ', IND_SYS.map(x => [x.id, x.label])]];
  if (part === 'err') return [['case', 'Trường hợp', ERR_CASES.map(c => [c.id, `${NAME[c.an]} bằng ${NAME[c.ti]}, ${c.ind}`])], ['C', 'Nồng độ (N)', [['0.1', '0,1'], ['0.05', '0,05']]]];
  if (part === 'pct') return [['sys', 'Hệ', [['H3PO4', 'H₃PO₄ bằng NaOH'], ['Na2CO3', 'Na₂CO₃ bằng HCl']]], ['pH', 'pH dừng', NUMOPT(P.sys === 'Na2CO3' ? [10.2, 9.8, 7.0, 6.5] : [6.5, 7.0, 7.5, 8.0])]];
  if (part === 'color') return [['case', 'Tình huống', COLOR_CASES.map(c => [c.id, COLOR_LAB[c.id] || c.id])]];
  if (part === 'dpk') return [['a', 'pKa₁', NUMOPT(range(2, 5, 0.5))], ['d', 'pKa₂ − pKa₁', NUMOPT([2.5, 3, 3.5, 4.5, 5, 6.5])], ['lim', 'Sai số cho phép', [['1', '1 %'], ['0.1', '0,1 %']]]];
  if (part === 'conc') return [['v', 'Biến thể', Object.entries(CONC_LAB)]];
  if (part === 'str') return [['v', 'Biến thể', Object.entries(STR_LAB)], ...(P.v === 'two' ? [['a', 'pKa của HX', NUMOPT([3.8, 4.2])], ['b', 'pKa của HY', NUMOPT([6.0, 6.5])]] : [])];
  if (part === 'pheq') return [['v', 'Phép chuẩn độ', Object.keys(PHEQ).map(k => [k, PHEQ[k].lab])]];
  if (part === 'sign') return [['case', 'Trường hợp', ERR_CASES.map(c => [c.id, `${NAME[c.an]} bằng ${NAME[c.ti]}, ${c.ind} (pT = ${c.pT})`])]];
  if (part === 'graph') return [['v', 'Dạng', [['pka', 'Đọc pKa ở điểm nửa trung hoà'], ['id', 'Nhận ra phép chuẩn độ']]],
    ...(P.v === 'id' ? [['sys', 'Đường cong của', Object.keys(GSYS).map(k => [k, GSYS[k].lab])]] : [['pka', 'pKa của HA', NUMOPT([3.8, 4.2, 4.6, 5.0, 5.4])]])];
  return [];
}
function tbFix() {   // điền giá trị mặc định cho tham số còn thiếu hoặc không hợp lệ
  for (let k = 0; k < 3; k++) tbSpec(TB.part).forEach(([id, , opts]) => { if (!opts.some(o => o[0] === TB.p[id])) TB.p[id] = opts[0][0]; });
}
function tbQuestion() {
  const P = TB.p, t = TB.part, o4 = [0, 1, 2, 3];
  if (t === 'ind') return { t, sys: P.sys, pool: Object.keys(indicatorLibrary).filter(n => indicatorLibrary[n].ranges.length === 1) };
  if (t === 'err') return { t, case: P.case, C: +P.C, order: o4 };
  if (t === 'pct') return { t, sys: P.sys, pH: +P.pH, order: P.sys === 'Na2CO3' ? [0, 1] : [0, 1, 2] };
  if (t === 'color') return { t, case: P.case, order: o4 };
  if (t === 'dpk') return { t: 'dpk', a: +P.a, b: +(+P.a + +P.d).toFixed(2), lim: +P.lim };
  if (t === 'graph') return { t, v: P.v, pka: +(P.pka || 4.6), sys: P.sys || 'hcl', others: Object.keys(GSYS).filter(k => k !== (P.sys || 'hcl')).slice(0, 3), order: o4 };
  if (t === 'str') return { t, v: P.v, a: +(P.a || 3.8), b: +(P.b || 6), order: o4 };
  if (t === 'sign') return { t, case: P.case, order: o4 };
  return { t, v: P.v, order: o4 };
}
const OK = ' <span class="l-mark ok">✓ đúng</span>';
function tbBody() {
  const t = TB.part, P = TB.p;
  if (t === 'explore') {
    const ex = { explore: { kind: P.kind, C: +P.C, V0: 10, Ct: 0.1, order: [0, 1, 2, 3] } }, A = exploreAnswer(ex), Q = explainQ(ex);
    return { html: `<p>${EXPLORE_TEXT[P.kind](ex.explore)}</p>
      <p><b>Bước 1 (ghi nhận dự đoán):</b> ${EXPLORE_PRED[P.kind]} Đường cong có mấy bước nhảy quan sát được?</p>
      <p><b>Bước 2 – đáp án:</b> ${A.obs.length} bước nhảy, tại ${A.obs.map(e => `V<sub>tđ</sub> = ${fmt(e.Veq)} mL (pH ${fmt(e.pH)}, bước nhảy ± 1 % rộng ${fmt(e.w)} đơn vị pH)`).join('; ')}.
      Các điểm tương đương không quan sát được: ${A.eps.filter(e => !A.obs.includes(e)).map(e => `${fmt(e.Veq)} mL (rộng ${fmt(e.w)})`).join('; ') || 'không có'}.<br>
      <span class="caption">Chấm: đúng số bước nhảy và mỗi thể tích lệch ≤ 0,3 mL; tối đa 2 lần kiểm tra. Bước nhảy được coi là quan sát được khi rộng ≥ 0,2 đơn vị pH.</span></p>
      <p><b>Bước 3 – câu hỏi:</b> ${Q.q}</p><ol type="A" class="sol-list">${Q.opts.map(o => `<li>${o[0]}${o[1] ? OK : ''}</li>`).join('')}</ol>` };
  }
  if (t === 'mix') {
    const p = { type: P.type, c1: +P.c1, c2: +P.c2, V0: +P.V0, Ct: 0.1 }, M = MIX_INFO[p.type], [V1, V2] = mixVolumes(p);
    const warn = V2 > 45 ? fb('Tổ hợp này không xuất hiện trong đề (V₂ > 45 mL); đề chỉ bốc các tổ hợp có V₂ ≤ 45 mL.', false) : '';
    return { key: mixKey(p), sol: solMix(p), html: warn + `<p>Bình nón chứa <b>${fmt(p.V0, 2)} mL hỗn hợp ${M.names.join(' và ')}</b>; buret chứa <b>${M.titrant} ${fmtC(p.Ct)} M</b>. ${M.two ? 'Chỉ thị phenolphtalein, sau đó thêm da cam methyl.' : 'Chỉ thị lục bromocresol và phenolphtalein.'}</p>
      <p><b>Đáp án:</b> V₁ = ${fmt(V1)} mL; V₂ = ${fmt(V2)} mL; C(${M.names[0]}) = ${fmtC(p.c1)} M; C(${M.names[1]}) = ${fmtC(p.c2)} M.<br>
      <span class="caption">Chấm (không tính điểm): V₂ lệch ≤ 0,3 mL; V₁ lệch ≤ ${M.two ? `max(0,3 mL; 5 % V₁) = ${fmt(Math.max(0.3, 0.05 * V1))} mL` : '0,3 mL'}; nồng độ lệch ≤ 2 % so với giá trị tính từ V₁, V₂ sinh viên nhập hoặc giá trị thật.</span></p>
      <p class="caption">Gợi ý hiển thị cho sinh viên: ${M.hint}</p>` };
  }
  const q = tbQuestion(), A = q5Answer(q), key = q5Key(q), sol = q5Sol(q, A);
  let h = '';
  if (q.t === 'ind') {
    const all = q.pool.map(n => ({ n, r: indRate(n, A.info.L, A.info.U) }));
    h = `<p>Khi ${A.S.label}, với sai số cho phép <b>± ${A.S.s === 0.01 ? '1' : '0,1'} %</b>, đánh dấu những chỉ thị dùng được (Tốt hoặc Chấp nhận).</p>
      <p>Bước nhảy: <b>${fmt(A.info.L)} – ${fmt(A.info.U)}</b>; pH tại điểm tương đương ${fmt(A.info.pH)}.</p>
      <div class="table-wrap"><table class="tb-table"><thead><tr><th>Chỉ thị</th><th>Khoảng đổi màu</th><th>pT</th><th>Đánh giá</th></tr></thead><tbody>${all.map(o => { const d = indicatorLibrary[o.n]; return `<tr><td>${o.n}</td><td>${fmt(d.ranges[0][0], 1)}–${fmt(d.ranges[0][1], 1)}</td><td>${fmt(d.pT, 1)}</td><td><b>${o.r}</b></td></tr>`; }).join('')}</tbody></table></div>
      <p class="caption">Mỗi đề bốc 5 chỉ thị trong danh sách trên (tối đa 2 chỉ thị dùng được); mỗi chỉ thị xét đúng được 1/5 điểm. Lời giải bên dưới minh hoạ với một bộ 5 chỉ thị; phần so sánh từng chỉ thị (cuối lời giải) luôn tự sinh theo đúng bộ chỉ thị của đề.</p>`;
  } else if (q.t === 'err') {
    h = `<p>${A.text}.</p><p><b>Đáp án:</b> (a) ${A.typeName}; (b) ${fmt(A.quick, A.quick < 1 ? 3 : 2)} % theo công thức tính nhanh; ${(A.exact < 0 ? '−' : '+') + fmt(Math.abs(A.exact), Math.abs(A.exact) < 1 ? 3 : 2)} % theo đại số đầy đủ.<br><span class="caption">Chấm: mỗi ý 0,5 điểm; ý (b) chấp nhận lệch ≤ 10 % so với một trong hai giá trị, không xét dấu.</span></p>`;
  } else if (q.t === 'pct') {
    h = `<p>${A.text}</p><p><b>Đáp án:</b> (a) ${A.pair}; (b) ${fmt(A.val, 2)} %.<br><span class="caption">Chấm: mỗi ý 0,5 điểm; ý (b) chấp nhận ± 1,5.</span></p>`;
  } else if (q.t === 'color') {
    h = `<p>${A.c.q}</p><ol type="A" class="sol-list">${A.opts.map(o => `<li>${o}${o === A.c.ans ? OK : ''}</li>`).join('')}</ol>`;
  } else if (q.t === 'dpk') {
    h = `<p>${A.text}</p><p><b>Đáp án:</b> ${A.ok ? 'Có' : 'Không'} (cần Δpk ≥ ${A.need}).</p>`;
  } else {
    h = `<p>${A.text}</p>${A.fig}<ol type="A" class="sol-list">${A.opts.map((o, j) => `<li>${o[0]}${j === A.k ? OK : ''}</li>`).join('')}</ol><p class="caption">Trong đề, thứ tự 4 phương án được xáo theo mã đề.</p>`;
  }
  return { key, sol, html: h };
}
function tbRender() {
  const box = $('tb-box'); if (!box) return;
  tbFix();
  const spec = tbSpec(TB.part), B = tbBody();
  const local = ovLocal(), file = ovFile(), k = B.key;
  const st = !k ? '' : (k in local ? (local[k] === null ? 'Đang dùng lời giải gốc (bỏ bản sửa trong mã nguồn) – bản nháp trên máy này' : 'Đã sửa – bản nháp trên máy này, chưa đưa vào mã nguồn') : k in file ? 'Đã sửa – lấy từ data/loi-giai-sua.js' : 'Lời giải gốc (tự sinh)');
  box.innerHTML = `<div class="tb-params">${spec.map(([id, lab, opts]) => `<div class="field"><label for="tb-${id}">${lab}</label><select id="tb-${id}" data-p="${id}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${TB.p[id] === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>`).join('')}</div>
    <div class="tb-q">${B.html}</div>
    ${B.sol ? `<div class="tb-solhead"><b>Lời giải chi tiết</b><span class="caption">${st}${k ? ` · mã: <code>${esc(k)}</code>` : ''}</span>
      <div class="l-actions" style="margin:0"><button id="tb-edit">Sửa lời giải</button>${k && (k in local || k in file) ? '<button id="tb-reset">Khôi phục lời giải gốc</button>' : ''}</div></div>
      <div id="tb-ed"></div><div class="sol-body tb-sol" id="tb-view">${applyOv(k, B.sol)}</div>` : ''}`;
  box.querySelectorAll('[data-p]').forEach(el => el.onchange = () => { TB.p[el.dataset.p] = el.value; tbRender(); });
  const ed = $('tb-edit'); if (ed) ed.onclick = () => tbEdit(k, B.sol);
  const rs = $('tb-reset'); if (rs) rs.onclick = () => { const o = ovLocal(); if (k in ovFile()) o[k] = null; else delete o[k]; ovSaveLocal(o); tbRender(); tbStatus(); };
}
function tbEdit(key, sol) {
  const cur = editPart(applyOv(key, sol)), part = sol.includes(E1);
  $('tb-view').classList.add('hidden'); $('tb-edit').disabled = true;
  $('tb-ed').innerHTML = `<p class="caption">${part ? 'Chỉ phần giải thích được sửa; dòng "Đáp án đúng" và các phần tự sinh theo đề (thứ tự phương án, danh sách chỉ thị) giữ nguyên. ' : ''}Công thức dạng phân số là mã MathML: sửa chữ trực tiếp, muốn sửa công thức thì dùng ô "Mã HTML".</p>
    <div class="l-actions" style="margin:6px 0"><button id="tb-m1" class="on">Soạn trực tiếp</button><button id="tb-m2">Mã HTML</button></div>
    <div id="tb-rich" class="sol-body tb-rich" contenteditable="true">${cur}</div><textarea id="tb-code" class="l-result hidden" rows="14"></textarea>
    <div class="l-actions"><button class="primary" id="tb-save">Lưu bản nháp</button><button id="tb-cancel">Huỷ</button></div>`;
  const rich = $('tb-rich'), code = $('tb-code');
  $('tb-m1').onclick = () => { if (!code.classList.contains('hidden')) rich.innerHTML = code.value; rich.classList.remove('hidden'); code.classList.add('hidden'); $('tb-m1').classList.add('on'); $('tb-m2').classList.remove('on'); };
  $('tb-m2').onclick = () => { if (code.classList.contains('hidden')) code.value = rich.innerHTML; code.classList.remove('hidden'); rich.classList.add('hidden'); $('tb-m2').classList.add('on'); $('tb-m1').classList.remove('on'); };
  $('tb-cancel').onclick = tbRender;
  $('tb-save').onclick = () => { const html = code.classList.contains('hidden') ? rich.innerHTML : code.value, o = ovLocal(); o[key] = html.trim(); ovSaveLocal(o); tbRender(); tbStatus(); alertT('Đã lưu bản nháp trên máy này. Bấm "Xuất bản sửa" để đưa vào mã nguồn.'); };
}
function tbExportText() {
  const all = ovAll(), out = {};
  Object.keys(all).sort().forEach(k => { if (all[k] != null) out[k] = all[k]; });
  return '// Lời giải đã được giảng viên sửa, ghi đè lời giải tự sinh.\n// Khoá: mã câu hỏi (xem trong Chế độ giảng viên › Ngân hàng câu hỏi). Giá trị: nội dung HTML.\n// File này do nút "Xuất bản sửa" tạo ra; có thể sửa tay.\nconst LOI_GIAI_SUA = ' + JSON.stringify(out, null, 2) + ';\n';
}
function tbStatus() {
  const el = $('tb-status'); if (!el) return;
  const l = Object.keys(ovLocal()).length, f = Object.keys(ovFile()).length;
  el.innerHTML = `Bản sửa trong mã nguồn: <b>${f}</b> · Bản nháp trên máy này: <b>${l}</b>`;
}
function bankHTML() {
  return `<p class="caption">Mỗi mã đề chỉ là một cách bốc ngẫu nhiên từ ngân hàng dưới đây (và xáo thứ tự phương án). Chọn phần và tham số để xem câu hỏi, đáp án, cách chấm và lời giải.</p>
    <div class="tb-bar"><div class="field"><label for="tb-part">Phần</label><select id="tb-part">${TB_PARTS.map(([v, l]) => `<option value="${v}" ${TB.part === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="tb-tools"><span id="tb-status" class="caption"></span><div class="l-actions" style="margin:0"><button id="tb-export">Xuất bản sửa</button><button id="tb-clear">Xoá bản nháp trên máy này</button></div></div></div>
    <div id="tb-msg"></div><div id="tb-out"></div><div id="tb-box" class="tb-box"></div>`;
}
function bindBank() {
  $('tb-part').onchange = e => { TB.part = e.target.value; TB.p = {}; tbRender(); };
  $('tb-export').onclick = () => {
    const txt = tbExportText();
    $('tb-out').innerHTML = `<div class="tb-export"><p>Thay toàn bộ nội dung file <code>data/loi-giai-sua.js</code> trong kho mã nguồn bằng đoạn dưới đây (hoặc tải file về rồi tải lên GitHub, ghi đè file cũ). Sau khi Vercel cập nhật, mọi sinh viên thấy lời giải mới; khi đó có thể xoá bản nháp trên máy này.</p>
      <textarea class="l-result" rows="10" readonly id="tb-exp-txt"></textarea><div class="l-actions"><button class="primary" id="tb-copy">Chép</button><button id="tb-dl">Tải file loi-giai-sua.js</button><button id="tb-x">Đóng</button></div></div>`;
    $('tb-exp-txt').value = txt;
    $('tb-copy').onclick = () => { const t = $('tb-exp-txt'); t.select(); (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => alertT('Đã chép.'), () => document.execCommand && document.execCommand('copy')); };
    $('tb-dl').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/javascript;charset=utf-8' })); a.download = 'loi-giai-sua.js'; document.body.append(a); a.click(); a.remove(); };
    $('tb-x').onclick = () => { $('tb-out').innerHTML = ''; };
  };
  $('tb-clear').onclick = () => { if (!Object.keys(ovLocal()).length) return alertT('Không có bản nháp nào.'); ovSaveLocal({}); tbRender(); tbStatus(); alertT('Đã xoá bản nháp trên máy này.'); };
  tbStatus(); tbRender();
}

// ===== HẰNG SỐ VÀ CÔNG THỨC =====
function constHTML() {
  const sw = c => `<i class="tb-sw" style="background:${c}"></i>`;
  const chem = Object.entries(library).map(([n, d]) => `<tr><td>${n}</td><td>${d.n}</td><td>${d.pKa.length ? d.pKa.map(v => fmt(v, 2)).join('; ') : '—'}</td><td>${d.zFull > 0 ? '+' : ''}${d.zFull}</td><td>${d.h}</td><td>${d.counter === 'water' ? 'OH⁻ / H⁺ của nước' : 'ion trơ'}</td></tr>`).join('');
  const ind = Object.entries(indicatorLibrary).map(([n, d]) => `<tr><td>${n}</td><td>${d.pKa.map(v => fmt(v, 2)).join('; ')}</td><td>${d.ranges.map(([a, b]) => fmt(a, 1) + '–' + fmt(b, 1)).join('; ')}</td><td>${fmt(d.pT, 2)}</td><td>${d.colors.map(sw).join('')}</td><td>${d.sol || ''}</td></tr>`).join('');
  return `<p class="caption">Các bảng dưới đây đọc trực tiếp từ <code>data/hang-so.js</code>, là số liệu mô phỏng và chấm điểm đang dùng.</p>
    <h4>Thư viện chất</h4><div class="table-wrap"><table class="tb-table"><thead><tr><th>Chất</th><th>Số nấc n</th><th>pKa (tăng dần)</th><th>Điện tích dạng proton hoá hoàn toàn (zFull)</th><th>Số H của dạng đưa vào</th><th>Ion đối</th></tr></thead><tbody>${chem}</tbody></table></div>
    <p class="caption">HCl, HNO₃, nấc 1 của H₂SO₄ được coi là acid mạnh bằng pKa rất âm (−6; −1,4; −3).</p>
    <h4>Thư viện chỉ thị</h4><div class="table-wrap"><table class="tb-table"><thead><tr><th>Chỉ thị</th><th>pK<sub>HInd</sub></th><th>Khoảng đổi màu</th><th>pT mặc định</th><th>Màu các dạng (proton hoá nhiều → ít)</th><th>Dung dịch chỉ thị</th></tr></thead><tbody>${ind}</tbody></table></div>
    <h4>Hằng số khác</h4><ul class="sol-list"><li>Tích số ion của nước K<sub>w</sub> = 10⁻¹⁴ (25 °C); bỏ qua hoạt độ.</li>
    <li>Bước nhảy quan sát được khi rộng ≥ ${fmt(UNOBSERVED_JUMP_THRESHOLD, 1)} đơn vị pH (tính với ± 1 %); rộng dưới ${fmt(CLEAR_JUMP, 1)} đơn vị pH thì ghi "bước nhảy nhỏ, khó quan sát".</li>
    <li>Một giọt = 0,05 mL. Buret 25 hoặc 50 mL.</li>
    <li>Sai số cho phép mặc định của bảng điểm tương đương: ± 0,1 % (chọn được 0,2; 0,5; 1 % hoặc tự nhập).</li></ul>
    <p class="caption"><b>Lưu ý khi sửa hằng số:</b> đổi giá trị trong <code>data/hang-so.js</code> thì mô phỏng, đồ thị, bảng, đáp án và các phép tính trong lời giải đều cập nhật. Riêng một số đề và lời giải có ghi sẵn giá trị pKa bằng chữ (ví dụ "pKa = 4,73"); danh sách các chỗ này ở mục "Sửa hằng số" trong README.</p>`;
}
function formulaHTML() {
  const pH = MI('pH'), h = MI('h'), C = MI('C'), pk = SUB(MI('pk'), MI('a')), Ka = j => SUB(MI('k'), MN(j)), al = j => SUB(MI('α'), MN(j));
  return `<h4>1. Công thức mô phỏng dùng để tính pH (mọi hệ)</h4>
    <p>Mô phỏng <b>không</b> dùng công thức gần đúng. Với mỗi thể tích V, pH được tìm bằng cách giải phương trình bảo toàn điện tích.</p>
    <p><b>Phân số mol</b> của dạng mất j proton (acid có n nấc, h = [H⁺]):</p>
    ${EQ(al('j'), EQS, FR(SUP(h, MI('n') + MINUS + MI('j')) + DOT + Ka(1) + Ka(2) + MO('⋯') + Ka('j'), MI('D')), MO(';'), MO('&#x2003;'), MI('D'), EQS, SUP(h, MI('n')), PLUS, SUP(h, MI('n') + MINUS + MN(1)) + Ka(1), PLUS, MO('⋯'), PLUS, Ka(1) + Ka(2) + MO('⋯') + Ka('n'))}
    <p><b>Phương trình bảo toàn điện tích</b> sau khi trộn V₀ mL dung dịch bình nón với V mL dung dịch buret:</p>
    ${EQ(h, MINUS, FR(SUB(MI('K'), MI('w')), h), PLUS, FR(SUB(MI('V'), MN(0)) + DOT + MO('∑') + SUB(MI('C'), MI('i')) + SUB(MI('z̄'), MI('i')) + PLUS + MI('V') + DOT + MO('∑') + SUB(MI('C'), MI('k')) + SUB(MI('z̄'), MI('k')), SUB(MI('V'), MN(0)) + PLUS + MI('V')), EQS, MN(0))}
    <p>với z̄ là điện tích trung bình của mỗi thành phần (tính từ các α và điện tích từng dạng, có kể ion đối). Khi bật "Bỏ qua pha loãng", mẫu số V₀ + V được thay bằng V₀. Phương trình được giải bằng phương pháp chia đôi trong khoảng pH −2 đến 16 (80 vòng lặp).</p>
    <p><b>Thể tích tương đương</b>: tính theo số proton được trao đổi đến nấc đang xét: ${IM(SUB(MI('V'), MT('tđ,k')), EQS, SUB(MI('V'), MN(0)), DOT, FR(MO('∑') + MT('C (các nấc đã chuẩn)'), MT('C chất chuẩn × số proton nhận/cho')))}.</p>
    <p><b>Bước nhảy</b> ở điểm tương đương k: pH tại ${IM(SUB(MI('V'), MT('tđ,k')), MO('±'), MI('s'), DOT, MI('ΔV'))}, với ΔV là thể tích chất chuẩn của riêng giai đoạn k (từ điểm tương đương k − 1 đến k).</p>
    <p><b>V cuối và sai số chỉ thị</b>: V cuối là thể tích tại pH = pT (luôn tính có kể pha loãng), ${IM(MI('SS'), MT('(%)'), EQS, FR(SUB(MI('V'), MT('cuối')) + MINUS + SUB(MI('V'), MT('tđ')), SUB(MI('V'), MT('tđ'))), TIMES, MN(100))}.</p>
    <p><b>Màu dung dịch</b>: mỗi dạng chỉ thị góp độ hấp thụ theo phân số mol của nó (định luật Lambert–Beer), cộng các chỉ thị theo số giọt, rồi đổi lại thành màu.</p>
    <h4>2. Công thức tính nhanh dùng trong lời giải</h4>
    <ul class="sol-list"><li>Acid mạnh: ${IM(pH, EQS, MO('−'), MI('lg'), C)}; base mạnh: ${IM(pH, EQS, MN(14), PLUS, MI('lg'), C)}</li>
    <li>Acid yếu: ${IM(pH, EQS, HALF, PRS(pk, MINUS, MI('lg'), C))}; base yếu (pKa của acid liên hợp): ${IM(pH, EQS, MN(7), PLUS, HALF, pk, PLUS, HALF, MI('lg'), C)}</li>
    <li>Muối của base yếu (ví dụ NH₄⁺): ${IM(pH, EQS, HALF, pk, MINUS, HALF, MI('lg'), C)}</li>
    <li>Hệ đệm: ${IM(pH, EQS, pk, PLUS, LG(FR(SUB(MI('C'), MI('B')), SUB(MI('C'), MI('A')))))}</li>
    <li>Chất lưỡng tính (ví dụ NaH₂PO₄, NaHCO₃): ${IM(pH, EQS, HALF, PRS(SUB(MI('pk'), MN(1)), PLUS, SUB(MI('pk'), MN(2))))}</li>
    <li>Sai số hydro: ${IM(MI('SS'), EQS, FR(SUP(MN(10), MO('−') + MI('pT')) + DOT + SUB(MI('V'), MI('T')), MI('N') + DOT + MI('V')), TIMES, MN(100))}; sai số hydroxyl: ${IM(MI('SS'), EQS, FR(SUP(MN(10), MO('−') + PR(MN(14), MINUS, MI('pT'))) + DOT + SUB(MI('V'), MI('T')), MI('N') + DOT + MI('V')), TIMES, MN(100))}</li>
    <li>Sai số acid HA: ${IM(MI('SS'), EQS, FR(SUP(MN(10), MO('−') + MI('pT')), SUP(MN(10), MO('−') + pk) + PLUS + SUP(MN(10), MO('−') + MI('pT'))), TIMES, MN(100))}; sai số base B: ${IM(MI('SS'), EQS, FR(SUP(MN(10), MO('−') + PR(MN(14), MINUS, MI('pT'))), SUP(MN(10), MO('−') + SUB(MI('pk'), MI('b'))) + PLUS + SUP(MN(10), MO('−') + PR(MN(14), MINUS, MI('pT')))), TIMES, MN(100))}</li>
    <li>Màu chỉ thị: ${IM(FR(SP('HInd'), SP('Ind⁻')), EQS, SUP(MN(10), SUB(MI('pk'), MI('HInd')) + MINUS + pH))}; khoảng đổi màu ${IM(SUB(MI('pk'), MI('HInd')), MO('±'), MN(1))}</li>
    <li>Định lượng riêng nấc 1 của acid hai nấc: Δpk ≥ 4 (sai số 1 %) hoặc Δpk ≥ 6 (sai số 0,1 %)</li></ul>
    <p class="caption">Lời giải chi tiết các câu tính toán trình bày cả cách tính nhanh (công thức trên) và cách đại số đầy đủ (bảo toàn khối lượng và điện tích, giống mô phỏng).</p>`;
}
