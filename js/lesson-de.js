// BÀI HỌC 5E: sinh đề theo mã đề, đáp án, ký hiệu toán (MathML).
// Các file js/ là script thường (không dùng module), nạp theo thứ tự trong index.html và dùng chung biến toàn cục.

// ===== CHẾ ĐỘ BÀI HỌC (MÔ HÌNH 5E) — ĐỀ NGẪU NHIÊN THEO MÃ ĐỀ, LỜI GIẢI CHI TIẾT =====
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const L_STEPS = ['Gắn kết', 'Khám phá', 'Giải thích', 'Mở rộng', 'Đánh giá'];
const TOTAL_POINTS = 10;
let L = null, savedFree = null;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const relNear = (a, b, rel) => Math.abs(a - b) <= rel * Math.abs(b);
function newCode() { let c = ''; for (let i = 0; i < 6; i++) c += CODE_ABC[Math.floor(Math.random() * 32)]; return c; }
function codeSeed(code) { let h = 2166136261; for (const ch of code) { h ^= CODE_ABC.indexOf(ch) + 1; h = Math.imul(h, 16777619); } return h >>> 0; }
function rngFrom(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
function shuffle(r, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const cStep = (r, lo, hi, st) => +(lo + st * Math.floor(r() * (Math.round((hi - lo) / st) + 1))).toFixed(4);
const comp = (name, C) => { const d = library[name]; return { C, pKa: d.pKa.slice(), zFull: d.zFull, h: d.h, counter: d.counter }; };
const fmtC = c => fmt(c, 4);

// ===== Ký hiệu toán (MathML: trình duyệt hiển thị phân số như Equation trong Word) =====
const MI = x => `<mi>${x}</mi>`, MO = x => `<mo>${x}</mo>`, MT = x => `<mtext>${x}</mtext>`, MN = x => `<mn>${x}</mn>`;
const FR = (a, b) => `<mfrac><mrow>${a}</mrow><mrow>${b}</mrow></mfrac>`;
const SUP = (a, b) => `<msup><mrow>${a}</mrow><mrow>${b}</mrow></msup>`;
const SUB = (a, b) => `<msub><mrow>${a}</mrow><mrow>${b}</mrow></msub>`;
const PR = (...a) => `<mo stretchy="false" lspace="0.1em" rspace="0.05em">(</mo>${a.join('')}<mo stretchy="false" lspace="0.05em" rspace="0.1em">)</mo>`;
const PRS = (...a) => `<mo>(</mo>${a.join('')}<mo>)</mo>`;   // ngoặc co giãn theo phân số
const EQ = (...a) => `<div class="eqline"><math display="block"><mrow>${a.join('')}</mrow></math></div>`;
const IM = (...a) => `<math><mrow>${a.join('')}</mrow></math>`;
const EQS = MO('='), PLUS = MO('+'), MINUS = MO('−'), TIMES = MO('×'), DOT = MO('·'), APPROX = MO('≈');
function decFor(x, sig) { const ax = Math.abs(x); if (ax === 0) return 0; return Math.max(0, Math.min(6, sig - 1 - Math.floor(Math.log10(ax)))); }
function NUM(x, sig = 4) {                 // số → MathML; số rất nhỏ/lớn viết dạng a·10^b
  if (!Number.isFinite(x)) return MN('—');
  const ax = Math.abs(x);
  if (ax === 0) return MN('0');
  if (ax >= 1e-3 && ax < 1e5) return (x < 0 ? MO('−') : '') + MN(fmt(ax, decFor(ax, sig)));
  const e = Math.floor(Math.log10(ax)), m = ax / 10 ** e;
  return (x < 0 ? MO('−') : '') + `<mrow>${MN(fmt(m, sig - 1))}${DOT}${SUP(MN('10'), (e < 0 ? MO('−') : '') + MN(Math.abs(e)))}</mrow>`;
}
const P10 = e => SUP(MN('10'), (e < 0 ? MO('−') : '') + MN(fmt(Math.abs(e), Number.isInteger(e) ? 0 : 2)));   // 10^(−4,73)
const UNIT = u => `<mspace width="0.3em"/><mtext>${u}</mtext>`;
const LG = (...a) => `<mi>lg</mi><mo>&#x2061;</mo>${PRS(...a)}`;
const SP = (t) => MT('[' + t + ']');
const nf = (x, sig = 4) => fmt(x, decFor(x, sig));          // số trong lời văn
const pct = (x, d = 2) => fmt(x, d) + ' %';

// ===== SINH ĐỀ =====
function genExam(code) {
  const r = rngFrom(codeSeed(code));
  const ex = { code };
  const kind = pick(r, ['H3PO4', 'H2C2O4', 'CH3COOH', 'NH3']);
  const C = kind === 'H3PO4' ? cStep(r, 0.06, 0.10, 0.01) : cStep(r, 0.05, 0.10, 0.01);
  ex.explore = { kind, C, V0: 10, Ct: 0.1, order: shuffle(r, [0, 1, 2, 3]) };
  const types = shuffle(r, ['HCl+H3PO4', 'NaOH+Na2CO3', 'Na2CO3+NaHCO3']).slice(0, 2);
  ex.mix = types.map(t => {
    let c1, c2, V0, V2;
    do { c1 = cStep(r, 0.02, 0.08, 0.005); c2 = cStep(r, 0.02, 0.08, 0.005); V0 = pick(r, [10, 20]); V2 = mixVolumes({ type: t, c1, c2, V0, Ct: 0.1 })[1]; } while (V2 > 45);
    return { type: t, c1, c2, V0, Ct: 0.1 };
  });
  const base = ['ind', 'err', 'pct', 'color', 'dpk'].map(t => genQ5(t, r));
  const more = ['conc', 'str', 'pheq', 'sign', 'graph'].map(t => genQ5b(t, r, ex, base));
  const ORDER = ['pheq', 'conc', 'str', 'color', 'sign', 'graph', 'ind', 'dpk', 'err', 'pct'];   // thông hiểu → vận dụng → tính toán
  ex.q5 = ORDER.map(t => [...base, ...more].find(q => q.t === t));
  return ex;
}
function mixVolumes(p) {
  const k = p.V0 / p.Ct;
  if (p.type === 'Na2CO3+NaHCO3') return [p.c1 * k, (2 * p.c1 + p.c2) * k];
  return [(p.c1 + p.c2) * k, (p.c1 + 2 * p.c2) * k];
}
const MIX_INFO = {
  'HCl+H3PO4': { names: ['HCl', 'H₃PO₄'], titrant: 'NaOH', ind: ['Lục bromocresol', 'Phenolphtalein'], two: false,
    hint: 'Đến điểm tương đương 1, HCl và nấc 1 của H₃PO₄ đã bị trung hoà. Từ điểm tương đương 1 đến 2, NaOH phản ứng với H₂PO₄⁻.',
    calc: (V1, V2, k) => [(2 * V1 - V2) / k, (V2 - V1) / k] },
  'NaOH+Na2CO3': { names: ['NaOH', 'Na₂CO₃'], titrant: 'HCl', ind: ['Phenolphtalein'], two: true,
    hint: 'Khi phenolphtalein mất màu: toàn bộ NaOH và 1/2 Na₂CO₃ (tới HCO₃⁻) đã được định lượng. Sau khi thêm da cam methyl, HCl chuẩn nốt HCO₃⁻.',
    calc: (V1, V2, k) => [(2 * V1 - V2) / k, (V2 - V1) / k] },
  'Na2CO3+NaHCO3': { names: ['Na₂CO₃', 'NaHCO₃'], titrant: 'HCl', ind: ['Phenolphtalein'], two: true,
    hint: 'Khi phenolphtalein mất màu: Na₂CO₃ mới chuyển thành NaHCO₃. Sau khi thêm da cam methyl, HCl chuẩn toàn bộ HCO₃⁻ (gồm cả phần sinh ra từ Na₂CO₃).',
    calc: (V1, V2, k) => [V1 / k, (V2 - 2 * V1) / k] }
};
function mixComps(p) {
  if (p.type === 'HCl+H3PO4') return [comp('HCl', p.c1), comp('H3PO4', p.c2)];
  if (p.type === 'NaOH+Na2CO3') return [comp('NaOH', p.c1), comp('Na2CO3', p.c2)];
  return [comp('Na2CO3', p.c1), comp('NaHCO3', p.c2)];
}
const IND_SYS = [
  { id: 'acoh', label: 'chuẩn độ CH₃COOH 0,1 M bằng NaOH 0,1 M', an: ['CH3COOH', 0.1], ti: ['NaOH', 0.1], ep: 0, s: 0.001 },
  { id: 'nh3', label: 'chuẩn độ NH₃ 0,1 M bằng HCl 0,1 M', an: ['NH3', 0.1], ti: ['HCl', 0.1], ep: 0, s: 0.001 },
  { id: 'hcl001', label: 'chuẩn độ HCl 0,01 M bằng NaOH 0,01 M', an: ['HCl', 0.01], ti: ['NaOH', 0.01], ep: 0, s: 0.001 },
  { id: 'na2co3', label: 'định lượng Na₂CO₃ 0,05 M bằng HCl 0,1 M đến điểm tương đương 2', an: ['Na2CO3', 0.05], ti: ['HCl', 0.1], ep: 'last', s: 0.01 },
  { id: 'h3po4a', label: 'chuẩn độ H₃PO₄ 0,1 M bằng NaOH 0,1 M đến điểm tương đương 1', an: ['H3PO4', 0.1], ti: ['NaOH', 0.1], ep: 0, s: 0.01 },
  { id: 'h3po4b', label: 'chuẩn độ H₃PO₄ 0,1 M bằng NaOH 0,1 M đến điểm tương đương 2', an: ['H3PO4', 0.1], ti: ['NaOH', 0.1], ep: 1, s: 0.01 }
];
const ERR_TYPES = ['Sai số hydro', 'Sai số hydroxyl', 'Sai số acid HA', 'Sai số base B'];
// an/ti: chất trong bình nón / trên buret; pT; pHtd: pH tại điểm tương đương ; type: chỉ số trong ERR_TYPES
const ERR_CASES = [
  { id: 'naoh-dcm', an: 'NaOH', ti: 'HCl', ind: 'da cam methyl', pT: 4, type: 0 },
  { id: 'naoh-pp', an: 'NaOH', ti: 'HCl', ind: 'phenolphtalein', pT: 9, type: 1 },
  { id: 'hcl-dcm', an: 'HCl', ti: 'NaOH', ind: 'da cam methyl', pT: 4, type: 0 },
  { id: 'acoh-dcm', an: 'CH3COOH', ti: 'NaOH', ind: 'da cam methyl', pT: 4, type: 2 },
  { id: 'acoh-pp', an: 'CH3COOH', ti: 'NaOH', ind: 'phenolphtalein', pT: 9, type: 1 },
  { id: 'nh3-pp', an: 'NH3', ti: 'HCl', ind: 'phenolphtalein', pT: 9, type: 3 },
  { id: 'nh3-dcm', an: 'NH3', ti: 'HCl', ind: 'da cam methyl', pT: 4, type: 0 }
];
const NAME = { NaOH: 'NaOH', HCl: 'HCl', CH3COOH: 'CH₃COOH', NH3: 'NH₃' };
const COLOR_CASES = [
  { id: 'tashiro-before', q: 'Chuẩn độ NH₃ bằng HCl với chỉ thị hỗn hợp Tashiro (3 giọt đỏ methyl + 1 giọt xanh methylen). Lúc chưa tới điểm tương đương (pH ≈ 7), dung dịch có màu gì?', ans: 'Lục', opts: ['Lục', 'Tím', 'Vàng', 'Không màu'], pH: 7, ind: 'Đỏ methyl', pk: 5.0, acid: 'đỏ', base: 'vàng', mix: 'Xanh methylen không đổi màu theo pH, luôn cho màu xanh. Vàng (đỏ methyl) + xanh (xanh methylen) → <b>lục</b>.' },
  { id: 'tashiro-after', q: 'Chuẩn độ NH₃ bằng HCl với chỉ thị hỗn hợp Tashiro (3 giọt đỏ methyl + 1 giọt xanh methylen). Khi đã qua điểm tương đương (pH ≈ 4), dung dịch có màu gì?', ans: 'Tím', opts: ['Tím', 'Lục', 'Đỏ', 'Không màu'], pH: 4, ind: 'Đỏ methyl', pk: 5.0, acid: 'đỏ', base: 'vàng', mix: 'Xanh methylen luôn cho màu xanh. Đỏ (đỏ methyl) + xanh (xanh methylen) → <b>tím</b>.' },
  { id: 'bcgpp', q: 'Chuẩn độ H₃PO₄ bằng NaOH, bình nón chứa đồng thời lục bromocresol và phenolphtalein. Ngay sau điểm tương đương 2 (pH ≈ 9,7), dung dịch có màu gì?', ans: 'Tím', opts: ['Tím', 'Xanh dương', 'Hồng', 'Không màu'], pH: 9.7, two: [['Lục bromocresol', 4.7, 'vàng', 'xanh'], ['Phenolphtalein', 9.4, 'không màu', 'hồng']], mix: 'Xanh (lục bromocresol) + hồng (phenolphtalein) cùng hấp thụ ánh sáng nên mắt thấy <b>tím</b>.' },
  { id: 'warder', q: 'Định lượng hỗn hợp NaOH + Na₂CO₃ bằng HCl: chuẩn đến khi phenolphtalein vừa mất màu hồng (pH ≈ 8,3) rồi thêm da cam methyl. Ngay sau khi thêm da cam methyl, dung dịch có màu gì?', ans: 'Vàng', opts: ['Vàng', 'Hồng', 'Da cam đỏ', 'Không màu'], pH: 8.3, two: [['Phenolphtalein', 9.4, 'không màu', 'hồng'], ['Da cam methyl', 3.46, 'hồng', 'vàng']], mix: 'Phenolphtalein gần như không màu, da cam methyl ở dạng vàng → dung dịch <b>vàng</b>; chuẩn tiếp đến khi chuyển sang da cam.' }
];
function genQ5(t, r) {
  if (t === 'ind') { const sys = pick(r, IND_SYS); return { t, sys: sys.id, pool: shuffle(r, Object.keys(indicatorLibrary).filter(n => indicatorLibrary[n].ranges.length === 1)) }; }
  if (t === 'err') return { t, case: pick(r, ERR_CASES).id, C: pick(r, [0.1, 0.05]), order: shuffle(r, [0, 1, 2, 3]) };
  if (t === 'pct') { if (r() < 0.5) return { t, sys: 'H3PO4', pH: pick(r, [6.5, 7.0, 7.5, 8.0]), order: shuffle(r, [0, 1, 2]) };
    return { t, sys: 'Na2CO3', pH: pick(r, [10.2, 9.8, 7.0, 6.5]), order: shuffle(r, [0, 1]) }; }
  if (t === 'color') return { t, case: pick(r, COLOR_CASES).id, order: shuffle(r, [0, 1, 2, 3]) };
  const a = cStep(r, 2.0, 5.0, 0.5), d = pick(r, [2.5, 3, 3.5, 4.5, 5, 6.5]), lim = pick(r, [1, 0.1]);
  return { t: 'dpk', a, b: +(a + d).toFixed(2), lim };
}

// ===== ĐÁP ÁN (tính lại từ đề) =====
const BOOK = false;                                 // dil = false: bỏ qua pha loãng
function epInfo(an, ti, V0) {
  const eps = equivalencePoints(V0, an, ti);
  return eps.map((e, i) => {
    const d = e.Veq - (i ? eps[i - 1].Veq : 0);
    const a = solvePH(e.Veq - 0.01 * d, V0, an, ti, BOOK), b = solvePH(e.Veq + 0.01 * d, V0, an, ti, BOOK);
    return { Veq: e.Veq, dV: d, pH: solvePH(e.Veq, V0, an, ti, BOOK), w: Math.abs(b - a) };
  });
}
function exploreAnswer(ex) {
  const E = ex.explore, an = [comp(E.kind, E.C)], ti = [comp(E.kind === 'NH3' ? 'HCl' : 'NaOH', E.Ct)];
  const eps = epInfo(an, ti, E.V0);
  return { an, ti, eps, obs: eps.filter(e => e.w >= UNOBSERVED_JUMP_THRESHOLD && e.Veq <= 50) };
}
function explainQ(ex) {
  const A = exploreAnswer(ex), k = ex.explore.kind;
  let q, opts;
  if (k === 'H3PO4') {
    q = `Vì sao không quan sát được bước nhảy ở điểm tương đương 3 (≈ ${fmt(A.eps[2].Veq)} mL)?`;
    opts = [['pKa₃ ≈ 12,4 quá lớn (nấc 3 quá yếu): gần điểm tương đương 3, pH do OH⁻ dư quyết định nên đường cong gần như không đổi độ dốc.', true],
      ['H₃PO₄ thực chất chỉ có 2 nấc phân li.', false], ['Nồng độ NaOH quá thấp nên không phản ứng với nấc 3.', false], ['Dung dịch bị pha loãng quá nhiều nên mất bước nhảy.', false]];
  } else if (k === 'H2C2O4') {
    q = `Acid oxalic có 2 nấc nhưng chỉ quan sát được 1 bước nhảy (≈ ${fmt(A.obs[0].Veq)} mL). Vì sao?`;
    opts = [['pKa₁ = 1,25 và pKa₂ = 4,27 chênh nhau chưa tới 4 đơn vị, nên hai nấc bị chuẩn độ đồng thời; chỉ thấy bước nhảy khi cả hai nấc đã được trung hoà.', true],
      ['Nấc 1 là acid mạnh nên không bao giờ có bước nhảy.', false], ['Acid oxalic bị phân huỷ khi gặp NaOH.', false], ['Bước nhảy thứ nhất bị màu chỉ thị che mất.', false]];
  } else if (k === 'CH3COOH') {
    q = `Vì sao pH tại điểm tương đương lớn hơn 7 (≈ ${fmt(A.obs[0].pH)})?`;
    opts = [['Tại điểm tương đương dung dịch chứa CH₃COO⁻, là base liên hợp của acid yếu, nên có tính base.', true],
      ['Tại điểm tương đương NaOH đã dư.', false], ['CH₃COOH chưa phản ứng hết tại điểm tương đương.', false], ['CO₂ trong không khí làm tăng pH.', false]];
  } else {
    q = `Vì sao pH tại điểm tương đương nhỏ hơn 7 (≈ ${fmt(A.obs[0].pH)})?`;
    opts = [['Tại điểm tương đương dung dịch chứa NH₄⁺, là acid liên hợp của base yếu NH₃, nên có tính acid.', true],
      ['Tại điểm tương đương HCl đã dư.', false], ['NH₃ bay hơi hết khỏi dung dịch.', false], ['Chỉ thị làm giảm pH của dung dịch.', false]];
  }
  return { q, opts: ex.explore.order.map(i => opts[i]) };
}
function indRate(name, L0, U0) {
  const d = indicatorLibrary[name], [a, b] = d.ranges[0], pT = d.pT;
  return (a >= L0 && b <= U0) ? 'Tốt' : (pT >= L0 && pT <= U0) ? 'Chấp nhận' : 'Không phù hợp';
}
function q5Answer(q) {
  if (NEWQ[q.t]) return newqAnswer(q);
  if (q.t === 'ind') {
    const S = IND_SYS.find(x => x.id === q.sys), an = [comp(S.an[0], S.an[1])], ti = [comp(S.ti[0], S.ti[1])];
    const all = epInfo(an, ti, 10), obs = all.filter(e => e.w >= UNOBSERVED_JUMP_THRESHOLD);
    const ep = S.ep === 'last' ? obs[obs.length - 1] : obs[S.ep];
    const x = [solvePH(ep.Veq - S.s * ep.dV, 10, an, ti, BOOK), solvePH(ep.Veq + S.s * ep.dV, 10, an, ti, BOOK)];
    const info = { L: Math.min(...x), U: Math.max(...x), pH: ep.pH, ep, an, ti };
    const rated = q.pool.map(n => ({ n, r: indRate(n, info.L, info.U) }));
    const good = rated.filter(o => o.r !== 'Không phù hợp'), bad = rated.filter(o => o.r === 'Không phù hợp');
    const opts = [...good.slice(0, 2), ...bad.slice(0, 5 - Math.min(2, good.length))].sort((p, r2) => q.pool.indexOf(p.n) - q.pool.indexOf(r2.n));
    return { S, info, opts, correct: opts.filter(o => o.r !== 'Không phù hợp').map(o => o.n) };
  }
  if (q.t === 'err') {
    const c = ERR_CASES.find(x => x.id === q.case), C = q.C;
    const an = [comp(c.an, C)], ti = [comp(c.ti, C)], Veq = 10;
    const Vend = volumeAtPH(c.pT, 10, an, ti, true);                       // đại số đầy đủ, có pha loãng
    const exact = (Vend - Veq) / Veq * 100;
    const h = 10 ** -c.pT, oh = 10 ** -(14 - c.pT);
    let quick;
    if (c.type === 0) quick = h * 2 / C * 100;
    else if (c.type === 1) quick = oh * 2 / C * 100;
    else if (c.type === 2) quick = h / (10 ** -4.73 + h) * 100;
    else quick = oh / (10 ** -4.75 + oh) * 100;
    const text = `Định lượng ${NAME[c.an]} ${fmt(C, 2)} N bằng ${NAME[c.ti]} ${fmt(C, 2)} N, chỉ thị ${c.ind} (pT = ${c.pT})` +
      (c.an === 'CH3COOH' ? ', biết pKa(CH₃COOH) = 4,73' : c.an === 'NH3' ? ', biết pKa(NH₄⁺) = 9,25' : '');
    return { c, C, text, quick, exact, Vend, h, oh, typeName: ERR_TYPES[c.type], typeOpts: q.order.map(i => ERR_TYPES[i]) };
  }
  if (q.t === 'pct') {
    if (q.sys === 'H3PO4') {
      const an = [comp('H3PO4', 0.1)], ti = [comp('NaOH', 0.1)], V = volumeAtPH(q.pH, 10, an, ti, BOOK);
      const pairs = ['H₃PO₄ / H₂PO₄⁻', 'H₂PO₄⁻ / HPO₄²⁻', 'HPO₄²⁻ / PO₄³⁻'];
      return { text: `Chuẩn độ H₃PO₄ 0,1 M bằng NaOH 0,1 M (pKa₁ = 2,15; pKa₂ = 7,20; pKa₃ = 12,4). Kết thúc chuẩn độ ở pH = ${fmt(q.pH, 1)}. (a) Lúc đó dung dịch là hệ đệm của cặp nào? (b) Đã định lượng được bao nhiêu % so với khi định lượng hoàn toàn cả 3 chức acid? (Không kể sự thay đổi thể tích.)`,
        val: V / 30 * 100, pairs: q.order.map(i => pairs[i]), pair: pairs[1] };
    }
    const an = [comp('Na2CO3', 0.1)], ti = [comp('HCl', 0.1)], V = volumeAtPH(q.pH, 20, an, ti, BOOK);
    const pairs = ['CO₃²⁻ / HCO₃⁻', 'HCO₃⁻ / H₂CO₃'];
    return { text: `Chuẩn độ 20,00 mL Na₂CO₃ 0,1 M bằng HCl 0,1 M (H₂CO₃: pKa₁ = 6,35; pKa₂ = 10,33). Dừng chuẩn độ khi dung dịch có pH = ${fmt(q.pH, 1)}. (a) Lúc đó dung dịch là hệ đệm của cặp nào? (b) Đã dùng bao nhiêu % lượng HCl cần để định lượng hết cả 2 nấc? (Không kể sự thay đổi thể tích.)`,
      val: V / 40 * 100, pairs: q.order.map(i => pairs[i]), pair: q.pH > 8.34 ? pairs[0] : pairs[1] };
  }
  if (q.t === 'color') { const c = COLOR_CASES.find(x => x.id === q.case); return { c, opts: q.order.map(i => c.opts[i]) }; }
  const need = q.lim === 1 ? 4 : 6;
  return { text: `Acid hai nấc H₂A có pKa₁ = ${fmt(q.a, 2)}, pKa₂ = ${fmt(q.b, 2)}. Có thể định lượng riêng nấc 1 với sai số ≤ ${q.lim === 1 ? '1' : '0,1'} % không?`, ok: q.b - q.a >= need, need };
}
