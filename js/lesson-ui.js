// BÀI HỌC 5E: giao diện các bước, chấm điểm, xem lại, phiếu kết quả.
// Các file js/ là script thường (không dùng module), nạp theo thứ tự trong index.html và dùng chung biến toàn cục.

// ===== GIAO DIỆN BÀI HỌC =====
function lessonFresh(code) {
  return { code, ex: genExam(code), step: 0, info: { name: '', cls: '', team: '', msv: '' }, pred: null,
    s2: { tries: 0, ok: false, done: false, msg: '' }, s3: { tries: 0, first: null, firstOK: false, done: false, msg: '', pickedIdx: null },
    s4: { i: 0, mo: false, tries: [0, 0], ok: [false, false], last: [null, null], showSol: [false, false] }, s5: { i: 0, view: 0, res: [] }, max: 0 };
}
function lessonSections(show) {
  const q = sel => document.querySelector(sel);
  const map = { setup: q('section[aria-labelledby="setup-title"]'), ind: q('[data-template-id="indicator-panel"]'),
    seq: q('[data-template-id="sequence-panel"]'), eqt: q('[data-template-id="eq-table-panel"]'),
    legend: $('chart-legend'), theory: $('show-theory') && $('show-theory').closest('label'), dil: $('no-dil') && $('no-dil').closest('label') };
  Object.entries(map).forEach(([k, el]) => { if (el) el.classList.toggle('hidden', !show[k]); });
}
function setLayers(on) { lesson.layers = { jump: on, range: on, seg: on, pt: on, eq: on, eqpt: on }; }
function loadSystem(an, ti, V0, inds, names) {
  state.V = 0; state.tol = 0.01; state.eqSel = {}; state.noDil = true; state.capacity = 50;
  const toState = (c, nm) => ({ name: nm, C: String(c.C).replace('.', ','), n: c.pKa.length, pKa: c.pKa.map(String), zFull: c.zFull, h: c.h, counter: c.counter });
  state.analyte = an.map((c, i) => toState(c, names ? names[i] : 'Mẫu'));
  state.titrant = ti.map(c => toState(c, c.pKa.length ? 'HCl' : 'NaOH'));
  state.V0 = fmt(V0, 2); $('v0').value = state.V0; $('capacity').value = 50;
  state.indicators = inds.map(n => newIndicator(n));
  renderComponents(); renderIndicators(); recalculate();
}
function addIndicator(name) { if (state.indicators.some(r => r.name === name)) return; state.indicators.push(newIndicator(name)); renderIndicators(); refreshIndicator(); }
function enterLesson() {
  if (lesson.active) return;
  savedFree = JSON.parse(JSON.stringify(state));
  lesson.active = true; L = lessonFresh(newCode());
  state = { ...initial(), layers: {} };
  $('mode-free').classList.remove('on'); $('mode-lesson').classList.add('on');
  $('lesson-panel').classList.remove('hidden');
  goStep(0);
}
function exitLesson() {
  if (!lesson.active) return;
  stopAuto(); lesson.active = false;
  state = savedFree || initial();
  $('mode-lesson').classList.remove('on'); $('mode-free').classList.add('on');
  $('lesson-panel').classList.add('hidden');
  lessonSections({ setup: true, ind: true, seq: true, eqt: true, legend: true, theory: true, dil: true });
  $('v0').value = state.V0; $('capacity').value = state.capacity; $('show-theory').checked = state.theory; $('no-dil').checked = state.noDil !== false;
  renderComponents(); renderIndicators(); recalculate();
}
function lessonView({ eqt = false, seq = false, layers = false, theory = false }) {
  lessonSections({ setup: false, ind: false, seq, eqt, legend: false, theory: false, dil: false });
  setLayers(layers); state.theory = theory; graph();
}
const EXPLORE_TEXT = {
  H3PO4: (E) => `Bình nón chứa <b>${fmt(E.V0, 2)} mL H₃PO₄ ${fmtC(E.C)} M</b> (pKa₁ 2,15; pKa₂ 7,20; pKa₃ 12,4). Buret chứa <b>NaOH ${fmtC(E.Ct)} M</b>.`,
  H2C2O4: (E) => `Bình nón chứa <b>${fmt(E.V0, 2)} mL acid oxalic H₂C₂O₄ ${fmtC(E.C)} M</b> (pKa₁ 1,25; pKa₂ 4,27). Buret chứa <b>NaOH ${fmtC(E.Ct)} M</b>.`,
  CH3COOH: (E) => `Bình nón chứa <b>${fmt(E.V0, 2)} mL CH₃COOH ${fmtC(E.C)} M</b> (pKa 4,73). Buret chứa <b>NaOH ${fmtC(E.Ct)} M</b>.`,
  NH3: (E) => `Bình nón chứa <b>${fmt(E.V0, 2)} mL NH₃ ${fmtC(E.C)} M</b> (pKa của NH₄⁺ 9,25). Buret chứa <b>HCl ${fmtC(E.Ct)} M</b>.`
};
const EXPLORE_PRED = { H3PO4: 'H₃PO₄ có 3 nấc phân li.', H2C2O4: 'Acid oxalic có 2 nấc phân li.', CH3COOH: 'CH₃COOH là acid một nấc.', NH3: 'NH₃ là base một nấc.' };
function loadExplore() {
  const A = exploreAnswer(L.ex), E = L.ex.explore;
  loadSystem(A.an, A.ti, E.V0, [E.kind === 'NH3' ? 'Đỏ methyl' : E.kind === 'H3PO4' ? 'Lục bromocresol' : 'Phenolphtalein'], [E.kind]);
}
function loadMix(i) { const p = L.ex.mix[i], M = MIX_INFO[p.type]; loadSystem(mixComps(p), [comp(M.titrant, p.Ct)], p.V0, M.ind, ['Mẫu (thành phần 1)', 'Mẫu (thành phần 2)']); }
function goStep(n) {
  stopAuto(); L.step = n; L.max = Math.max(L.max || 0, n); if (n === 5 && !(L.max > 5)) L.s5.view = L.s5.i;
  if (n === 0 || n === 1) { loadExplore(); lessonView({}); }
  if (n === 2) lessonView({});
  if (n === 3) lessonView(L.s3.done ? { eqt: true, layers: true, theory: true } : {});
  if (n === 4) { L.s4.mo = false; loadMix(L.s4.i); lessonView(L.s4.showSol[L.s4.i] ? { eqt: true, layers: true, theory: true } : {}); }
  if (n === 5) { loadExplore(); lessonView({ theory: true }); }
  if (n === 6) lessonView({ eqt: true, seq: true, layers: true, theory: true });
  renderLesson();
  const panel = $('lesson-panel'); if (panel && n > 0) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function score() { const per = L.ex.q5.map((q, i) => L.s5.res[i] ? L.s5.res[i].pts : 0); return { per, total: per.reduce((a, b) => a + b, 0) }; }
const fmtPts = x => fmt(Math.round(x * 100) / 100, 2);
function studentLine() { const I = L.info; return `Họ tên: ${I.name || '—'} | Lớp: ${I.cls || '—'} | Tổ: ${I.team || '—'} | Mã SV: ${I.msv || '—'}`; }
function resultText() {
  const sc = score(), ex = L.ex;
  const lines = ['KẾT QUẢ BÀI HỌC: CHUẨN ĐỘ ACID–BASE (mô hình 5E)', 'Mã đề: ' + ex.code, studentLine(), 'Thời gian nộp: ' + new Date().toLocaleString('vi-VN'), '',
    'Các bước luyện tập (không tính điểm):',
    `  Bước 1: dự đoán ${L.pred ?? '—'} bước nhảy`,
    `  Bước 2: ${L.s2.ok ? 'xác định đúng' : 'chưa đúng'} (${L.s2.tries} lần thử)`,
    `  Bước 3: ${L.s3.firstOK ? 'đúng ngay lần đầu' : L.s3.done ? 'đúng sau ' + L.s3.tries + ' lần' : 'chưa trả lời'}`];
  ex.mix.forEach((p, i) => lines.push(`  Bước 4, bài ${i + 1} (${MIX_INFO[p.type].names.join(' + ')}): ${L.s4.ok[i] ? 'đúng hết' : 'chưa đúng hết'} sau ${L.s4.tries[i]} lần kiểm tra${L.s4.showSol[i] ? '; đã xem lời giải' : ''}`));
  lines.push('', 'Bước 5 – Đánh giá (thang 10 điểm, 10 câu):');
  ex.q5.forEach((q, i) => { const r = L.s5.res[i]; lines.push(`  Câu ${i + 1}: ${fmtPts(sc.per[i])}/1${r ? ' — trả lời: ' + r.answer : ''}`); });
  lines.push('', `TỔNG ĐIỂM: ${fmtPts(sc.total)}/${TOTAL_POINTS}`);
  return lines.join('\r\n');
}
function downloadResult() {
  const body = resultText(), text = body + '\r\nMã kiểm tra: ' + resultCheck(body);
  const blob = new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `ket-qua-${L.ex.code}${L.info.msv ? '-' + L.info.msv.replace(/[^\p{L}\p{N}]+/gu, '') : ''}.txt`;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function copyResult(btn) {
  const body = resultText(), text = body + '\r\nMã kiểm tra: ' + resultCheck(body);
  const done = () => { btn.textContent = 'Đã chép'; setTimeout(() => btn.textContent = 'Chép kết quả', 1500); };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => { $('l-result-text').select(); }); else $('l-result-text').select();
}
function fb(msg, ok) { return msg ? `<div class="l-fb ${ok === true ? 'ok' : ok === false ? 'bad' : ''}">${msg}</div>` : ''; }
function radios(name, opts, val, disabled) {
  return opts.map(([v, t]) => `<label class="l-opt"><input type="radio" name="${name}" value="${esc(v)}" ${val !== null && val !== undefined && String(val) === String(v) ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span>${t}</span></label>`).join('');
}
const mark = (ok) => ok == null ? '' : `<span class="l-mark ${ok ? 'ok' : 'bad'}">${ok ? '✓' : '✗'}</span>`;
function solBox(html, open = true) { return `<details class="sol" ${open ? 'open' : ''}><summary>Lời giải chi tiết</summary><div class="sol-body">${html}</div></details>`; }
function renderLesson() {
  const box = $('lesson-panel'); if (!box || !L) return;
  const n = L.step, ex = L.ex;
  const rev = n > 0 && n < L.max;
  const prog = `<div class="l-top"><ol class="l-prog">${L_STEPS.map((t, i) => { const k = i + 1, can = k <= L.max && k !== n;
    return `<li class="${k === n ? 'cur' : k <= L.max ? 'done' : ''}${can ? ' go' : ''}"${can ? ` data-go="${k}" role="button" tabindex="0" title="Xem lại bước ${k}"` : ''}><b>${k}</b><span>${t}</span></li>`; }).join('')}</ol><span class="l-code">Mã đề <b>${ex.code}</b></span></div>`
    + (rev ? `<div class="l-review">Đang xem lại bước ${n} (chỉ xem, không sửa được). <button id="l-back">${L.max === 6 ? 'Về kết quả' : 'Về bước ' + L.max + ' đang làm'}</button></div>` : '');
  let h = '';
  if (n === 0) {
    const I = L.info;
    h = `<div class="l-top"><p class="eyebrow" style="color:#12733f;margin:0">Bài học · mô hình 5E</p><span class="l-code">Mã đề <b>${ex.code}</b></span></div>
      <h2 class="heading" style="font-size:23px">Chuẩn độ acid–base: bước nhảy, định lượng hỗn hợp và chọn chỉ thị</h2>
      <p><b>Chuẩn đầu ra.</b> Sau bài học, sinh viên:</p>
      <ol class="l-outcomes"><li>Từ pKa và nồng độ, xác định được các điểm tương đương quan sát được trên đường cong chuẩn độ acid/base đa chức hoặc hỗn hợp, và tính được nồng độ từng thành phần.</li>
      <li>Chọn được chỉ thị phù hợp dựa trên bước nhảy pH và khoảng đổi màu, và tính được sai số chỉ thị.</li></ol>
      <div class="l-info">
        <div class="field"><label for="l-name">Họ tên</label><input id="l-name" value="${esc(I.name)}" autocomplete="name"></div>
        <div class="field"><label for="l-cls">Lớp</label><input id="l-cls" value="${esc(I.cls)}"></div>
        <div class="field"><label for="l-team">Tổ</label><select id="l-team"><option value="">— Chọn tổ —</option>${Array.from({ length: 12 }, (_, k) => String(k + 1)).map(t => `<option value="${t}" ${I.team === t ? 'selected' : ''}>Tổ ${t}</option>`).join('')}</select></div>
        <div class="field"><label for="l-msv">Mã sinh viên</label><input id="l-msv" value="${esc(I.msv)}"></div></div>
      <p class="caption">Mỗi lần mở bài là một đề khác nhau (mã đề ở góc trên). Bước 1–4 để khám phá và luyện tập; điểm (thang 10) chỉ tính ở bước 5. Đường cong tính bỏ qua pha loãng.</p>
      <div class="l-actions"><button class="primary" id="l-next">Bắt đầu</button><button id="l-reroll">Đổi đề khác</button></div>`;
  }
  const E = ex.explore;
  if (n === 1) {
    h = `<h3 class="heading">Bước 1 · Gắn kết</h3><p>${EXPLORE_TEXT[E.kind](E)}</p>
      <p><b>Câu hỏi:</b> ${EXPLORE_PRED[E.kind]} Bạn dự đoán đường cong chuẩn độ có mấy bước nhảy pH <i>quan sát được</i>?</p>
      <div class="l-opts">${radios('l-pred', [['0', 'Không có bước nhảy'], ['1', '1 bước nhảy'], ['2', '2 bước nhảy'], ['3', '3 bước nhảy']], L.pred, rev)}</div>
      <p class="caption">Câu này chỉ ghi nhận dự đoán.</p>${rev ? '' : '<div class="l-actions"><button class="primary" id="l-s1">Ghi nhận dự đoán</button></div>'}`;
  }
  if (n === 2) {
    h = `<h3 class="heading">Bước 2 · Khám phá</h3><p>${EXPLORE_TEXT[E.kind](E)}</p>
      <p>Dùng các nút <b>+1 giọt / +0,1 mL / +1 mL</b> hoặc thanh trượt ở <b>Phòng thí nghiệm ảo</b> để chuẩn độ tới khoảng 45 mL. Đường cong chỉ vẽ phần đã chuẩn độ. Quan sát chỗ pH thay đổi đột ngột.</p>
      <div class="l-grid"><div class="field"><label for="l-n">Số bước nhảy quan sát được</label><input id="l-n" inputmode="numeric" value="${esc((L.s2.raw || [])[0] || '')}" ${L.s2.done || rev ? 'disabled' : ''}></div>
      ${[1, 2, 3].map(i => `<div class="field"><label for="l-v${i}">V tại bước nhảy ${i} (mL)</label><input id="l-v${i}" inputmode="decimal" placeholder="để trống nếu không có" value="${esc((L.s2.raw || [])[i] || '')}" ${L.s2.done || rev ? 'disabled' : ''}></div>`).join('')}</div>
      ${fb(L.s2.msg, L.s2.done ? L.s2.ok : false)}
      ${rev ? '' : `<div class="l-actions">${L.s2.done ? '<button class="primary" id="l-next">Tiếp tục</button>' : '<button class="primary" id="l-s2">Kiểm tra</button>'}</div>`}`;
  }
  if (n === 3) {
    const Q = explainQ(ex);
    h = `<h3 class="heading">Bước 3 · Giải thích</h3><p><b>Câu hỏi:</b> ${Q.q}</p>
      <div class="l-opts">${radios('l-s3', Q.opts.map((o, i) => [i, 'ABCD'[i] + '. ' + o[0]]), L.s3.pickedIdx, L.s3.done)}</div>
      ${fb(L.s3.msg, L.s3.done ? true : (L.s3.msg ? false : null))}
      ${rev ? '' : `<div class="l-actions">${L.s3.done ? '<button class="primary" id="l-next">Tiếp tục</button>' : '<button class="primary" id="l-s3b">Trả lời</button>'}</div>`}
      ${L.s3.done ? '<p class="caption">Bảng "Các điểm tương đương và sai số chuẩn độ" và các lớp trên đồ thị đã được mở để bạn đối chiếu.</p>' : ''}`;
  }
  if (n === 4) {
    const i = L.s4.i, p = ex.mix[i], M = MIX_INFO[p.type], last = L.s4.last[i];
    const val0 = (k) => last ? esc(last.raw[k]) : '';
    h = `<h3 class="heading">Bước 4 · Mở rộng <span class="caption">(bài ${i + 1}/2 · luyện tập, không tính điểm)</span></h3>
      <p>Bình nón chứa <b>${fmt(p.V0, 2)} mL hỗn hợp ${M.names.join(' và ')}</b> chưa biết nồng độ. Buret chứa <b>${M.titrant} ${fmtC(p.Ct)} M</b>.
      ${M.two ? 'Bình nón có sẵn <b>phenolphtalein</b>. Chuẩn độ đến khi <b>vừa mất màu hồng</b>, ghi V₁; sau đó thêm da cam methyl và chuẩn tiếp đến khi dung dịch <b>chuyển từ vàng sang da cam</b>, ghi V₂ (thể tích tổng từ đầu).' : 'Bình nón có lục bromocresol và phenolphtalein. Đọc V₁, V₂ tại hai lần đổi màu (hai bước nhảy).'}</p>
      ${M.two ? `<div class="l-actions" style="margin-top:0"><button id="l-addmo" ${L.s4.mo ? 'disabled' : ''}>${L.s4.mo ? 'Đã thêm da cam methyl' : 'Thêm 2 giọt da cam methyl'}</button></div>` : ''}
      <details class="l-hint"><summary>Gợi ý</summary><p>${M.hint}</p></details>
      <div class="l-grid">
        <div class="field"><label for="l-V1">V₁ (mL) ${mark(last && last.ok[0])}</label><input id="l-V1" inputmode="decimal" value="${val0(0)}" ${rev ? 'disabled' : ''}></div>
        <div class="field"><label for="l-V2">V₂ (mL) ${mark(last && last.ok[1])}</label><input id="l-V2" inputmode="decimal" value="${val0(1)}" ${rev ? 'disabled' : ''}></div>
        <div class="field"><label for="l-c1">C(${M.names[0]}) (mol/L) ${mark(last && last.ok[2])}</label><input id="l-c1" inputmode="decimal" value="${val0(2)}" ${rev ? 'disabled' : ''}></div>
        <div class="field"><label for="l-c2">C(${M.names[1]}) (mol/L) ${mark(last && last.ok[3])}</label><input id="l-c2" inputmode="decimal" value="${val0(3)}" ${rev ? 'disabled' : ''}></div></div>
      ${last ? fb(last.msg, last.ok.every(Boolean)) : ''}
      <div class="l-actions">${rev ? '' : '<button class="primary" id="l-s4">Kiểm tra</button>'}<button id="l-sol4">${L.s4.showSol[i] ? 'Ẩn lời giải' : 'Xem lời giải chi tiết'}</button>${rev ? `<button id="l-s4other">Xem bài ${i === 0 ? 2 : 1}</button>` : `<button id="l-s4next">${i === 0 ? 'Sang bài 2' : 'Sang bước 5'}</button>`}</div>
      ${L.s4.showSol[i] ? solBox(applyOv(mixKey(p), solMix(p))) : ''}`;
  }
  if (n === 5) {
    const i = L.s5.view ?? L.s5.i, q = ex.q5[i], A = q5Answer(q), res = L.s5.res[i], dis = res ? 'disabled' : '', last5 = L.s5.res.length ? L.s5.res.length - 1 : 0;
    const nav5 = `<div class="l-qnav"><button id="l-qprev" ${i > 0 ? '' : 'disabled'} aria-label="Câu trước">◀ Câu trước</button><span>Câu ${i + 1}/${ex.q5.length}</span><button id="l-qnext" ${i < Math.max(L.s5.i, last5) ? '' : 'disabled'} aria-label="Câu sau">Câu sau ▶</button></div>`;
    let body = '', sol = '';
    if (q.t === 'ind') {
      body = `<p>Khi ${A.S.label}, với sai số cho phép <b>± ${A.S.s === 0.01 ? '1' : '0,1'} %</b>, đánh dấu những chỉ thị <b>dùng được</b> (đánh giá Tốt hoặc Chấp nhận). Mỗi chỉ thị xét đúng được ${fmt(1 / A.opts.length, 1)} điểm.</p>
        <div class="l-opts">${A.opts.map(o => { const d = indicatorLibrary[o.n], ok = res ? res.perOpt[o.n] : undefined;
          return `<label class="l-opt"><input type="checkbox" name="l-q" value="${esc(o.n)}" ${dis} ${res && res.picked.includes(o.n) ? 'checked' : ''}><span>${o.n} <span class="caption">(khoảng đổi màu ${fmt(d.ranges[0][0], 1)}–${fmt(d.ranges[0][1], 1)}; pT ${fmt(d.pT, 1)})</span> ${mark(ok)}</span></label>`; }).join('')}</div>`;
      sol = solInd(A);
    }
    if (q.t === 'err') {
      body = `<p>${A.text}.</p>
        <div class="l-grid"><div class="field"><label for="l-qt">(a) Loại sai số ${mark(res && res.okA)}</label><select id="l-qt" ${dis}><option value="">— Chọn —</option>${A.typeOpts.map(o => `<option ${res && res.typePicked === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
        <div class="field"><label for="l-qv">(b) Độ lớn sai số (%) ${mark(res && res.okB)}</label><input id="l-qv" inputmode="decimal" ${dis} value="${res ? esc(res.vRaw) : ''}"></div></div>
        <p class="caption">Mỗi ý 0,5 điểm. Ý (b) chấp nhận kết quả theo công thức tính nhanh hoặc theo đại số đầy đủ (lệch ≤ 10 %).</p>`;
      sol = solErr(A);
    }
    if (q.t === 'pct') {
      body = `<p>${A.text}</p>
        <div class="l-grid"><div class="field"><label for="l-qt">(a) Hệ đệm của cặp ${mark(res && res.okA)}</label><select id="l-qt" ${dis}><option value="">— Chọn —</option>${A.pairs.map(o => `<option ${res && res.typePicked === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>
        <div class="field"><label for="l-qv">(b) Phần trăm (%) ${mark(res && res.okB)}</label><input id="l-qv" inputmode="decimal" ${dis} value="${res ? esc(res.vRaw) : ''}"></div></div>
        <p class="caption">Mỗi ý 0,5 điểm. Ý (b) chấp nhận lệch ≤ 1,5 %.</p>`;
      sol = solPct(q, A);
    }
    if (q.t === 'color') { body = `<p>${A.c.q}</p><div class="l-opts">${radios('l-q', A.opts.map(o => [o, o + (res && res.answer === o ? ' ' + mark(res.ok) : '')]), res ? res.answer : null, !!res)}</div>`; sol = solColor(A.c); }
    if (q.t === 'dpk') { body = `<p>${A.text}</p><div class="l-opts">${radios('l-q', [['Có', 'Có'], ['Không', 'Không']].map(([v, t]) => [v, t + (res && res.answer === v ? ' ' + mark(res.ok) : '')]), res ? res.answer : null, !!res)}</div>`; sol = solDpk(q, A); }
    if (NEWQ[q.t]) { body = `<p>${A.text}</p>${A.fig}<div class="l-opts">${radios('l-q', A.opts.map((o, j) => [ABCD[j], `<b>${ABCD[j]}.</b> ${o[0]}` + (res && res.answer === ABCD[j] ? ' ' + mark(res.ok) : '')]), res ? res.answer : null, !!res)}</div>`; sol = A.sol; }
    sol = applyOv(q5Key(q), sol);
    h = `<h3 class="heading">Bước 5 · Đánh giá <span class="caption">(câu ${i + 1}/${ex.q5.length} · 1 điểm)</span></h3>${body}
      ${res ? fb(`Điểm câu này: <b>${fmtPts(res.pts)}/1</b>.`, res.pts >= 0.999) + solBox(sol) : ''}
      <div class="l-actions">${res ? (i === L.s5.i && L.max === 5 ? `<button class="primary" id="l-s5next">${i + 1 < ex.q5.length ? 'Câu tiếp theo' : 'Xem kết quả'}</button>` : '') : '<button class="primary" id="l-s5">Trả lời</button>'}</div>${nav5}`;
  }
  if (n === 6) {
    const sc = score(), body = resultText(), text = body + '\r\nMã kiểm tra: ' + resultCheck(body);
    h = `<div class="l-top"><h3 class="heading" style="margin:0">Kết quả bài học</h3></div><p>${esc(studentLine())}</p>
      <div class="table-wrap"><table class="l-score"><thead><tr><th>Bước 5 – Đánh giá</th><th>Điểm</th></tr></thead><tbody>
      ${ex.q5.map((q, i) => `<tr><td>Câu ${i + 1}: ${Q5_LABEL[q.t]}</td><td>${fmtPts(sc.per[i])}/1</td></tr>`).join('')}
      <tr><td><b>Tổng</b></td><td><b>${fmtPts(sc.total)}/${TOTAL_POINTS}</b></td></tr></tbody></table></div>
      <p class="caption">Nộp kết quả cho giảng viên bằng cách tải tệp hoặc chép đoạn dưới đây (có mã đề và mã kiểm tra; sửa nội dung sẽ làm mã kiểm tra không còn khớp).</p>
      <textarea id="l-result-text" class="l-result" readonly rows="10">${esc(text)}</textarea>
      <div class="l-actions"><button class="primary" id="l-dl">Tải kết quả (.txt)</button><button id="l-copy">Chép kết quả</button><button id="l-again">Làm đề mới</button><button id="l-free">Về phòng thí nghiệm tự do</button></div>`;
  }
  box.innerHTML = (n > 0 ? prog : '') + h;
  bindLesson();
}
function val(id) { const el = $(id); return el ? el.value : ''; }
function numVal(id) { const v = val(id).trim(); return v === '' ? NaN : number(v); }
function radioVal(name) { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? el.value : null; }
function bindLesson() {
  const on = (id, f) => { const el = $(id); if (el) el.onclick = f; };
  [['l-name', 'name'], ['l-cls', 'cls'], ['l-team', 'team'], ['l-msv', 'msv']].forEach(([id, k]) => { const el = $(id); if (el) el.oninput = el.onchange = () => { L.info[k] = el.value.trim(); }; });
  on('l-next', () => goStep(L.step + 1));
  document.querySelectorAll('#lesson-panel [data-go]').forEach(el => { const go = () => goStep(+el.dataset.go); el.onclick = go; el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }; });
  on('l-back', () => goStep(L.max));
  on('l-qprev', () => { L.s5.view = Math.max(0, (L.s5.view ?? L.s5.i) - 1); renderLesson(); });
  on('l-qnext', () => { L.s5.view = (L.s5.view ?? L.s5.i) + 1; renderLesson(); });
  on('l-s4other', () => { L.s4.i = 1 - L.s4.i; goStep(4); });
  on('l-reroll', () => { const I = L.info; L = lessonFresh(newCode()); L.info = I; goStep(0); });
  on('l-s1', () => { const v = radioVal('l-pred'); if (v === null) return alertBox('Hãy chọn một dự đoán.'); L.pred = v; goStep(2); });
  on('l-s2', () => {
    const nIn = numVal('l-n'), vs = [1, 2, 3].map(i => numVal('l-v' + i)).filter(Number.isFinite);
    if (!Number.isFinite(nIn)) return alertBox('Hãy nhập số bước nhảy.');
    const A = exploreAnswer(L.ex), eps = A.obs.map(e => e.Veq);
    L.s2.tries++; L.s2.raw = ['l-n', 'l-v1', 'l-v2', 'l-v3'].map(val);
    const countOK = nIn === eps.length && vs.length === eps.length;
    const volOK = countOK && eps.every(V => vs.some(v => Math.abs(v - V) <= 0.3));
    const predTxt = L.pred !== null ? ` Dự đoán ở bước 1: ${L.pred} bước nhảy, ${L.pred === String(eps.length) ? 'khớp với thí nghiệm.' : 'chưa khớp với thí nghiệm.'}` : '';
    const ans = `Có ${eps.length} bước nhảy quan sát được, tại ${eps.map(v => fmt(v)).join(' mL và ')} mL.`;
    if (volOK) { L.s2.ok = true; L.s2.done = true; L.s2.msg = 'Chính xác. ' + ans + predTxt; }
    else if (L.s2.tries >= 2) { L.s2.done = true; L.s2.msg = 'Chưa đúng. ' + ans + predTxt; }
    else L.s2.msg = !countOK ? 'Chưa đúng số bước nhảy hoặc số thể tích đã nhập (mỗi bước nhảy nhập một thể tích). Gợi ý: chuẩn độ tới khoảng 45 mL và chú ý những chỗ pH đổi đột ngột. Bạn còn 1 lần thử.'
      : 'Số bước nhảy đúng nhưng có thể tích lệch nhiều so với điểm tương đương. Hãy nhỏ từng giọt quanh bước nhảy để đọc chính xác hơn. Bạn còn 1 lần thử.';
    renderLesson();
  });
  on('l-s3b', () => {
    const v = radioVal('l-s3'); if (v === null) return alertBox('Hãy chọn một phương án.');
    const Q = explainQ(L.ex), opt = Q.opts[+v];
    L.s3.tries++; L.s3.pickedIdx = +v;
    if (L.s3.first === null) { L.s3.first = +v; L.s3.firstOK = opt[1]; }
    if (opt[1]) { L.s3.done = true; L.s3.msg = 'Đúng. ' + opt[0]; lessonView({ eqt: true, layers: true, theory: true }); }
    else L.s3.msg = 'Chưa đúng. Hãy đối chiếu với đường cong bạn vừa chuẩn độ và các giá trị pKa rồi chọn lại.';
    renderLesson();
  });
  on('l-addmo', () => { L.s4.mo = true; addIndicator('Da cam methyl'); renderLesson(); });
  on('l-s4', () => {
    const i = L.s4.i, p = L.ex.mix[i], M = MIX_INFO[p.type];
    const raw = ['l-V1', 'l-V2', 'l-c1', 'l-c2'].map(val), [V1, V2, c1, c2] = ['l-V1', 'l-V2', 'l-c1', 'l-c2'].map(numVal);
    const [T1, T2] = mixVolumes(p), k = p.V0 / p.Ct, tol1 = M.two ? Math.max(0.3, 0.05 * T1) : 0.3;
    const okV1 = Number.isFinite(V1) && Math.abs(V1 - T1) <= tol1, okV2 = Number.isFinite(V2) && Math.abs(V2 - T2) <= 0.3;
    const useV1 = Number.isFinite(V1) ? V1 : T1, useV2 = Number.isFinite(V2) ? V2 : T2;
    const [e1, e2] = M.calc(useV1, useV2, k), [t1, t2] = [p.c1, p.c2];
    const okC1 = Number.isFinite(c1) && (relNear(c1, e1, 0.02) || relNear(c1, t1, 0.02)), okC2 = Number.isFinite(c2) && (relNear(c2, e2, 0.02) || relNear(c2, t2, 0.02));
    const ok = [okV1, okV2, okC1, okC2];
    const msgs = [];
    if (!okV1) msgs.push('V₁ chưa đúng: đọc lại thể tích ở lần đổi màu thứ nhất' + (M.two ? ' (lúc dung dịch vừa mất màu hồng).' : '.'));
    if (!okV2) msgs.push('V₂ chưa đúng: đọc lại thể tích ở lần đổi màu thứ hai (V₂ tính từ lúc bắt đầu chuẩn độ).');
    if (!okC1 || !okC2) {
      if (Number.isFinite(c1) && Number.isFinite(c2) && relNear(c1, e2, 0.02) && relNear(c2, e1, 0.02)) msgs.push('Bạn đã hoán đổi nồng độ của hai chất.');
      else {
        if (!okC1) msgs.push(p.type !== 'Na2CO3+NaHCO3' && Number.isFinite(c1) && relNear(c1, useV1 / k, 0.02) ? `C(${M.names[0]}) chưa đúng: đến V₁ không chỉ ${M.names[0]} mà cả ${p.type === 'HCl+H3PO4' ? 'nấc 1 của H₃PO₄' : 'Na₂CO₃ (chuyển thành HCO₃⁻)'} đã phản ứng.` : `C(${M.names[0]}) chưa đúng.`);
        if (!okC2) msgs.push(p.type === 'Na2CO3+NaHCO3' && Number.isFinite(c2) && relNear(c2, (useV2 - useV1) / k, 0.02) ? 'C(NaHCO₃) chưa đúng: từ V₁ đến V₂, HCl chuẩn cả HCO₃⁻ sinh ra từ Na₂CO₃, nên phải trừ thêm phần đó.' : `C(${M.names[1]}) chưa đúng.`);
      }
    }
    L.s4.tries[i]++; if (ok.every(Boolean)) L.s4.ok[i] = true;
    L.s4.last[i] = { raw, ok, msg: ok.every(Boolean) ? 'Đúng cả bốn ô. Bạn có thể xem lời giải chi tiết để đối chiếu.' : msgs.join(' ') + ' Sửa các ô có dấu ✗ rồi bấm Kiểm tra lại.' };
    renderLesson();
  });
  on('l-sol4', () => { const i = L.s4.i; L.s4.showSol[i] = !L.s4.showSol[i]; if (L.s4.showSol[i]) lessonView({ eqt: true, layers: true, theory: true }); renderLesson(); });
  on('l-s4next', () => { if (L.s4.i === 0) { L.s4.i = 1; goStep(4); } else goStep(5); });
  on('l-s5', () => {
    const i = L.s5.i, q = L.ex.q5[i], A = q5Answer(q);
    let res;
    if (q.t === 'ind') {
      const picked = [...document.querySelectorAll('input[name="l-q"]:checked')].map(e => e.value);
      const perOpt = {}; A.opts.forEach(o => { perOpt[o.n] = picked.includes(o.n) === A.correct.includes(o.n); });
      const pts = Object.values(perOpt).filter(Boolean).length / A.opts.length;
      res = { picked, perOpt, pts, answer: picked.join(', ') || '(không chọn)' };
    }
    if (q.t === 'err' || q.t === 'pct') {
      const tp = val('l-qt'), vRaw = val('l-qv'), v = numVal('l-qv');
      if (!tp || !Number.isFinite(v)) return alertBox('Hãy trả lời cả hai ý (a) và (b).');
      const okA = q.t === 'err' ? tp === A.typeName : tp === A.pair;
      const okB = q.t === 'err' ? (relNear(Math.abs(v), A.quick, 0.1) || relNear(Math.abs(v), Math.abs(A.exact), 0.1)) : Math.abs(v - A.val) <= 1.5;
      res = { typePicked: tp, vRaw, okA, okB, pts: (okA ? 0.5 : 0) + (okB ? 0.5 : 0), answer: `${tp}; ${vRaw} %` };
    }
    if (NEWQ[q.t]) {
      const v = radioVal('l-q'); if (v === null) return alertBox('Hãy chọn một phương án.');
      const ok = v === ABCD[A.k]; res = { answer: v, ok, pts: ok ? 1 : 0 };
    }
    if (q.t === 'color' || q.t === 'dpk') {
      const v = radioVal('l-q'); if (v === null) return alertBox('Hãy chọn một phương án.');
      const ok = q.t === 'color' ? v === A.c.ans : (v === 'Có') === A.ok;
      res = { answer: v, ok, pts: ok ? 1 : 0 };
    }
    L.s5.res[i] = res; renderLesson();
  });
  on('l-s5next', () => { if (L.s5.i + 1 < L.ex.q5.length) { L.s5.i++; L.s5.view = L.s5.i; renderLesson(); $('lesson-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); } else goStep(6); });
  on('l-dl', downloadResult);
  on('l-copy', () => copyResult($('l-copy')));
  on('l-again', () => { const I = L.info; L = lessonFresh(newCode()); L.info = I; goStep(0); });
  on('l-free', exitLesson);
}
function alertBox(msg) {
  let el = $('lesson-panel').querySelector('.l-alert');
  if (!el) { el = document.createElement('div'); el.className = 'l-fb bad l-alert'; $('lesson-panel').append(el); }
  el.textContent = msg; setTimeout(() => el && el.remove(), 3000);
}
$('mode-lesson').addEventListener('click', enterLesson);
$('mode-free').addEventListener('click', exitLesson);
