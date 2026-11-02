// BÀI HỌC 5E: lời giải chi tiết các câu tính toán (bước 4, bước 5).
// Các file js/ là script thường (không dùng module), nạp theo thứ tự trong index.html và dùng chung biến toàn cục.

// ===== LỜI GIẢI CHI TIẾT =====
const H = t => `<h5 class="sol-h">${t}</h5>`;
function solMix(p) {
  const M = MIX_INFO[p.type], [V1, V2] = mixVolumes(p), C = p.Ct, V0 = p.V0, T = M.titrant;
  const nT = (v) => SUB(MI('n'), MT(T)), cT = SUB(MI('C'), MT(T));
  let h = H('Phân tích đề') + `<p>Gọi C(${T}) = ${fmtC(C)} M là nồng độ dung dịch chuẩn, V₀ = ${fmt(V0, 2)} mL là thể tích hỗn hợp đem chuẩn độ. Đọc trên buret: <b>V₁ = ${fmt(V1)} mL</b>, <b>V₂ = ${fmt(V2)} mL</b> (V₂ tính từ lúc bắt đầu). Nhớ: số milimol = nồng độ (mol/L) × thể tích (mL).</p>`;
  if (p.type === 'HCl+H3PO4') {
    h += `<p><b>Giai đoạn 1</b> (từ 0 đến V₁, lục bromocresol đổi màu): HCl + NaOH → NaCl + H₂O và H₃PO₄ + NaOH → NaH₂PO₄ + H₂O.<br>
      <b>Giai đoạn 2</b> (từ V₁ đến V₂, phenolphtalein đổi màu): NaH₂PO₄ + NaOH → Na₂HPO₄ + H₂O.</p>` + H('Lập phương trình') +
      `<p>Lượng NaOH ở giai đoạn 2 chỉ phản ứng với H₂PO₄⁻, mà số mol H₂PO₄⁻ đúng bằng số mol H₃PO₄ ban đầu:</p>` +
      EQ(SUB(MI('n'), MT('H₃PO₄')), EQS, cT, DOT, PR(SUB(MI('V'), MN(2)), MINUS, SUB(MI('V'), MN(1))), EQS, NUM(C), TIMES, PR(MN(fmt(V2, 2)), MINUS, MN(fmt(V1, 2))), EQS, NUM(C * (V2 - V1)), UNIT('mmol')) +
      EQ(MI('C'), PR(MT('H₃PO₄')), EQS, FR(SUB(MI('n'), MT('H₃PO₄')), SUB(MI('V'), MN(0))), EQS, FR(NUM(C * (V2 - V1)), MN(fmt(V0, 2))), EQS, `<mrow><mn>${fmtC(p.c2)}</mn></mrow>`, UNIT('M')) +
      `<p>Lượng NaOH ở giai đoạn 1 trung hoà cả HCl và nấc 1 của H₃PO₄:</p>` +
      EQ(cT, DOT, SUB(MI('V'), MN(1)), EQS, SUB(MI('n'), MT('HCl')), PLUS, SUB(MI('n'), MT('H₃PO₄')), MO('⇒'), SUB(MI('n'), MT('HCl')), EQS, NUM(C), TIMES, MN(fmt(V1, 2)), MINUS, NUM(C * (V2 - V1)), EQS, NUM(C * (2 * V1 - V2)), UNIT('mmol')) +
      EQ(MI('C'), PR(MT('HCl')), EQS, FR(NUM(C * (2 * V1 - V2)), MN(fmt(V0, 2))), EQS, MN(fmtC(p.c1)), UNIT('M')) +
      `<p>Gộp lại thành công thức tổng quát:</p>` + EQ(MI('C'), PR(MT('HCl')), EQS, FR(cT + DOT + PR(MN(2), SUB(MI('V'), MN(1)), MINUS, SUB(MI('V'), MN(2))), SUB(MI('V'), MN(0))), MO(';'), MO('&#x2003;'), MI('C'), PR(MT('H₃PO₄')), EQS, FR(cT + DOT + PR(SUB(MI('V'), MN(2)), MINUS, SUB(MI('V'), MN(1))), SUB(MI('V'), MN(0))));
  } else if (p.type === 'NaOH+Na2CO3') {
    h += `<p><b>Giai đoạn 1</b> (từ 0 đến V₁, phenolphtalein mất màu hồng): NaOH + HCl → NaCl + H₂O và Na₂CO₃ + HCl → NaHCO₃ + NaCl.<br>
      <b>Giai đoạn 2</b> (từ V₁ đến V₂, da cam methyl chuyển vàng → da cam): NaHCO₃ + HCl → NaCl + CO₂ + H₂O.</p>` + H('Lập phương trình') +
      `<p>NaHCO₃ chuẩn ở giai đoạn 2 đều sinh ra từ Na₂CO₃ ở giai đoạn 1, nên số mol bằng số mol Na₂CO₃ ban đầu:</p>` +
      EQ(SUB(MI('n'), MT('Na₂CO₃')), EQS, cT, DOT, PR(SUB(MI('V'), MN(2)), MINUS, SUB(MI('V'), MN(1))), EQS, NUM(C), TIMES, PR(MN(fmt(V2, 2)), MINUS, MN(fmt(V1, 2))), EQS, NUM(C * (V2 - V1)), UNIT('mmol')) +
      EQ(MI('C'), PR(MT('Na₂CO₃')), EQS, FR(NUM(C * (V2 - V1)), MN(fmt(V0, 2))), EQS, MN(fmtC(p.c2)), UNIT('M')) +
      `<p>HCl ở giai đoạn 1 trung hoà toàn bộ NaOH và chuyển Na₂CO₃ thành NaHCO₃ (1 nấc):</p>` +
      EQ(cT, DOT, SUB(MI('V'), MN(1)), EQS, SUB(MI('n'), MT('NaOH')), PLUS, SUB(MI('n'), MT('Na₂CO₃')), MO('⇒'), SUB(MI('n'), MT('NaOH')), EQS, NUM(C), TIMES, MN(fmt(V1, 2)), MINUS, NUM(C * (V2 - V1)), EQS, NUM(C * (2 * V1 - V2)), UNIT('mmol')) +
      EQ(MI('C'), PR(MT('NaOH')), EQS, FR(NUM(C * (2 * V1 - V2)), MN(fmt(V0, 2))), EQS, MN(fmtC(p.c1)), UNIT('M'));
  } else {
    h += `<p><b>Giai đoạn 1</b> (từ 0 đến V₁, phenolphtalein mất màu hồng): Na₂CO₃ + HCl → NaHCO₃ + NaCl. NaHCO₃ có sẵn chưa phản ứng.<br>
      <b>Giai đoạn 2</b> (từ V₁ đến V₂, da cam methyl đổi màu): toàn bộ HCO₃⁻ (có sẵn + sinh ra từ Na₂CO₃) + HCl → CO₂ + H₂O.</p>` + H('Lập phương trình') +
      EQ(SUB(MI('n'), MT('Na₂CO₃')), EQS, cT, DOT, SUB(MI('V'), MN(1)), EQS, NUM(C), TIMES, MN(fmt(V1, 2)), EQS, NUM(C * V1), UNIT('mmol')) +
      EQ(MI('C'), PR(MT('Na₂CO₃')), EQS, FR(NUM(C * V1), MN(fmt(V0, 2))), EQS, MN(fmtC(p.c1)), UNIT('M')) +
      `<p>Ở giai đoạn 2, HCl chuẩn cả NaHCO₃ có sẵn lẫn NaHCO₃ sinh ra từ Na₂CO₃:</p>` +
      EQ(cT, DOT, PR(SUB(MI('V'), MN(2)), MINUS, SUB(MI('V'), MN(1))), EQS, SUB(MI('n'), MT('NaHCO₃')), PLUS, SUB(MI('n'), MT('Na₂CO₃')), MO('⇒'), SUB(MI('n'), MT('NaHCO₃')), EQS, NUM(C), TIMES, PR(MN(fmt(V2, 2)), MINUS, MN(fmt(V1, 2))), MINUS, NUM(C * V1), EQS, NUM(C * (V2 - 2 * V1)), UNIT('mmol')) +
      EQ(MI('C'), PR(MT('NaHCO₃')), EQS, FR(NUM(C * (V2 - 2 * V1)), MN(fmt(V0, 2))), EQS, MN(fmtC(p.c2)), UNIT('M'));
  }
  return h;
}
// Cách 2 chung: phương trình bảo toàn điện tích, viết chữ, cho hệ trong bài
function solErr(A) {
  const c = A.c, C = A.C, h = A.h, oh = A.oh, pHtd = { NaOH: 7, HCl: 7, CH3COOH: 8.87, NH3: 5.12 }[c.an];
  const excess = c.type === 0 ? 'HCl (acid mạnh)' : c.type === 1 ? 'NaOH (base mạnh)' : c.type === 2 ? 'CH₃COOH chưa chuẩn (acid yếu)' : 'NH₃ chưa chuẩn (base yếu)';
  let s = H('Phân tích đề') + `<p>(1) pH tại điểm tương đương ≈ ${fmt(pHtd, 2)}. So sánh: pT = ${c.pT} ${c.pT < pHtd ? '<' : '>'} ${fmt(pHtd, 2)} nên lúc kết thúc dung dịch còn <b>${c.pT < pHtd ? 'acid' : 'base'}</b>.<br>
    (2) Chất còn lại là <b>${excess}</b> → dùng <b>${A.typeName}</b>.</p>`;
  s += H('Cách 1: công thức tính nhanh');
  const V = SUB(MI('V'), MI('T'));
  if (c.type === 0 || c.type === 1) {
    const ion = c.type === 0 ? SUP(MI('H'), MO('+')) : SUP(MI('OH'), MO('−'));
    const pw = c.type === 0 ? P10(-c.pT) : SUP(MN('10'), MO('−') + PR(MN(14), MINUS, MN(c.pT)));
    s += EQ(SUB(MI('SS'), ion), MT('(%)'), EQS, FR(pw + DOT + V, MI('N') + DOT + MI('V')), TIMES, MN(100)) +
      `<p>Trong đó: ${c.type === 0 ? IM(P10(-c.pT)) + ' là [H⁺] tại pH = pT' : IM(SUP(MN('10'), MO('−') + PR(MN(14), MINUS, MN(c.pT))), EQS, P10(-(14 - c.pT))) + ' là [OH⁻] tại pH = pT'};
      N = ${fmt(C, 2)} là nồng độ dung dịch đem định lượng; V là thể tích đem định lượng; V<sub>T</sub> là thể tích lúc kết thúc. Hai dung dịch cùng nồng độ nên thể tích chất chuẩn ≈ V, do đó ${IM(V, APPROX, MN(2), MI('V'), MO('⇒'), FR(V, MI('V')), EQS, MN(2))}.</p>` +
      EQ(SUB(MI('SS'), ion), EQS, FR((c.type === 0 ? P10(-c.pT) : P10(-(14 - c.pT))) + TIMES + MN(2), NUM(C)), TIMES, MN(100), EQS, `<mrow><mn>${fmt(A.quick, A.quick < 1 ? 3 : 2)}</mn><mo>%</mo></mrow>`);
  } else {
    const isA = c.type === 2, pk = isA ? 4.73 : 4.75;
    const x = isA ? P10(-c.pT) : P10(-(14 - c.pT)), xv = isA ? h : oh;
    s += isA
      ? `<p>Dừng ở pH = pT thì một phần CH₃COOH chưa phản ứng. Tỉ lệ CH₃COOH chưa chuẩn so với lượng ban đầu bằng ${IM(FR(SP('HA'), SP('HA') + PLUS + SUP(SP('A'), MO('−'))), EQS, FR(MI('h'), SUB(MI('k'), MI('a')) + PLUS + MI('h')))} với h = [H⁺] = ${IM(SUP(MN('10'), MO('−') + MI('pT')))}.</p>` +
        EQ(MI('SS'), MT('(%)'), EQS, FR(P10(-c.pT), P10(-pk) + PLUS + P10(-c.pT)), TIMES, MN(100))
      : `<p>Dừng ở pH = pT thì một phần NH₃ chưa phản ứng. Với base B, dùng oh = [OH⁻] = ${IM(SUP(MN('10'), MO('−') + PR(MN(14), MINUS, MI('pT'))))} và pk<sub>b</sub> = 14 − pKa(NH₄⁺) = 14 − 9,25 = 4,75.</p>` +
        EQ(MI('SS'), MT('(%)'), EQS, FR(SUP(MN('10'), MO('−') + PR(MN(14), MINUS, MN(c.pT))), P10(-pk) + PLUS + SUP(MN('10'), MO('−') + PR(MN(14), MINUS, MN(c.pT)))), TIMES, MN(100));
    s += `<p>Thay số: ${IM(P10(-pk), EQS, NUM(10 ** -pk))} (bấm máy 10^(−${fmt(pk, 2)})), ${IM(x, EQS, NUM(xv))}.</p>` +
      EQ(MI('SS'), EQS, FR(NUM(xv), NUM(10 ** -pk) + PLUS + NUM(xv)), TIMES, MN(100), EQS, FR(NUM(xv), NUM(10 ** -pk + xv)), TIMES, MN(100), APPROX, `<mrow><mn>${fmt(A.quick, 1)}</mn><mo>%</mo></mrow>`);
  }
  // Cách 2
  s += H('Cách 2: đại số đầy đủ (bảo toàn khối lượng + bảo toàn điện tích, có kể pha loãng)');
  const Vx = SUB(MI('V'), MI('x')), V0 = SUB(MI('V'), MN(0)), Cm = MI('C'), hm = MI('h'), ohm = MI('oh');
  const VV = PR(V0, PLUS, Vx), conc = (coef, v) => FR((coef ? coef + DOT : '') + Cm + DOT + v, V0 + PLUS + Vx);
  s += `<p>Gọi V₀ = 10,00 mL là thể tích ${NAME[c.an]} đem chuẩn, V<sub>x</sub> là thể tích ${NAME[c.ti]} đã thêm lúc dừng (pH = pT = ${c.pT}). Hai dung dịch cùng nồng độ C = ${fmt(C, 2)} M nên thể tích tương đương V<sub>tđ</sub> = V₀ = 10,00 mL. Tại pH = ${c.pT}: h = [H⁺] = ${IM(NUM(h))} M; oh = [OH⁻] = ${IM(NUM(oh))} M.</p>`;
  // cat: ion dương (vế trái), an: ion âm (vế phải) trong phương trình bảo toàn điện tích
  let cat, an, coefCat = '', coefAn = '', vCat, vAn, gA, gB, num, den, pre = '';
  if (c.an === 'NaOH') { cat = 'Na⁺'; an = 'Cl⁻'; vCat = V0; vAn = Vx; gA = [Cm, MINUS, hm, PLUS, ohm]; gB = [Cm, PLUS, hm, MINUS, ohm]; num = C + h - oh; den = C - h + oh; }
  else if (c.an === 'HCl') { cat = 'Na⁺'; an = 'Cl⁻'; vCat = Vx; vAn = V0; gA = [Cm, PLUS, hm, MINUS, ohm]; gB = [Cm, MINUS, hm, PLUS, ohm]; num = C - h + oh; den = C + h - oh; }
  else if (c.an === 'CH3COOH') {
    const ka = 10 ** -4.73, a1 = ka / (ka + h), al = SUB(MI('α'), MT('A⁻'));
    cat = 'Na⁺'; an = 'CH₃COO⁻'; vCat = Vx; vAn = V0; coefAn = al; gA = [Cm, PLUS, hm, MINUS, ohm]; gB = [Cm, DOT, al, MINUS, hm, PLUS, ohm]; num = C * a1 - h + oh; den = C + h - oh;
    pre = `<p>Acid yếu CH₃COOH chỉ có một phần ở dạng ion CH₃COO⁻. Phần đó (phân số mol α) tính theo h và k<sub>a</sub> = ${IM(P10(-4.73))}:</p>` +
      EQ(al, EQS, FR(SUB(MI('k'), MI('a')), SUB(MI('k'), MI('a')) + PLUS + hm), EQS, FR(NUM(ka), NUM(ka) + PLUS + NUM(h)), EQS, NUM(a1, 6)) +
      `<p>(α<sub>A⁻</sub> ${a1 > 0.5 ? 'gần 1: hầu hết acid đã chuyển thành acetat' : 'nhỏ: phần lớn CH₃COOH chưa phản ứng'}.)</p>`;
  } else {
    const ka = 10 ** -9.25, b = h / (h + ka), al = SUB(MI('α'), MT('NH₄⁺'));
    cat = 'NH₄⁺'; an = 'Cl⁻'; vCat = V0; vAn = Vx; coefCat = al; gA = [Cm, MINUS, hm, PLUS, ohm]; gB = [Cm, DOT, al, PLUS, hm, MINUS, ohm]; num = C * b + h - oh; den = C - h + oh;
    pre = `<p>Base yếu NH₃ chỉ có một phần đã chuyển thành NH₄⁺. Phần đó (phân số mol α) tính theo h và k<sub>a</sub>(NH₄⁺) = ${IM(P10(-9.25))}:</p>` +
      EQ(al, EQS, FR(hm, hm + PLUS + SUB(MI('k'), MI('a'))), EQS, FR(NUM(h), NUM(h) + PLUS + NUM(ka)), EQS, NUM(b, 6));
  }
  s += pre + `<p><b>Bước 1, bảo toàn khối lượng.</b> Sau khi trộn, thể tích dung dịch là (V₀ + V<sub>x</sub>), nên nồng độ mỗi ion bằng số mmol chia cho thể tích đó:</p>` +
    EQ(SP(cat), EQS, conc(coefCat, vCat), MO(';'), MO('&#x2003;'), SP(an), EQS, conc(coefAn, vAn)) +
    `<p><b>Bước 2, bảo toàn điện tích</b> (tổng điện tích dương = tổng điện tích âm):</p>` + EQ(SP(cat), PLUS, SP('H⁺'), EQS, SP(an), PLUS, SP('OH⁻')) +
    `<p><b>Bước 3, thay nồng độ ở bước 1 vào</b> (với [H⁺] = h, [OH⁻] = oh):</p>` +
    EQ(conc(coefCat, vCat), PLUS, hm, EQS, conc(coefAn, vAn), PLUS, ohm) +
    `<p><b>Bước 4, nhân hai vế với (V₀ + V<sub>x</sub>)</b> để bỏ mẫu số:</p>` +
    EQ((coefCat ? coefCat + DOT : '') + Cm + DOT + vCat, PLUS, hm, DOT, VV, EQS, (coefAn ? coefAn + DOT : '') + Cm + DOT + vAn, PLUS, ohm, DOT, VV) +
    `<p><b>Bước 5, phá ngoặc, đưa các số hạng chứa V<sub>x</sub> về vế trái, các số hạng chứa V₀ về vế phải</b>, rồi đặt V<sub>x</sub>, V₀ làm thừa số chung:</p>` +
    EQ(Vx, DOT, PR(...gA), EQS, V0, DOT, PR(...gB)) +
    `<p><b>Bước 6, chia hai vế cho (${c.an === 'NaOH' || c.an === 'NH3' ? 'C − h + oh' : 'C + h − oh'})</b> được công thức tính thể tích lúc dừng:</p>` +
    EQ(Vx, EQS, V0, DOT, FR(gB.join(''), gA.join('')));
  const Vxv = 10 * num / den;
  s += `<p><b>Bước 7, thay số</b> (C = ${fmt(C, 2)}; h = ${IM(NUM(h))}; oh = ${IM(NUM(oh))}; V₀ = 10,00):</p>` + EQ(Vx, EQS, MN('10,00'), TIMES, FR(NUM(num, 8), NUM(den, 8)), EQS, NUM(Vxv, 7), UNIT('mL')) +
    `<p><b>Bước 8, tính sai số:</b> so sánh thể tích chất chuẩn đã dùng (V<sub>x</sub>) với thể tích cần đến điểm tương đương (V<sub>tđ</sub>):</p>` +
    EQ(MI('SS'), MT('(%)'), EQS, FR(Vx + MINUS + SUB(MI('V'), MT('tđ')), SUB(MI('V'), MT('tđ'))), TIMES, MN(100), EQS, FR(NUM(Vxv, 7) + MINUS + MN('10,00'), MN('10,00')), TIMES, MN(100), EQS, `<mrow><mn>${(A.exact < 0 ? '−' : '+') + fmt(Math.abs(A.exact), Math.abs(A.exact) < 1 ? 3 : 2)}</mn><mo>%</mo></mrow>`) +
    `<p>Dấu ${A.exact < 0 ? '"−" nghĩa là dừng sớm (chưa đủ chất chuẩn)' : '"+" nghĩa là đã cho dư chất chuẩn'}. Độ lớn sai số ≈ ${fmt(Math.abs(A.exact), Math.abs(A.exact) < 1 ? 3 : 2)} %.</p>`;
  return s;
}
function solPct(q, A) {
  const pH = q.pH, h = 10 ** -pH, oh = 10 ** -(14 - pH);
  let s = '';
  if (q.sys === 'H3PO4') {
    const k = [10 ** -2.15, 10 ** -7.2, 10 ** -12.4], r = 10 ** (pH - 7.2), f = r / (1 + r);
    s += H('Phân tích đề') + `<p>pH tại điểm tương đương 1 ≈ 4,7 và tại điểm tương đương 2 ≈ 9,7. pH = ${fmt(pH, 1)} nằm giữa hai điểm này: <b>nấc 1 đã chuẩn xong, nấc 2 đang chuẩn dở</b>. Dung dịch lúc này là hệ đệm <b>H₂PO₄⁻ / HPO₄²⁻</b> với pKa₂ = 7,20.</p>`;
    s += H('Cách 1: công thức tính nhanh (phương trình hệ đệm)') +
      EQ(MI('pH'), EQS, SUB(MI('pKa'), MN(2)), PLUS, LG(FR(SP('HPO₄²⁻'), SP('H₂PO₄⁻')))) +
      `<p><b>Bước 1, tìm tỉ số hai dạng.</b> Thay pH = ${fmt(pH, 1)} và pKa₂ = 7,20:</p>` +
      EQ(MN(fmt(pH, 1)), EQS, MN('7,20'), PLUS, LG(FR(SP('HPO₄²⁻'), SP('H₂PO₄⁻'))), MO('⇒'), FR(SP('HPO₄²⁻'), SP('H₂PO₄⁻')), EQS, SUP(MN('10'), PR(MN(fmt(pH, 1)), MINUS, MN('7,20'))), EQS, NUM(r)) +
      `<p>(bấm máy: 10^(${fmt(pH, 1)} − 7,20) = ${nf(r)}). Nghĩa là cứ ${nf(r)} phần HPO₄²⁻ thì có 1 phần H₂PO₄⁻.</p>` +
      `<p><b>Bước 2, phần nấc 2 đã được chuẩn.</b> Lượng H₃PO₄ ban đầu (sau nấc 1) chia thành hai phần H₂PO₄⁻ và HPO₄²⁻. Phần đã chuyển thành HPO₄²⁻ chính là phần nấc 2 đã được NaOH trung hoà:</p>` +
      EQ(MT('phần nấc 2 đã chuẩn'), EQS, FR(SP('HPO₄²⁻'), SP('H₂PO₄⁻') + PLUS + SP('HPO₄²⁻')), EQS, FR(NUM(r), MN(1) + PLUS + NUM(r)), EQS, NUM(f)) +
      `<p>(chia cả tử và mẫu cho [H₂PO₄⁻] để dùng được tỉ số ở bước 1).</p>` +
      `<p><b>Bước 3, số proton đã bị lấy đi.</b> Mỗi phân tử H₃PO₄ đã mất trọn 1 proton ở nấc 1 và thêm ${nf(f)} proton ở nấc 2:</p>` +
      EQ(MT('số proton đã lấy đi trên 1 H₃PO₄'), EQS, MN(1), PLUS, NUM(f), EQS, NUM(1 + f)) +
      `<p><b>Bước 4, so với cả 3 chức.</b> Định lượng hoàn toàn cả 3 chức thì mỗi H₃PO₄ mất 3 proton, nên:</p>` +
      EQ(MT('% đã định lượng'), EQS, FR(NUM(1 + f), MN(3)), TIMES, MN(100), APPROX, `<mrow><mn>${fmt((1 + f) / 3 * 100, 1)}</mn><mo>%</mo></mrow>`);
    const D = h ** 3 + k[0] * h * h + k[0] * k[1] * h + k[0] * k[1] * k[2];
    const t = [h ** 3, k[0] * h * h, k[0] * k[1] * h, k[0] * k[1] * k[2]], al = t.map(x => x / D), nb = al[1] + 2 * al[2] + 3 * al[3] + (oh - h) / 0.1;
    s += H('Cách 2: đại số đầy đủ (không bỏ qua dạng nào)') +
      `<p><b>Bước 1, tỉ lệ các dạng của H₃PO₄ (phân số mol α).</b> Ở một pH xác định, H₃PO₄ tồn tại đồng thời ở 4 dạng. Phần (α) của mỗi dạng tính từ h = [H⁺] và các hằng số k₁, k₂, k₃:</p>` +
      EQ(SUB(MI('α'), MT('H₃PO₄')), EQS, FR(SUP(MI('h'), MN(3)), MI('D')), MO(';'), MO('&#x2003;'), SUB(MI('α'), MT('H₂PO₄⁻')), EQS, FR(SUB(MI('k'), MN(1)) + SUP(MI('h'), MN(2)), MI('D')), MO(';'), MO('&#x2003;'), SUB(MI('α'), MT('HPO₄²⁻')), EQS, FR(SUB(MI('k'), MN(1)) + SUB(MI('k'), MN(2)) + MI('h'), MI('D')), MO(';'), MO('&#x2003;'), SUB(MI('α'), MT('PO₄³⁻')), EQS, FR(SUB(MI('k'), MN(1)) + SUB(MI('k'), MN(2)) + SUB(MI('k'), MN(3)), MI('D'))) +
      EQ(MI('D'), EQS, SUP(MI('h'), MN(3)), PLUS, SUB(MI('k'), MN(1)), SUP(MI('h'), MN(2)), PLUS, SUB(MI('k'), MN(1)), SUB(MI('k'), MN(2)), MI('h'), PLUS, SUB(MI('k'), MN(1)), SUB(MI('k'), MN(2)), SUB(MI('k'), MN(3))) +
      `<p>Thay số: h = ${IM(P10(-pH), EQS, NUM(h))}; k₁ = ${IM(P10(-2.15), EQS, NUM(k[0]))}; k₂ = ${IM(P10(-7.2), EQS, NUM(k[1]))}; k₃ = ${IM(P10(-12.4), EQS, NUM(k[2]))}.</p>` +
      EQ(MI('D'), EQS, NUM(t[0]), PLUS, NUM(t[1]), PLUS, NUM(t[2]), PLUS, NUM(t[3]), EQS, NUM(D)) +
      `<p>Chia từng số hạng cho D: α(H₃PO₄) = ${IM(NUM(al[0]))}; α(H₂PO₄⁻) = ${IM(NUM(al[1]))}; α(HPO₄²⁻) = ${IM(NUM(al[2]))}; α(PO₄³⁻) = ${IM(NUM(al[3]))}.</p>` +
      `<p><b>Bước 2, bảo toàn điện tích</b> (không kể pha loãng, mọi nồng độ tính theo thể tích ban đầu; C = 0,1 M):</p>` +
      EQ(SP('Na⁺'), PLUS, SP('H⁺'), EQS, SP('OH⁻'), PLUS, MI('C'), PR(SUB(MI('α'), MT('H₂PO₄⁻')), PLUS, MN(2), SUB(MI('α'), MT('HPO₄²⁻')), PLUS, MN(3), SUB(MI('α'), MT('PO₄³⁻')))) +
      `<p>[Na⁺] chính là lượng NaOH đã thêm. Chia hai vế cho C để được số mol NaOH đã dùng trên 1 mol H₃PO₄:</p>` +
      EQ(FR(SUB(MI('n'), MT('NaOH')), SUB(MI('n'), MT('H₃PO₄'))), EQS, SUB(MI('α'), MT('H₂PO₄⁻')), PLUS, MN(2), SUB(MI('α'), MT('HPO₄²⁻')), PLUS, MN(3), SUB(MI('α'), MT('PO₄³⁻')), PLUS, FR(SP('OH⁻') + MINUS + SP('H⁺'), MI('C'))) +
      EQ(MO(''), EQS, NUM(al[1], 5), PLUS, MN(2), TIMES, NUM(al[2], 5), PLUS, MN(3), TIMES, NUM(al[3]), PLUS, FR(NUM(oh) + MINUS + NUM(h), MN('0,1')), EQS, NUM(nb, 5)) +
      EQ(MT('% đã định lượng'), EQS, FR(NUM(nb, 5), MN(3)), TIMES, MN(100), APPROX, `<mrow><mn>${fmt(A.val, 2)}</mn><mo>%</mo></mrow>`);
  } else {
    const k1 = 10 ** -6.35, k2 = 10 ** -10.33, high = pH > 8.34;
    s += H('Phân tích đề') + `<p>pH tại điểm tương đương 1 ≈ 8,34 (dung dịch NaHCO₃) và tại điểm tương đương 2 ≈ 3,7–3,9. pH = ${fmt(pH, 1)} ${high ? 'lớn hơn 8,34: <b>đang ở nấc 1</b>, CO₃²⁻ mới chuyển một phần thành HCO₃⁻. Dung dịch là hệ đệm <b>CO₃²⁻ / HCO₃⁻</b> (pKa₂ = 10,33)' : 'nằm giữa hai điểm tương đương: <b>nấc 1 đã xong, nấc 2 đang chuẩn dở</b>. Dung dịch là hệ đệm <b>HCO₃⁻ / H₂CO₃</b> (pKa₁ = 6,35)'}.</p>`;
    if (high) {
      const r = 10 ** (pH - 10.33), f = 1 / (1 + r);
      s += H('Cách 1: công thức tính nhanh (phương trình hệ đệm)') +
        EQ(MI('pH'), EQS, SUB(MI('pKa'), MN(2)), PLUS, LG(FR(SP('CO₃²⁻'), SP('HCO₃⁻')))) +
        EQ(FR(SP('CO₃²⁻'), SP('HCO₃⁻')), EQS, SUP(MN('10'), PR(MN(fmt(pH, 1)), MINUS, MN('10,33'))), EQS, NUM(r)) +
        `<p>(bấm máy 10^(${fmt(pH, 1)} − 10,33)). <b>Phần Na₂CO₃ đã chuyển thành HCO₃⁻</b> (mỗi phần này đã nhận 1 H⁺ từ HCl):</p>` +
        EQ(FR(SP('HCO₃⁻'), SP('CO₃²⁻') + PLUS + SP('HCO₃⁻')), EQS, FR(MN(1), NUM(r) + PLUS + MN(1)), EQS, NUM(f)) +
        `<p>Vậy số mol HCl đã dùng trên 1 mol Na₂CO₃ là ${nf(f)}. Định lượng hết cả 2 nấc cần 2 mol HCl cho 1 mol Na₂CO₃:</p>` +
        EQ(MT('% HCl đã dùng'), EQS, FR(NUM(f), MN(2)), TIMES, MN(100), APPROX, `<mrow><mn>${fmt(f / 2 * 100, 1)}</mn><mo>%</mo></mrow>`);
    } else {
      const r = 10 ** (pH - 6.35), f = 1 / (1 + r);
      s += H('Cách 1: công thức tính nhanh (phương trình hệ đệm)') +
        EQ(MI('pH'), EQS, SUB(MI('pKa'), MN(1)), PLUS, LG(FR(SP('HCO₃⁻'), SP('H₂CO₃')))) +
        EQ(FR(SP('HCO₃⁻'), SP('H₂CO₃')), EQS, SUP(MN('10'), PR(MN(fmt(pH, 1)), MINUS, MN('6,35'))), EQS, NUM(r)) +
        `<p>(bấm máy 10^(${fmt(pH, 1)} − 6,35)). <b>Phần đã chuyển tiếp thành H₂CO₃</b> (đã nhận thêm H⁺ thứ hai):</p>` +
        EQ(FR(SP('H₂CO₃'), SP('HCO₃⁻') + PLUS + SP('H₂CO₃')), EQS, FR(MN(1), NUM(r) + PLUS + MN(1)), EQS, NUM(f)) +
        `<p>Mỗi Na₂CO₃ đã nhận trọn 1 H⁺ ở nấc 1 và thêm ${nf(f)} H⁺ ở nấc 2:</p>` +
        EQ(MT('số mol HCl trên 1 mol Na₂CO₃'), EQS, MN(1), PLUS, NUM(f), EQS, NUM(1 + f)) +
        EQ(MT('% HCl đã dùng'), EQS, FR(NUM(1 + f), MN(2)), TIMES, MN(100), APPROX, `<mrow><mn>${fmt((1 + f) / 2 * 100, 1)}</mn><mo>%</mo></mrow>`);
    }
    const D = h * h + k1 * h + k1 * k2, t = [h * h, k1 * h, k1 * k2], al = t.map(x => x / D), nb = 2 * al[0] + al[1] + (h - oh) / 0.1;
    s += H('Cách 2: đại số đầy đủ (không bỏ qua dạng nào)') +
      `<p><b>Bước 1, tỉ lệ các dạng carbonat</b> từ h = [H⁺], k₁, k₂:</p>` +
      EQ(SUB(MI('α'), MT('H₂CO₃')), EQS, FR(SUP(MI('h'), MN(2)), MI('D')), MO(';'), MO('&#x2003;'), SUB(MI('α'), MT('HCO₃⁻')), EQS, FR(SUB(MI('k'), MN(1)) + MI('h'), MI('D')), MO(';'), MO('&#x2003;'), SUB(MI('α'), MT('CO₃²⁻')), EQS, FR(SUB(MI('k'), MN(1)) + SUB(MI('k'), MN(2)), MI('D')), MO(';'), MO('&#x2003;'), MI('D'), EQS, SUP(MI('h'), MN(2)), PLUS, SUB(MI('k'), MN(1)), MI('h'), PLUS, SUB(MI('k'), MN(1)), SUB(MI('k'), MN(2))) +
      `<p>Thay số: h = ${IM(P10(-pH), EQS, NUM(h))}; k₁ = ${IM(P10(-6.35), EQS, NUM(k1))}; k₂ = ${IM(P10(-10.33), EQS, NUM(k2))}.</p>` +
      EQ(MI('D'), EQS, NUM(t[0]), PLUS, NUM(t[1]), PLUS, NUM(t[2]), EQS, NUM(D)) +
      `<p>α(H₂CO₃) = ${IM(NUM(al[0]))}; α(HCO₃⁻) = ${IM(NUM(al[1]))}; α(CO₃²⁻) = ${IM(NUM(al[2]))}.</p>` +
      `<p><b>Bước 2, bảo toàn điện tích</b> (không kể pha loãng; C = 0,1 M; [Na⁺] = 2C; [Cl⁻] là lượng HCl đã thêm):</p>` +
      EQ(SP('Na⁺'), PLUS, SP('H⁺'), EQS, SP('OH⁻'), PLUS, SP('Cl⁻'), PLUS, MI('C'), PR(SUB(MI('α'), MT('HCO₃⁻')), PLUS, MN(2), SUB(MI('α'), MT('CO₃²⁻')))) +
      `<p>Thay [Na⁺] = 2C, chia hai vế cho C và dùng α(H₂CO₃) + α(HCO₃⁻) + α(CO₃²⁻) = 1:</p>` +
      EQ(FR(SUB(MI('n'), MT('HCl')), SUB(MI('n'), MT('Na₂CO₃'))), EQS, MN(2), SUB(MI('α'), MT('H₂CO₃')), PLUS, SUB(MI('α'), MT('HCO₃⁻')), PLUS, FR(SP('H⁺') + MINUS + SP('OH⁻'), MI('C'))) +
      EQ(MO(''), EQS, MN(2), TIMES, NUM(al[0], 5), PLUS, NUM(al[1], 5), PLUS, FR(NUM(h) + MINUS + NUM(oh), MN('0,1')), EQS, NUM(nb, 5)) +
      EQ(MT('% HCl đã dùng'), EQS, FR(NUM(nb, 5), MN(2)), TIMES, MN(100), APPROX, `<mrow><mn>${fmt(A.val, 2)}</mn><mo>%</mo></mrow>`);
  }
  return s;
}
function cbInd(A) {
  const S = A.S, ep = A.info.ep, s = S.s, Ca = S.an[1], Ct = S.ti[1], h = MI('h'), C = MI('C'), Kw = SUB(MI('K'), MI('w'));
  const k = i => SUB(MI('k'), MN(i)), ka = SUB(MI('k'), MI('a')), ohT = FR(Kw, h);
  const tIon = S.ti[0] === 'HCl' ? 'Cl⁻' : 'Na⁺';
  let eq, note;
  if (S.id === 'acoh') { eq = EQ(SP('Na⁺'), PLUS, h, EQS, C, DOT, FR(ka, ka + PLUS + h), PLUS, ohT); note = `C = ${fmt(Ca, 2)} M là nồng độ CH₃COOH; k<sub>a</sub> = ${IM(P10(-4.73))}`; }
  else if (S.id === 'nh3') { eq = EQ(C, DOT, FR(h, h + PLUS + ka), PLUS, h, EQS, SP('Cl⁻'), PLUS, ohT); note = `C = ${fmt(Ca, 2)} M là nồng độ NH₃; k<sub>a</sub>(NH₄⁺) = ${IM(P10(-9.25))}`; }
  else if (S.id === 'hcl001') { eq = EQ(SP('Na⁺'), PLUS, h, EQS, C, PLUS, ohT); note = `C = ${fmt(Ca, 2)} M là nồng độ HCl (= [Cl⁻])`; }
  else if (S.id === 'na2co3') { eq = EQ(MN(2), C, PLUS, h, EQS, SP('Cl⁻'), PLUS, ohT, PLUS, C, DOT, FR(k(1) + h + PLUS + MN(2) + k(1) + k(2), SUP(h, MN(2)) + PLUS + k(1) + h + PLUS + k(1) + k(2))); note = `C = ${fmt(Ca, 2)} M là nồng độ Na₂CO₃ ([Na⁺] = 2C); k₁ = ${IM(P10(-6.35))}, k₂ = ${IM(P10(-10.33))}`; }
  else { eq = EQ(SP('Na⁺'), PLUS, h, EQS, ohT, PLUS, C, DOT, FR(k(1) + SUP(h, MN(2)) + PLUS + MN(2) + k(1) + k(2) + h + PLUS + MN(3) + k(1) + k(2) + k(3), SUP(h, MN(3)) + PLUS + k(1) + SUP(h, MN(2)) + PLUS + k(1) + k(2) + h + PLUS + k(1) + k(2) + k(3))); note = `C = ${fmt(Ca, 2)} M là nồng độ H₃PO₄; k₁ = ${IM(P10(-2.15))}, k₂ = ${IM(P10(-7.2))}, k₃ = ${IM(P10(-12.4))}`; }
  const pts = [-1, 1].map(sg => { const V = ep.Veq + sg * s * ep.dV; return { sg, V, c: Ct * V / 10, pH: solvePH(V, 10, A.info.an, A.info.ti, BOOK) }; });
  const pc = sg => fmt(100 + sg * s * 100, s === 0.01 ? 0 : 1);
  return `<p>Phương trình bảo toàn điện tích của dung dịch (h = [H⁺], [OH⁻] = K<sub>w</sub>/h; ion của các dạng acid–base viết bằng phân số mol α như câu tính %):</p>` + eq +
    `<p>Trong đó ${note}; [${tIon}] là lượng ${S.ti[0]} đã thêm. Lượng chất chuẩn của giai đoạn này là ΔV = ${fmt(ep.dV)} mL (từ điểm tương đương trước đến điểm này), nên:</p>` +
    pts.map(p => EQ(MT(`Ở ${pc(p.sg)} %:`), '<mspace width="0.6em"/>', MI('V'), EQS, NUM(ep.Veq), (p.sg < 0 ? MINUS : PLUS), MN(fmt(s, s === 0.01 ? 2 : 3)), TIMES, NUM(ep.dV), EQS, NUM(p.V), UNIT('mL'), MO('⇒'), SP(tIon), EQS, FR(NUM(Ct) + TIMES + NUM(p.V), MN('10,00')), EQS, NUM(p.c), UNIT('M'))).join('') +
    `<p>Thay vào phương trình trên được một phương trình một ẩn h. Phương trình bậc cao này không giải tay được dễ dàng, nên giải bằng cách thử dần (chia đôi khoảng pH) trên máy tính; mô phỏng này làm đúng như vậy:</p>`;
}
function solInd(A) {
  const S = A.S, s = S.s, sp = s === 0.01 ? '1' : '0,1', lo = 100 - s * 100, hi = 100 + s * 100, lo_ = fmt(lo, s === 0.01 ? 0 : 1), hi_ = fmt(hi, s === 0.01 ? 0 : 1), ss = fmt(s * 100, s === 0.01 ? 0 : 1);
  let t = E1 + H('Phân tích đề') + `<p><b>Bước nhảy pH</b> là khoảng pH khi lượng chất chuẩn của giai đoạn đang xét đạt từ ${lo_} % đến ${hi_} % lượng cần thiết (sai số ± ${sp} %). Chỉ thị dùng được khi khoảng đổi màu nằm trong bước nhảy (<b>Tốt</b>), hoặc ít nhất pT nằm trong bước nhảy (<b>Chấp nhận</b>). Cần tính pH ở hai đầu.</p>`;
  t += H('Cách 1: công thức tính nhanh (bỏ qua pha loãng)');
  const q1 = [];
  if (S.id === 'acoh') {
    const a = 4.73 + Math.log10(lo / (s * 100)), b = 14 + Math.log10(s * 0.1);
    t += `<p><b>Ở ${lo_} %:</b> còn ${ss} % CH₃COOH, đã tạo ${lo_} % CH₃COO⁻ → hệ đệm:</p>` + EQ(MI('pH'), EQS, MN('4,73'), PLUS, LG(FR(MN(lo_), MN(ss))), EQS, NUM(a)) +
      `<p><b>Ở ${hi_} %:</b> NaOH dư ${ss} % → [OH⁻] = ${ss} % × 0,1 = ${IM(NUM(s * 0.1))} M:</p>` + EQ(MI('pH'), EQS, MN(14), PLUS, LG(NUM(s * 0.1)), EQS, NUM(b)); q1.push(a, b);
  } else if (S.id === 'nh3') {
    const a = 9.25 + Math.log10(s * 100 / lo), b = -Math.log10(s * 0.1);
    t += `<p><b>Ở ${lo_} %:</b> còn ${ss} % NH₃, đã tạo ${lo_} % NH₄⁺ → hệ đệm (pKa NH₄⁺ = 9,25):</p>` + EQ(MI('pH'), EQS, MN('9,25'), PLUS, LG(FR(MN(ss), MN(lo_))), EQS, NUM(a)) +
      `<p><b>Ở ${hi_} %:</b> HCl dư ${ss} % → [H⁺] = ${IM(NUM(s * 0.1))} M:</p>` + EQ(MI('pH'), EQS, MO('−'), LG(NUM(s * 0.1)), EQS, NUM(b)); q1.push(b, a);
  } else if (S.id === 'hcl001') {
    const a = -Math.log10(s * 0.01), b = 14 + Math.log10(s * 0.01);
    t += `<p><b>Ở ${lo_} %:</b> còn ${ss} % HCl → [H⁺] = ${ss} % × 0,01 = ${IM(NUM(s * 0.01))} M:</p>` + EQ(MI('pH'), EQS, MO('−'), LG(NUM(s * 0.01)), EQS, NUM(a)) +
      `<p><b>Ở ${hi_} %:</b> NaOH dư → [OH⁻] = ${IM(NUM(s * 0.01))} M:</p>` + EQ(MI('pH'), EQS, MN(14), PLUS, LG(NUM(s * 0.01)), EQS, NUM(b)); q1.push(a, b);
  } else if (S.id === 'na2co3') {
    const a = 6.35 + Math.log10(1 / 99), b = -Math.log10(0.01 * 0.05);
    t += `<p>Xét riêng nấc 2 (HCO₃⁻ → H₂CO₃). <b>Ở 99 %:</b> còn 1 % HCO₃⁻, đã tạo 99 % H₂CO₃ → hệ đệm (pKa₁ = 6,35):</p>` + EQ(MI('pH'), EQS, MN('6,35'), PLUS, LG(FR(MN(1), MN(99))), EQS, NUM(a)) +
      `<p><b>Ở 101 %:</b> HCl dư 1 % lượng cần cho nấc 2; lượng đó bằng 1 % số mol Na₂CO₃ → [H⁺] = 0,01 × 0,05 = ${IM(NUM(0.0005))} M:</p>` + EQ(MI('pH'), EQS, MO('−'), LG(NUM(0.0005)), EQS, NUM(b)); q1.push(b, a);
  } else if (S.id === 'h3po4a') {
    const a = 2.15 + Math.log10(99), b = 7.2 + Math.log10(1 / 99);
    t += `<p><b>Ở 99 % nấc 1:</b> hệ đệm H₃PO₄ / H₂PO₄⁻ (pKa₁ = 2,15):</p>` + EQ(MI('pH'), EQS, MN('2,15'), PLUS, LG(FR(MN(99), MN(1))), EQS, NUM(a)) +
      `<p><b>Ở 101 %:</b> đã sang 1 % nấc 2, hệ đệm H₂PO₄⁻ / HPO₄²⁻ (pKa₂ = 7,20):</p>` + EQ(MI('pH'), EQS, MN('7,20'), PLUS, LG(FR(MN(1), MN(99))), EQS, NUM(b)); q1.push(a, b);
  } else {
    const a = 7.2 + Math.log10(99), b = 12.4 + Math.log10(1 / 99);
    t += `<p><b>Ở 99 % nấc 2:</b> hệ đệm H₂PO₄⁻ / HPO₄²⁻ (pKa₂ = 7,20):</p>` + EQ(MI('pH'), EQS, MN('7,20'), PLUS, LG(FR(MN(99), MN(1))), EQS, NUM(a)) +
      `<p><b>Ở 101 %:</b> đã sang 1 % nấc 3, hệ đệm HPO₄²⁻ / PO₄³⁻ (pKa₃ = 12,4):</p>` + EQ(MI('pH'), EQS, MN('12,4'), PLUS, LG(FR(MN(1), MN(99))), EQS, NUM(b)); q1.push(a, b);
  }
  t += `<p>→ Bước nhảy theo cách 1: <b>${fmt(Math.min(...q1))} – ${fmt(Math.max(...q1))}</b>.</p>`;
  t += H('Cách 2: đại số đầy đủ (bảo toàn điện tích, bỏ qua pha loãng)') +
    cbInd(A, lo_, hi_) +
    `<p>pH ở ${lo_} % = <b>${fmt(A.info[S.ti[0] === 'HCl' ? 'U' : 'L'])}</b>; pH ở ${hi_} % = <b>${fmt(A.info[S.ti[0] === 'HCl' ? 'L' : 'U'])}</b>; pH tại điểm tương đương = ${fmt(A.info.pH)}. → Bước nhảy: <b>${fmt(A.info.L)} – ${fmt(A.info.U)}</b>.</p>` +
    E2 + H('So khoảng đổi màu với bước nhảy (theo cách 2)') +
    '<ul class="sol-list">' + A.opts.map(o => { const d = indicatorLibrary[o.n]; return `<li><b>${o.n}</b>: khoảng đổi màu ${fmt(d.ranges[0][0], 1)}–${fmt(d.ranges[0][1], 1)}, pT ${fmt(d.pT, 1)} → ${o.r === 'Tốt' ? 'cả khoảng đổi màu nằm trong bước nhảy: <b>Tốt</b>' : o.r === 'Chấp nhận' ? 'chỉ pT nằm trong bước nhảy: <b>Chấp nhận</b>' : 'pT nằm ngoài bước nhảy: <b>Không phù hợp</b>'}.</li>`; }).join('') + '</ul>';
  return t;
}
function solColor(c) {
  const ratio = (pk, pH) => 10 ** (pk - pH);
  let s = H('Phân tích') + `<p>Màu của mỗi chỉ thị phụ thuộc tỉ số hai dạng: ${IM(FR(SP('HInd'), SP('Ind⁻')), EQS, SUP(MN('10'), SUB(MI('pk'), MI('HInd')) + MINUS + MI('pH')))}. Mắt thấy màu dạng acid khi tỉ số ≥ 10, màu dạng base khi tỉ số ≤ 1/10.</p>`;
  const list = c.two || [[c.ind, c.pk, c.acid, c.base]];
  list.forEach(([n, pk, ac, bs]) => {
    const r = ratio(pk, c.pH);
    s += EQ(MT(n + ': '), FR(SP('HInd'), SP('Ind⁻')), EQS, SUP(MN('10'), PR(MN(fmt(pk, 2)), MINUS, MN(fmt(c.pH, 1)))), EQS, NUM(r)) +
      `<p>→ ${r >= 10 ? `tỉ số ≥ 10: thấy màu dạng acid (<b>${ac}</b>)` : r <= 0.1 ? `tỉ số ≤ 1/10: thấy màu dạng base (<b>${bs}</b>)` : `đang chuyển màu giữa ${ac} và ${bs}`}.</p>`;
  });
  return s + `<p>${c.mix}</p>`;
}
function solDpk(q, A) {
  const d = q.b - q.a, e = q.lim === 1 ? 1 : 0.1, big = 100 - e;
  return H('Phân tích đề') + `<p>Muốn định lượng riêng nấc 1 với sai số ≤ ${fmt(e, e < 1 ? 1 : 0)} % thì tại điểm tương đương 1: nấc 1 đã phản ứng ít nhất ${fmt(big, e < 1 ? 1 : 0)} %, còn nấc 2 phản ứng nhiều nhất ${fmt(e, e < 1 ? 1 : 0)} %.</p>` +
    H('Lập điều kiện') + `<p>Tại cùng một pH, viết pH theo cả hai cặp acid–base:</p>` +
    EQ(MI('pH'), EQS, SUB(MI('pk'), MN(1)), MINUS, LG(FR(SP('H₂A'), SP('HA⁻'))), EQS, SUB(MI('pk'), MN(2)), MINUS, LG(FR(SP('HA⁻'), SP('A²⁻')))) +
    `<p>Trừ hai vế cho nhau, rồi thay tỉ lệ cho phép:</p>` + EQ(FR(SP('H₂A'), SP('HA⁻')), EQS, FR(MN(fmt(e, e < 1 ? 1 : 0)), MN(fmt(big, e < 1 ? 1 : 0))), MO(';'), MO('&#x2003;'), FR(SP('HA⁻'), SP('A²⁻')), EQS, FR(MN(fmt(big, e < 1 ? 1 : 0)), MN(fmt(e, e < 1 ? 1 : 0)))) +
    EQ(SUB(MI('pk'), MN(2)), MINUS, SUB(MI('pk'), MN(1)), EQS, LG(FR(MN(fmt(big, e < 1 ? 1 : 0)), MN(fmt(e, e < 1 ? 1 : 0)))), PLUS, LG(FR(MN(fmt(big, e < 1 ? 1 : 0)), MN(fmt(e, e < 1 ? 1 : 0)))), APPROX, MN(A.need)) +
    `<p>Vậy cần ${IM(FR(SUB(MI('k'), MN(1)), SUB(MI('k'), MN(2))), MO('≥'), SUP(MN('10'), MN(A.need)))}, tức Δpk ≥ ${A.need}.</p>` +
    H('Áp dụng') + EQ(MI('Δpk'), EQS, SUB(MI('pk'), MN(2)), MINUS, SUB(MI('pk'), MN(1)), EQS, MN(fmt(q.b, 2)), MINUS, MN(fmt(q.a, 2)), EQS, MN(fmt(d, 2))) +
    `<p>${fmt(d, 2)} ${A.ok ? '≥' : '<'} ${A.need} → <b>${A.ok ? 'Có' : 'Không'}</b> định lượng riêng được nấc 1 với sai số ≤ ${fmt(e, e < 1 ? 1 : 0)} %.</p>`;
}
