const $=s=>document.querySelector(s);
const rp=n=>'Rp'+Number(n||0).toLocaleString('id-ID');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const defMenu=[["Nasi Goreng",25000],["Mie Goreng",23000],["Ayam Bakar",32000],["Sate Ayam (10 tusuk)",28000],["Soto Ayam",22000],["Es Teh Manis",6000],["Es Jeruk",9000],["Kopi Hitam",10000]].map((m,i)=>({id:i+1,name:m[0],price:m[1]}));
let S;
try{S=JSON.parse(localStorage.getItem('kasir-restoran'))}catch(e){}
if(!S||!S.menu)S={menu:defMenu,orders:{},nTables:12,nextId:100};
if(!S.shop)S.shop={name:'Nama Restoran',addr:''};
if(!S.sales)S.sales=[];
if(!S.discounts)S.discounts=[{code:'HEMAT10',type:'pct',value:10,min:0,max:0,exp:''},{code:'PROMO5K',type:'amt',value:5000,min:50000,max:0,exp:''}];
const save=()=>{try{localStorage.setItem('kasir-restoran',JSON.stringify(S))}catch(e){}};
let cur=null,draft=null;

const ago=t=>{if(!t)return'';const m=Math.floor((Date.now()-t)/60000);return m<1?'baru saja':m<60?m+' mnt':Math.floor(m/60)+' j '+(m%60)+' mnt'};
const qty=o=>o.items.reduce((s,x)=>s+x.qty,0);
function setBrand(){
  const el=$('#logo'),l=S.shop.logo;
  $('#ttl').textContent=S.shop.name;
  el.textContent=l?'':(S.shop.name.trim()[0]||'R').toUpperCase();
  el.style.backgroundImage=l?`url("${l}")`:'';el.classList.toggle('img',!!l);
  document.title=S.shop.name+' – Kasir';
}
function pruneSales(){const td=new Date().toDateString(),n=S.sales.length;S.sales=S.sales.filter(s=>new Date(s.t).toDateString()===td);if(S.sales.length!==n)save()}
function renderTables(){
  pruneSales();
  let h='';
  for(let i=1;i<=S.nTables;i++){
    const o=S.orders[i];
    h+=`<button class="tbl ${o?'busy':''}" data-t="${i}"><span class="tn">${i}</span><span class="st">${o?'Terisi':'Kosong'}</span>${o?`<span class="tc">${esc(o.name)}</span><span class="tm">${qty(o)} item · ${ago(o.time)}</span><b class="tp">${rp(total(o))}</b>`:'<span class="tc free">Ketuk untuk memesan</span>'}</button>`;
  }
  $('#tables').innerHTML=h;
  $('#tCnt').textContent=S.nTables+' meja';$('#tMin').disabled=S.nTables<=1;$('#tPlus').disabled=S.nTables>=100;
  const td=new Date().toDateString(),ts=S.sales.filter(s=>new Date(s.t).toDateString()===td);
  const act=Object.entries(S.orders).sort((a,b)=>(a[1].time||0)-(b[1].time||0));
  const owe=act.reduce((s,[,o])=>s+total(o),0);
  $('#stats').innerHTML=[['Pendapatan hari ini',rp(ts.reduce((s,x)=>s+x.total,0)),''],['Transaksi hari ini',ts.length,'o'],['Meja terisi',act.length+' / '+S.nTables,'o'],['Belum dibayar',rp(owe),'r']].map(([l,v,c])=>`<div class="stat ${c}"><small>${l}</small><b>${v}</b></div>`).join('');
  $('#active').innerHTML=act.map(([n,o])=>`<button class="li" data-t="${n}"><span class="badge">${n}</span><span class="n">${esc(o.name)}<small>${qty(o)} item · ${ago(o.time)}</small></span><b>${rp(total(o))}</b></button>`).join('')||'<p class="empty">Belum ada pesanan berjalan.</p>';
  $('#recent').innerHTML=S.sales.slice(-6).reverse().map(s=>`<div class="li"><span class="badge g ${s.meja==='TAKEAWAY'?'takeaway-label':''}">${s.meja==='TAKEAWAY'?'TAKEAWAY':esc(s.meja)}</span><span class="n">${esc(s.name)}<small>${new Date(s.t).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</small></span><b>${rp(s.total)}</b></div>`).join('')||'<p class="empty">Belum ada transaksi.</p>';
}
const total=o=>o.items.reduce((s,i)=>s+i.price*i.qty,0);
function open(html){$('#box').oninput=null;$('#box').onchange=null;$('#box').innerHTML=html;$('#ov').classList.add('on')}
function close(){$('#ov').classList.remove('on');renderTables()}

const pick=e=>{const b=e.target.closest('[data-t]');if(b)openTable(b.dataset.t==='TAKEAWAY'?'TAKEAWAY':+b.dataset.t)};
$('#tables').onclick=pick;$('#active').onclick=pick;
$('#bMenu').onclick=menuMgr;
$('#bTakeaway').onclick=()=>openTable('TAKEAWAY');
$('#tPlus').onclick=()=>{if(S.nTables>=100){alert('Jumlah meja maksimal 100.');return}S.nTables++;save();renderTables()};
$('#tMin').onclick=()=>{const n=S.nTables;if(n<=1)return;if(S.orders[n]){alert('Meja '+n+' masih memiliki pesanan. Selesaikan pembayaran atau hapus pesanannya dulu.');return}S.nTables--;save();renderTables()};
$('#bDash').onclick=()=>dashMgr();
$('#bDisc').onclick=()=>discMgr();

function openTable(n){
  cur=n;
  draft=S.orders[n]?JSON.parse(JSON.stringify(S.orders[n])):{name:'',items:[]};
  const exist=!!S.orders[n];
  open(`<h2>${n==='TAKEAWAY'?'Pesanan Takeaway':'Meja '+n}${exist?' – Tambah pesanan':''}</h2>
  <div class="cols2">
    <div><input id="ms" placeholder="Cari menu..." autocomplete="off"><div class="mgrid" id="mg"></div></div>
    <div>
      <label class="lab" for="cn">Nama pelanggan</label><input id="cn" value="${esc(draft.name)}" placeholder="Nama pelanggan">
      <h3>Pesanan</h3><div id="cart" class="list"></div>
      <div class="tot"><span>Total</span><span id="tt"></span></div>
      <div class="acts" style="margin-top:0"><button id="x">Batal</button><button id="sv">Simpan</button><button class="pri" id="pay">Bayar</button>${exist?'<button class="del" id="cx">Hapus</button>':''}</div>
    </div>
  </div>`);
  const grid=q=>{$('#mg').innerHTML=S.menu.filter(m=>m.name.toLowerCase().includes(q.trim().toLowerCase())).map(m=>`<button class="mc" data-m="${m.id}"><b>${esc(m.name)}</b><span>${rp(m.price)}</span></button>`).join('')||'<p class="legend">Menu tidak ditemukan.</p>'};
  grid('');
  $('#ms').oninput=e=>grid(e.target.value);
  $('#cn').oninput=e=>draft.name=e.target.value;
  $('#box').onclick=ed;
  cart();
}
function cart(){
  $('#cart').innerHTML=draft.items.map((i,x)=>`<div class="row"><span class="n">${esc(i.name)}<br><small>${rp(i.price)}</small></span><span class="q"><button data-d="${x}">−</button>${i.qty}<button data-u="${x}">+</button></span></div>`).join('')||'<p class="legend">Belum ada item.</p>';
  $('#tt').textContent=rp(total(draft));
}
function ed(e){
  const b=e.target.closest('button');if(!b||!$('#cart'))return;
  if(b.dataset.m){const m=S.menu.find(z=>z.id==b.dataset.m);const f=draft.items.find(i=>i.id==m.id);f?f.qty++:draft.items.push({id:m.id,name:m.name,price:m.price,qty:1});cart()}
  else if(b.dataset.u){draft.items[b.dataset.u].qty++;cart()}
  else if(b.dataset.d){const i=draft.items[b.dataset.d];if(--i.qty<=0)draft.items.splice(b.dataset.d,1);cart()}
  else if(b.id==='x')close();
  else if(b.id==='cx'){if(confirm('Hapus pesanan meja '+cur+'?')){delete S.orders[cur];save();close()}}
  else if(b.id==='sv'){if(commit())close()}
  else if(b.id==='pay'){if(commit())payModal()}
}
function commit(){
  if(!draft.name.trim()){alert('Isi nama pelanggan dulu.');return false}
  if(!draft.items.length){alert('Pilih minimal satu menu.');return false}
  draft.name=draft.name.trim();draft.time=draft.time||Date.now();
  S.orders[cur]=draft;save();return true;
}
let cashStr='',receiptName='';
const today=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};
function checkDisc(code,sub){
  code=(code||'').trim().toUpperCase();
  if(!code)return{ok:false,msg:'Masukkan kode diskon.'};
  const d=S.discounts.find(x=>x.code&&x.code.toUpperCase()===code);
  if(!d)return{ok:false,msg:'Kode tidak ditemukan.'};
  if(d.exp&&d.exp<today())return{ok:false,msg:'Kode sudah kedaluwarsa.'};
  if(sub<(+d.min||0))return{ok:false,msg:'Minimal belanja '+rp(d.min)+'.'};
  let a=d.type==='pct'?Math.floor(sub*(+d.value||0)/100):(+d.value||0);
  if(d.type==='pct'&&+d.max>0)a=Math.min(a,+d.max);
  return{ok:true,code:d.code.toUpperCase(),amount:Math.min(a,sub)};
}
function savePdf(o,sub,disc,dcode,cash,name,d){
  try{
    const t=sub-disc,W=42,line=(l,r)=>l+' '.repeat(Math.max(1,W-l.length-r.length))+r,hr='-'.repeat(W),ctr=s=>' '.repeat(Math.max(0,Math.floor((W-s.length)/2)))+s;
    const wrap=(s,n=W)=>{const r=[];let c='';String(s||'').split(/\s+/).filter(Boolean).forEach(w=>{while(w.length>n){if(c){r.push(c);c=''}r.push(w.slice(0,n));w=w.slice(n)}if((c+' '+w).trim().length>n){r.push(c);c=w}else c=(c+' '+w).trim()});if(c)r.push(c);return r};
    const logo=S.shop.logoBW,HW=24;
    const H=logo?[...wrap(S.shop.name,HW),...wrap(S.shop.addr,HW)].map(ctr):[...wrap(S.shop.name),...wrap(S.shop.addr)].map(ctr);
    if(logo)while(H.length<4)H.push('');
    const L=[...H,ctr('Struk Pembayaran'),hr,line('Meja '+cur,d.toLocaleString('id-ID',{dateStyle:'short',timeStyle:'short'})),'Pelanggan: '+o.name,hr];
    o.items.forEach(i=>{L.push(i.name.slice(0,W));L.push(line(i.qty+' x '+rp(i.price),rp(i.qty*i.price)))});
    L.push(hr);
    if(disc>0)L.push(line('Subtotal',rp(sub)),line('Diskon','-'+rp(disc)));
    L.push(line('Total',rp(t)),line('Tunai',rp(cash)),line('Kembalian',rp(cash-t)),hr,ctr('Terima kasih atas kunjungan Anda'));
    const lh=4,h=Math.max(L.length*lh+14,100);
    const pdf=new window.jspdf.jsPDF({unit:'mm',format:[80,h]});
    pdf.setFont('courier','normal');pdf.setFontSize(8);
    if(logo)pdf.addImage(logo,'JPEG',4,4,15,15);
    L.forEach((s,i)=>pdf.text(s,4,8+i*lh));
    pdf.save(name+'.pdf');
  }catch(e){console.error(e)}
}
function payModal(){
  const o=S.orders[cur],sub=total(o);cashStr='';let disc=0,dcode='';
  const T=()=>sub-disc,keys=['1','2','3','4','5','6','7','8','9','0','00','000'];
  const chips=S.discounts.filter(d=>d.code&&!(d.exp&&d.exp<today())).map(d=>`<button data-chip="${esc(d.code)}">${esc(d.code)} · ${d.type==='pct'?(+d.value)+'%':rp(d.value)}</button>`).join('');
  open(`<h2>Pembayaran – ${cur==='TAKEAWAY'?'Takeaway':'Meja '+cur} (${esc(o.name)})</h2>
  <div class="cols">
    <div>
      ${o.items.map(i=>`<div class="row"><span class="n">${i.qty}× ${esc(i.name)}</span><span>${rp(i.price*i.qty)}</span></div>`).join('')}
      <div class="row"><span>Subtotal</span><span>${rp(sub)}</span></div>
      <div class="row" id="drow" style="display:none"><span id="dlab"></span><span id="dval"></span></div>
      <div class="tot"><span>Total tagihan</span><span id="tt">${rp(sub)}</span></div>
      <div>Kembalian</div><div class="chg" id="chg">${rp(0)}</div>
      <div class="dbox"><div class="mrow2"><input id="dc" placeholder="Kode diskon" autocapitalize="characters" autocomplete="off"><button id="da">Pakai</button></div>
      <div class="chips">${chips}</div><div id="dm" class="msg"></div></div>
    </div>
    <div>
      <div>Uang diterima</div>
      <div class="disp" id="cashd">Rp0</div>
      <div class="quick"><button data-c="pas">Uang pas</button></div>
      <div class="pad">${keys.map(k=>`<button class="key" data-k="${k}">${k}</button>`).join('')}<button class="key" data-k="C">C</button><button class="key" data-k="B" aria-label="Hapus">⌫</button></div>
    </div>
  </div>
  <div class="acts"><button id="back">Kembali</button><button class="pri" id="ok" disabled>Selesaikan &amp; cetak struk</button></div>`);
  const upd=()=>{const c=+cashStr||0,d=c-T();$('#cashd').textContent=rp(c);$('#chg').textContent=d>=0?rp(d):'Kurang '+rp(-d);$('#chg').className='chg'+(d<0?' neg':'');$('#ok').disabled=d<0||(!cashStr&&T()>0)};
  const showDisc=()=>{$('#drow').style.display=disc>0?'flex':'none';$('#dlab').textContent='Diskon ('+dcode+')';$('#dval').textContent='-'+rp(disc);$('#tt').textContent=rp(T());$('#da').textContent=dcode?'Lepas':'Pakai';$('#dc').disabled=!!dcode;upd()};
  const apply=c=>{const r=checkDisc(c,sub),m=$('#dm');if(!r.ok){m.textContent=r.msg;m.className='msg bad';return}disc=r.amount;dcode=r.code;$('#dc').value=r.code;m.textContent='Kode '+r.code+' dipakai, hemat '+rp(r.amount)+'.';m.className='msg ok';showDisc()};
  const unapply=()=>{disc=0;dcode='';$('#dc').value='';$('#dm').textContent='';showDisc()};
  const press=k=>{if(k==='C')cashStr='';else if(k==='B')cashStr=cashStr.slice(0,-1);else if(cashStr.length+k.length<=10)cashStr=(cashStr+k).replace(/^0+/,'');upd()};
  const done=()=>finish(o,sub,disc,dcode,+cashStr||0);
  payKey=e=>{if(!$('#cashd'))return;
    if(e.target&&e.target.tagName==='INPUT'){if(e.key==='Enter'&&e.target.id==='dc'){e.preventDefault();$('#da').click()}return}
    if(/^\d$/.test(e.key))press(e.key);else if(e.key==='Backspace')press('B');else if(e.key==='Escape')press('C');else if(e.key==='Enter'&&!$('#ok').disabled)done()};
  $('#box').onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.k)press(b.dataset.k);
    else if(b.dataset.c){cashStr=String(T());upd()}
    else if(b.dataset.chip){if(!dcode)apply(b.dataset.chip)}
    else if(b.id==='da')dcode?unapply():apply($('#dc').value);
    else if(b.id==='back')openTable(cur);
    else if(b.id==='ok')done()};
}
let payKey=null;
document.addEventListener('keydown',e=>{if(payKey)payKey(e)});
function finish(o,sub,disc,dcode,cash){
  const t=sub-disc;
  const html=`<div id="receipt"><div class="rh">${S.shop.logoBW?`<img src="${S.shop.logoBW}" alt="">`:''}<div class="c"><b>${esc(S.shop.name)}</b>${S.shop.addr?`<br>${esc(S.shop.addr)}`:''}<br>Struk Pembayaran</div></div><hr>
  <div class="r"><span>${cur==='TAKEAWAY'?'Takeaway':'Meja '+cur}</span><span>${new Date().toLocaleString('id-ID',{dateStyle:'short',timeStyle:'short'})}</span></div>
  <div>Pelanggan: ${esc(o.name)}</div><hr>
  ${o.items.map(i=>`<div>${esc(i.name)}</div><div class="r"><span>${i.qty} × ${rp(i.price)}</span><span>${rp(i.qty*i.price)}</span></div>`).join('')}<hr>
  ${disc>0?`<div class="r"><span>Subtotal</span><span>${rp(sub)}</span></div><div class="r"><span>Diskon</span><span>-${rp(disc)}</span></div>`:''}
  <div class="r"><b>Total</b><b>${rp(t)}</b></div><div class="r"><span>Tunai</span><span>${rp(cash)}</span></div><div class="r"><span>Kembalian</span><span>${rp(cash-t)}</span></div><hr>
  <div class="c">Terima kasih atas kunjungan Anda</div></div>`;
  delete S.orders[cur];
  const sale={t:Date.now(),meja:cur,name:o.name,sub,disc,code:dcode,total:t,items:o.items.map(i=>({name:i.name,qty:i.qty,price:i.price}))};
  S.sales.push(sale);
  // Simpan transaksi ke database server agar riwayat pendapatan tidak hanya tersimpan di browser.
  fetch('api.php?action=save_sale',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sale)}).then(r=>r.json()).then(r=>{if(!r.ok)console.error('Gagal menyimpan transaksi ke database:',r.message)}).catch(e=>console.error('Database tidak terhubung:',e));
  if(S.sales.length>2000)S.sales=S.sales.slice(-2000);
  save();
  const d=new Date(),p=n=>String(n).padStart(2,'0');
  receiptName=`struk pembayaran ${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}.${p(d.getMinutes())}.${p(d.getSeconds())}`;
  savePdf(o,sub,disc,dcode,cash,receiptName,d);
  open(`<h2>Pembayaran berhasil</h2>${html}<div class="acts"><button class="pri" id="pr">Cetak struk</button><button id="cl">Selesai</button></div>`);
  $('#printArea').innerHTML=html;
  $('#box').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='pr'){const t=document.title;document.title=receiptName;window.onafterprint=()=>{document.title=t};window.print()}if(b.id==='cl')close()};
}
function menuMgr(){
  open(`<h2>Kelola menu</h2><div id="ml"></div>
  <h2 style="margin-top:16px">Tambah menu baru</h2>
  <div class="mrow"><input id="nn" placeholder="Nama menu"><input id="np" type="number" placeholder="Harga"><button class="pri" id="na">Tambah</button></div>
  <div class="acts"><button id="cl">Tutup</button></div>`);
  const draw=()=>{$('#ml').innerHTML=S.menu.map(m=>`<div class="mrow"><input data-n="${m.id}" value="${esc(m.name)}"><input data-p="${m.id}" type="number" value="${m.price}"><button class="del" data-x="${m.id}">Hapus</button></div>`).join('')};
  draw();
  $('#box').oninput=e=>{const t=e.target,m=S.menu.find(z=>z.id==(t.dataset.n||t.dataset.p));if(!m)return;if(t.dataset.n)m.name=t.value;else m.price=+t.value||0;save()};
  $('#box').onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.id==='cl')close();
    else if(b.dataset.x){S.menu=S.menu.filter(m=>m.id!=b.dataset.x);save();draw()}
    else if(b.id==='na'){const n=$('#nn').value.trim(),p=+$('#np').value;if(!n||!(p>0)){alert('Isi nama dan harga menu.');return}S.menu.push({id:S.nextId++,name:n,price:p});save();$('#nn').value=$('#np').value='';draw()}};
}
function discMgr(){
  open(`<h2>Kelola diskon</h2><p class="legend">Kasir hanya bisa memakai kode yang terdaftar di sini. Isi 0 pada kolom yang tidak dipakai.</p><div id="dlist"></div><div class="acts"><button id="dn">+ Tambah kode</button><button class="pri" id="cl">Tutup</button></div>`);
  const draw=()=>{$('#dlist').innerHTML=S.discounts.map((d,i)=>`<div class="dcard"><div class="dgrid">
    <div><label>Kode</label><input data-i="${i}" data-f="code" value="${esc(d.code)}" autocapitalize="characters"></div>
    <div><label>Jenis</label><select data-i="${i}" data-f="type"><option value="pct"${d.type==='pct'?' selected':''}>Persen (%)</option><option value="amt"${d.type==='amt'?' selected':''}>Nominal (Rp)</option></select></div>
    <div><label>Nilai</label><input type="number" data-i="${i}" data-f="value" value="${d.value}"></div>
    <div><label>Min. belanja (Rp)</label><input type="number" data-i="${i}" data-f="min" value="${d.min||0}"></div>
    <div><label>Maks. potongan (Rp, untuk %)</label><input type="number" data-i="${i}" data-f="max" value="${d.max||0}"></div>
    <div><label>Berlaku sampai</label><input type="date" data-i="${i}" data-f="exp" value="${d.exp||''}"></div>
    <button class="del" data-x="${i}">Hapus</button></div></div>`).join('')||'<p class="legend">Belum ada kode diskon.</p>'};
  draw();
  $('#box').oninput=e=>{const t=e.target,i=t.dataset.i,f=t.dataset.f;if(i===undefined||!S.discounts[i])return;const v=t.value;S.discounts[i][f]=f==='code'?v.trim().toUpperCase():(f==='type'||f==='exp')?v:(+v||0);save()};
  $('#box').onclick=e=>{const b=e.target.closest('button');if(!b)return;
    if(b.id==='cl')close();
    else if(b.id==='dn'){S.discounts.push({code:'',type:'pct',value:10,min:0,max:0,exp:''});save();draw()}
    else if(b.dataset.x!==undefined){S.discounts.splice(+b.dataset.x,1);save();draw()}};
}
function processLogo(file,cb){
  if(file.size>8*1024*1024){alert('Ukuran foto terlalu besar (maksimal 8 MB).');return}
  const fr=new FileReader();
  fr.onload=()=>{const im=new Image();
    im.onload=()=>{
      const mk=(sz,gray)=>{const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d');
        x.fillStyle='#fff';x.fillRect(0,0,sz,sz);
        const k=sz/Math.max(im.width,im.height),w=im.width*k,h=im.height*k;x.drawImage(im,(sz-w)/2,(sz-h)/2,w,h);
        if(gray){const d=x.getImageData(0,0,sz,sz),p=d.data;for(let i=0;i<p.length;i+=4){let g=.299*p[i]+.587*p[i+1]+.114*p[i+2];g=Math.max(0,Math.min(255,(g-128)*1.25+128));p[i]=p[i+1]=p[i+2]=g}x.putImageData(d,0,0)}
        return c.toDataURL('image/jpeg',.85)};
      cb(mk(160,false),mk(240,true))};
    im.onerror=()=>alert('File gambar tidak bisa dibaca. Coba format JPG atau PNG.');
    im.src=fr.result};
  fr.readAsDataURL(file);
}
function dashMgr(){
  const td=new Date().toDateString(),ts=S.sales.filter(s=>new Date(s.t).toDateString()===td);
  const sum=f=>ts.reduce((x,y)=>x+f(y),0),rev=sum(s=>s.total),disc=sum(s=>s.disc);
  const cnt={};ts.forEach(s=>s.items.forEach(i=>cnt[i.name]=(cnt[i.name]||0)+i.qty));
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,5),rec=S.sales.slice(-10).reverse();
  const st=(l,v)=>`<div class="stat"><small>${l}</small><b>${v}</b></div>`;
  open(`<h2>Dashboard</h2>
  <h3>Pengaturan restoran</h3>
  <div class="dgrid" style="margin-bottom:6px"><div><label>Nama restoran (tampil di struk)</label><input id="sn" value="${esc(S.shop.name)}" maxlength="40"></div>
  <div><label>Alamat / telepon (opsional)</label><input id="sa" value="${esc(S.shop.addr)}" maxlength="80"></div></div>
  <div class="logoup" id="drop"><span class="lp" id="lp"></span><div><div class="lab">Foto profil / logo restoran</div>
  <div class="uprow"><input type="file" id="lf" accept="image/*" class="sr"><label class="upl" for="lf"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V5"/><path d="M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg><span id="lft">Pilih foto</span></label><button id="lx" class="del"${S.shop.logo?'':' hidden'}>Hapus</button></div>
  <small id="lfn">JPG atau PNG, maks. 8 MB. Bisa juga tarik dan lepas foto ke kotak ini.</small><br><small>Tampil di pojok kiri atas halaman, dan di struk dalam warna hitam putih.</small></div></div>
  <p class="legend" style="margin:0 0 6px">Perubahan tersimpan otomatis dan langsung dipakai di struk berikutnya.</p>
  <h3>Ringkasan hari ini</h3>
  <div class="stats in">${st('Pendapatan',rp(rev))}${st('Transaksi',ts.length)}${st('Total diskon',rp(disc))}${st('Rata-rata/transaksi',rp(ts.length?Math.round(rev/ts.length):0))}</div>
  <div class="cols">
    <div><h3>Menu terlaris hari ini</h3>${top.map(([n,q])=>`<div class="row"><span class="n">${esc(n)}</span><span>${q}×</span></div>`).join('')||'<p class="legend">Belum ada penjualan hari ini.</p>'}</div>
    <div><h3>Transaksi terakhir</h3><div class="list">${rec.map(s=>`<div class="row"><span class="n">Meja ${s.meja} · ${esc(s.name)}<br><small>${new Date(s.t).toLocaleString('id-ID',{dateStyle:'short',timeStyle:'short'})}</small></span><span>${rp(s.total)}</span></div>`).join('')||'<p class="legend">Belum ada transaksi.</p>'}</div></div>
  </div>
  <p class="legend">Riwayat transaksi otomatis direset setiap pergantian hari (pukul 00.00).</p>
  <div class="acts"><button class="pri" id="cl">Tutup</button></div>`);
  $('#box').oninput=e=>{const t=e.target;if(t.id==='sn'){S.shop.name=t.value.trim()||'Nama Restoran';setBrand()}else if(t.id==='sa')S.shop.addr=t.value.trim();else return;save()};
  const prev=()=>{const p=$('#lp');p.style.backgroundImage=S.shop.logo?`url("${S.shop.logo}")`:'';p.textContent=S.shop.logo?'':(S.shop.name.trim()[0]||'R').toUpperCase();$('#lx').hidden=!S.shop.logo;$('#lft').textContent=S.shop.logo?'Ganti foto':'Pilih foto'};
  prev();
  const go=f=>{if(!f)return;if(!f.type.startsWith('image/')){alert('Pilih file gambar (JPG atau PNG).');return}processLogo(f,(c,bw)=>{S.shop.logo=c;S.shop.logoBW=bw;save();setBrand();prev();$('#lfn').textContent='Tersimpan: '+f.name})};
  const dz=$('#drop');
  dz.ondragover=e=>{e.preventDefault();dz.classList.add('drag')};
  dz.ondragleave=()=>dz.classList.remove('drag');
  dz.ondrop=e=>{e.preventDefault();dz.classList.remove('drag');go(e.dataTransfer.files[0])};
  $('#box').onchange=e=>{if(e.target.id==='lf'&&e.target.files[0]){go(e.target.files[0]);e.target.value=''}};
  $('#box').onclick=e=>{if(e.target.closest('#cl'))close();else if(e.target.closest('#lx')){delete S.shop.logo;delete S.shop.logoBW;save();setBrand();prev()}};
}
setBrand();
// Riwayat pendapatan diambil dari database server jika tersedia.
fetch('api.php?action=sales').then(r=>r.json()).then(r=>{if(r.ok&&Array.isArray(r.sales)){S.sales=r.sales;save();renderTables()}}).catch(()=>{});
renderTables();
setInterval(renderTables,30000);
// jam & tanggal mengikuti perangkat, berdetak tiap detik tanpa refresh
function tickClock(){
  const d=new Date();
  $('#clock').textContent=d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'short',year:'numeric'})+' · '+d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
tickClock();
setInterval(tickClock,1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){tickClock();renderTables()}});
