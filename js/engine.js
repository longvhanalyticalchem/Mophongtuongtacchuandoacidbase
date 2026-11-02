// ENGINE: tính pH bằng bảo toàn điện tích, điểm tương đương, màu chỉ thị.
// Các file js/ là script thường (không dùng module), nạp theo thứ tự trong index.html và dùng chung biến toàn cục.

const KW = 1e-14, LN10 = Math.LN10;
const UNOBSERVED_JUMP_THRESHOLD = 0.2;   // bước nhảy ±1 % hẹp hơn 0,2 pH: không quan sát được
const CLEAR_JUMP = 0.5;                   // 0,2–0,5 pH: bước nhảy nhỏ, khó quan sát
// Thành phần: { C, pKa:[tăng dần], zFull, h, counter: 'inert' | 'water' }
// counter 'inert': ion đối trơ (Na+, K+, Cl-, NO3-...). counter 'water': ion đối là OH- (nếu dạng đưa vào mang điện dương) hoặc H+ (nếu mang điện âm), thuộc cân bằng của nước.
function alphas(H, pKa) {
  const n = pKa.length, logH = Math.log(H), logs = []; let cum = 0;
  for (let j = 0; j <= n; j++) { if (j > 0) cum += -pKa[j - 1] * LN10; logs.push((n - j) * logH + cum); }
  const m = Math.max(...logs), ex = logs.map(l => Math.exp(l - m)), s = ex.reduce((a, b) => a + b, 0);
  return ex.map(e => e / s);
}
function chargePerC(H, comp) {
  const n = comp.pKa.length, a = alphas(H, comp.pKa); let z = 0;
  for (let j = 0; j <= n; j++) z += a[j] * (comp.zFull - j);
  const q0 = comp.zFull - (n - comp.h);
  return comp.counter === 'water' ? z : z - q0;
}
function chargeOf(H, comps) { return comps.reduce((s, c) => s + c.C * chargePerC(H, c), 0); }
// Bảo toàn điện tích sau khi trộn V0 mL dung dịch bình nón với V mL dung dịch buret
// dil = true: tính có pha loãng (chính xác); dil = false: bỏ qua pha loãng
function dilOn() { try { return state.noDil === false; } catch (e) { return true; } }
function f(pH, V, V0, analyte, titrant, dil = dilOn()) {
  const H = Math.pow(10, -pH);
  return H - KW / H + (V0 * chargeOf(H, analyte) + V * chargeOf(H, titrant)) / (dil ? V0 + V : V0);
}
function solvePH(V, V0, analyte, titrant, dil = dilOn()) {
  let lo = -2, hi = 16;
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(mid, V, V0, analyte, titrant, dil) > 0) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
function phAlone(comps) { return solvePH(0, 1, comps, []); }
function volumeAtPH(pH, V0, analyte, titrant, dil = dilOn()) {
  const H = Math.pow(10, -pH), W = H - KW / H;
  return dil ? -V0 * (W + chargeOf(H, analyte)) / (W + chargeOf(H, titrant)) : -V0 * (W + chargeOf(H, analyte)) / chargeOf(H, titrant);
}
// Liệt kê “vị trí proton” của một dung dịch: filled = proton có thể cho; empty = chỗ có thể nhận proton
// H+ đi kèm (counter 'water', dạng mang điện âm) là vị trí đã có proton với pKa 0 (H3O+/H2O);
// OH- đi kèm (counter 'water', dạng mang điện dương) là vị trí trống với pKa 14 (H2O/OH-).
function sites(comps) {
  const filled = [], empty = [];
  comps.forEach((c, ci) => {
    const n = c.pKa.length, q0 = c.zFull - (n - c.h);
    for (let k = n - c.h; k < n; k++) filled.push({ pKa: c.pKa[k], C: c.C, comp: ci, step: k + 1 });
    for (let k = 0; k < n - c.h; k++) empty.push({ pKa: c.pKa[k], C: c.C, comp: ci, step: k + 1 });
    if (c.counter === 'water' && q0 < 0) for (let i = 0; i < -q0; i++) filled.push({ pKa: 0, C: c.C, comp: ci, step: 'H+' });
    if (c.counter === 'water' && q0 > 0) for (let i = 0; i < q0; i++) empty.push({ pKa: 14, C: c.C, comp: ci, step: 'OH-' });
  });
  return { filled, empty };
}
// Điểm tương đương tổng quát
// Chiều phản ứng: pH dung dịch buret > pH dung dịch bình nón → chất chuẩn đóng vai base (nhận proton), ngược lại là acid.
// Chất chuẩn là base: proton của chất phân tích bị lấy lần lượt theo pKa tăng dần. Tại ĐTĐ thứ k (biên = pKa của vị trí thứ k),
//   mỗi mol chất chuẩn nhận số proton = số vị trí trống của nó có pKa > biên.
// Chất chuẩn là acid: đối xứng (vị trí trống của chất phân tích theo pKa giảm dần; vị trí có proton của chất chuẩn có pKa < biên).
function equivalencePoints(V0, analyte, titrant) {
  const base = phAlone(titrant) > phAlone(analyte);
  const A = sites(analyte), T = sites(titrant);
  const list = base ? A.filled.sort((a, b) => a.pKa - b.pKa) : A.empty.sort((a, b) => b.pKa - a.pKa);
  let cum = 0; const out = [];
  list.forEach(s => {
    cum += s.C;
    const cap = (base ? T.empty.filter(t => t.pKa > s.pKa) : T.filled.filter(t => t.pKa < s.pKa)).reduce((x, t) => x + t.C, 0);
    if (cap > 0) out.push({ ...s, Veq: V0 * cum / cap, titrantRole: base ? 'base' : 'acid' });
  });
  return out;
}
function jump(Veq, V0, analyte, titrant, tol = 0.001) {
  return Math.abs(solvePH(Veq * (1 + tol), V0, analyte, titrant) - solvePH(Veq * (1 - tol), V0, analyte, titrant));
}
function titrationError(pT, Veq, V0, analyte, titrant) {
  const Vend = volumeAtPH(pT, V0, analyte, titrant, true); return { Vend, q: (Vend - Veq) / Veq * 100 };
}
function indicatorColor(pH, ind) {
  const a = alphas(Math.pow(10, -pH), ind.pKa), absorb = [0, 0, 0];
  ind.colors.forEach((hex, j) => { const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    rgb.forEach((t, c) => { absorb[c] += a[j] * -Math.log10(Math.max(t, 0.02)); }); });
  return '#' + absorb.map(A => Math.round(255 * Math.pow(10, -A)).toString(16).padStart(2, '0')).join('');
}
function mixColor(pH, inds) {
  const absorb = [0, 0, 0];
  inds.forEach(ind => {
    const a = alphas(Math.pow(10, -pH), ind.pKa), w = ind.w ?? 1;
    ind.colors.forEach((hex, j) => {
      const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
      rgb.forEach((t, c) => { absorb[c] += w * a[j] * -Math.log10(Math.max(t, 0.02)); });
    });
  });
  return '#' + absorb.map(A => Math.round(255 * Math.pow(10, -A)).toString(16).padStart(2, '0')).join('');
}
