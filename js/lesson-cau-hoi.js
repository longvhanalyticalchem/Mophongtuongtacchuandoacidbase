// BÀI HỌC 5E: câu hỏi thông hiểu – vận dụng ở bước 5 (nồng độ, độ mạnh, pH tại ĐTĐ, dấu sai số, đọc đồ thị).
// Các file js/ là script thường (không dùng module), nạp theo thứ tự trong index.html và dùng chung biến toàn cục.

// ===== BƯỚC 5 · CÂU THÔNG HIỂU – VẬN DỤNG (trắc nghiệm, có giải thích) =====
const ABCD = 'ABCD';
const f1 = x => fmt(x, 1), f2 = x => fmt(x, 2);
function jmp(an, ti, V0 = 10, k = 0, s = 0.001) {
  const e = equivalencePoints(V0, an, ti), E = e[k], d = E.Veq - (k ? e[k - 1].Veq : 0);
  const a = solvePH(E.Veq - s * d, V0, an, ti, BOOK), b = solvePH(E.Veq + s * d, V0, an, ti, BOOK);
  return { a, b, pH: solvePH(E.Veq, V0, an, ti, BOOK), Veq: E.Veq };
}
const hxComp = (pKa, C = 0.1) => ({ C, pKa: [pKa], zFull: 0, h: 1, counter: 'inert' });
const Q5_LABEL = { ind: 'chọn chỉ thị', err: 'sai số chỉ thị', pct: '% đã định lượng', color: 'màu chỉ thị', dpk: 'điều kiện định lượng riêng',
  conc: 'ảnh hưởng của nồng độ', str: 'ảnh hưởng của độ mạnh acid/base', pheq: 'pH tại điểm tương đương', sign: 'dấu của sai số', graph: 'đọc đường cong chuẩn độ' };
const P = t => `<p>${t}</p>`;
const UL = a => `<ul style="margin:6px 0;padding-left:20px;line-height:1.6">${a.map(x => `<li>${x}</li>`).join('')}</ul>`;
const HALF = FR(MN(1), MN(2));
const pkA = SUB(MI('pk'), MI('a'));

// --- A. Ảnh hưởng của nồng độ ---
function concStrong(j1, j2) {
  return H('Bước nhảy được tính thế nào') +
    P('Bước nhảy pH là khoảng pH từ lúc còn thiếu 0,1 % đến lúc thừa 0,1 % chất chuẩn. Với acid mạnh – base mạnh (bỏ qua pha loãng):') +
    UL([`Ở <b>99,9 %</b>: còn 0,1 % HCl chưa được chuẩn, [H⁺] = 10⁻³·C, nên ${IM(MI('pH'), EQS, MN(3), MINUS, MI('lg'), MI('C'))}.`,
      'Ở <b>100 %</b>: dung dịch chỉ có NaCl, pH = 7 với mọi nồng độ.',
      `Ở <b>100,1 %</b>: thừa 0,1 % NaOH, [OH⁻] = 10⁻³·C, nên ${IM(MI('pH'), EQS, MN(11), PLUS, MI('lg'), MI('C'))}.`]) +
    H('Thay số') + UL([`C = 0,1 M: pH đi từ <b>${f1(j1.a)}</b> đến <b>${f1(j1.b)}</b> (dài ${f1(j1.b - j1.a)} đơn vị).`,
      `C = 0,01 M: pH đi từ <b>${f1(j2.a)}</b> đến <b>${f1(j2.b)}</b> (dài ${f1(j2.b - j2.a)} đơn vị).`]) +
    H('Vì sao nồng độ càng cao thì bước nhảy càng dài') +
    P('Hai đầu bước nhảy do <b>lượng acid còn thiếu hoặc base dư</b> quyết định, và lượng này bằng 0,1 % của C. Dung dịch càng đặc thì lượng H⁺ (hoặc OH⁻) quanh ĐTĐ càng nhiều, pH hai đầu càng xa 7, nên <b>bước nhảy càng dài</b>. Giảm nồng độ 10 lần thì mỗi đầu tiến về phía 7 một đơn vị, bước nhảy ngắn đi 2 đơn vị. Vì vậy thường dùng dung dịch 0,1 N; ở 0,01 N bước nhảy chỉ còn 5–9 nên da cam methyl không còn đạt sai số ± 0,1 %.');
}
function concWeak(acid, j1, j2) {
  const W = acid ? 'CH₃COOH/CH₃COO⁻' : 'NH₄⁺/NH₃', T = acid ? 'NaOH' : 'HCl', s = acid ? '+' : '−';
  return H('Pha loãng ảnh hưởng tới từng điểm thế nào') + UL([
    `Ở <b>99,9 %</b>: dung dịch là hệ đệm ${W}, ${IM(MI('pH'), EQS, pkA, PLUS, LG(acid ? FR(MN('99,9'), MN('0,1')) : FR(MN('0,1'), MN('99,9'))))} ≈ ${acid ? '4,73' : '9,25'} ${s} 3. Biểu thức <b>không chứa C</b>, nên đầu bước nhảy gần như không đổi (${f2(j1.a)} → ${f2(j2.a)}).`,
    acid ? `Ở <b>100 %</b>: dung dịch CH₃COO⁻, ${IM(MI('pH'), EQS, MN(7), PLUS, HALF, pkA, PLUS, HALF, MI('lg'), MI('C'))}: ${f2(j1.pH)} → ${f2(j2.pH)}.`
      : `Ở <b>100 %</b>: dung dịch NH₄⁺, ${IM(MI('pH'), EQS, HALF, pkA, MINUS, HALF, MI('lg'), MI('C'))}: ${f2(j1.pH)} → ${f2(j2.pH)}.`,
    `Ở <b>100,1 %</b>: ${T} dư, ${acid ? IM(MI('pH'), EQS, MN(11), PLUS, MI('lg'), MI('C')) : IM(MI('pH'), EQS, MN(3), MINUS, MI('lg'), MI('C'))}: ${f1(j1.b)} → ${f1(j2.b)}.`]) +
    H('Kết luận') + P(`Với ${acid ? 'acid' : 'base'} yếu, đầu bước nhảy do hệ đệm quyết định nên không phụ thuộc nồng độ; chỉ phần do ${T} dư quyết định mới thay đổi khi pha loãng. Bước nhảy vì vậy chỉ ngắn lại ở phía ${acid ? 'kiềm' : 'acid'}. Đây cũng là lý do chung: nồng độ càng cao thì lượng chất chuẩn dư sau ĐTĐ càng lớn, pH càng xa ĐTĐ, bước nhảy càng dài.`);
}
function qConc(q) {
  if (q.v === 'hcl' || q.v === 'why') {
    const j1 = jmp([comp('HCl', 0.1)], [comp('NaOH', 0.1)]), j2 = jmp([comp('HCl', 0.01)], [comp('NaOH', 0.01)]);
    if (q.v === 'hcl') return {
      text: `Chuẩn độ HCl bằng NaOH cùng nồng độ, sai số cho phép ± 0,1 %, bỏ qua pha loãng. Với dung dịch 0,1 M, bước nhảy pH là ${f1(j1.a)} – ${f1(j1.b)}. Nếu dùng cả hai dung dịch 0,01 M thì bước nhảy thay đổi thế nào?`,
      opts: [[`Ngắn lại ở cả hai phía, còn khoảng ${f1(j2.a)} – ${f1(j2.b)}`, true],
        [`Dài ra thành khoảng ${f1(j1.a - 1)} – ${f1(j1.b + 1)}, vì dung dịch loãng thì pH thay đổi mạnh hơn`, false, 'Pha loãng làm lượng H⁺ (hoặc OH⁻) dư quanh ĐTĐ giảm đi, nên pH hai đầu tiến lại gần 7 chứ không xa ra.'],
        [`Chỉ ngắn lại ở phía acid, còn khoảng ${f1(j2.a)} – ${f1(j1.b)}`, false, 'Đầu kiềm do lượng NaOH dư quyết định; lượng này cũng giảm 10 lần nên đầu kiềm cũng hạ 1 đơn vị.'],
        ['Không đổi, vì HCl và NaOH vẫn phản ứng theo tỉ lệ 1 : 1', false, 'Tỉ lệ phản ứng không đổi, nhưng pH ở 99,9 % và 100,1 % phụ thuộc trực tiếp vào nồng độ.']],
      body: concStrong(j1, j2) };
    return {
      text: 'Dung dịch càng đặc thì bước nhảy pH càng dài. Với phép chuẩn độ HCl bằng NaOH (sai số ± 0,1 %), cách giải thích nào đúng?',
      opts: [['Ở 99,9 % và 100,1 %, pH do lượng HCl còn thiếu hoặc NaOH dư quyết định; lượng này bằng 0,1 % của C, nên C càng lớn thì pH đầu bước nhảy càng thấp và pH cuối càng cao', true],
        ['pH tại điểm tương đương thay đổi theo nồng độ nên bước nhảy dài ra', false, 'Tại ĐTĐ dung dịch chỉ có NaCl, pH = 7 với mọi nồng độ.'],
        ['Dung dịch đặc có khả năng đệm lớn hơn quanh điểm tương đương', false, 'Quanh ĐTĐ của acid mạnh – base mạnh không có hệ đệm; chính vì không có đệm nên pH mới nhảy.'],
        ['Chỉ thị đổi màu rõ hơn trong dung dịch đặc nên thấy bước nhảy dài hơn', false, 'Bước nhảy được tính từ thành phần dung dịch, không phụ thuộc vào chỉ thị.']],
      body: concStrong(j1, j2) };
  }
  const acid = q.v === 'acoh', A = acid ? 'CH3COOH' : 'NH3', T = acid ? 'NaOH' : 'HCl';
  const j1 = jmp([comp(A, 0.1)], [comp(T, 0.1)]), j2 = jmp([comp(A, 0.01)], [comp(T, 0.01)]);
  const near = acid ? 'acid' : 'kiềm', far = acid ? 'kiềm' : 'acid', arr = acid ? '–' : '→';
  return {
    text: acid ? `Chuẩn độ CH₃COOH (pKa = 4,73) bằng NaOH cùng nồng độ, sai số ± 0,1 %, bỏ qua pha loãng. Với dung dịch 0,1 M, bước nhảy là ${f2(j1.a)} – ${f1(j1.b)}. Nếu dùng cả hai dung dịch 0,01 M thì bước nhảy thay đổi thế nào?`
      : `Chuẩn độ NH₃ (pKa của NH₄⁺ = 9,25) bằng HCl cùng nồng độ, sai số ± 0,1 %, bỏ qua pha loãng. Với dung dịch 0,1 M, bước nhảy là ${f2(j1.a)} → ${f1(j1.b)}. Nếu dùng cả hai dung dịch 0,01 M thì bước nhảy thay đổi thế nào?`,
    opts: [[`Chỉ ngắn lại ở phía ${far}: đầu bước nhảy vẫn ≈ ${f1(j2.a)}, cuối bước nhảy ${acid ? 'giảm còn' : 'tăng lên'} ≈ ${f1(j2.b)}`, true],
      [`Ngắn lại ở cả hai phía, còn khoảng ${f1(j1.a + (acid ? 1 : -1))} ${arr} ${f1(j2.b)}`, false, `Đầu bước nhảy nằm trong vùng đệm; pH ở đó chỉ phụ thuộc pKa và tỉ lệ hai dạng (99,9 : 0,1), không phụ thuộc nồng độ.`],
      [`Chỉ ngắn lại ở phía ${near}: đầu bước nhảy ${acid ? 'tăng lên' : 'giảm còn'} ≈ ${f1(j1.a + (acid ? 1 : -1))}, cuối vẫn ≈ ${f1(j1.b)}`, false, `Ngược lại: phía ${near} là vùng đệm nên gần như không đổi; phía ${far} do ${T} dư quyết định nên mới thay đổi theo nồng độ.`],
      [`Không đổi, vì đầu bước nhảy chỉ phụ thuộc pKa`, false, `Đầu bước nhảy đúng là chỉ phụ thuộc pKa, nhưng cuối bước nhảy (do ${T} dư) phụ thuộc nồng độ.`]],
    body: concWeak(acid, j1, j2) };
}
// --- B. Ảnh hưởng của độ mạnh acid/base ---
const STR_RULE = H('Quy luật') + UL([
  `Trước ĐTĐ của acid yếu là vùng đệm: ${IM(MI('pH'), EQS, pkA, PLUS, LG(FR(SUB(MI('C'), MI('B')), SUB(MI('C'), MI('A')))))}. Ở 99,9 % tỉ lệ là 99,9 : 0,1 nên pH ≈ pKa + 3. Acid càng yếu (pKa càng lớn) thì đầu bước nhảy càng cao.`,
  'Sau ĐTĐ (100,1 %) pH do NaOH dư quyết định, không phụ thuộc acid mạnh hay yếu.',
  `Tại ĐTĐ dung dịch chứa base liên hợp A⁻: ${IM(MI('pH'), EQS, MN(7), PLUS, HALF, pkA, PLUS, HALF, MI('lg'), MI('C'))}. Acid càng yếu thì A⁻ càng mạnh, pH tại ĐTĐ càng cao.`]);
function qStr(q) {
  if (q.v === 'hcl-acoh' || q.v === 'naoh-nh3') {
    const acid = q.v === 'hcl-acoh', S = acid ? 'HCl' : 'NaOH', Wk = acid ? 'CH3COOH' : 'NH3', T = acid ? 'NaOH' : 'HCl', W = NAME[Wk];
    const jS = jmp([comp(S, 0.1)], [comp(T, 0.1)]), jW = jmp([comp(Wk, 0.1)], [comp(T, 0.1)]);
    const near = acid ? 'acid' : 'kiềm', far = acid ? 'kiềm' : 'acid';
    return {
      text: `Chuẩn độ riêng ${S} 0,1 M và ${W} 0,1 M (${acid ? 'pKa = 4,73' : 'pKa của NH₄⁺ = 9,25'}) bằng ${T} 0,1 M, sai số ± 0,1 %, bỏ qua pha loãng. So sánh hai bước nhảy pH, nhận định nào đúng?`,
      opts: [[`Bước nhảy của ${W} ngắn hơn, bị rút ngắn ở phía ${near} (bắt đầu từ ≈ ${f1(jW.a)} thay vì ${f1(jS.a)}); phía ${far} vẫn kết thúc ở ≈ ${f1(jW.b)}`, true],
        [`Bước nhảy của ${W} ngắn hơn, bị rút ngắn ở phía ${far}`, false, `Sau ĐTĐ pH do ${T} dư quyết định, giống hệt nhau ở hai phép chuẩn độ, nên phía ${far} không đổi.`],
        [`Bước nhảy của ${W} dài hơn, vì pH tại ĐTĐ ${acid ? 'lớn' : 'nhỏ'} hơn 7`, false, `pH tại ĐTĐ ${acid ? 'lớn' : 'nhỏ'} hơn 7 chỉ làm ĐTĐ lệch về phía ${far}, không làm bước nhảy dài ra.`],
        ['Hai bước nhảy dài bằng nhau vì cùng nồng độ', false, 'Cùng nồng độ thì phía chất chuẩn dư giống nhau, nhưng phía còn lại phụ thuộc độ mạnh của chất cần định lượng.']],
      body: H('So sánh') + UL([`${S} (${acid ? 'acid' : 'base'} mạnh): bước nhảy ≈ ${f1(jS.a)} → ${f1(jS.b)}, pH tại ĐTĐ = 7.`,
        `${W} (${acid ? 'acid' : 'base'} yếu): bước nhảy ≈ ${f2(jW.a)} → ${f1(jW.b)}, pH tại ĐTĐ ≈ ${f2(jW.pH)}.`]) +
        (acid ? STR_RULE : H('Giải thích') + UL([`Trước ĐTĐ là vùng đệm NH₄⁺/NH₃: ở 99,9 %, ${IM(MI('pH'), EQS, pkA, PLUS, LG(FR(MN('0,1'), MN('99,9'))))} ≈ 9,25 − 3 = 6,25. Với NaOH (base mạnh), ở 99,9 % pH do 0,1 % NaOH còn lại quyết định nên vẫn ≈ 10.`,
          'Sau ĐTĐ (100,1 %) pH do HCl dư quyết định nên cả hai cùng ≈ 4.'])) +
        P(`Vì vậy ${acid ? 'acid' : 'base'} càng yếu thì bước nhảy càng bị rút ngắn ở phía ${near}`) };
  }
  if (q.v === 'two') {
    const jX = jmp([hxComp(q.a)], [comp('NaOH', 0.1)]), jY = jmp([hxComp(q.b)], [comp('NaOH', 0.1)]);
    return {
      text: `Hai acid một nấc HX (pKa = ${f1(q.a)}) và HY (pKa = ${f1(q.b)}), cùng nồng độ 0,1 M, được chuẩn độ riêng bằng NaOH 0,1 M (sai số ± 0,1 %, bỏ qua pha loãng). Nhận định nào đúng?`,
      opts: [['HX có bước nhảy dài hơn; pH tại điểm tương đương của HY cao hơn', true],
        ['HY có bước nhảy dài hơn; pH tại điểm tương đương của HY cao hơn', false, 'HY yếu hơn nên đầu bước nhảy (≈ pKa + 3) cao hơn, bước nhảy ngắn hơn.'],
        ['HX có bước nhảy dài hơn; pH tại điểm tương đương của HX cao hơn', false, 'Base liên hợp Y⁻ của acid yếu hơn thì mạnh hơn, nên tại ĐTĐ dung dịch của HY có pH cao hơn.'],
        ['Hai bước nhảy dài bằng nhau vì cùng nồng độ và cùng chất chuẩn', false, 'Phía kiềm giống nhau, nhưng phía acid (vùng đệm) phụ thuộc pKa.']],
      body: STR_RULE + H('Áp dụng') + UL([`HX: bước nhảy ≈ ${f1(jX.a)} → ${f1(jX.b)} (dài ${f1(jX.b - jX.a)}), pH tại ĐTĐ ≈ ${f2(jX.pH)}.`,
        `HY: bước nhảy ≈ ${f1(jY.a)} → ${f1(jY.b)} (dài ${f1(jY.b - jY.a)}), pH tại ĐTĐ ≈ ${f2(jY.pH)}.`]) };
  }
  const j = jmp([comp('H3BO3', 0.1)], [comp('NaOH', 0.1)]);
  return {
    text: 'Vì sao không định lượng trực tiếp được H₃BO₃ 0,1 M (pKa = 9,24) bằng NaOH 0,1 M với chỉ thị màu thông thường?',
    opts: [['Acid quá yếu nên quanh điểm tương đương pH gần như không đổi (không có bước nhảy), không có chỉ thị nào đổi màu đúng lúc', true],
      ['H₃BO₃ không phản ứng với NaOH', false, 'H₃BO₃ vẫn phản ứng với NaOH; vấn đề là phản ứng không đủ hoàn toàn để tạo ra bước nhảy pH.'],
      ['Bước nhảy quá dài nên chỉ thị đổi màu quá sớm', false, 'Ngược lại, bước nhảy gần như bằng 0.'],
      ['pH tại điểm tương đương bằng 7 nên không chỉ thị nào đổi màu', false, `Tại ĐTĐ dung dịch chứa base liên hợp của H₃BO₃ nên pH ≈ ${f1(j.pH)}, không phải 7.`]],
    body: STR_RULE + H('Áp dụng') + P(`Với pKa = 9,24, đầu bước nhảy theo công thức đệm phải là ≈ 9,24 + 3 = 12,24, còn cao hơn cả pH do NaOH dư ở 100,1 % (≈ 10). Hai vùng chồng lên nhau nên đường cong không có đoạn dựng đứng. Tính đầy đủ: pH ở 99,9 % ≈ ${f2(j.a)}, ở 100,1 % ≈ ${f2(j.b)}, chỉ chênh ${f2(j.b - j.a)} đơn vị.`) +
      P('Tóm lại: acid quá yếu gần như không có bước nhảy nên không chọn được chỉ thị, phải tìm cách định lượng khác.') };
}

// --- C. pH tại điểm tương đương so với 7 ---
const LH = (k1, k2, s1, s2) => EQ(MI('pH'), EQS, HALF, PRS(SUB(MI('pk'), MN(k1)), PLUS, SUB(MI('pk'), MN(k2))), EQS, HALF, PRS(MN(s1), PLUS, MN(s2)));
const PHEQ = {
  'hcl': { lab: 'HCl 0,1 M bằng NaOH 0,1 M', an: ['HCl', 0.1], ti: ['NaOH', 0.1], k: 0, cmp: '=',
    ok: 'tại ĐTĐ dung dịch chỉ chứa NaCl; Na⁺ và Cl⁻ đều không có tính acid – base đáng kể',
    bad: [['>', 'NaOH là base mạnh', 'Tại ĐTĐ NaOH vừa phản ứng hết, chưa dư.'], ['<', 'HCl là acid mạnh', 'Tại ĐTĐ HCl đã phản ứng hết.'], ['>', 'Cl⁻ là base liên hợp nên dung dịch có tính base', 'Cl⁻ là base liên hợp của acid mạnh nên tính base không đáng kể.']],
    f: () => P(`Dung dịch như nước nguyên chất: ${IM(MI('h'), EQS, MI('oh'), EQS, SUP(MN(10), MN('−7')))}, pH = 7.`) },
  'acoh': { lab: 'CH₃COOH 0,1 M (pKa = 4,73) bằng NaOH 0,1 M', an: ['CH3COOH', 0.1], ti: ['NaOH', 0.1], k: 0, cmp: '>',
    ok: 'tại ĐTĐ dung dịch chứa CH₃COO⁻, là base liên hợp của acid yếu',
    bad: [['=', 'acid và base đã phản ứng vừa đủ', 'Vừa đủ về lượng không có nghĩa là trung tính; muối của acid yếu có tính base.'], ['<', 'CH₃COOH vẫn còn dư', 'Tại ĐTĐ CH₃COOH đã phản ứng hết.'], ['>', 'NaOH đã dư', 'NaOH chỉ dư sau ĐTĐ; tại ĐTĐ chưa có NaOH dư.']],
    f: p => EQ(MI('pH'), EQS, MN(7), PLUS, HALF, pkA, PLUS, HALF, MI('lg'), MI('C'), EQS, MN(7), PLUS, HALF, TIMES, MN('4,73'), PLUS, HALF, MI('lg'), MN('0,1'), APPROX, MN(f2(p))) },
  'nh3': { lab: 'NH₃ 0,1 M (pKa của NH₄⁺ = 9,25) bằng HCl 0,1 M', an: ['NH3', 0.1], ti: ['HCl', 0.1], k: 0, cmp: '<',
    ok: 'tại ĐTĐ dung dịch chứa NH₄⁺, là acid liên hợp của base yếu',
    bad: [['=', 'acid và base đã phản ứng vừa đủ', 'Vừa đủ về lượng không có nghĩa là trung tính; NH₄⁺ có tính acid.'], ['<', 'HCl đã dư', 'HCl chỉ dư sau ĐTĐ; tại ĐTĐ chưa có HCl dư.'], ['>', 'NH₃ vẫn còn dư', 'Tại ĐTĐ NH₃ đã phản ứng hết.']],
    f: p => EQ(MI('pH'), EQS, HALF, pkA, MINUS, HALF, MI('lg'), MI('C'), EQS, HALF, TIMES, MN('9,25'), MINUS, HALF, MI('lg'), MN('0,1'), APPROX, MN(f2(p))) },
  'h3po4-1': { lab: 'H₃PO₄ 0,1 M (pKa = 2,15; 7,20; 12,4) bằng NaOH 0,1 M, xét điểm tương đương 1', an: ['H3PO4', 0.1], ti: ['NaOH', 0.1], k: 0, cmp: '<',
    ok: 'tại ĐTĐ 1 dung dịch chứa NaH₂PO₄, chất lưỡng tính có pH ≈ ½(pKa₁ + pKa₂)',
    bad: [['>', 'NaOH là base mạnh', 'Tại ĐTĐ 1 không có NaOH dư; pH do H₂PO₄⁻ quyết định.'], ['=', 'nấc 1 đã được trung hoà vừa đủ', 'Trung hoà vừa đủ nấc 1 cho dung dịch H₂PO₄⁻, chất này có tính acid nhiều hơn tính base.'], ['<', 'H₃PO₄ còn dư nhiều', 'Tại ĐTĐ 1, H₃PO₄ đã chuyển gần hết thành H₂PO₄⁻.']],
    f: p => LH(1, 2, '2,15', '7,20') + P(`≈ ${f2(p)}.`) },
  'h3po4-2': { lab: 'H₃PO₄ 0,1 M (pKa = 2,15; 7,20; 12,4) bằng NaOH 0,1 M, xét điểm tương đương 2', an: ['H3PO4', 0.1], ti: ['NaOH', 0.1], k: 1, cmp: '>',
    ok: 'tại ĐTĐ 2 dung dịch chứa Na₂HPO₄, chất lưỡng tính có pH ≈ ½(pKa₂ + pKa₃)',
    bad: [['>', 'NaOH đã dư', 'Tại ĐTĐ 2 chưa có NaOH dư; pH do HPO₄²⁻ quyết định.'], ['=', 'hai nấc đã được trung hoà vừa đủ', 'Dung dịch HPO₄²⁻ có tính base nhiều hơn tính acid nên không trung tính.'], ['<', 'trong dung dịch vẫn còn H₂PO₄⁻ là acid', 'Tại ĐTĐ 2, H₂PO₄⁻ đã chuyển gần hết thành HPO₄²⁻.']],
    f: p => LH(2, 3, '7,20', '12,4') + P(`≈ ${f2(p)}.`) },
  'na2co3-1': { lab: 'Na₂CO₃ 0,1 M (H₂CO₃: pKa = 6,35; 10,33) bằng HCl 0,1 M, xét điểm tương đương 1', an: ['Na2CO3', 0.1], ti: ['HCl', 0.1], k: 0, cmp: '>',
    ok: 'tại ĐTĐ 1 dung dịch chứa NaHCO₃, chất lưỡng tính có pH ≈ ½(pKa₁ + pKa₂)',
    bad: [['<', 'HCl là acid mạnh', 'Tại ĐTĐ 1 chưa có HCl dư; pH do HCO₃⁻ quyết định.'], ['=', 'nấc 1 đã được trung hoà vừa đủ', 'Dung dịch HCO₃⁻ có tính base nhiều hơn tính acid nên không trung tính.'], ['>', 'Na₂CO₃ vẫn còn dư nhiều', 'Tại ĐTĐ 1, CO₃²⁻ đã chuyển gần hết thành HCO₃⁻.']],
    f: p => LH(1, 2, '6,35', '10,33') + P(`≈ ${f2(p)}.`) },
  'na2co3-2': { lab: 'Na₂CO₃ 0,1 M (H₂CO₃: pKa = 6,35; 10,33) bằng HCl 0,1 M, xét điểm tương đương 2', an: ['Na2CO3', 0.1], ti: ['HCl', 0.1], k: 1, cmp: '<',
    ok: 'tại ĐTĐ 2 dung dịch chứa H₂CO₃ (CO₂ hoà tan), là một acid yếu',
    bad: [['<', 'HCl đã dư', 'Tại ĐTĐ 2 chưa có HCl dư; pH do H₂CO₃ quyết định.'], ['=', 'cả hai nấc đã được trung hoà vừa đủ', 'Sản phẩm H₂CO₃ là acid yếu nên dung dịch có tính acid.'], ['>', 'NaHCO₃ vẫn còn dư', 'Tại ĐTĐ 2, HCO₃⁻ đã chuyển gần hết thành H₂CO₃.']],
    f: p => EQ(MI('pH'), EQS, HALF, SUB(MI('pk'), MN(1)), MINUS, HALF, MI('lg'), MI('C'), EQS, HALF, TIMES, MN('6,35'), MINUS, HALF, MI('lg'), MN('0,1'), APPROX, MN(f2(p))) }
};
const CMPW = { '>': 'lớn hơn 7', '<': 'nhỏ hơn 7', '=': 'bằng 7' };
function qPheq(q) {
  const S = PHEQ[q.v], j = jmp([comp(...S.an)], [comp(...S.ti)], 10, S.k);
  return {
    text: `Khi chuẩn độ ${S.lab}, pH tại điểm tương đương lớn hơn, bằng hay nhỏ hơn 7? Vì sao? (Bỏ qua pha loãng.)`,
    opts: [[`pH ${S.cmp === '=' ? '= 7' : CMPW[S.cmp] + ` (≈ ${f1(j.pH)})`}, vì ${S.ok}`, true],
      ...S.bad.map(([c, why, w]) => [`pH ${CMPW[c]}, vì ${why}`, false, w])],
    body: H('Thành phần dung dịch tại điểm tương đương') + P(`Tại ĐTĐ, chất cần định lượng vừa phản ứng hết với chất chuẩn, chưa có chất nào dư. pH do <b>sản phẩm</b> quyết định: ${S.ok}.`) +
      H('Tính pH (công thức tính nhanh)') + S.f(j.pH) +
      P(`So với 7: pH tại ĐTĐ <b>${CMPW[S.cmp]}</b>. Đây là lý do phải chọn chỉ thị có pT gần pH tại ĐTĐ, chứ không phải lúc nào cũng gần 7.`) };
}
// --- D. Dấu của sai số chỉ thị (không tính số) ---
function qSign(q) {
  const c = ERR_CASES.find(x => x.id === q.case), j = jmp([comp(c.an, 0.1)], [comp(c.ti, 0.1)]);
  const tb = c.ti === 'NaOH', before = tb ? c.pT < j.pH : c.pT > j.pH;
  const A = NAME[c.an], T = NAME[c.ti], dir = tb ? 'tăng' : 'giảm';
  const why = `Chất chuẩn là ${tb ? 'base' : 'acid'} nên pH ${dir} dần; pH = ${c.pT} xuất hiện ${before ? 'trước' : 'sau'} ĐTĐ (≈ ${f1(j.pH)}), nên ${before ? 'phải dừng trước ĐTĐ' : 'đã qua ĐTĐ mới dừng'}.`;
  return {
    text: `Định lượng ${A} 0,1 M bằng ${T} 0,1 M, chỉ thị ${c.ind} (pT = ${c.pT}). Biết pH tại điểm tương đương ≈ ${f1(j.pH)}. Không cần tính, nhận định nào đúng về lúc kết thúc chuẩn độ?`,
    opts: [[`Dừng chuẩn độ trước ĐTĐ; sai số âm; trong dung dịch còn ${A} chưa được chuẩn`, before, before ? '' : why],
      [`Dừng chuẩn độ sau ĐTĐ; sai số dương; trong dung dịch có ${T} dư`, !before, before ? why : ''],
      [`Dừng chuẩn độ trước ĐTĐ; sai số dương; trong dung dịch có ${T} dư`, false, 'Dừng trước ĐTĐ thì chất chuẩn chưa đủ: không thể có chất chuẩn dư, và sai số phải âm.'],
      [`Dừng chuẩn độ sau ĐTĐ; sai số âm; trong dung dịch còn ${A} chưa được chuẩn`, false, 'Dừng sau ĐTĐ thì chất chuẩn đã thừa, chất cần định lượng đã hết, nên sai số dương.']],
    body: H('Cách suy luận') + UL([
      `Chất chuẩn ${T} là ${tb ? 'base' : 'acid'}, nên trong quá trình chuẩn độ pH ${dir} dần.`,
      `Chuẩn độ kết thúc khi chỉ thị đổi màu, tức khi pH = pT = ${c.pT}.`,
      `So sánh: pT = ${c.pT} ${c.pT < j.pH ? '<' : '>'} pH tại ĐTĐ ≈ ${f1(j.pH)}. Vì pH ${dir} dần nên pH = ${c.pT} đạt tới <b>${before ? 'trước' : 'sau'}</b> điểm tương đương.`,
      before ? `Dừng trước ĐTĐ: lượng ${T} đã thêm <b>chưa đủ</b>, một phần ${A} chưa được chuẩn vẫn còn trong dung dịch, kết quả thấp hơn thực tế → <b>sai số âm</b>.`
        : `Dừng sau ĐTĐ: lượng ${T} đã thêm <b>thừa</b>, dung dịch có ${T} dư, kết quả cao hơn thực tế → <b>sai số dương</b>.`]) +
      P(`Chất còn lại trong dung dịch quyết định loại sai số: ở đây là <b>${ERR_TYPES[c.type]}</b>. Muốn biết độ lớn thì tính theo công thức tương ứng như ở câu “sai số chỉ thị”.`) };
}

// --- E. Đọc đường cong chuẩn độ ---
const GSYS = {
  hcl: { lab: 'HCl 0,1 M chuẩn độ bằng NaOH 0,1 M', an: ['HCl', 0.1], ti: ['NaOH', 0.1],
    feat: 'pH ban đầu thấp (≈ 1), pH tăng dần, không có vùng đệm, chỉ một bước nhảy dài quanh pH 7' },
  acoh: { lab: 'CH₃COOH 0,1 M chuẩn độ bằng NaOH 0,1 M', an: ['CH3COOH', 0.1], ti: ['NaOH', 0.1],
    feat: 'pH ban đầu ≈ 2,9, pH tăng dần, có vùng đệm (đoạn thoải quanh pH ≈ 4,7), một bước nhảy ngắn nằm ở vùng kiềm' },
  nh3: { lab: 'NH₃ 0,1 M chuẩn độ bằng HCl 0,1 M', an: ['NH3', 0.1], ti: ['HCl', 0.1],
    feat: 'pH ban đầu ≈ 11,1, pH giảm dần, có vùng đệm quanh pH ≈ 9,25, một bước nhảy nằm ở vùng acid' },
  h3po4: { lab: 'H₃PO₄ 0,1 M chuẩn độ bằng NaOH 0,1 M', an: ['H3PO4', 0.1], ti: ['NaOH', 0.1],
    feat: 'pH ban đầu ≈ 1,6, pH tăng dần, có hai bước nhảy (≈ 10 mL và ≈ 20 mL), nấc 3 không có bước nhảy' },
  na2co3: { lab: 'Na₂CO₃ 0,1 M chuẩn độ bằng HCl 0,1 M', an: ['Na2CO3', 0.1], ti: ['HCl', 0.1],
    feat: 'pH ban đầu ≈ 11,7, pH giảm dần, có hai bước nhảy: ở ≈ 10 mL (pH ≈ 8,3) nhỏ và ở ≈ 20 mL (pH ≈ 3,7) rõ hơn' }
};
function curveSVG(an, ti, xmax, tname, mk) {
  const X0 = 46, X1 = 548, Y0 = 12, Y1 = 282, sx = v => X0 + (X1 - X0) * v / xmax, sy = p => Y1 - (Y1 - Y0) * p / 14;
  let g = '';
  for (let p = 0; p <= 14; p++) g += `<line x1="${X0}" x2="${X1}" y1="${sy(p)}" y2="${sy(p)}" stroke="${p % 2 ? '#edf4ee' : '#cde0d1'}"/>` + (p % 2 ? '' : `<text x="${X0 - 8}" y="${sy(p) + 4}" text-anchor="end">${p}</text>`);
  for (let v = 0; v <= xmax; v++) g += `<line y1="${Y0}" y2="${Y1}" x1="${sx(v)}" x2="${sx(v)}" stroke="${v % 5 ? '#edf4ee' : '#cde0d1'}"/>` + (v % 5 ? '' : `<text x="${sx(v)}" y="${Y1 + 17}" text-anchor="middle">${v}</text>`);
  const pts = []; for (let i = 0; i <= 500; i++) { const v = xmax * i / 500; pts.push(`${sx(v).toFixed(1)},${sy(Math.max(0, Math.min(14, solvePH(v, 10, an, ti, BOOK)))).toFixed(1)}`); }
  const m = mk ? `<line x1="${sx(mk.V)}" x2="${sx(mk.V)}" y1="${Y1}" y2="${sy(mk.pH)}" stroke="#d9731a" stroke-dasharray="5 4" stroke-width="1.5"/><line x1="${X0}" x2="${sx(mk.V)}" y1="${sy(mk.pH)}" y2="${sy(mk.pH)}" stroke="#d9731a" stroke-dasharray="5 4" stroke-width="1.5"/><circle cx="${sx(mk.V)}" cy="${sy(mk.pH)}" r="5" fill="#d9731a"/><text x="${sx(mk.V) + 8}" y="${sy(mk.pH) + 18}" fill="#b45309" font-weight="700">${mk.t}</text>` : '';
  return `<div style="max-width:560px;margin:10px 0"><svg viewBox="0 0 560 318" style="width:100%;height:auto;display:block;background:#fff;border:1px solid #cde3d2;border-radius:12px" font-size="12" fill="#365443" role="img" aria-label="Đường cong chuẩn độ">${g}<polyline points="${pts.join(' ')}" fill="none" stroke="#12733f" stroke-width="2.4" stroke-linejoin="round"/>${m}<text x="${X1}" y="${Y1 + 33}" text-anchor="end">V ${tname} (mL)</text><text x="10" y="${Y0 + 4}" font-weight="700">pH</text></svg></div>`;
}
function qGraph(q) {
  if (q.v === 'pka') {
    const an = [hxComp(q.pka)], ti = [comp('NaOH', 0.1)], j = jmp(an, ti), p0 = solvePH(0, 10, an, ti, BOOK), ph5 = solvePH(5, 10, an, ti, BOOK);
    return {
      text: 'Đồ thị dưới đây là đường cong chuẩn độ 10,00 mL acid một nấc HA 0,1 M bằng NaOH 0,1 M (bỏ qua pha loãng). Dựa vào đồ thị, pKa của HA gần nhất với giá trị nào?',
      fig: curveSVG(an, ti, 20, 'NaOH'),
      opts: [[f1(q.pka), true], [f1(p0), false, 'Đây là pH ban đầu (V = 0), lúc chưa có hệ đệm.'], [f1(j.pH), false, 'Đây là pH tại điểm tương đương (V = 10 mL), lúc dung dịch chỉ còn A⁻.'], [f1(j.a), false, 'Đây là pH ở đầu bước nhảy (99,9 %), xấp xỉ pKa + 3.']],
      body: H('Cách đọc') + UL(['<b>Bước 1 – tìm ĐTĐ:</b> điểm tương đương nằm giữa đoạn dựng đứng, ở V ≈ 10,0 mL.',
        '<b>Bước 2 – tìm điểm nửa trung hoà:</b> V = 10,0 : 2 = 5,0 mL. Lúc này một nửa HA đã chuyển thành A⁻, nên [HA] = [A⁻].',
        `<b>Bước 3 – áp dụng công thức đệm:</b> ${IM(MI('pH'), EQS, pkA, PLUS, LG(FR(SP('A⁻'), SP('HA'))), EQS, pkA, PLUS, MI('lg'), MN(1), EQS, pkA)}.`,
        `<b>Bước 4 – đọc đồ thị:</b> tại V = 5 mL, pH ≈ ${f1(ph5)}, nên pKa ≈ ${f1(q.pka)}.`]) +
        curveSVG(an, ti, 20, 'NaOH', { V: 5, pH: ph5, t: `nửa ĐTĐ: pH ≈ ${f1(ph5)}` }) +
        P('Đây là cách đọc pKa từ đường cong: ở điểm nửa trung hoà, pH = pKa. Quanh điểm này đường cong thoải nhất vì hệ đệm mạnh nhất.') };
  }
  const S = GSYS[q.sys];
  return {
    text: 'Đường cong dưới đây (mẫu 10,00 mL, bỏ qua pha loãng) ứng với phép chuẩn độ nào? Trục hoành là thể tích chất chuẩn đã thêm.',
    fig: curveSVG([comp(...S.an)], [comp(...S.ti)], 25, 'chất chuẩn'),
    opts: [[S.lab, true], ...q.others.map(k => [GSYS[k].lab, false, `Đường cong của phép chuẩn độ này có ${GSYS[k].feat}.`])],
    body: H('Các đặc điểm đọc được từ đồ thị') + UL(['<b>pH ban đầu</b> cho biết dung dịch trong bình nón là acid hay base, mạnh hay yếu.',
      '<b>Chiều biến đổi pH</b>: pH tăng thì chất chuẩn là base, pH giảm thì chất chuẩn là acid.',
      '<b>Đoạn thoải trước bước nhảy</b> (vùng đệm) cho biết chất cần định lượng là acid hoặc base yếu.',
      '<b>Số bước nhảy</b> cho biết có bao nhiêu nấc (hoặc thành phần) định lượng riêng được.']) +
      P(`Đường cong trong đề có ${S.feat}. Đó là đặc điểm của phép chuẩn độ <b>${S.lab}</b>.`) };
}

const NEWQ = { conc: qConc, str: qStr, pheq: qPheq, sign: qSign, graph: qGraph };
function genQ5b(t, r, ex, base) {
  const order = shuffle(r, [0, 1, 2, 3]);
  if (t === 'conc') return { t, v: pick(r, ['hcl', 'acoh', 'nh3', 'why']), order };
  if (t === 'str') return { t, v: pick(r, ['hcl-acoh', 'naoh-nh3', 'two', 'weak']), a: pick(r, [3.8, 4.2]), b: pick(r, [6.0, 6.5]), order };
  if (t === 'pheq') return { t, v: pick(r, Object.keys(PHEQ).filter(v => !(v === 'acoh' && ex.explore.kind === 'CH3COOH') && !(v === 'nh3' && ex.explore.kind === 'NH3'))), order };
  if (t === 'sign') { const used = base.find(x => x.t === 'err'); return { t, case: pick(r, ERR_CASES.filter(c => !used || c.id !== used.case)).id, order }; }
  const sys = pick(r, Object.keys(GSYS));
  return { t, v: pick(r, ['pka', 'id']), pka: pick(r, [3.8, 4.2, 4.6, 5.0, 5.4]), sys, others: shuffle(r, Object.keys(GSYS).filter(k => k !== sys)).slice(0, 3), order };
}
function newqAnswer(q) {
  const raw = NEWQ[q.t](q), opts = q.order.map(i => raw.opts[i]), k = opts.findIndex(o => o[1]);
  const wrong = opts.map((o, i) => [i, o]).filter(([, o]) => !o[1] && o[2]);
  const sol = `<p><b>Đáp án đúng: ${ABCD[k]}.</b> ${opts[k][0]}.</p>` + E1 + raw.body + E2 +
    (wrong.length ? H('Vì sao các phương án khác sai') + UL(wrong.map(([i, o]) => `<b>${ABCD[i]}.</b> ${o[2]}`)) : '');
  return { text: raw.text, fig: raw.fig || '', opts, k, sol };
}
