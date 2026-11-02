// PHÒNG THÍ NGHIỆM TỰ DO: giao diện thiết lập dung dịch, buret, đồ thị, bảng điểm tương đương.
// Các file js/ là script thường (không dùng module), nạp theo thứ tự trong index.html và dùng chung biến toàn cục.

// Mọi phép tính hóa học ở phần giao diện bên dưới gọi trực tiếp engine phía trên.
const $=id=>document.getElementById(id);

const fresh=(name,C)=>({name,C,n:library[name].n,pKa:[...library[name].pKa],zFull:library[name].zFull,h:library[name].h,counter:library[name].counter});
const newIndicator=name=>({id:'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),name,drops:'2',pT:(indicatorLibrary[name]?.pT??7).toFixed(2).replace('.',','),ptCustom:false,custom:{name:'',pKa:['','',''],colors:['#FFFFFF','#4A86E8','#D7263D','#F2D21A'],pT:'7,0'}});
const initial=()=>({
  analyte:[fresh('H3PO4','0,1')],titrant:[fresh('NaOH','0,1')],V0:'10,00',capacity:50,V:0,
  speed:'medium',theory:true,noDil:true,
  indicators:[newIndicator('Lục bromocresol')],
  tol:0.001,eqSel:{}
});
let state=initial(),model=null,points=[],samples=[],autoTimer=null,renderTimer=null,activeIndicators=[],activeDetails=[];
try{
  const saved=JSON.parse(localStorage.getItem('chuan-do-acid-base-v3'));
  if(saved && Array.isArray(saved.analyte) && Array.isArray(saved.titrant)){
    state={...initial(),...saved};
    if(!Array.isArray(saved.indicators)||!saved.indicators.length){
      const old=newIndicator(indicatorLibrary[saved.indicator]?saved.indicator:'Lục bromocresol');
      old.pT=saved.indicatorPT??old.pT;old.custom={...old.custom,...(saved.customIndicator||{})};
      state.indicators=[old];
    }
    state.indicators=state.indicators.slice(0,3).map((row,i)=>({...newIndicator('Lục bromocresol'),...row,id:row.id||'restored-'+i,custom:{...newIndicator('Lục bromocresol').custom,...(row.custom||{})}}));
    state.eqSel=state.eqSel||{};
  }
}catch(e){}
const number=x=>Number(String(x).trim().replace(',','.'));
const fmt=(x,d=2)=>Number.isFinite(x)?x.toLocaleString('vi-VN',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
function persist(){if(typeof lesson!=='undefined'&&lesson.active)return;try{localStorage.setItem('chuan-do-acid-base-v3',JSON.stringify(state))}catch(e){}}
// ===== BẢNG "CÁC ĐIỂM TƯƠNG ĐƯƠNG VÀ SAI SỐ CHUẨN ĐỘ" =====
// Nguồn dữ liệu duy nhất cho bảng và cho các đánh dấu trên đồ thị (eqRows).
let eqRows = [];
// Bước nhảy: ± s theo lượng chất chuẩn của RIÊNG giai đoạn đó (từ ĐTĐ trước đến ĐTĐ này)
function stageDV(i) { return points[i].Veq - (i > 0 ? points[i - 1].Veq : 0); }
function epSpan(i, t, dil) {
  const e = points[i], d = stageDV(i);
  const a = solvePH(e.Veq - t * d, model.v0, model.analyte, model.titrant, dil), b = solvePH(e.Veq + t * d, model.v0, model.analyte, model.titrant, dil);
  return [Math.min(a, b), Math.max(a, b)];
}
function epWidth(i) { const [a, b] = epSpan(i, 0.01); return b - a; }
const TOL_OPTIONS = [0.001, 0.002, 0.005, 0.01];
function tolValue() {
  const t = Number(state.tol);
  return Number.isFinite(t) && t >= 0.0001 && t <= 0.1 ? t : 0.001;
}
function indicatorOptions() {
  const out = [];
  activeDetails.forEach(({ row, detail }) => {
    const name = row.name === 'Chỉ thị tự nhập' ? (row.custom.name || 'Chỉ thị tự nhập') : row.name;
    detail.ranges.forEach((r, k) => {
      const rp = detail.rangePT[k] ?? detail.ind.pKa[k] ?? detail.defaultPT;
      const pT = detail.ranges.length === 1 || rp === detail.defaultPT ? number(row.pT) : rp;   // pT lấy từ khối "Chỉ thị trong bình nón"
      out.push({ key: row.id + '-' + k, label: detail.ranges.length > 1 ? `${name} (khoảng ${k + 1})` : name, range: r, pT });
    });
  });
  return out;
}
function computeEqRows() {
  eqRows = [];
  if (!model) return;
  const V0 = model.v0, an = model.analyte, ti = model.titrant, cap = Number(state.capacity), s = tolValue();
  const pHat = V => solvePH(V, V0, an, ti);
  const options = indicatorOptions();
  state.eqSel = state.eqSel || {};
  points.forEach((e, idx) => {
    if (!(Number.isFinite(e.Veq) && e.Veq > 0 && e.Veq <= cap)) return;
    const pHeq = pHat(e.Veq), j1 = epSpan(idx, 0.01), w1 = j1[1] - j1[0], observable = w1 >= UNOBSERVED_JUMP_THRESHOLD, hard = observable && w1 < CLEAR_JUMP;
    const [L, U] = epSpan(idx, s);
    const r = { idx, e, pHeq, L, U, observable, hard, dV: stageDV(idx) };
    if (observable && options.length) {
      let st = state.eqSel[idx];
      if (!st || !options.some(o => o.key === st.key)) {
        const best = options.reduce((a, o) => Math.abs(o.pT - pHeq) < Math.abs(a.pT - pHeq) ? o : a);
        st = state.eqSel[idx] = { key: best.key };
      }
      const opt = options.find(o => o.key === st.key), [a, b] = opt.range, pT = opt.pT;
      const V1 = volumeAtPH(a, V0, an, ti), V2 = volumeAtPH(b, V0, an, ti);
      const VendPlot = volumeAtPH(pT, V0, an, ti), Vend = volumeAtPH(pT, V0, an, ti, true);   // sai số luôn tính có pha loãng (V_T)
      Object.assign(r, {
        opt, a, b, pT, Vlo: Math.min(V1, V2), Vhi: Math.max(V1, V2), Vend, VendPlot, q: (Vend - e.Veq) / e.Veq * 100,
        rating: (a >= L && b <= U) ? 'tot' : (pT >= L && pT <= U) ? 'chapnhan' : 'khong'
      });
    }
    eqRows.push(r);
  });
}
var lesson = { active: false, layers: {} };
const layerOn = k => lesson.active ? !!(lesson.layers || {})[k] : (state.layers || {})[k] !== false;
function renderLegend() {
  const box = $('chart-legend'); if (!box) return;
  const d = activeDetails[0], rangeSw = d
    ? `linear-gradient(to right,${[0, .25, .5, .75, 1].map(t => { const [a, b] = d.detail.ranges[0]; return mixColor(a + (b - a) * t, [{ ...d.detail.ind, w: 1 }]); }).join(',')})`
    : '#e8eef0';
  const segSw = d ? `linear-gradient(to right,${[0, .5, 1].map(t => { const [a, b] = d.detail.ranges[0]; return mixColor(a + (b - a) * t, activeIndicators); }).join(',')})` : '#12733f';
  const items = [
    ['jump', 'Bước nhảy pH (± s)', 'background:#df925833;border:1px solid #df925888'],
    ['range', 'Khoảng đổi màu của chỉ thị', `background:${rangeSw};opacity:.6;border:1px solid #c8d6d8`],
    ['seg', 'Đoạn dung dịch đang đổi màu', `background:${segSw};height:6px;border-radius:3px`],
    ['pt', 'pT và điểm cuối', 'background:repeating-linear-gradient(to right,#b45566 0 4px,transparent 4px 8px);height:2px'],
    ['eq', 'Thể tích tương đương (V<sub>tđ</sub>)', 'background:repeating-linear-gradient(to bottom,#df9258 0 3px,transparent 3px 6px);width:2px;height:16px'],
    ['eqpt', 'Điểm tương đương', 'width:11px;height:11px;border-radius:2px;background:#df9258;border:2px solid #fff;box-shadow:0 0 0 1px #df9258;transform:rotate(45deg);margin:0 6px']
  ];
  box.innerHTML = items.map(([k, label, st]) =>
    `<label><input type="checkbox" data-layer="${k}" ${layerOn(k) ? 'checked' : ''}><span class="lg-sw" style="${st}"></span><span>${label}</span></label>`).join('')
    + (layerOn('pt') ? '' : '');
  box.querySelectorAll('[data-layer]').forEach(el => el.onchange = () => {
    state.layers = { ...(state.layers || {}), [el.dataset.layer]: el.checked }; persist(); graph();
  });
}

function renderEqTable() {
  const box = $('eq-table'); if (!box) return;
  computeEqRows();
  const title = '<h2 class="canva-text heading" style="color:#13321f;font-weight:700;font-size:23px">Các điểm tương đương và sai số chuẩn độ</h2>';
  if (!model) { box.innerHTML = title + '<p class="caption">Hãy nhập dữ liệu dung dịch hợp lệ để xem kết quả.</p>'; return; }
  if (!points.length) { box.innerHTML = title + '<p class="caption">Không có điểm tương đương: hai dung dịch không phản ứng trung hoà với nhau.</p>'; return; }
  const s = tolValue(), custom = !TOL_OPTIONS.includes(s), cap = Number(state.capacity), options = indicatorOptions();
  const RATE = {
    tot: ['Tốt', '#1b8a3a', 'Toàn bộ quá trình đổi màu xảy ra trong ± s quanh điểm tương đương.'],
    chapnhan: ['Chấp nhận', '#2563c9', 'Dừng đúng màu ở pT thì sai số ≤ s, nhưng màu chuyển từ từ qua nhiều giọt.'],
    khong: ['Không phù hợp', '#d9731a', 'Sai số tại pT lớn hơn s.']
  };
  const role = points[0].titrantRole === 'base' ? 'base (nhận proton)' : 'acid (cho proton)';
  const head = ['STT', 'Thành phần / nấc', 'V tương đương', 'pH tại ĐTĐ', 'Bước nhảy pH (± s)', 'Chỉ thị báo điểm cuối',
    'Khoảng đổi màu', 'Đổi màu khi V =', 'Đánh giá chỉ thị', 'V cuối', 'SS (%)'];
  const inside = V => Number.isFinite(V) && V >= 0 && V <= cap;
  let html = title + `
    <p class="eqt-role">Chất chuẩn đóng vai trò ${role} · <span class="caption">pH riêng bình nón: ${fmt(phAlone(model.analyte))} · pH riêng buret: ${fmt(phAlone(model.titrant))}</span></p>
    <div class="eqt-s"><label for="eqt-tol">Sai số cho phép của phép chuẩn độ (± s)</label>
      <select id="eqt-tol">${TOL_OPTIONS.map(v => `<option value="${v}" ${v === s ? 'selected' : ''}>${fmt(v * 100, 1)} %</option>`).join('')}
        <option value="custom" ${custom ? 'selected' : ''}>Tự nhập</option></select>
      <input id="eqt-tol-custom" inputmode="decimal" value="${fmt(s * 100, 2)}" style="width:80px;${custom ? '' : 'display:none'}" aria-label="Sai số cho phép tự nhập (%)"><span class="caption" style="${custom ? '' : 'display:none'}">%</span></div>
    <p class="caption eqt-note">Bước nhảy pH: khoảng pH khi lượng chất chuẩn của giai đoạn đó (từ điểm tương đương trước đến điểm này) đạt (100 − s) % đến (100 + s) % lượng cần thiết.</p>
    <div class="table-wrap"><table class="eqt-table"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
  eqRows.forEach((r, n) => {
    const name = state.analyte[r.e.comp]?.name || `Thành phần ${r.e.comp + 1}`;
    const step = typeof r.e.step === 'number' ? 'nấc ' + r.e.step : r.e.step;
    const base = [n + 1, `${name} · ${step}${r.hard ? '<br><span class="eqt-hard">bước nhảy nhỏ, khó quan sát</span>' : ''}`, `${fmt(r.e.Veq)} mL`, fmt(r.pHeq), `${fmt(r.L)} – ${fmt(r.U)}`];
    const cells = base.map((c, k) => `<td data-label="${head[k]}">${c}</td>`).join('');
    if (!r.observable || !r.opt) {
      html += `<tr class="muted-point">${cells}${'<td class="eqt-dash">—</td>'.repeat(5)}<td class="eqt-dash" data-label="Ghi chú">—</td><td class="eqt-mnote">Không quan sát được bước nhảy</td></tr>`;
      return;
    }
    const R = RATE[r.rating];
    html += `<tr>${cells}
      <td data-label="Chỉ thị báo điểm cuối"><select data-eq-ind="${r.idx}" aria-label="Chỉ thị báo điểm cuối">${options.map(o => `<option value="${o.key}" ${o.key === r.opt.key ? 'selected' : ''}>${o.label}</option>`).join('')}</select><span class="eqt-pt">pT = ${fmt(r.pT)}</span></td>
      <td data-label="Khoảng đổi màu">${fmt(r.a, 1)} – ${fmt(r.b, 1)}</td>
      <td data-label="Đổi màu khi V =">${inside(r.Vlo) && inside(r.Vhi) ? `${fmt(r.Vlo)} – ${fmt(r.Vhi)} mL` : 'ngoài buret'}</td>
      <td data-label="Đánh giá chỉ thị" style="color:${R[1]};font-weight:700">${R[0]}</td>
      <td data-label="V cuối">${inside(r.Vend) ? fmt(r.Vend) + ' mL' : 'ngoài buret'}</td>
      <td data-label="SS (%)">${(r.q > 0 ? '+' : r.q < 0 ? '−' : '') + fmt(Math.abs(r.q))} %</td></tr>`;
  });
  html += `</tbody></table></div><div class="eqt-legend"><p><b>Đánh giá chỉ thị</b> (so khoảng đổi màu và pT với bước nhảy pH ± s):</p>
    <p><b style="color:${RATE.tot[1]}">Tốt:</b> cả khoảng đổi màu của chỉ thị nằm trong bước nhảy. Từ lúc bắt đầu đổi màu đến lúc đổi hẳn màu, sai số đều ≤ s.</p>
    <p><b style="color:${RATE.chapnhan[1]}">Chấp nhận:</b> chỉ pT nằm trong bước nhảy, một phần khoảng đổi màu nằm ngoài. Dừng đúng ở pT thì sai số ≤ s, nhưng màu chuyển từ từ qua nhiều giọt nên dễ dừng sớm hoặc muộn.</p>
    <p><b style="color:${RATE.khong[1]}">Không phù hợp:</b> pT nằm ngoài bước nhảy. Dừng ở pT thì sai số lớn hơn s.</p>
    <p><b>SS (%)</b>: sai số chỉ thị. Dấu − là dừng trước điểm tương đương (chưa đủ chất chuẩn), dấu + là dừng sau điểm tương đương (dư chất chuẩn). pT lấy từ khối "Chỉ thị trong bình nón".</p></div>
    <p class="caption mt-2">${state.noDil !== false ? 'Đường cong và bước nhảy đang tính <b>bỏ qua pha loãng</b> ; ' : ''}V cuối và sai số SS luôn tính có kể pha loãng (thể tích V<sub>T</sub>).</p>`;
  box.innerHTML = html;
  const later = () => setTimeout(() => { persist(); renderEqTable(); graph(); }, 0);
  const sel = $('eqt-tol'), cin = $('eqt-tol-custom');
  sel.onchange = () => {
    if (sel.value === 'custom') { cin.style.display = ''; cin.nextElementSibling.style.display = ''; cin.focus(); return; }
    state.tol = Number(sel.value); later();
  };
  cin.onchange = () => { const v = number(cin.value); if (Number.isFinite(v) && v >= 0.01 && v <= 10) { state.tol = v / 100; later(); } };
  box.querySelectorAll('[data-eq-ind]').forEach(el => el.onchange = () => {
    const o = options.find(o => o.key === el.value); state.eqSel[el.dataset.eqInd] = { key: o.key }; later();
  });
}

function clampV(){state.V=Math.min(Number(state.capacity),Math.max(0,Number(state.V)||0))}
function stopAuto(){clearInterval(autoTimer);autoTimer=null;$('auto-button').classList.remove('hidden');$('stop-button').classList.add('hidden');}
function chargeLabel(z){return z===0?'':z>0?'⁺'.repeat(Math.min(z,3))+(z>3?String(z):''):'⁻'.repeat(Math.min(-z,3))+(z< -3?String(-z):'')}
function formulaLabel(c,h){
  const n=Number(c.n),z=Number(c.zFull)-(n-h),base=h?'H'+(h>1?h:'')+'A':'A';
  if(n===0 && c.counter==='water' && z>0) return 'M(OH)'+(z>1?z:'');
  if(n===1 && Number(c.zFull)===1) return h?'HB'+chargeLabel(z):'B';
  if(n===3 && Number(c.zFull)===0 && c.counter==='inert') return ['Na3A','Na2HA','NaH2A','H3A'][h];
  if(n===2 && Number(c.zFull)===0 && c.counter==='inert') return ['Na2A','NaHA','H2A'][h];
  if(n===1 && Number(c.zFull)===0 && h===1) return 'HA';
  return base+chargeLabel(z);
}
function companion(c,h){
  const z=Number(c.zFull)-(Number(c.n)-h);
  if(!z)return 'không cần ion đối';
  if(c.counter==='water')return z>0?'kèm '+(z>1?z+' ':'')+'OH⁻':'kèm '+(-z>1?-z+' ':'')+'H⁺';
  return z>0?'kèm ion trơ âm (ví dụ Cl⁻)':'kèm ion trơ dương (ví dụ Na⁺)';
}
function setOptions(select,items,value){
  select.replaceChildren();
  items.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;select.append(o)});
  select.value=String(value);
}
function paintForm(row,c,side,index){
  const prefix=side+'-'+index;
  row.querySelector('.component-heading').textContent='Thành phần '+(index+1);
  row.querySelectorAll('label').forEach((label,i)=>{const input=label.nextElementSibling;if(input && /^(INPUT|SELECT)$/.test(input.tagName)){input.id=prefix+'-'+i;label.htmlFor=input.id}});
  row.querySelector('.comp-name').value=c.name;
  row.querySelector('.comp-c').value=c.C;
  row.querySelector('.comp-n').value=c.n;
  row.querySelector('.comp-z').value=c.zFull;
  row.querySelector('.comp-counter').value=c.counter;
  setOptions(row.querySelector('.library'),[['','— Chọn chất —'],...Object.keys(library).map(k=>[k,k])],'');
  const pk=row.querySelector('.pka-fields');pk.replaceChildren();
  const n=Number(c.n);
  for(let k=0;k<Math.min(6,Math.max(0,Number.isInteger(n)?n:0));k++){
    const wrap=document.createElement('div');wrap.className='field';
    const label=document.createElement('label');label.textContent='pKa'+(k+1);
    const input=document.createElement('input');input.inputMode='decimal';input.value=c.pKa[k]??'';input.id=prefix+'-pka-'+k;label.htmlFor=input.id;
    input.addEventListener('input',()=>{c.pKa[k]=input.value;schedule()});
    wrap.append(label,input);pk.append(wrap);
  }
  const z=Number(c.zFull);
  setOptions(row.querySelector('.comp-h'),Number.isInteger(n)&&n>=0&&n<=6&&Number.isInteger(z)
    ?Array.from({length:n+1},(_,h)=>[h,`${h} H · ${formulaLabel(c,h)} · điện tích ${z-(n-h)>0?'+':''}${z-(n-h)}`])
    :[['0','Nhập n và zFull hợp lệ'],],Math.min(n,Math.max(0,Number(c.h))));
  row.querySelector('.form-note').textContent='Dạng đưa vào: '+formulaLabel(c,Number(c.h))+'; '+companion(c,Number(c.h))+'.';
  row.querySelector('.remove-component').disabled=state[side].length<=1;
}
function renderComponents(){
  for(const side of ['analyte','titrant']){
    const list=$(side+'-list');list.replaceChildren();
    state[side].forEach((c,index)=>{
      const row=$('component-template').content.firstElementChild.cloneNode(true);
      paintForm(row,c,side,index);
      row.querySelector('.remove-component').addEventListener('click',()=>{state[side].splice(index,1);renderComponents();recalculate()});
      row.querySelector('.library').addEventListener('change',e=>{if(!e.target.value)return;state[side][index]=fresh(e.target.value,c.C);renderComponents();recalculate()});
      for(const [selector,key] of [['.comp-name','name'],['.comp-c','C'],['.comp-n','n'],['.comp-z','zFull'],['.comp-h','h'],['.comp-counter','counter']]){
        row.querySelector(selector).addEventListener('input',e=>{
          c[key]=e.target.value;
          if(key==='n'){const n=number(c.n);c.pKa=Array.from({length:Math.max(0,Math.min(6,Number.isInteger(n)?n:0))},(_,i)=>c.pKa[i]??'');c.h=String(Math.min(Math.max(0,number(c.h)||0),n||0))}
          if(key==='n'||key==='zFull'||key==='h'||key==='counter'){paintForm(row,c,side,index)}
          schedule();
        });
      }
      list.append(row);
    });
    $(side==='analyte'?'add-analyte':'add-titrant').disabled=state[side].length>=(side==='analyte'?4:2);
  }
}
function validate(){
  const errors=[],v0=number(state.V0);
  if(!Number.isFinite(v0)||v0<1||v0>100)errors.push('V0 phải từ 1 đến 100 mL.');
  const lists={};
  for(const side of ['analyte','titrant']){
    const title=side==='analyte'?'Bình nón':'Buret';
    const max=side==='analyte'?4:2;
    if(!state[side].length||state[side].length>max)errors.push(`${title}: cần từ 1 đến ${max} thành phần.`);
    lists[side]=state[side].map((c,i)=>{
      const name=`${title}, thành phần ${i+1}`;
      const C=number(c.C),n=number(c.n),zFull=number(c.zFull),h=number(c.h);
      if(!Number.isFinite(C)||C<0.0001||C>2)errors.push(`${name}: C phải từ 0,0001 đến 2 mol/L.`);
      if(!Number.isInteger(n)||n<0||n>6)errors.push(`${name}: n phải là số nguyên từ 0 đến 6.`);
      if(!Number.isInteger(zFull))errors.push(`${name}: zFull phải là số nguyên.`);
      if(!Number.isInteger(h)||h<0||h>n)errors.push(`${name}: dạng đưa vào không hợp lệ.`);
      const pKa=(c.pKa||[]).map(number);
      if(Number.isInteger(n)&&pKa.length!==n)errors.push(`${name}: cần đúng ${n} giá trị pKa.`);
      if(pKa.some(x=>!Number.isFinite(x)))errors.push(`${name}: mỗi pKa phải là một số.`);
      if(pKa.some((x,j)=>j>0&&x<=pKa[j-1]))errors.push(`${name}: pKa phải tăng dần.`);
      if(!['inert','water'].includes(c.counter))errors.push(`${name}: ion đối không hợp lệ.`);
      return {C,pKa,zFull,h,counter:c.counter};
    });
  }
  return {errors,v0,analyte:lists.analyte,titrant:lists.titrant};
}
function schedule(){persist();clearTimeout(renderTimer);renderTimer=setTimeout(recalculate,130)}
function svg(tag,attrs,parent,text){
  const el=document.createElementNS('http://www.w3.org/2000/svg',tag);
  for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));
  if(text!==undefined)el.textContent=text;
  parent.append(el);return el;
}
function indicatorDetail(row){
  if(row.name!=='Chỉ thị tự nhập'){
    const entry=indicatorLibrary[row.name]||indicatorLibrary['Lục bromocresol'];
    return {ind:{pKa:entry.pKa,colors:entry.colors},ranges:entry.ranges,defaultPT:entry.pT,rangePT:entry.rangePT||[entry.pT],error:''};
  }
  const raw=(row.custom?.pKa||[]).slice(0,3),filled=raw.filter(x=>String(x??'').trim()!=='');
  const values=filled.map(number);let error='';
  if(!filled.length)error='Chỉ thị tự nhập cần ít nhất một pKa.';
  else if(values.some(v=>!Number.isFinite(v)||v<0||v>14))error='Mỗi pKa phải là số từ 0 đến 14.';
  else if(values.some((v,i)=>i>0&&v<=values[i-1]))error='Các pKa đã nhập phải tăng dần.';
  const pKa=error?[]:values,colors=(row.custom?.colors||[]).slice(0,pKa.length+1);
  if(!error&&colors.some(c=>!/^#[0-9a-f]{6}$/i.test(c)))error='Màu từng dạng phải là mã màu hợp lệ.';
  return {ind:{pKa,colors},ranges:pKa.map(v=>[Math.max(0,v-1),Math.min(14,v+1)]),defaultPT:pKa[0]??7,rangePT:pKa,error};
}
function rowError(row,detail){
  const drops=number(row.drops),pt=number(row.pT);
  if(String(row.drops).trim()===''||!Number.isInteger(drops)||drops<1||drops>5)return 'Số giọt phải là số nguyên từ 1 đến 5.';
  if(detail.error)return detail.error;
  if(String(row.pT).trim()===''||!Number.isFinite(pt)||pt<0||pt>14)return 'pT của chỉ thị phải là số từ 0 đến 14.';
  return '';
}
function updateIndicatorState(){
  activeIndicators=[];activeDetails=[];const errors=[];
  state.indicators.forEach((row,i)=>{
    const detail=indicatorDetail(row),node=[...$('indicator-list').children][i];
    if(!row.ptCustom){row.pT=fmt(detail.defaultPT,2);if(node)node.querySelector('.indicator-pt').value=row.pT}
    const error=rowError(row,detail);
    if(node){node.querySelector('.field-error').textContent=error;node.querySelector('.field-error').classList.toggle('hidden',!error)}
    if(error)errors.push(`Chỉ thị ${i+1}: ${error}`);
    else{activeIndicators.push({...detail.ind,w:number(row.drops)/2});activeDetails.push({row,detail})}
  });
  $('indicator-error').textContent=errors.join('\n');$('indicator-error').classList.toggle('hidden',!errors.length);
  renderPHScale();
}
function renderCustomColors(node,row,detail){
  const holder=node.querySelector('.custom-color-fields');holder.replaceChildren();
  if(row.name!=='Chỉ thị tự nhập')return;
  const count=Math.min(4,Math.max(2,detail.ind.pKa.length+1));
  for(let i=0;i<count;i++){
    const wrap=document.createElement('div');wrap.className='field';
    const label=document.createElement('label');label.textContent='Màu dạng '+(i+1)+(i===0?' · proton hóa nhiều nhất':'');
    const input=document.createElement('input');input.type='color';input.id='indicator-'+row.id+'-color-'+i;label.htmlFor=input.id;
    input.value=/^#[0-9a-f]{6}$/i.test(row.custom.colors[i]||'')?row.custom.colors[i]:'#FFFFFF';
    input.addEventListener('input',e=>{row.custom.colors[i]=e.target.value.toUpperCase();refreshIndicator()});
    wrap.append(label,input);holder.append(wrap);
  }
}
function paintIndicator(node,row,index){
  const detail=indicatorDetail(row);
  node.querySelector('.row-title').textContent='Chỉ thị '+(index+1);
  node.querySelector('.remove-indicator').disabled=state.indicators.length<=1;
  const select=node.querySelector('.indicator-select');
  setOptions(select,[...Object.keys(indicatorLibrary),'Chỉ thị tự nhập'].map(name=>[name,name]),row.name);
  node.querySelector('.indicator-drops').value=row.drops;
  const ptIn=node.querySelector('.indicator-pt'),ptBtn=node.querySelector('.pt-toggle');
  if(!row.ptCustom)row.pT=fmt(detail.defaultPT,2);
  ptIn.value=row.pT;ptIn.disabled=!row.ptCustom;ptIn.id='indicator-'+row.id+'-pt';node.querySelector('.pt-label').htmlFor=ptIn.id;
  ptBtn.textContent=row.ptCustom?'Về pT mặc định':'Tùy chỉnh pT';ptBtn.setAttribute('aria-pressed',String(!!row.ptCustom));
  node.querySelector('.pt-note').innerHTML='pT là pH mà người làm thí nghiệm chọn để dừng chuẩn độ (lúc chỉ thị đổi màu rõ nhất), không phải hằng số của chỉ thị như pKa hay khoảng đổi màu. Giá trị mặc định là pT thường dùng của chỉ thị'+(detail.ranges.length>1?' (áp dụng cho khoảng đổi màu có pT '+fmt(detail.defaultPT,2)+')':'')+'. Giá trị này dùng để tính V cuối và SS (%) ở bảng "Các điểm tương đương và sai số chuẩn độ".'+(row.ptCustom?' <b>Đang dùng pT tự chọn.</b>':'');
  node.querySelector('.custom-indicator').classList.toggle('hidden',row.name!=='Chỉ thị tự nhập');
  node.querySelector('.custom-name').value=row.custom.name||'';
  node.querySelectorAll('.custom-pka').forEach((input,i)=>{input.value=row.custom.pKa[i]??''});
  node.querySelectorAll('label').forEach((label,i)=>{
    const control=label.nextElementSibling;
    if(control&&/^(INPUT|SELECT)$/.test(control.tagName)){control.id='indicator-'+row.id+'-'+i;label.htmlFor=control.id}
  });
  renderCustomColors(node,row,detail);
  node.querySelector('.indicator-pkas').textContent='pKa đã dùng: '+(detail.ind.pKa.length?detail.ind.pKa.map(v=>fmt(v,2)).join('; '):'Không có pKa');
  node.querySelector('.indicator-ranges').textContent='Khoảng đổi màu (chỉ để hiển thị): '+(detail.ranges.length?detail.ranges.map(([a,b])=>fmt(a,1)+'–'+fmt(b,1)).join(' · '):'—');
  node.querySelector('.indicator-default-pt').textContent='pT mặc định: '+fmt(detail.defaultPT,2)+(indicatorLibrary[row.name]&&indicatorLibrary[row.name].sol?' · Dung dịch chỉ thị: '+indicatorLibrary[row.name].sol:'');
  const swatches=node.querySelector('.indicator-swatches');swatches.replaceChildren();
  detail.ind.colors.forEach((color,i)=>{const item=document.createElement('span');item.className='swatch';const chip=document.createElement('i');chip.style.backgroundColor=color;const text=document.createElement('span');text.textContent='Dạng '+(i+1)+': '+color.toUpperCase();item.append(chip,text);swatches.append(item)});
}
function renderIndicators(){
  const holder=$('indicator-list');holder.replaceChildren();
  state.indicators.forEach((row,index)=>{
    const node=$('indicator-template').content.firstElementChild.cloneNode(true);paintIndicator(node,row,index);holder.append(node);
    node.querySelector('.remove-indicator').addEventListener('click',()=>{if(state.indicators.length<=1)return;state.indicators.splice(index,1);renderIndicators();refreshIndicator()});
    node.querySelector('.indicator-select').addEventListener('change',e=>{
      row.name=e.target.value;const d=indicatorDetail(row);row.ptCustom=false;state.eqSel={};row.pT=fmt(d.defaultPT,2);
      paintIndicator(node,row,index);refreshIndicator();
    });
    node.querySelector('.indicator-drops').addEventListener('input',e=>{row.drops=e.target.value;refreshIndicator()});
    node.querySelector('.indicator-pt').addEventListener('input',e=>{if(!row.ptCustom)return;row.pT=e.target.value;refreshIndicator()});
    node.querySelector('.pt-toggle').addEventListener('click',()=>{
      row.ptCustom=!row.ptCustom;if(!row.ptCustom)row.pT=fmt(indicatorDetail(row).defaultPT,2);
      paintIndicator(node,row,index);refreshIndicator();if(row.ptCustom)node.querySelector('.indicator-pt').focus();
    });
    node.querySelector('.custom-name').addEventListener('input',e=>{row.custom.name=e.target.value;refreshIndicator()});
    node.querySelectorAll('.custom-pka').forEach((input,i)=>input.addEventListener('input',e=>{
      row.custom.pKa[i]=e.target.value;
      const d=indicatorDetail(row);renderCustomColors(node,row,d);
      node.querySelector('.indicator-pkas').textContent='pKa đã dùng: '+(d.ind.pKa.length?d.ind.pKa.map(v=>fmt(v,2)).join('; '):'Không có pKa');
      node.querySelector('.indicator-ranges').textContent='Khoảng đổi màu (chỉ để hiển thị): '+(d.ranges.length?d.ranges.map(([a,b])=>fmt(a,1)+'–'+fmt(b,1)).join(' · '):'—');
      refreshIndicator();
    }));
  });
  $('add-indicator').disabled=state.indicators.length>=3;
  updateIndicatorState();
}
function renderPHScale(){
  const bar=$('ph-gradient');bar.replaceChildren();
  const stops=Array.from({length:141},(_,i)=>`${mixColor(i/10,activeIndicators)} ${(i/140*100).toFixed(3)}%`);
  bar.style.background='linear-gradient(to right,'+stops.join(',')+')';
  activeDetails.forEach(({row,detail},index)=>{
    detail.ranges.forEach(([a,b])=>{
      const band=document.createElement('span');band.className='range-overlay';
      band.style.left=(a/14*100)+'%';band.style.width=((b-a)/14*100)+'%';
      band.style.borderColor=detail.ind.colors[Math.min(detail.ind.colors.length-1,1)];
      band.title=(row.custom.name||row.name)+' · khoảng '+fmt(a,1)+'–'+fmt(b,1);
      bar.append(band);
    });
    const pt=number(row.pT);
    if(detail.ranges.length&&Number.isFinite(pt)&&pt>=0&&pt<=14){const mark=document.createElement('span');mark.className='pt-marker';mark.style.left=(pt/14*100)+'%';mark.style.background=detail.ind.colors[Math.min(detail.ind.colors.length-1,1)];mark.title=(row.custom.name||row.name)+' · pT '+fmt(pt,2);bar.append(mark)}
  });
  bar.setAttribute('aria-label','Thang màu pH 0 đến 14; '+activeDetails.map(({row,detail})=>(row.custom.name||row.name)+': '+detail.ranges.map(([a,b])=>fmt(a,1)+' đến '+fmt(b,1)).join(', ')+'; pT '+fmt(number(row.pT))).join('; '));
}
function observablePoints(){
  if(!model)return [];
  return points.map((p,i)=>({p,i})).filter(({p,i})=>Number.isFinite(p.Veq)&&p.Veq>0&&p.Veq<=Number(state.capacity)&&epWidth(i)>=UNOBSERVED_JUMP_THRESHOLD);
}
function renderSequence(){
  const holder=$('color-sequence');holder.replaceChildren();
  if(!model){holder.textContent='Hãy nhập dữ liệu dung dịch hợp lệ để xem chuỗi đổi màu.';return}
  const milestones=[{V:0,label:'Ban đầu'}];
  observablePoints().forEach(({p,i})=>{milestones.push({V:p.Veq-.01*stageDV(i),label:'Trước ĐTĐ'+(i+1),badge:'ĐTĐ'+(i+1)});milestones.push({V:p.Veq+.01*stageDV(i),label:'Sau ĐTĐ'+(i+1),badge:'ĐTĐ'+(i+1)})});
  milestones.push({V:Number(state.capacity),label:'Dư chất chuẩn'});
  milestones.forEach((m,i)=>{
    if(i){const arrow=document.createElement('span');arrow.className='sequence-arrow';arrow.textContent='→';arrow.setAttribute('aria-hidden','true');holder.append(arrow)}
    const ph=solvePH(m.V,model.v0,model.analyte,model.titrant),color=mixColor(ph,activeIndicators);
    const step=document.createElement('div');step.className='sequence-step';
    if(m.badge){const badge=document.createElement('span');badge.className='sequence-badge';badge.textContent=m.badge;step.append(badge)}
    const chip=document.createElement('div');chip.className='sequence-chip';chip.style.backgroundColor=color;chip.setAttribute('aria-label','Màu '+color);
    const label=document.createElement('small');label.textContent=m.label+' · '+fmt(m.V)+' mL · pH '+fmt(ph);
    step.append(chip,label);holder.append(step);
  });
}
function graph(){
  const chart=$('chart');chart.replaceChildren();
  if(!model)return;
  const cap=Number(state.capacity),left=55,right=725,top=27,bottom=405;
  const x=v=>left+(right-left)*v/cap,y=ph=>bottom-(bottom-top)*Math.max(0,Math.min(14,ph))/14;
  if(layerOn('range'))activeDetails.forEach(({detail})=>detail.ranges.forEach(([a,b])=>{
    const low=Math.max(0,a),high=Math.min(14,b),slices=Math.max(6,Math.ceil((high-low)*12));
    for(let i=0;i<slices;i++){
      const p0=low+(high-low)*i/slices,p1=low+(high-low)*(i+1)/slices;
      svg('rect',{x:left,y:y(p1),width:right-left,height:Math.max(.2,y(p0)-y(p1)),fill:mixColor((p0+p1)/2,[{...detail.ind,w:1}]),opacity:.13},chart);
    }
  }));
  for(let p=0;p<=14;p+=2){svg('line',{x1:left,y1:y(p),x2:right,y2:y(p),stroke:'#dcebdf','stroke-width':1},chart);svg('text',{x:43,y:y(p)+4,'text-anchor':'end',fill:'#55705f','font-size':12},chart,String(p))}
  for(let v=0;v<=cap;v+=5){svg('line',{x1:x(v),y1:top,x2:x(v),y2:bottom,stroke:'#edf3ee'},chart);svg('text',{x:x(v),y:bottom+19,'text-anchor':'middle',fill:'#55705f','font-size':11},chart,String(v))}
  svg('line',{x1:left,y1:top,x2:left,y2:bottom,stroke:'#44684f','stroke-width':2},chart);
  svg('line',{x1:left,y1:bottom,x2:right,y2:bottom,stroke:'#44684f','stroke-width':2},chart);
  if(layerOn('jump'))eqRows.filter(r => r.observable).forEach(r => {
    const s = tolValue(), x0 = x(r.e.Veq - s * r.dV), x1 = x(r.e.Veq + s * r.dV);
    svg('rect', { x: x0, y: top, width: Math.max(1, x1 - x0), height: bottom - top, fill: '#df9258', opacity: .07 }, chart);
    svg('rect', { x: left, y: y(r.U), width: right - left, height: Math.max(1, y(r.L) - y(r.U)), fill: '#df9258', opacity: .07 }, chart);
  });
  const visible=points.filter(p=>p.Veq>=0&&p.Veq<=cap);
  if(layerOn('eq'))visible.forEach((p,i)=>{
    const xx=x(p.Veq),w1=epWidth(points.indexOf(p)),faint=w1<UNOBSERVED_JUMP_THRESHOLD,hard=!faint&&w1<CLEAR_JUMP;
    const line=svg('line',{x1:xx,y1:top,x2:xx,y2:bottom,stroke:faint?'#a9c2b0':hard?'#c9a227':'#df9258','stroke-width':1.5,'stroke-dasharray':'5 5',opacity:faint?.5:1},chart);
    const badge=svg('g',{transform:`translate(${Math.min(xx-19,right-40)},${bottom-25})`,style:'cursor:pointer'},chart);
    svg('rect',{x:0,y:0,width:38,height:18,rx:6,fill:faint?'#a9c2b0':hard?'#c9a227':'#df9258',opacity:faint?.75:1},badge);
    const bt=svg('text',{x:19,y:13,'text-anchor':'middle',fill:'#fff','font-size':11,'font-weight':'700'},badge);
    svg('tspan',{},bt,'V');svg('tspan',{'font-size':8,dy:3},bt,'tđ'+(i+1));
    const tip=`Thể tích tương đương ${i+1}: Vtđ = ${fmt(p.Veq)} mL`+(faint?' · không quan sát được bước nhảy':hard?' · bước nhảy nhỏ, khó quan sát':'');
    [line,badge].forEach(el=>{el.addEventListener('mouseenter',()=>{$('chart-note').textContent=tip});el.addEventListener('mouseleave',()=>{$('chart-note').textContent=''})});
  });
  svg('text',{x:left+8,y:top+14,fill:'#55705f','font-size':12,'font-weight':'700'},chart,'pH');
  svg('text',{x:right,y:bottom+54,'text-anchor':'end',fill:'#55705f','font-size':12,'font-weight':'700'},chart,'V (mL)');
  const d=samples.map((p,i)=>(i?'L':'M')+x(p.v).toFixed(3)+' '+y(p.ph).toFixed(3)).join(' ');
  if(state.theory)svg('path',{d,fill:'none',stroke:'#a6cdb0','stroke-width':2},chart);
  if(layerOn('seg'))eqRows.filter(r => r.opt).forEach(r => {
    const start = Math.max(0, r.Vlo), end = Math.min(cap, r.Vhi);
    if (!(end > start)) return;
    const pieces = 24;
    for (let j = 0; j < pieces; j++) {
      const v0 = start + (end - start) * j / pieces, v1 = start + (end - start) * (j + 1) / pieces;
      const ph0 = solvePH(v0, model.v0, model.analyte, model.titrant), ph1 = solvePH(v1, model.v0, model.analyte, model.titrant);
      svg('line', { x1: x(v0), y1: y(ph0), x2: x(v1), y2: y(ph1), stroke: mixColor((ph0 + ph1) / 2, activeIndicators), 'stroke-width': 6, 'stroke-linecap': 'round', opacity: .9 }, chart);
    }
  });
  const current=state.V,partial=samples.filter(p=>p.v<=current);
  if(!partial.length||partial[partial.length-1].v!==current)partial.push({v:current,ph:solvePH(current,model.v0,model.analyte,model.titrant)});
  svg('path',{d:partial.map((p,i)=>(i?'L':'M')+x(p.v).toFixed(3)+' '+y(p.ph).toFixed(3)).join(' '),fill:'none',stroke:'#12733f','stroke-width':3,'stroke-linejoin':'round'},chart);
  const ph=solvePH(current,model.v0,model.analyte,model.titrant);
  svg('circle',{cx:x(current),cy:y(ph),r:7,fill:'#12733f',stroke:'white','stroke-width':3},chart);
  if(layerOn('eqpt'))visible.forEach((p,i)=>{
    const ph0=solvePH(p.Veq,model.v0,model.analyte,model.titrant),cx=x(p.Veq),cy=y(ph0),faint=epWidth(points.indexOf(p))<UNOBSERVED_JUMP_THRESHOLD;
    const d=svg('rect',{x:cx-5.5,y:cy-5.5,width:11,height:11,rx:1.5,fill:faint?'#a9c2b0':'#df9258',stroke:'#fff','stroke-width':2,transform:`rotate(45 ${cx} ${cy})`,style:'cursor:pointer'},chart);
    const tip=`Điểm tương đương ${i+1}: Vtđ = ${fmt(p.Veq)} mL, pH = ${fmt(ph0)}`;
    svg('title',{},d,tip);d.addEventListener('mouseenter',()=>{$('chart-note').textContent=tip});d.addEventListener('mouseleave',()=>{$('chart-note').textContent=''});
  });
  if(layerOn('pt'))eqRows.filter(r => r.opt).forEach(r => {
    const line = svg('line', { x1: left, y1: y(r.pT), x2: right, y2: y(r.pT), stroke: '#b45566', 'stroke-width': 1.5, 'stroke-dasharray': '4 5', opacity: .8 }, chart);
    svg('title', {}, line, 'pT = ' + fmt(r.pT));
    if (Number.isFinite(r.VendPlot) && r.VendPlot >= 0 && r.VendPlot <= cap) {
      const dot = svg('circle', { cx: x(r.VendPlot), cy: y(r.pT), r: 5, fill: '#b45566', stroke: '#fff', 'stroke-width': 2 }, chart);
      const tip = 'Điểm cuối (ĐTĐ ' + (r.idx + 1) + '): ' + fmt(r.Vend) + ' mL · pT ' + fmt(r.pT);
      svg('title', {}, dot, tip);
      dot.addEventListener('mouseenter', () => { $('chart-note').textContent = tip });
      dot.addEventListener('mouseleave', () => { $('chart-note').textContent = '' });
    }
  });
  $('chart-note').textContent = '';
}
function makeSamples(){
  const cap=Number(state.capacity),values=[];
  for(let i=0;i<=600;i++)values.push(cap*i/600);
  for(const p of points){
    if(!Number.isFinite(p.Veq)||p.Veq<=0||p.Veq>cap)continue;
    for(let j=-200;j<=200;j++)values.push(p.Veq*(1+j*0.0001));
  }
  values.sort((a,b)=>a-b);
  samples=[];let last=-1;
  for(const v of values){
    if(v<0||v>cap||v-last<1e-9)continue;
    samples.push({v,ph:solvePH(v,model.v0,model.analyte,model.titrant)});last=v;
  }
}
function buretScale() {
  const cap = Number(state.capacity), g = document.getElementById('buret-scale');
  if (!g) return;
  g.querySelectorAll('text').forEach((t, i) => { const v = i * 5 * cap / 50; t.textContent = String(v).replace('.', ','); });
}
function setLab(V, V0, color, open) {
  const cap = Number(state.capacity) || 50;
  const top = 40 + Math.min(V, cap) * 290 / cap;              // vạch 0 ở y = 40, vạch cuối ở y = 330
  const bl = document.getElementById('buret-liquid');
  if (bl) { bl.setAttribute('y', top); bl.setAttribute('height', 360 - top); }
  const meniscus = document.getElementById('buret-meniscus'); if (meniscus) meniscus.setAttribute('cy', top);
  const sy = Math.max(495, 548 - 0.6 * (V0 + V));
  const hw = 30 + (sy - 490) * 38 / 82;
  ['flask-liquid', 'flask-liquid-under', 'flask-liquid-depth'].forEach(id => { const r = document.getElementById(id); if (r) { r.setAttribute('y', sy); r.setAttribute('height', 600 - sy); } });
  ['flask-surface', 'flask-surface-shine', 'ripple'].forEach(id => { const e = document.getElementById(id); if (e) { e.setAttribute('cy', sy); if (id !== 'ripple') e.setAttribute('rx', hw); } });
  const liquid = document.getElementById('flask-liquid'); if (liquid) liquid.setAttribute('fill', color);
  const surface = document.getElementById('flask-surface'); if (surface) surface.setAttribute('fill', color);
  const handle = document.getElementById('stopcock-handle'); if (handle && open) handle.setAttribute('transform', 'rotate(-90 186 380.5)'); // khoá tự đóng lại sau hoạt hình giọt
  return sy;
}
let closeTimer = null;
function animateDrop(nextV) {
  if (!model || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const drop = $('drop'), ripple = $('ripple'), swirl = $('flask-swirl'), handle = $('stopcock-handle');
  const sy = Math.max(495, 548 - 0.6 * (number(state.V0) + nextV));
  if (handle) handle.setAttribute('transform', 'rotate(-90 186 380.5)');
  clearTimeout(closeTimer); closeTimer = setTimeout(() => handle && handle.setAttribute('transform', ''), 420);
  if (drop && drop.animate) {
    drop.animate([{ transform: 'translateY(0px)', opacity: 1 }, { transform: `translateY(${sy - 452}px)`, opacity: 1 }],
      { duration: 300, easing: 'cubic-bezier(.5,0,1,1)' });
  }
  if (ripple && ripple.animate) {
    ripple.animate([{ transform: 'scale(1)', opacity: .9 }, { transform: 'scale(11)', opacity: 0 }],
      { duration: 520, delay: 280, easing: 'ease-out' });
  }
  const phNow = solvePH(nextV, model.v0, model.analyte, model.titrant);
  const phAhead = solvePH(Math.min(Number(state.capacity), nextV + 0.5), model.v0, model.analyte, model.titrant);
  const c1 = mixColor(phNow, activeIndicators), c2 = mixColor(phAhead, activeIndicators);
  const diff = [1, 3, 5].reduce((s, i) => s + Math.abs(parseInt(c1.slice(i, i + 2), 16) - parseInt(c2.slice(i, i + 2), 16)), 0);
  if (swirl && swirl.animate && diff > 60) {
    swirl.setAttribute('stroke', c2);
    swirl.animate([{ opacity: .9, transform: 'rotate(0deg)' }, { opacity: 0, transform: 'rotate(160deg)' }],
      { duration: 1000, delay: 280, easing: 'ease-out' });
  }
}
function updateVolume(){
  clampV();$('volume-slider').value=state.V;
  $('volume-readout').textContent=fmt(state.V)+' mL';
  const ph=model?solvePH(state.V,model.v0,model.analyte,model.titrant):NaN;
  $('ph-readout').textContent=fmt(ph);
  const color=Number.isFinite(ph)?mixColor(ph,activeIndicators):'#FFFFFF';
  setLab(state.V,number(state.V0),color,false);
  updateMobileBar();graph();persist();
}
function recalculate(){
  clearTimeout(renderTimer);stopAuto();
  const validated=validate();$('errors').classList.toggle('hidden',!validated.errors.length);
  $('errors').textContent=validated.errors.join('\n');
  model=validated.errors.length?null:validated;
  points=model?equivalencePoints(model.v0,model.analyte,model.titrant):[];
  $('volume-slider').max=state.capacity;clampV();buretScale();
  samples=[];if(model)makeSamples();
  renderEqTable();renderSequence();renderLegend();updateSetupSummary();updateVolume();
}
function move(delta){if(!model)return;const next=Math.min(Number(state.capacity),Math.round((state.V+delta)*100)/100);if(next>state.V)animateDrop(next);state.V=next;updateVolume()}
function refreshIndicator(){updateIndicatorState();renderSequence();renderEqTable();renderLegend();updateVolume();persist()}
// ===== Điện thoại: thu gọn thiết lập, thanh điều khiển dưới =====
const narrow = window.matchMedia('(max-width:700px)');
function setSetupCollapsed(c) {
  $('setup-body').classList.toggle('collapsed', c);
  $('setup-toggle').textContent = c ? 'Sửa dung dịch ▼' : 'Thu gọn ▲';
  $('setup-toggle').setAttribute('aria-expanded', String(!c));
}
function updateSetupSummary() {
  const desc = list => list.map(c => `${c.name || 'chất'} ${String(c.C).replace('.', ',')} M`).join(' + ');
  $('setup-summary').innerHTML = `<b>Bình nón:</b> ${desc(state.analyte)} · ${state.V0} mL<br><b>Buret:</b> ${desc(state.titrant)} · ${state.capacity} mL`;
}
$('setup-toggle').addEventListener('click', () => setSetupCollapsed(!$('setup-body').classList.contains('collapsed')));
document.querySelectorAll('[data-mstep]').forEach(b => b.addEventListener('click', () => move(Number(b.dataset.mstep))));
function updateMobileBar() {
  $('mbar-v').textContent = fmt(state.V);
  const ph = model ? solvePH(state.V, model.v0, model.analyte, model.titrant) : NaN;
  $('mbar-ph').textContent = fmt(ph);
  $('mbar-chip').style.background = Number.isFinite(ph) ? mixColor(ph, activeIndicators) : '#fff';
}

$('add-analyte').addEventListener('click',()=>{if(state.analyte.length>=4)return;state.analyte.push(fresh('CH3COOH','0,1'));renderComponents();recalculate()});
$('add-titrant').addEventListener('click',()=>{if(state.titrant.length>=2)return;state.titrant.push(fresh('NaOH','0,1'));renderComponents();recalculate()});
$('swap').addEventListener('click',()=>{
  [state.analyte,state.titrant]=[state.titrant,state.analyte];
  state.analyte=state.analyte.slice(0,4);state.titrant=state.titrant.slice(0,2);
  const oldV0=number(state.V0);
  state.V0=fmt(Math.min(100,Math.max(1,Number(state.capacity))));
  state.capacity=oldV0<=25?25:50;
  state.V=0;$('v0').value=state.V0;$('capacity').value=state.capacity;
  renderComponents();recalculate();
});
$('v0').addEventListener('input',e=>{state.V0=e.target.value;schedule()});
$('capacity').addEventListener('change',e=>{state.capacity=Number(e.target.value);state.V=0;recalculate()});
$('speed').addEventListener('change',e=>{state.speed=e.target.value;persist()});
$('show-theory').addEventListener('change',e=>{state.theory=e.target.checked;graph();persist()});
$('no-dil').addEventListener('change',e=>{state.noDil=e.target.checked;recalculate()});
$('volume-slider').addEventListener('input',e=>{state.V=number(e.target.value);updateVolume()});
$('drop-button').addEventListener('click',()=>move(.05));
$('tenth-button').addEventListener('click',()=>move(.1));
$('half-ml-button').addEventListener('click',()=>move(.5));
$('ml-button').addEventListener('click',()=>move(1));
$('reset-button').addEventListener('click',()=>{stopAuto();state.V=0;updateVolume()});
$('auto-button').addEventListener('click',()=>{
  if(!model||state.V>=Number(state.capacity))return;
  $('auto-button').classList.add('hidden');$('stop-button').classList.remove('hidden');
  autoTimer=setInterval(()=>{
    if(state.V>=Number(state.capacity)){stopAuto();return}
    const distance=Math.min(...points.filter(p=>p.Veq>state.V&&p.Veq<=Number(state.capacity)).map(p=>p.Veq-state.V),Infinity);
    const step=distance<.5?.05:({slow:.05,medium:.1,fast:.25}[state.speed]||.1);
    move(step);
  },180);
});
$('stop-button').addEventListener('click',stopAuto);
$('add-indicator').addEventListener('click',()=>{if(state.indicators.length>=3)return;state.indicators.push(newIndicator('Lục bromocresol'));renderIndicators();refreshIndicator()});
$('quick-indicators').addEventListener('click',()=>{state.indicators=[newIndicator('Lục bromocresol'),newIndicator('Phenolphtalein')];state.eqSel={};renderIndicators();refreshIndicator()});

$('v0').value=state.V0;$('capacity').value=state.capacity;
$('speed').value=state.speed;$('show-theory').checked=state.theory;$('no-dil').checked=state.noDil!==false;
