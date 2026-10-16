/* ═══ game.js — bagian 2/2 (v3) ═══
   State pemain, UI/menu, jaringan (Firebase), kontrol, loop utama, PWA.
   Track picker 3 kategori, car picker 3 kategori, harga mobil 950–25000 JB.
   Butuh world.js dimuat lebih dulu. ═══ */

let me,base,rid,host=false,playing=false,joined=false,pl=null,P={},cy=0,zd=10,pitch=.6,keys={},ix=0,iy=0,run=false,jmp=false,last=performance.now(),selMap='island',roomMap='island';
let lastRoom={},raceEnd=0,srvOff=0,soloRace=false;const CDMS=7000,srvNow=()=>Date.now()+srvOff;
let raceTimer=0,raceRunning=false,raceFinished=false,raceArmed=false,raceCd=0,goT=0;
let mobileUp=false,mobileDown=false;
const show=id=>{SCREENS.forEach(s=>$(s).classList.toggle('hide',s!=id));if(id=='menu'&&window.refreshChip)refreshChip();if(id=='skin'&&window.refreshCarUI)window.refreshCarUI()};
let menuSh=0;
const menuG=new THREE.Group();
menuG.add(Mt(new THREE.CylinderGeometry(3.2,3.2,.5,24),LS(0xffffff,{shininess:30}),0,-.25,0),Mt(new THREE.CylinderGeometry(3.5,3.7,.4,24),LS(0xb8d8ff,{shininess:60}),0,-.6,0));
sc.add(menuG);

(function injectShopAndLayout(){const menu=$('menu');if(!menu)return;const mb=menu.querySelector('.mb');if(!mb)return;const rightCol=document.createElement('div');rightCol.className='menu-right';menu.insertBefore(rightCol,mb);rightCol.appendChild(mb);const shop=document.createElement('div');shop.className='shop';shop.innerHTML=`<div class="shop-lbl">HADIAH JB <span class="shop-arw">▸</span></div><div class="shop-body"><div class="shop-row" data-reward="650"><span class="amt">650 JB</span><span class="prc"><s>Rp 15.000</s><b>Rp 20.000</b></span></div><div class="shop-row" data-reward="1000"><span class="amt">1.000 JB</span><span class="prc"><s>Rp 25.000</s><b>Rp 35.000</b></span></div><div class="shop-row" data-reward="5000"><span class="amt">5.000 JB</span><span class="prc"><s>Rp 65.000</s><b>Rp 95.000</b></span></div><div class="shop-note">Kirim rekaman dan screenshot untuk menerima</div></div>`;rightCol.appendChild(shop);shop.querySelector('.shop-lbl').onclick=()=>{shop.classList.toggle('open');shop.querySelector('.shop-arw').textContent=shop.classList.contains('open')?'▾':'▸'};const ttl=menu.querySelector('.ttl'),left=document.createElement('div');left.className='menu-left';menu.insertBefore(left,rightCol);left.appendChild(ttl);const chip=document.createElement('div');chip.className='mchip';chip.innerHTML='<i></i><b id="mcn"></b><span id="mcj"></span>';left.appendChild(chip);window.refreshChip=()=>{$('mcn').textContent=cfg.name||'Pemain';$('mcj').textContent=cfg.jb+' JB'};refreshChip();shop.querySelectorAll('.shop-row').forEach(row=>{row.onclick=()=>{const need=parseInt(row.dataset.reward);const rp=row.querySelector('.prc b').textContent;if(cfg.jb>=need)toast('Kamu bisa klaim '+rp+'! Kirim rekaman & screenshot ke admin.');else toast('Kurang '+(need-cfg.jb)+' JB lagi untuk '+rp)}})})();
(function injectGfxSettings(){const setScreen=$('set');if(!setScreen)return;const card=setScreen.querySelector('.card');if(!card)return;const sb=$('sb');if(!sb)return;const lbl=document.createElement('div');lbl.className='lbl';lbl.textContent='Kualitas Grafik';const wrap=document.createElement('div');wrap.className='grid';wrap.id='gfxGrid';[['lowest','Lowest'],['low','Low'],['high','High'],['highest','Highest']].forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.dataset.gfx=k;b.className=cfg.gfx===k?'on':'';b.onclick=()=>{cfg.gfx=k;sv();[...wrap.children].forEach(x=>x.classList.toggle('on',x.dataset.gfx===k));applyGfx();rs();if(playing)build(curMap);toast('Grafik: '+l)};wrap.appendChild(b)});card.insertBefore(lbl,sb);card.insertBefore(wrap,sb)})();

function setSelf(){const keep=(pl&&typeof pl.x==='number')?{x:pl.x,z:pl.z,y:pl.y,r:pl.r,vx:pl.vx,vz:pl.vz,vy:pl.vy,jc:pl.jc,air:pl.air,py:pl.py,pvy:pl.pvy,js:pl.js,jx:pl.jx,sv:pl.sv,lean:pl.lean,flip:pl.flip,spd:pl.spd,ty:pl.ty,tx:pl.tx,tz:pl.tz,tr:pl.tr,e:pl.e,et:pl.et,lEt:pl.lEt,lCt:pl.lCt,init:pl.init,lx:pl.lx,lz:pl.lz,tt:pl.tt}:null;if(pl&&pl.root&&pl.root.parent)pl.root.parent.remove(pl.root);pl=mkP({...cfg,n:cfg.name});if(keep)Object.assign(pl,keep);pl.carType=cfg.car||'starter';(playing?sc:menuG).add(pl.root);const jbn=$('jbn');if(jbn)jbn.textContent=cfg.jb+' JB'}
function menuMode(){playing=false;document.body.classList.remove('racing');document.body.classList.remove('pkr');document.body.classList.remove('bxm');document.body.classList.remove('lowhp');cam.fov=60;cam.updateProjectionMatrix();world.visible=false;menuG.visible=true;makeSky(0x0e1a3a,0x3a5a9a);sc.fog=null;pl.x=pl.z=pl.y=0;pl.vx=pl.vz=pl.vy=0;pl.r=0;menuG.add(pl.root);zd=5}
build('island');setSelf();menuMode();
document.querySelectorAll('.bk').forEach(b=>b.onclick=()=>show('menu'));
$('ppbk').onclick=()=>show('menu');
const SHAPES=['Setengah','Kotak','Segitiga','Bola','Silinder','Piramida','Permata','Telur','Dodeka','Ikosa','Cakram','Prisma','Menara','Bantal'];
const shGrid=$('shapes');
SHAPES.forEach((n,i)=>{const b=document.createElement('button');b.textContent=n;b.className=cfg.sh==i?'on':'';b.onclick=()=>{cfg.sh=i;sv();setSelf();[...shGrid.children].forEach((x,j)=>x.classList.toggle('on',j==i))};shGrid.append(b)});

/* ═══ HATS dengan harga ═══ */
const hGrid=$('hats');
function refreshHatUI(){
  [...hGrid.children].forEach((b,i)=>{
    const price=HAT_PRICES[i]||0;
    const owned=(cfg.hats||[0]).includes(i);
    b.className=((cfg.hat|0)==i?'on':'')+(price>0&&!owned?' locked':'');
    const hp=b.querySelector('.hp');
    if(hp){
      if(price===0){hp.textContent='GRATIS';hp.className='hp own'}
      else if(owned){hp.textContent='✓ DIMILIKI';hp.className='hp own'}
      else{hp.textContent=price+' JB';hp.className='hp'}
    }
  });
}
HATS.forEach((n,i)=>{
  const b=document.createElement('button');
  b.innerHTML=n+'<small class="hp"></small>';
  b.onclick=()=>selectHat(i);
  hGrid.append(b);
});
function selectHat(i){
  const price=HAT_PRICES[i]||0;
  cfg.hats=cfg.hats||[0];
  if(price>0&&!cfg.hats.includes(i)){
    if(cfg.jb<price){toast('Kurang '+(price-cfg.jb)+' JB untuk '+HATS[i]);return}
    cfg.jb-=price;
    cfg.hats.push(i);
    sv();
    const jbn=$('jbn');if(jbn)jbn.textContent=cfg.jb+' JB';
    me&&me.update({jb:cfg.jb});
    if(window.refreshChip)refreshChip();
    toast('Membeli '+HATS[i]+'! -'+price+' JB');
    for(let k=0;k<20;k++){const a=Math.random()*6.28,r=Math.random()*1.5;puff(pl.x+Math.cos(a)*r,pl.z+Math.sin(a)*r,1,['#ffd23f','#fff3a0'][k%2],4,pl.y+.5+Math.random()*1.5)}
  }
  cfg.hat=i;
  sv();
  setSelf();
  refreshHatUI();
}
refreshHatUI();

const FONTS=['monospace','sans-serif','serif','cursive','Impact','Georgia','Verdana','Trebuchet MS','Courier New'];
const fGrid=$('fonts');
FONTS.forEach(n=>{const b=document.createElement('button');b.textContent=n;b.style.fontFamily=n;b.className=cfg.nf==n?'on':'';b.onclick=()=>{cfg.nf=n;sv();setSelf();[...fGrid.children].forEach(x=>x.classList.toggle('on',x.textContent==n))};fGrid.append(b)});

/* ═══ CSS Color Picker (c1, c2, nc) ═══ */
function buildColorGrid(containerId,key){
  const grid=$(containerId);
  if(!grid)return;
  grid.innerHTML='';
  C_PALETTE.forEach(hex=>{
    const b=document.createElement('button');
    b.type='button';
    b.style.setProperty('--sw',hex);
    b.dataset.c=hex;
    if(C_LIGHT.has(hex))b.dataset.light='1';
    if((cfg[key]||'').toLowerCase()===hex.toLowerCase())b.classList.add('on');
    b.onclick=()=>{
      cfg[key]=hex;sv();
      [...grid.children].forEach(x=>x.classList.toggle('on',x.dataset.c.toLowerCase()===hex.toLowerCase()));
      setSelf();
    };
    grid.append(b);
  });
}
buildColorGrid('c1grid','c1');
buildColorGrid('c2grid','c2');
buildColorGrid('ncgrid','nc');

/* ═══════════════════════════════════════════════════════════════════
   KENDARAAN — Preview 2D pixel-art
   Semua mobil (16 total): starter + 5 Drag + 5 Rally + 5 Circuit
   ═══════════════════════════════════════════════════════════════════ */
function drawCarPreview(cv,C){
  const x=cv.getContext('2d'),W=cv.width,H=cv.height;
  x.imageSmoothingEnabled=false;
  // Background gradient
  const g=x.createLinearGradient(0,0,0,H);
  if(C.cat==='drag'){g.addColorStop(0,'#2a1030');g.addColorStop(1,'#0a0820')}
  else if(C.cat==='rally'){g.addColorStop(0,'#1a3a1a');g.addColorStop(1,'#0a2010')}
  else if(C.cat==='circuit'){g.addColorStop(0,'#2a1a5a');g.addColorStop(1,'#0a0830')}
  else{g.addColorStop(0,'#1a2a5a');g.addColorStop(1,'#0a1a3a')}
  x.fillStyle=g;x.fillRect(0,0,W,H);
  // Track surface
  x.fillStyle='#1a1a24';x.fillRect(0,H-8,W,8);
  x.fillStyle='#3a3a4a';x.fillRect(0,H-7,W,1);
  // Checkered line
  for(let i=0;i<W;i+=8){
    for(let j=0;j<2;j++){
      x.fillStyle=(i/8+j)%2?'#fff':'#111';
      x.fillRect(i,H-5+j*2,8,2);
    }
  }
  const cx=W/2,cy=H-13;
  const c1='#'+C.col.toString(16).padStart(6,'0');
  const c2='#'+C.col2.toString(16).padStart(6,'0');
  const r=(x0,y0,w,h,c)=>{x.fillStyle=c;x.fillRect(x0,y0,w,h)};
  const cw=(x0,y0,w,h,c1_,c2_)=>{r(x0,y0,w,h,c1_);r(x0+1,y0+1,w-2,h-2,c2_)}; // checkered pattern

  // Common helpers
  const wheel=(x0,y0,rw,rh,rim)=>{
    r(x0,y0,rw,rh,'#0a0a0f');
    r(x0+1,y0+1,rw-2,rh-2,'#1a1a24');
    r(x0+2,y0+2,rw-4,rh-4,rim||'#c8d0e0');
    r(x0+3,y0+3,rw-6,rh-6,'#333');
  };

  if(C.id==='starter'){
    r(cx-20,cy-8,40,7,c1); r(cx-16,cy-14,32,6,c1);
    r(cx-14,cy-13,28,4,'#223344');
    r(cx-6,cy-16,12,2,c2);
    r(cx-21,cy-6,2,2,'#ff2d2d');r(cx+19,cy-6,2,2,'#fff3a0');
    wheel(cx-16,cy-4,8,8,'#cfd6e0');wheel(cx+8,cy-4,8,8,'#cfd6e0');
  } else if(C.id==='demon'){
    r(cx-24,cy-9,48,9,c1);
    r(cx-20,cy-16,38,8,c1);
    r(cx-16,cy-15,30,5,'#0a0a0a');
    r(cx-24,cy-13,16,2,c2);r(cx+8,cy-12,16,2,c2);
    r(cx-22,cy-10,4,1,'#ff2d2d');
    r(cx-26,cy-4,4,4,'#1a1a1f');r(cx-24,cy-2,3,3,'#cfd6e0');
    r(cx+22,cy-4,4,4,'#1a1a1f');r(cx+23,cy-2,3,3,'#cfd6e0');
    r(cx-14,cy-7,2,2,'#fff3a0');r(cx+12,cy-7,2,2,'#fff3a0');
  } else if(C.id==='copo'){
    r(cx-24,cy-8,48,8,c1);
    r(cx-20,cy-15,40,8,c1);
    r(cx-16,cy-14,32,5,'#0a0a0a');
    r(cx-24,cy-12,4,6,c2);
    r(cx+20,cy-12,4,4,c2);
    r(cx-14,cy-6,2,2,'#fff3a0');r(cx+12,cy-6,2,2,'#fff3a0');
    r(cx-25,cy-6,2,2,'#ff2d2d');
    wheel(cx-18,cy-3,8,8,'#cfd6e0');wheel(cx+10,cy-3,8,8,'#cfd6e0');
  } else if(C.id==='supra'){
    r(cx-24,cy-9,48,8,c1);
    r(cx-18,cy-17,36,9,c1);
    r(cx-15,cy-16,30,6,'#111111');
    r(cx-24,cy-13,6,2,c2);
    r(cx-4,cy-19,10,2,c2);
    r(cx+18,cy-12,6,2,c2);
    r(cx-14,cy-7,2,2,'#fff3a0');r(cx+12,cy-7,2,2,'#fff3a0');
    r(cx-26,cy-6,3,2,'#ff2d2d');r(cx+23,cy-6,3,2,'#ff2d2d');
    wheel(cx-18,cy-4,8,8,'#d8d8d8');wheel(cx+10,cy-4,8,8,'#d8d8d8');
  } else if(C.id==='gtr'){
    r(cx-25,cy-8,50,8,c1);
    r(cx-20,cy-15,40,8,c1);
    r(cx-16,cy-14,32,5,'#111111');
    r(cx-25,cy-12,5,4,c2);r(cx+20,cy-12,5,4,c2);
    r(cx-20,cy-9,4,1,c2);r(cx+16,cy-9,4,1,c2);
    r(cx-14,cy-6,2,2,'#fff3a0');r(cx+12,cy-6,2,2,'#fff3a0');
    r(cx-26,cy-5,3,2,'#ff2d2d');r(cx+23,cy-5,3,2,'#ff2d2d');
    wheel(cx-18,cy-3,8,8,'#d8d8d8');wheel(cx+10,cy-3,8,8,'#d8d8d8');
  } else if(C.id==='cobra'){
    r(cx-26,cy-9,52,9,c1);
    r(cx-21,cy-17,42,9,c1);
    r(cx-17,cy-16,34,6,'#0a0a0a');
    r(cx-26,cy-14,7,3,c2);r(cx-4,cy-19,10,2,c2);
    r(cx-22,cy-8,2,2,'#fff3a0');r(cx+18,cy-8,2,2,'#fff3a0');
    r(cx-27,cy-6,3,3,'#ff2d2d');
    r(cx-4,cy-20,2,4,'#1a1a1a');
    wheel(cx-19,cy-3,9,9,'#cfd6e0');wheel(cx+10,cy-3,9,9,'#cfd6e0');
  } else if(C.id==='impreza'||C.id==='lancer'||C.id==='quattro'||C.id==='delta'||C.id==='celica'){
    // Generic rally car
    r(cx-23,cy-8,46,8,c1);
    r(cx-17,cy-16,36,8,c1);
    r(cx-14,cy-15,28,5,'#223344');
    r(cx-14,cy-15,2,5,'#0a1520');r(cx+12,cy-15,2,5,'#0a1520');
    r(cx-23,cy-11,6,3,c2);
    r(cx-23,cy-5,2,2,'#fff3a0');r(cx+21,cy-5,2,2,'#fff3a0');
    // Roof rack / light bar
    r(cx-8,cy-18,16,2,c2);
    r(cx-6,cy-19,3,2,'#333');r(cx+3,cy-19,3,2,'#333');
    // Mud flaps
    r(cx-20,cy-1,4,2,'#1a1a1a');r(cx+16,cy-1,4,2,'#1a1a1a');
    wheel(cx-17,cy-3,8,8,'#cfd6e0');wheel(cx+9,cy-3,8,8,'#cfd6e0');
  } else if(C.id==='gt3rs'||C.id==='senna'||C.id==='sr8'||C.id==='fxxk'||C.id==='typer'){
    // Circuit / super car
    r(cx-24,cy-7,48,7,c1);
    r(cx-17,cy-14,34,7,c1);
    r(cx-14,cy-13,26,4,'#111111');
    // Rear wing
    r(cx+18,cy-16,8,2,c2);
    r(cx+18,cy-14,1,5,'#1a1a1a');r(cx+25,cy-14,1,5,'#1a1a1a');
    // Front splitter
    r(cx-25,cy-5,4,2,c2);
    r(cx-23,cy-9,3,2,c2);
    r(cx-15,cy-5,2,2,'#fff3a0');r(cx+13,cy-5,2,2,'#fff3a0');
    r(cx-24,cy-4,2,2,'#ff2d2d');
    wheel(cx-18,cy-3,8,8,'#d8d8d8');wheel(cx+10,cy-3,8,8,'#d8d8d8');
  } else {
    // Fallback generic
    r(cx-24,cy-8,48,8,c1);
    r(cx-18,cy-15,36,7,c1);
    r(cx-14,cy-14,28,5,'#223344');
    r(cx-15,cy-6,2,2,'#fff3a0');r(cx+13,cy-6,2,2,'#fff3a0');
    wheel(cx-18,cy-3,8,8,'#cfd6e0');wheel(cx+10,cy-3,8,8,'#cfd6e0');
  }
}

/* ═══ State kategori mobil ═══ */
let currentCarCat='drag';

function refreshCarUI(){
  const g=$('cars');if(!g)return;
  // Refresh kategori buttons
  const catWrap=$('car-cats');
  if(catWrap){
    catWrap.innerHTML='';
    [['drag','Drag Race','5 Mobil'],['rally','Rally','5 Mobil'],['circuit','Sirkuit','5 Mobil']].forEach(([k,l,sub])=>{
      const b=document.createElement('button');
      b.className=(currentCarCat===k?'on':'');
      b.innerHTML=l+'<small>'+sub+'</small>';
      b.onclick=()=>{currentCarCat=k;refreshCarUI()};
      catWrap.append(b);
    });
  }
  // Filter kendaraan sesuai kategori
  g.innerHTML='';
  // Starter selalu ditampilkan
  const list=[carOf('starter'),...carsByCat(currentCarCat)];
  list.forEach(C=>{
    const b=document.createElement('button');
    b.className='car'+(cfg.car===C.id?' on':'');
    b.dataset.car=C.id;b.dataset.cat=C.cat;
    // Category tag
    const tag=document.createElement('div');
    tag.className='cat-tag';
    tag.textContent=C.cat==='drag'?'DRAG':C.cat==='rally'?'RALLY':'SIRKUIT';
    b.append(tag);
    // Canvas preview
    const cv=document.createElement('canvas');
    cv.width=96;cv.height=54;
    b.append(cv);
    // Name
    const nm=document.createElement('span');nm.className='cn';nm.textContent=C.n;b.append(nm);
    // Price / status
    const pr=document.createElement('small');pr.className='cp';
    const owned=(cfg.cars||['starter']).includes(C.id);
    if(C.price===0){pr.textContent='GRATIS';pr.className='cp owned'}
    else if(owned){pr.textContent='DIMILIKI';pr.className='cp owned'}
    else{pr.textContent=C.price.toLocaleString('id-ID')+' JB';pr.className='cp lock'}
    b.append(pr);
    drawCarPreview(cv,C);
    b.onclick=()=>selectCar(C);
    g.append(b);
  });
}
function selectCar(C){
  const owned=(cfg.cars||['starter']).includes(C.id);
  if(!owned&&C.price>0){
    if(cfg.jb<C.price){toast('Kurang '+(C.price-cfg.jb).toLocaleString('id-ID')+' JB untuk '+C.n);return}
    cfg.jb-=C.price;
    cfg.cars=(cfg.cars||['starter']).slice();
    cfg.cars.push(C.id);
    sv();
    const jbn=$('jbn');if(jbn)jbn.textContent=cfg.jb+' JB';
    me&&me.update({jb:cfg.jb});
    toast('Membeli '+C.n+'! -'+C.price.toLocaleString('id-ID')+' JB');
    for(let i=0;i<40;i++){const a=Math.random()*6.28,rr=Math.random()*2;puff(pl.x+Math.cos(a)*rr,pl.z+Math.sin(a)*rr,1,['#ffd23f','#fff3a0'][i%2],5,pl.y+.5+Math.random()*2)}
    if(window.refreshChip)refreshChip();
  }
  cfg.car=C.id;sv();
  if(pl){pl.carType=C.id;if(pl.car){pl.root.remove(pl.car.g);pl.car=null}}
  me&&me.update({car:C.id});
  refreshCarUI();
  toast('Kendaraan: '+C.n);
}

/* ═══════════ VOUCHER ═══════════ */
(function initVoucher(){
  const menu=$('menu'),ttl=menu&&menu.querySelector('.ttl'),vi=$('vi');if(!ttl||!vi)return;
  const CODES={PLSJB:100000};
  let taps=0,tt=0,busy=false;
  const snd=(f,i)=>{try{tn(f,f*1.5,.07,'square',.09,i||0)}catch(e){}};
  function wipe(mid){
    if(busy)return;busy=true;
    const W=innerWidth,H=innerHeight,cs=Math.ceil(W/80),rs=Math.ceil(H/80),st=330/(cs+rs);
    const o=document.createElement('div');o.id='vtr';o.style.setProperty('--c',cs);o.style.setProperty('--r',rs);
    for(let y=0;y<rs;y++)for(let x=0;x<cs;x++){const i=document.createElement('i');if((x+y)%2)i.className='a';i.style.animationDelay=Math.round((x+y)*st)+'ms';o.append(i)}
    document.body.append(o);
    try{SFX.portal()}catch(e){}
    setTimeout(()=>{mid();o.classList.add('out')},620);
    setTimeout(()=>{o.remove();busy=false},1260);
  }
  ttl.addEventListener('click',()=>{
    if(busy)return;const n=performance.now();taps=n-tt<1200?taps+1:1;tt=n;snd(500+taps*120);
    if(taps>=3){taps=0;wipe(()=>{show('voucher');vi.value=''})}
  });
  function redeem(){
    const code=vi.value.trim().toUpperCase();
    if(!code)return toast('Masukkan kode voucher');
    const jb=CODES[code];
    if(!jb)return toast('Kode voucher salah');
    if(cfg.vc.includes(code))return toast('Voucher sudah dipakai');
    cfg.vc.push(code);cfg.jb+=jb;sv();
    const jbn=$('jbn');if(jbn)jbn.textContent=cfg.jb+' JB';
    me&&me.update({jb:cfg.jb});
    if(pl)pl.jbLvl=jbLvlOf(cfg.jb);
    toast('Voucher berhasil! +'+jb.toLocaleString('id-ID')+' JB');
    try{SFX.king()}catch(e){}
    wipe(()=>{show('menu');vi.value=''});
  }
  $('vr').onclick=redeem;
  vi.addEventListener('keydown',e=>{if(e.key==='Enter')redeem()});
  $('vbk').onclick=()=>show('menu');
})();

const MICON={
island:'<rect x="0" y="9" width="12" height="3" fill="#3d8bff"/><rect x="3" y="8" width="6" height="1" fill="#f2d68a"/><rect x="6" y="4" width="1" height="4" fill="#8b5a2b"/><rect x="4" y="3" width="5" height="1" fill="#3aa84a"/><rect x="3" y="4" width="2" height="1" fill="#3aa84a"/><rect x="8" y="4" width="2" height="1" fill="#3aa84a"/><rect x="9" y="1" width="2" height="2" fill="#ffd23f"/>',
desert:'<rect x="0" y="10" width="12" height="2" fill="#e0c070"/><rect x="5" y="4" width="2" height="1" fill="#d8a850"/><rect x="4" y="5" width="4" height="1" fill="#d8a850"/><rect x="3" y="6" width="6" height="1" fill="#c99a5b"/><rect x="2" y="7" width="8" height="1" fill="#d8a850"/><rect x="1" y="8" width="10" height="2" fill="#c99a5b"/><rect x="9" y="1" width="2" height="2" fill="#ff8c1a"/>',
jungle:'<rect x="0" y="10" width="12" height="2" fill="#2f6b3a"/><rect x="5" y="7" width="2" height="3" fill="#6b4a2b"/><rect x="4" y="1" width="4" height="1" fill="#3aa84a"/><rect x="2" y="2" width="8" height="2" fill="#3aa84a"/><rect x="1" y="4" width="10" height="2" fill="#2f8a3a"/><rect x="3" y="6" width="6" height="1" fill="#2f8a3a"/>',
snow:'<rect x="0" y="10" width="12" height="2" fill="#f4f8ff"/><rect x="5" y="2" width="2" height="1" fill="#ffffff"/><rect x="4" y="3" width="4" height="1" fill="#ffffff"/><rect x="3" y="4" width="6" height="2" fill="#8aa8c8"/><rect x="2" y="6" width="8" height="2" fill="#6a88a8"/><rect x="1" y="8" width="10" height="2" fill="#8aa8c8"/>',
parkour:'<rect x="0" y="9" width="4" height="2" fill="#5cb85c"/><rect x="4" y="6" width="4" height="2" fill="#3d8bff"/><rect x="8" y="3" width="4" height="2" fill="#ff8c1a"/><rect x="1" y="7" width="2" height="2" fill="#7fd0ff"/>',
boxing:'<rect x="3" y="1" width="6" height="1" fill="#17306b"/><rect x="2" y="2" width="8" height="5" fill="#ff5d5d"/><rect x="3" y="2" width="3" height="1" fill="#ff9a9a"/><rect x="1" y="3" width="1" height="3" fill="#17306b"/><rect x="10" y="3" width="1" height="3" fill="#17306b"/><rect x="2" y="7" width="8" height="1" fill="#b32b30"/><rect x="3" y="8" width="6" height="3" fill="#ffffff"/><rect x="3" y="11" width="6" height="1" fill="#17306b"/>',
speedrace:'<rect x="1" y="6" width="10" height="3" fill="#ff5d5d"/><rect x="3" y="4" width="6" height="2" fill="#7fd0ff"/><rect x="2" y="8" width="3" height="3" fill="#17306b"/><rect x="7" y="8" width="3" height="3" fill="#17306b"/><rect x="5" y="2" width="2" height="2" fill="#ffd23f"/>',
builds:'<rect x="1" y="1" width="4" height="4" fill="#5cb85c"/><rect x="7" y="1" width="4" height="4" fill="#3d8bff"/><rect x="1" y="7" width="4" height="4" fill="#ffd23f"/><rect x="7" y="7" width="4" height="4" fill="#ff5d5d"/>'};
const micon=k=>'<svg class="mi" viewBox="0 0 12 12">'+(MICON[k]||'')+'</svg>';
const MU_HANGOUT=[['island','Pulau'],['desert','Gurun'],['jungle','Jungle'],['snow','Salju']];
const MU_FUN=[['parkour','Parkour'],['speedrace','Balapan'],['boxing','Boxing'],['builds','Builds']];
const MU=[...MU_HANGOUT,...MU_FUN];

const mGridHangout=$('mapsHangout');
const mGridFun=$('mapsFun');
const mkMapBtn=(k,l)=>{const b=document.createElement('button');b.innerHTML=micon(k)+'<span>'+l+'</span>';b.className=selMap==k?'on':'';b.dataset.map=k;
  b.onclick=()=>{selMap=k;[...mGridHangout.children,...mGridFun.children].forEach(x=>x.classList.toggle('on',x.dataset.map===k))};return b};
MU_HANGOUT.forEach(([k,l])=>mGridHangout.append(mkMapBtn(k,l)));
MU_FUN.forEach(([k,l])=>mGridFun.append(mkMapBtn(k,l)));

/* ═══════════════════════════════════════════════════════════════════
   TRACK PICKER — 3 kategori: Drag (4), Rally (5), Circuit (4)
   ═══════════════════════════════════════════════════════════════════ */
let rtrack='drag250';
const TRACK_CATS={
  drag:{ name:'Drag', sub:'4 Trek Lurus', color:'#d8342a',
    tracks:[
      ['drag250','Drag 250J','Lurus, 4 zona cuaca',1],
      ['drag500','Drag 500J','Lurus, lintasan sedang',2],
      ['drag1000','Drag 1000J','Lurus, tantangan menengah',3],
      ['drag5000','Drag 5000J','Lurus, maraton panjang',4]
    ]
  },
  rally:{ name:'Rally', sub:'5 Trek Berkelok', color:'#2a8a4a',
    tracks:[
      ['rally','Rally Klasik','Berkelok lewat hutan',4],
      ['neon','Neon City','Kota neon malam hari',3],
      ['beach','Pantai Sunset','Pesisir pasir dan senja',2],
      ['canyon','Canyon Gurun','Tikungan tajam di tebing',5],
      ['jelly','Jelly Land','Dunia jelly dan bubble',3]
    ]
  },
  circuit:{ name:'Sirkuit', sub:'4 Trek Loop 4500J', color:'#8f5cff',
    tracks:[
      ['circuit1','Sirkuit Alpine','Trek melingkar pegunungan',3],
      ['circuit2','Neon Ring','Loop bercahaya neon',4],
      ['circuit3','Desert Loop','Loop gurun berdebu',4],
      ['circuit4','Midnight Circuit','Sirkuit malam berbintang',5]
    ]
  }
};
const TRACK_KEYS=[];
for(const k in TRACK_CATS)for(const t of TRACK_CATS[k].tracks)TRACK_KEYS.push(t[0]);

function trkPreview(k,c){
  const x=c.getContext('2d'),S=48;
  x.fillStyle='#0a1030';x.fillRect(0,0,S,S);
  setTrack(k);
  const b=TRK.bb,kz=(S-8)/Math.max(b.h,1),kx=kz*Math.min(8,(S-12)/Math.max(1,b.w*kz)),ox=S/2-(b.w/2)*kx,
    X=p=>ox+(p.x-b.x0)*kx,Y=p=>S-4-(p.z-b.z0)*kz;
  // Track glow
  x.strokeStyle='rgba(125,208,255,.25)';x.lineWidth=5;x.beginPath();
  TRK.pts.forEach((p,i)=>i?x.lineTo(X(p),Y(p)):x.moveTo(X(p),Y(p)));x.stroke();
  x.strokeStyle='#7fd0ff';x.lineWidth=2;x.beginPath();
  TRK.pts.forEach((p,i)=>i?x.lineTo(X(p),Y(p)):x.moveTo(X(p),Y(p)));x.stroke();
  const a=TRK.pts[0],e=TRK.pts[TRK.pts.length-1];
  x.fillStyle='#3fbf5f';x.fillRect(X(a)-3,Y(a)-3,6,5);
  x.fillStyle='#ffd23f';x.fillRect(X(e)-3,Y(e)-1,6,5);
}

function pickTrack(){
  return new Promise(res=>{
    const d=document.createElement('div');
    d.className='ui';
    d.style.background='rgba(14,26,58,.55)';
    d.innerHTML='<div class="card tkc" style="pointer-events:auto;width:min(96vw,760px)">'+
      '<div class="lbl">Pilih Trek Balapan</div>'+
      '<div class="track-cats"></div>'+
      '<div id="track-grid"></div>'+
      '<button class="s">Kembali</button>'+
      '</div>';
    let curCat='drag';
    const catsWrap=d.querySelector('.track-cats');
    const grid=d.querySelector('#track-grid');
    const renderCats=()=>{
      catsWrap.innerHTML='';
      for(const k in TRACK_CATS){
        const C=TRACK_CATS[k];
        const b=document.createElement('button');
        b.className=(curCat===k?'on':'');
        b.style.setProperty('--c',C.color);
        b.innerHTML=C.name+'<small>'+C.sub+'</small>';
        b.onclick=()=>{curCat=k;renderCats();renderGrid()};
        catsWrap.append(b);
      }
    };
    const renderGrid=()=>{
      grid.innerHTML='';
      const C=TRACK_CATS[curCat];
      C.tracks.forEach(([k,n,t,df])=>{
        const b=document.createElement('button');
        b.className='tk';b.style.setProperty('--c',C.color);
        b.innerHTML='<canvas width="48" height="48"></canvas>'+
          '<span class="tt"><b>'+n+'</b><small>'+t+'</small>'+
          '<em class="dif">'+[1,2,3,4,5].map(i=>'<i'+(i<=df?' class="on"':'')+'></i>').join('')+'</em>'+
          '<em class="dist">'+(k.startsWith('drag')?k.replace('drag','')+'J':k.startsWith('circuit')?'4500J':k==='rally'?'5000J':k==='neon'?'4000J':'3500J')+'</em>'+
          '</span>';
        trkPreview(k,b.firstChild);
        b.onclick=()=>{d.remove();res(k)};
        grid.append(b);
      });
    };
    renderCats();renderGrid();
    d.querySelector('.s').onclick=()=>{d.remove();res(null)};
    document.body.append(d);
  });
}

/* ═══ Play Maps (2 group) ═══ */
const ppGridHangout=$('playMapsHangout');
const ppGridFun=$('playMapsFun');
async function startFromPlay(k){
  selMap=k;
  if(k=='speedrace'){const t=await pickTrack();if(!t)return;rtrack=t}
  $('mp').disabled=true;
  if(k=='builds'){
      await join('g_builds_'+(uid||'x'), k, false);
      $('mp').disabled=false;
      start(k, true);
      return;
  }
  await join(k=='speedrace'?'g_'+k+'_'+(uid||'x'):'g_'+k,k,false);
  $('mp').disabled=false;
  start(k,k=='speedrace');
}
MU_HANGOUT.forEach(([k,l])=>{
  const b=document.createElement('button');b.dataset.map=k;
  b.innerHTML=micon(k)+'<span>'+l+'</span><small data-cnt>· · ·</small>';
  b.onclick=()=>startFromPlay(k);
  ppGridHangout.append(b);
});
MU_FUN.forEach(([k,l])=>{
  const b=document.createElement('button');b.dataset.map=k;
  b.innerHTML=micon(k)+'<span>'+l+'</span><small data-cnt>'+(k=='speedrace'?'pilih trek':(k=='builds'?'solo':'· · ·'))+'</small>';
  b.onclick=()=>startFromPlay(k);
  ppGridFun.append(b);
});
const countUnsubs={};

async function setupGlobalCounts(){
  try{await ready}catch(e){}
  if(typeof db==='undefined'||!db)return;
  for(const [k,l] of MU){
    if(countUnsubs[k]||k=='speedrace'||k=='builds')continue;
    const ref=db.ref('rooms/g_'+k+'/players');
    const cb=s=>{
      const v=s.val()||{};
      const now=Date.now();
      let cnt=0;
      for(const id in v){
        const p=v[id]||{};
        const t=p.lastSeen;
        if(typeof t==='number' && t>0 && (now-t)<300000)cnt++;
      }
      const btn=[...document.querySelectorAll('#playMapsHangout button, #playMapsFun button')].find(x=>x.dataset.map===k);
      if(!btn)return;
      const small=btn.querySelector('[data-cnt]');
      if(!small)return;
      if(cnt>0){small.textContent=''+cnt+' online';small.className='on-live';small.style.color='#3fbf5f'}
      else{small.textContent='· kosong ·';small.className='';small.style.color=''}
    };
    ref.on('value',cb);
    countUnsubs[k]={ref,cb};
  }
}
setupGlobalCounts();

$('rd').value=cfg.rd;$('rd').oninput=e=>{cfg.rd=+e.target.value;sv();setRD()};
$('sb').onclick=()=>{$('set').classList.add('hide');playing?$('pause').classList.remove('hide'):show('menu')};
$('ms').onclick=()=>{show('skin');window.refreshCarUI&&window.refreshCarUI()};$('mr').onclick=()=>show('croom');$('mt').onclick=()=>show('set');
$('mp').onclick=()=>show('playpick');

/* ══════ PWA INSTALL ══════ */
let dp=null;
const mdBtn=$('md');
const setMdLabel=(t,d)=>{if(mdBtn){mdBtn.textContent=t;mdBtn.disabled=!!d}};
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;setMdLabel('Download',false);toast('Siap diinstall! Tekan Download')});
addEventListener('appinstalled',()=>{dp=null;setMdLabel('Terinstall ✓',true);toast('Meet-UP berhasil diinstall!')});
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
if(isStandalone())setMdLabel('Terinstall ✓',true);
if(mdBtn){
  mdBtn.onclick=async()=>{
    if(isStandalone()){toast('Sudah terinstall! Buka dari ikon di layar utama');return}
    if(!dp){toast('Tunggu... browser belum siap. Coba lagi 2 detik lagi');return}
    try{
      dp.prompt();
      const c=await dp.userChoice;
      if(c.outcome==='accepted'){toast('Menginstall...');setMdLabel('Terinstall ✓',true)}
      else toast('Install dibatalkan');
      dp=null;
    }catch(e){toast('Gagal install: '+e.message)}
  }
}

$('ng').onclick=()=>{const v=$('nm').value.trim().slice(0,14);if(!v)return;cfg.name=v;sv();setSelf();show('menu')};

async function join(id,map,h){const er=await ready;if(er&&er!='timeout'&&er!='net'&&er!=''){toast(ERR[er]);return 0}try{return await join2(id,map,h)}catch(e){toast('Gagal masuk: '+(e.code||e.message));return 0}}
async function join2(id,map,h){rid=id;host=h;roomMap=map;base=db.ref('rooms/'+id);me=base.child('players/'+uid);me.onDisconnect().remove();await me.set({n:cfg.name,c1:cfg.c1,c2:cfg.c2,sh:cfg.sh,hat:cfg.hat|0,nc:cfg.nc,nf:cfg.nf,car:cfg.car,x:0,z:0,y:0,r:0,e:-1,et:0,ct:0,ch:' ',jb:cfg.jb,hp:10,kl:0,klt:0,dc:0,kb:'',pc:0,pk:0,ab:0,ko:0,lastSeen:TS});try{const o=await db.ref('.info/serverTimeOffset').once('value');srvOff=o.val()||0}catch(e){}pl.x=pl.z=pl.y=0;joined=true;base.child('players').on('value',onPl);if(pl._hb)clearInterval(pl._hb);pl._hb=setInterval(()=>{if(me)me.update({lastSeen:TS}).catch(()=>{})},20000);if(id[0]!='g'){base.child('meta').on('value',s=>{const m=s.val();if(m&&m.started){if(m.startAt&&m.map=='speedrace')raceEnd=m.startAt+CDMS;if(!playing){rtrack=TRACK_KEYS.includes(m.track)?m.track:'drag250';start(m.map)}}})}return 1}
function onPl(s){const v=s.val()||{};lastRoom=v;if(joined&&!v[uid]){leave();alert('Kamu keluar dari room');return}$('ll').innerHTML='';for(const id in v){const r=document.createElement('div');r.className='row';r.innerHTML=`<i style="background:${v[id].c1}"></i><b></b>`;r.lastChild.textContent=v[id].n+(id==uid?' (kamu)':'');if(host&&id!=uid){const x=document.createElement('button');x.className='kick';x.textContent=KX;x.onclick=()=>base.child('players/'+id).remove();r.append(x)}$('ll').append(r)}for(const id in v){if(id==uid)continue;const d=v[id];let p=P[id];if(!p){p=P[id]=mkP(d);p.x=d.x;p.z=d.z;p.y=d.y||0;p.carType=d.car||'starter';if((d.jb||0)>=500)toast(''+d.n+' punya '+d.jb+' JB!')}else if(p.carType!==(d.car||'starter')){p.carType=d.car||'starter';if(p.car){p.root.remove(p.car.g);p.car=null}}p.tx=d.x;p.tz=d.z;p.tr=d.r;p.ty=d.y||0;p.nm=d.n;p.pg=d.pg||0;p.ft=d.ft||0;p.jbLvl=jbLvlOf(d.jb||0);bxNet(p,d,id);if(d.et!==p.lEt){if(p.init&&d.e>=0)setE(p,d.e);p.lEt=d.et}if(d.ct!==p.lCt){if(p.init&&d.ch.trim())say(p,d.ch);p.lCt=d.ct}p.init=1}for(const id in P)if(!v[id]){sc.remove(P[id].root);delete P[id]}bxSyncRoom(v)}
function start(map,solo){
  soloRace=!!solo;if(solo)raceEnd=0;
  if(map=='speedrace')setTrack(rtrack);
  racePrg=0;build(map);clearBots();
  if(map=='speedrace'&&solo)mkBots();
  world.visible=true;menuG.visible=false;sc.add(pl.root);playing=true;
  
  if(map=='builds') {
      document.getElementById('hud').classList.add('hide');
      document.getElementById('build-ui').classList.remove('hide');
      initBuildMode();
  } else {
      document.getElementById('build-ui').classList.add('hide');
      document.getElementById('hud').classList.remove('hide');
  }

  document.body.classList.toggle('racing',map=='speedrace');
  document.body.classList.toggle('pkr',map=='parkour');
  document.body.classList.toggle('bxm',map=='boxing');
  
  pl.boostMul=1;pl.boostTime=0;pl.boostCooldown=0;pl.sitting=null;pl.balloon=null;pl.hp=pl.maxHp;pl.inRing=false;pl.koTimer=0;pl.invuln=0;pl._prevJump=false;
  
  if(map=='speedrace'){pl.x=((uid||'ab').charCodeAt(1)%5-2)*3;pl.z=-6;pl.y=0}
  else if(map=='parkour'){pl.x=0;pl.z=0;pl.y=1}
  else if(map=='boxing'){pl.x=0;pl.z=-16;pl.y=0}
  else if(map=='builds'){pl.x=0;pl.z=0;pl.y=0}
  else{pl.x=6;pl.z=-8;pl.y=0}
  
  pl.vx=pl.vz=pl.vy=0;pl.r=0;raceTimer=0;raceRunning=false;raceFinished=false;raceArmed=true;
  ['menu','playpick','lobby'].forEach(i=>$(i).classList.add('hide'));
  
  zd=12;cp=null;pf=false;
  if(map!='speedrace'&&map!='parkour'&&map!='boxing'&&map!='builds')setTimeout(()=>toast('Monster menyerang! Tekan F atau tombol HIT untuk melawan'),1500);
  if(map=='speedrace'){
    const ids=Object.keys(lastRoom).sort(),ln=solo?0:[-5,0,5][Math.max(0,ids.indexOf(uid))%3],q=trkAt(-6,ln);
    pl.x=q.x;pl.z=q.z;pl.y=0;pl.r=q.h;cy=Math.PI+q.h;pitch=.4;zd=9;
    TRK.ci=TRK.loop?Math.floor((TRK.len-6)/4):0;
    lastS=TRK.loop?TRK.len-6:-6;raceDist=-6;myFt=0;
    raceCd=raceEnd?Math.max(.01,(raceEnd-srvNow())/1000):3.99;
    car.sp=0;car.st=0;hideWin();
    const TN=TRK.kind.toUpperCase();
    toast(matchMedia('(pointer:coarse)').matches?'Trek '+TN+'! Kiri: panah atas/bawah = gas/rem · Kanan: panah kiri/kanan = belok':'Trek '+TN+'! Panah atas/bawah = gas/rem, kiri/kanan = belok (W/A/S/D juga bisa)');
  } else {
    cam.fov=60;cam.updateProjectionMatrix();
    if(map=='parkour'){cy=Math.PI;pitch=.5}
    if(map=='boxing'){cy=Math.PI;pitch=.45;bxStart()}
  }
}
async function leave(){bxReset();padReset();hideWin();clearBots();raceEnd=0;joined=false;playing=false;if(pl&&pl._hb){clearInterval(pl._hb);pl._hb=null}if(pl&&pl.balloon){pl.balloon.rider=null;pl.balloon=null}if(base){base.child('players').off();base.child('meta').off();try{if(host&&rid[0]!='g')await base.remove();else await me.remove()}catch(e){}}for(const id in P)sc.remove(P[id].root);P={};base=me=null;$('hud').classList.add('hide');$('pause').classList.add('hide');$('hpbar').classList.add('hide');if(dlgBtnEl)dlgBtnEl.classList.remove('show');currentDlgTarget=null;menuMode();show('menu');document.getElementById('build-ui').classList.add('hide');if(window.buildCleanup)buildCleanup()}
const code=()=>Math.random().toString(36).slice(2,7).toUpperCase();
$('rc').onclick=async()=>{const er=await ready;if(er&&er!='timeout'&&er!='net'&&er!=''){return toast(ERR[er])}const m=selMap,c=code();let tk=null;if(m=='speedrace'){tk=await pickTrack();if(!tk)return;rtrack=tk}try{await db.ref('rooms/'+c+'/meta').set({host:uid,map:m,track:tk||'drag250',started:false})}catch(e){return toast('Gagal buat room: '+e.code)}if(await join(c,m,true)){$('lc').textContent=c;$('lg').classList.remove('hide');show('lobby')}};
$('rj').onclick=async()=>{const er=await ready;if(er&&er!='timeout'&&er!='net'&&er!=''){return toast(ERR[er])}const c=$('ri').value.trim().toUpperCase();let r;try{r=await db.ref('rooms/'+c+'/meta').once('value')}catch(e){return toast('Gagal: '+e.code)}if(!r.exists())return toast('Room tidak ditemukan');const m=r.val().map;if(r.val().started&&m=='speedrace')return toast('Balapan sudah dimulai');rtrack=TRACK_KEYS.includes(r.val().track)?r.val().track:'drag250';let pc;try{pc=await db.ref('rooms/'+c+'/players').once('value')}catch(e){pc=null}if(m=='speedrace'&&pc&&pc.numChildren()>=3)return toast('Room balapan penuh (maks 3 pemain)');if(await join(c,m,false)){$('lc').textContent=c;$('lg').classList.add('hide');show('lobby')}};
$('lg').onclick=async()=>{try{if(roomMap=='speedrace')await base.child('meta').update({started:true,startAt:TS});else await base.child('meta/started').set(true)}catch(e){}if(!playing)start(roomMap)};
$('lx').onclick=leave;$('pe').onclick=leave;
$('pb').onclick=()=>$('pause').classList.remove('hide');$('pr').onclick=()=>$('pause').classList.add('hide');
$('ps').onclick=()=>{$('pause').classList.add('hide');$('set').classList.remove('hide')};
let actPage=0;
function renderBar(){const b=$('bar');b.innerHTML='';for(let k=0;k<8;k++){const i=actPage*8+k,x=document.createElement('button');x.append(icoC(i));x.insertAdjacentHTML('beforeend','<small>'+(k+1)+'</small>');x.onclick=()=>emo(i);if(pl&&pl.e==i)x.classList.add('on');b.append(x)}
  const m=document.createElement('button');m.innerHTML='<b style="font-size:15px;line-height:1">...</b><small>'+(actPage+1)+'/3</small>';m.onclick=()=>{actPage=(actPage+1)%3;renderBar()};b.append(m)}
renderBar();
function emo(i){if(!playing||!pl)return;const n=pl.e==i?-1:i;setE(pl,n);me&&me.update({e:n,et:TS});[...$('bar').children].forEach((b,j)=>b.classList.toggle('on',actPage*8+j==n));setTimeout(()=>[...$('bar').children].forEach(b=>b.classList.remove('on')),700)}
function send(){if(!pl)return;const t=$('ci').value.trim();if(t){say(pl,t);me&&me.update({ch:t,ct:TS})}$('ci').value='';$('chat').classList.add('hide')}
$('cb').onclick=()=>{$('chat').classList.toggle('hide');$('ci').focus()};
$('cs').onclick=send;$('ci').onkeydown=e=>{if(e.key=='Enter')send()};

/* ═══ Keydown: Skip INPUT/TEXTAREA, tambah key E untuk action, ESC tutup feedback ═══ */
addEventListener('keydown',e=>{
  if(e.code=='Escape'&&!$('fb').classList.contains('hide')){closeFeedback();e.preventDefault();return}
  if(e.target.tagName=='INPUT'||e.target.tagName=='TEXTAREA')return;
  keys[e.code]=1;
  if(e.code=='KeyF'||e.code=='KeyJ')attack();
  if(e.code=='KeyE'&&playing&&actTarget)doAction();
  if(e.key>='1'&&e.key<='8')emo(actPage*8+ +e.key-1);
  if(e.key=='9'){actPage=(actPage+1)%3;renderBar()}
  if(e.key=='Enter'){$('chat').classList.remove('hide');$('ci').focus();e.preventDefault()}
});
addEventListener('keyup',e=>keys[e.code]=0);
let ds=0,lx=0,ly=0,cvT={};
const look=(dx,dy)=>{cy-=dx*.008;pitch=Math.min(1.35,Math.max(.05,pitch+dy*.006))};
let clk=null;cv.onmousedown=e=>{ds=1;lx=e.clientX;ly=e.clientY;clk={t:performance.now(),x:e.clientX,y:e.clientY}};
addEventListener('mouseup',e=>{
  ds=0;
  if(clk&&playing&&e.button===0&&performance.now()-clk.t<230&&Math.hypot(e.clientX-clk.x,e.clientY-clk.y)<7){
    if(curMap=='boxing')attack();
    else if(actTarget)doAction();
  }
  clk=null;
});
addEventListener('mousemove',e=>{if(ds&&playing){look(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY}});
cv.onwheel=e=>zd=Math.min(22,Math.max(3,zd+e.deltaY*.01));
cv.ontouchstart=e=>{for(const t of e.changedTouches)cvT[t.identifier]={x:t.clientX,y:t.clientY}};
cv.ontouchmove=e=>{const ids=Object.keys(cvT);if(ids.length>=2){const a=cvT[ids[0]],b=cvT[ids[1]],d0=Math.hypot(a.x-b.x,a.y-b.y);for(const t of e.changedTouches)if(cvT[t.identifier])Object.assign(cvT[t.identifier],{x:t.clientX,y:t.clientY});zd=Math.min(22,Math.max(3,zd-(Math.hypot(a.x-b.x,a.y-b.y)-d0)*.03))}else for(const t of e.changedTouches){const o=cvT[t.identifier];if(o){if(playing)look(t.clientX-o.x,t.clientY-o.y);o.x=t.clientX;o.y=t.clientY}}};
cv.ontouchend=cv.ontouchcancel=e=>{for(const t of e.changedTouches)delete cvT[t.identifier]};
const lockL=()=>{try{if(matchMedia('(pointer:coarse)').matches)(document.documentElement.requestFullscreen?document.documentElement.requestFullscreen():Promise.resolve()).then(()=>screen.orientation.lock('landscape')).catch(()=>{})}catch(e){}};
addEventListener('pointerdown',lockL,{once:true});
if(matchMedia('(pointer:coarse)').matches)$('mob').classList.remove('hide');
const joy=$('joy'),kn=$('kn');
const jm=e=>{const t=e.targetTouches[0],r=joy.getBoundingClientRect(),dx=t.clientX-r.left-62,dy=t.clientY-r.top-62,l=Math.min(1,Math.hypot(dx,dy)/52),a=Math.atan2(dy,dx);ix=Math.cos(a)*l;iy=-Math.sin(a)*l;kn.style.left=42+Math.cos(a)*l*42+'px';kn.style.top=42+Math.sin(a)*l*42+'px'};
joy.ontouchstart=joy.ontouchmove=e=>{e.stopPropagation();jm(e)};
joy.ontouchend=()=>{ix=iy=0;kn.style.left=kn.style.top='42px'};
$('jb').ontouchstart=()=>{jmp=true};
$('ab').ontouchstart=e=>{e.preventDefault();attack()};$('ab').onclick=attack;
$('rb').ontouchstart=()=>{run=!run;$('rb').classList.toggle('s',!run)};
const PAD={U:0,D:0,L:0,R:0};
[['kU','U'],['kD','D'],['kL','L'],['kR','R']].forEach(([id,k])=>{const b=$(id);if(!b)return;
  const on=e=>{e.preventDefault();e.stopPropagation();PAD[k]=1;b.classList.add('on');try{b.setPointerCapture(e.pointerId)}catch(_){}};
  const off=()=>{PAD[k]=0;b.classList.remove('on')};
  b.onpointerdown=on;b.onpointerup=b.onpointercancel=b.onlostpointercapture=off;b.oncontextmenu=e=>e.preventDefault()});
const padReset=()=>{for(const k in PAD)PAD[k]=0;document.querySelectorAll('#rpad .pad').forEach(b=>b.classList.remove('on'))};
let jbHoldTimer=null,jbWasHold=false;
$('jb').addEventListener('touchstart',()=>{if(pl&&pl.balloon){jbWasHold=false;jbHoldTimer=setTimeout(()=>{mobileUp=true;jbWasHold=true},250)}},{capture:true});
$('jb').addEventListener('touchend',()=>{if(jbHoldTimer){clearTimeout(jbHoldTimer);jbHoldTimer=null}if(mobileUp){mobileUp=false}},{capture:true});
$('rb').addEventListener('touchstart',()=>{if(pl&&pl.balloon){mobileDown=true}},{capture:true});
$('rb').addEventListener('touchend',()=>{mobileDown=false},{capture:true});

/* ═══ Bind Action Button & Feedback ═══ */
const actBtn=$('act');
if(actBtn){
  let actDown=false;
  actBtn.onpointerdown=e=>{e.preventDefault();actDown=true;doAction()};
  actBtn.onclick=e=>{e.preventDefault();e.stopPropagation();if(actDown){actDown=false;return}doAction()};
}
const fbClose=$('fbc'),fbSend=$('fbs');
if(fbClose)fbClose.onclick=closeFeedback;
if(fbSend)fbSend.onclick=submitFeedback;

const PR=0.5,PH=1.5,STEP=1.3;
function resolveH(){for(const c of cols){if(!c.enabled)continue;if(c.type==='dome')continue;const top=c.y+c.h;if(pl.y>=top-0.1)continue;if(top-pl.y<=STEP)continue;if(pl.y+PH<=c.y)continue;const dx=pl.x-c.x,dz=pl.z-c.z;const ox=c.w/2+PR-Math.abs(dx);const oz=c.d/2+PR-Math.abs(dz);if(ox>0&&oz>0){if(ox<oz){pl.x=c.x+Math.sign(dx||1)*(c.w/2+PR);if(pl.vx*Math.sign(dx||1)<0)pl.vx=0}else{pl.z=c.z+Math.sign(dz||1)*(c.d/2+PR);if(pl.vz*Math.sign(dz||1)<0)pl.vz=0}}}}
function groundY(){let GY=-999,GSLIP=0,GBOUNCE=0;const gr=0.42;for(const c of cols){if(!c.enabled)continue;if(c.type==='dome'){const dd=Math.hypot(pl.x-c.x,pl.z-c.z);if(dd<c.radius){const topH=c.domeH*Math.sqrt(Math.max(0,1-(dd/c.radius)**2));if(topH>GY){GY=topH;GSLIP=0;GBOUNCE=0}}continue}const top=c.y+c.h;if(pl.y<top-0.55)continue;if(pl.x+gr>c.x-c.w/2&&pl.x-gr<c.x+c.w/2&&pl.z+gr>c.z-c.d/2&&pl.z-gr<c.z+c.d/2){if(top>GY){GY=top;GSLIP=c.slip||0;GBOUNCE=c.bounce||0}}}if(GY<-500)GY=(curMap=='parkour'||curMap=='builds')?-50:0;return{GY,GSLIP,GBOUNCE}}
function groundYSafe(){let GY=-999;const gr=0.42;for(const c of cols){if(!c.enabled)continue;if(c.type==='dome'){const dd=Math.hypot(pl.x-c.x,pl.z-c.z);if(dd<c.radius){const topH=c.domeH*Math.sqrt(Math.max(0,1-(dd/c.radius)**2));if(topH>GY)GY=topH}continue}const top=c.y+c.h;if(pl.y<top-0.55)continue;if(pl.x+gr>c.x-c.w/2&&pl.x-gr<c.x+c.w/2&&pl.z+gr>c.z-c.d/2&&pl.z-gr<c.z+c.d/2){if(top>GY)GY=top}}if(GY<-500)GY=(curMap=='parkour'||curMap=='builds')?-50:0;return GY}
function groundYSafeAt(x,z){let GY=0;const gr=0.42;for(const c of cols){if(!c.enabled)continue;if(c.type==='dome'){const dd=Math.hypot(x-c.x,z-c.z);if(dd<c.radius){const topH=c.domeH*Math.sqrt(Math.max(0,1-(dd/c.radius)**2));if(topH>GY)GY=topH}continue}const top=c.y+c.h;if(x+gr>c.x-c.w/2&&x-gr<c.x+c.w/2&&z+gr>c.z-c.d/2&&z-gr<c.z+c.d/2){if(top>GY)GY=top}}return GY}

const car={sp:0,st:0};
function carStep(dt){const n=Math.min(12,Math.max(1,Math.ceil(Math.abs(car.sp)*dt/4)));for(let i=0;i<n;i++)carStep1(dt/n)}
function carStep1(dt){
  const go=raceCd<=0&&!raceFinished,fl=FXL();
  const CFG=carOf(cfg.car);
  const acc=go?Math.max(-1,Math.min(1,iy+(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)+PAD.U-PAD.D)):0,
    st=go?Math.max(-1,Math.min(1,ix+(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+PAD.R-PAD.L)):0;
  if(pl.boostTime>0&&(pl.boostTime-=dt)<=0)pl.boostMul=1;
  const top=CFG.top*(pl.boostMul||1);
  const ar=0.9*CFG.acc;
  if(acc>0)car.sp+=(top-car.sp)*Math.min(1,dt*(pl.boostTime>0?ar*2.67:ar))*acc;
  else if(acc<0)car.sp=Math.max(-12,car.sp+acc*45*dt);
  else car.sp*=Math.pow(raceFinished?.25:.65,dt);
  car.st+=(st-car.st)*Math.min(1,dt*8);
  pl.r-=car.st*dt*2.1*Math.min(1,Math.abs(car.sp)/14)*Math.min(1,150/Math.max(1,Math.abs(car.sp)))*(car.sp<0?-1:1);
  pl.vx=Math.sin(pl.r)*car.sp;pl.vz=Math.cos(pl.r)*car.sp;pl.x+=pl.vx*dt;pl.z+=pl.vz*dt;pl.y=0;pl.vy=0;
  const nr=trkNear(pl.x,pl.z,TRK.ci),lim=RW/2+.4;TRK.ci=nr.i;
  {let dl=nr.s-lastS;if(TRK.loop){if(dl<-TRK.len/2)dl+=TRK.len;else if(dl>TRK.len/2)dl-=TRK.len;raceDist+=dl}else raceDist=nr.s;lastS=nr.s;racePrg=raceDist}
  if(Math.abs(nr.d)>lim){const q=TRK.pts[nr.i],sg=Math.sign(nr.d);pl.x=nr.px+q.nx*sg*lim;pl.z=nr.pz+q.nz*sg*lim;car.sp*=Math.pow(.2,dt);if(fl&&Math.abs(car.sp)>10&&Math.random()<dt*30)puff(pl.x,pl.z,2,'#ffd23f',3,.6)}
  if(!ds&&!Object.keys(cvT).length&&car.sp>2){let d=pl.r+Math.PI-cy;d=Math.atan2(Math.sin(d),Math.cos(d));cy+=d*Math.min(1,dt*3)}
  const fv=60+Math.min(28,Math.max(0,car.sp)*.32)+(pl.boostTime>0?10:0);
  if(Math.abs(fv-cam.fov)>.05){cam.fov+=(fv-cam.fov)*Math.min(1,dt*4);cam.updateProjectionMatrix()}
  const sn=Math.sin(pl.r),cs=Math.cos(pl.r),bx=pl.x-sn*2.4,bz=pl.z-cs*2.4;pl.dustT-=dt;
  if(pl.dustT<=0&&Math.abs(car.sp)>4){pl.dustT=[.14,.08,.045,.025][fl];puff(bx+(Math.random()-.5),bz+(Math.random()-.5),1,pl.boostTime>0?'#ff8c1a':'#cfd6e0',pl.boostTime>0?3:1.2,.4)}
  if(fl>=2&&Math.abs(car.st)>.6&&car.sp>20&&Math.random()<dt*30){puff(bx,bz,2,'#ffffff',1.5,.2);trail(bx,bz,'#222222')}
  if(fl>=2&&car.sp>22&&Math.random()<dt*Math.min(car.sp,60)*.5){const a=(Math.random()-.5)*10,f=6+Math.random()*24;spawnAmb('streaks',{x:pl.x+cs*a+sn*f,y:.4+Math.random()*3.5,z:pl.z-sn*a+cs*f,r:pl.r})}
  for(const bb of boostBubbles)if(bb.act&&Math.hypot(bb.x-pl.x,bb.z-pl.z)<2.8){bb.act=false;bb.m.visible=false;bb.respawn=8;pl.boostMul=CFG.boost/CFG.top;pl.boostTime=3;car.sp+=8;ring(pl.x,pl.z,'#ffd23f',.2,1);puff(pl.x,pl.z,16,'#ffb84a',4,.8)}
}
function raceHud(dt){
  const t=$('raceTimer'),b=$('rbar'),c=$('cd'),sh=(e,v)=>e.classList.toggle('hide',!v),on=curMap=='speedrace';
  sh(t,on);sh(b,on);sh($('rpos'),on);sh($('spd'),on);if(!on){sh(c,0);return}
  if(raceCd>0){if(raceEnd)raceCd=(raceEnd-srvNow())/1000;else raceCd-=dt;if(raceCd<=0){raceRunning=true;raceTimer=raceEnd?Math.max(0,-raceCd):0;goT=.9}}
  if(goT>0)goT-=dt;
  sh(c,raceCd>0||goT>0);c.textContent=raceCd>0?Math.ceil(raceCd):'GO!';
  if(raceRunning&&!raceFinished){raceTimer=raceEnd?Math.max(0,(srvNow()-raceEnd)/1000):raceTimer+dt;if(raceDist>=RL)finishRace()}
  const d=Math.max(0,Math.min(RL,raceDist)),L=standings(),rk=L.findIndex(x=>x.me)+1;
  t.textContent=fmtT(raceTimer)+'  '+Math.round(d)+'/'+RL+'J';
  b.firstElementChild.style.width=d/RL*100+'%';
  const rp=$('rpos');rp.firstElementChild.textContent=rk;rp.firstElementChild.style.color=rk==1?'#ffd23f':'#fff';rp.lastElementChild.textContent='/'+L.length;
  const kmh=Math.round(Math.abs(car.sp)*3.6),sp=$('spd');sp.querySelector('b').textContent=kmh;sp.querySelector('.sb i').style.width=Math.min(100,kmh/Math.max(4.5,carOf(cfg.car).boost*.036))+'%';sp.classList.toggle('bo',pl.boostTime>0);
  let us=b.querySelectorAll('u');if(us.length!=L.length){us.forEach(u=>u.remove());L.forEach(()=>b.appendChild(document.createElement('u')));us=b.querySelectorAll('u')}
  L.forEach((e,i)=>{const u=us[i];u.style.left=(e.ft?100:Math.max(0,Math.min(100,e.d/RL*100)))+'%';u.style.background=e.c;u.className=e.me?'me':''});
}
let BOTS=[];
const BDEF=[{n:'Jello Merah',c1:'#ff5d5d',c2:'#ffb0b0',sh:3,sk:1,ln:-5},{n:'Jello Hijau',c1:'#3fbf5f',c2:'#b8f0c4',sh:1,sk:.94,ln:5}];
function clearBots(){for(const b of BOTS)sc.remove(b.p.root);BOTS=[]}
function mkBots(){clearBots();BOTS=BDEF.map(d=>{const p=mkP({n:d.n,c1:d.c1,c2:d.c2,sh:d.sh,hat:0,nc:'#ffffff',nf:'monospace',jb:0}),q=trkAt(-6,d.ln);p.x=p.tx=q.x;p.z=p.tz=q.z;p.r=p.tr=q.h;return{p,d,dist:-6,v:0,ft:0,t:0,bt:0,nb:5+Math.random()*6,ph:Math.random()*6.28}})}
function botsStep(dt,now){const go=raceCd<=0,T=TRK;for(const b of BOTS){
  if(go&&!b.ft){const idx=T.loop?Math.floor(((b.dist%T.len)+T.len)%T.len/4):Math.max(0,Math.min(T.curv.length-1,Math.floor((b.dist+T.s0)/4)));let tg=69.44*b.d.sk*Math.max(.9,1-(T.curv[idx]||0)*14);const gp=raceDist-b.dist;if(gp>250)07;else if(gp<-300)tg*=.94;if((b.nb-=dt)<=0){b.bt=2.5;b.nb=8+Math.random()*8}if(b.bt>0){b.bt-=dt;tg*=1.2}tg=Math.min(tg,95);b.v+=(tg-b.v)*Math.min(1,dt*3.0);b.t=(b.t||0)+dt;const pd=b.dist;b.dist+=b.v*dt;if(b.dist>=RL){const f=b.v>0?(RL-pd)/(b.dist-pd):1;b.ft=Math.max(.01,b.t-dt*(1-f))}}
  else if(b.ft){b.v*=Math.pow(.25,dt);b.dist+=b.v*dt}
  const q=trkAt(b.dist,b.d.ln*.7+Math.sin(now/1700+b.ph)*2.5);b.p.tx=q.x;b.p.tz=q.z;b.p.tr=q.h;b.p.ty=0}}
function standings(){const L=[{n:cfg.name||'Kamu',c:cfg.c1,d:raceDist,ft:myFt,me:1}];for(const b of BOTS)L.push({n:b.d.n,c:b.d.c1,d:b.dist,ft:b.ft});for(const id in P){const e=P[id];L.push({n:e.nm||'?',c:e.c1,d:e.pg||0,ft:e.ft||0})}
  L.sort((a,b)=>a.ft&&b.ft?a.ft-b.ft:a.ft?-1:b.ft?1:b.d-a.d);return L}
let winT=0,winRw=0;
const fmtT=t=>{const m=Math.floor(t/60);return m+':'+(t-m*60).toFixed(2).padStart(5,'0')};
function finishRace(){raceFinished=true;raceRunning=false;myFt=raceTimer;const rk=standings().findIndex(x=>x.me)+1,T=TRK.par,base=raceTimer<T[0]?100:raceTimer<T[1]?50:raceTimer<T[2]?20:10;winRw=Math.max(5,Math.round(base*[1,.5,.25][Math.min(2,rk-1)]));cfg.jb+=winRw;sv();$('jbn').textContent=cfg.jb+' JB';me&&me.update({jb:cfg.jb,ft:+raceTimer.toFixed(2),pg:RL});
  for(let i=0;i<[20,40,80,140][FXL()];i++)puff(pl.x+(Math.random()-.5)*8,pl.z+Math.random()*6,1,['#ff5d5d','#ffd23f','#3fbf5f','#3d8bff','#ff5db1'][i%5],6,2+Math.random()*3);ring(pl.x,pl.z,'#ffd23f',.2,1);showWin()}
(function injectWin(){const st=document.createElement('style');st.textContent='#win{z-index:12;background:rgba(14,26,58,.6)}#win .card{width:min(92vw,380px);gap:10px}#win .wt{font-size:18px;text-align:center;color:#3d8bff;line-height:1.4}#win .wt.w1{color:#e0a000}#win .ws{font-size:9px;text-align:center;opacity:.8;line-height:1.8}#wl{display:flex;flex-direction:column;gap:8px}#wl .row{gap:8px;padding:8px 10px}#wl .rk{flex:none;width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:#fff;color:var(--k);box-shadow:0 0 0 3px var(--k);font-size:11px}#wl .r1 .rk{background:#ffd23f}#wl .r2 .rk{background:#d8dfe8}#wl .r3 .rk{background:#e0a070}#wl .row.me{background:#fff3b8}#wl .tm{font-size:9px;flex:none}';document.head.appendChild(st);
  const w=document.createElement('div');w.id='win';w.className='ui hide';w.innerHTML='<div class="card"><div id="wt" class="wt"></div><div id="ws" class="ws"></div><div id="wl"></div><button id="wa">Main Lagi</button><button id="wx" class="d">Keluar</button></div>';document.body.appendChild(w);
  $('wa').onclick=()=>{hideWin();start('speedrace',true)};$('wx').onclick=()=>{hideWin();leave()}})();
function renderWin(){const L=standings(),rk=L.findIndex(x=>x.me)+1,wt=$('wt');wt.textContent=rk==1?'MENANG!':'PERINGKAT '+rk;wt.className='wt'+(rk==1?' w1':'');$('ws').textContent=fmtT(myFt)+'  ·  +'+winRw+' JB';const wl=$('wl');wl.innerHTML='';
  L.forEach((e,i)=>{const r=document.createElement('div');r.className='row r'+(i+1)+(e.me?' me':'');r.innerHTML='<div class="rk">'+(i+1)+'</div><i></i><b></b><span class="tm"></span>';r.querySelector('i').style.background=e.c;r.querySelector('b').textContent=e.n+(e.me?' (kamu)':'');r.querySelector('.tm').textContent=e.ft?fmtT(e.ft):Math.min(99,Math.round(Math.max(0,e.d)/RL*100))+'%';wl.append(r)});
  if(L.every(e=>e.ft)&&winT){clearInterval(winT);winT=0}}
function showWin(){$('wa').classList.toggle('hide',!soloRace);$('win').classList.remove('hide');renderWin();if(winT)clearInterval(winT);winT=setInterval(renderWin,400)}
function hideWin(){if(winT){clearInterval(winT);winT=0}const w=$('win');if(w)w.classList.add('hide')}

let lasCool=0,pkLast=null;
let pkPcd=0,pkWT=0;
function pkDie(m){if(lasCool>0)return;lasCool=1;const q=cp||{x:0,y:0,z:0};puff(pl.x,pl.z,16,'#ff2a4a',4,pl.y+1);pl.x=q.x;pl.z=q.z;pl.y=q.y+3;pl.vx=pl.vz=pl.vy=0;pkPush.t=0;toast(m)}
function spcStep(now,dt){const t=now/1000,ph2=Math.floor(t/2.2)%2;pkPcd-=dt;
  if(pkPush.t>0){const f=pkPush.t/pkPush.T;pl.x+=pkPush.x*f*dt;pl.z+=pkPush.z*f*dt;pkPush.t-=dt}
  for(const o of SPC){const c=o.c,g=o.g;if(Math.abs(c.z-pl.z)>60)continue;
    const st=c.enabled&&!pl.sitting&&!pl.balloon&&Math.abs(pl.x-c.x)<c.w/2+.1&&Math.abs(pl.z-c.z)<c.d/2+.1&&Math.abs(pl.y-(c.y+c.h))<.25&&pl.vy<=.6;
    switch(o.k){
    case 11:if(st){pl.x+=o.dx*4.6*dt;pl.z+=o.dz*4.6*dt}o.ch.forEach((m,k)=>{m.position.z=(((k/4+t*.35)%1)-.5)*o.len*.9});break;
    case 12:o.cd-=dt;if(st&&o.cd<=0){o.cd=.6;pl.vy=21;pkPush={x:0,z:9,t:.9,T:.9};puff(pl.x,pl.z,14,'#66ff99',4,pl.y+.3)}o.ar.position.y=2+Math.sin(t*6)*.25;break;
    case 13:if(o.s==0){g.position.x=c.x;if(st){o.s=1;o.t=0}}else if(o.s==1){o.t+=dt;g.position.x=c.x+Math.sin(t*60)*.09;if(o.t>.6){o.s=2;o.t=0;c.enabled=false}}else{o.t+=dt;g.position.y=c.y-Math.min(60,o.t*o.t*40);if(o.t>3){o.s=0;c.enabled=true;g.position.set(c.x,c.y,c.z)}}break;
    case 14:case 15:{const on=o.A?ph2==0:ph2==1,rem=2.2-(t%2.2),warn=on&&rem<.5&&((now/80|0)%2);c.enabled=on;o.solid.visible=on&&!warn;o.ghost.visible=!on||warn;break}
    case 16:if(st){pl.x-=pl.vx*dt*.62;pl.z-=pl.vz*dt*.62}o.bb.forEach((m,k)=>{m.position.y=1.2+Math.abs(Math.sin(t*2+k*2))*.45});break;
    case 17:o.r1.scale.setScalar(1+Math.sin(t*4)*.08);o.r2.position.y=1.5+Math.sin(t*3)*.3;if(st&&pkPcd<=0){const dd=plats[o.dest];if(dd){pkPcd=1.4;puff(pl.x,pl.z,20,'#c070ff',4,pl.y+1);pl.x=dd.x;pl.z=dd.z;pl.y=dd.y+dd.h+.05;pl.vx=pl.vz=pl.vy=0;puff(pl.x,pl.z,20,'#c070ff',4,pl.y+1);toast('PORTAL!')}}break;
    case 18:{const a=o.w*dt;o.rot.rotation.y+=a;if(st){const rx=pl.x-c.x,rz=pl.z-c.z,ca=Math.cos(a),sa=Math.sin(a);pl.x=c.x+rx*ca+rz*sa;pl.z=c.z-rx*sa+rz*ca}break}
    case 19:{const T=4.2,u=(((t+o.ph)%T)+T)%T,ph=u<2.2?0:u<3?1:2;o.top.material.color.setHex(ph==0?0x3fff9a:ph==1?(((now/110)|0)%2?0xffb020:0x886010):0xff2a2a);if(ph==2&&st)pkDie('Panas! Kembali ke checkpoint');break}
    case 20:{o.h=st?Math.min(1,o.h+dt*.4):Math.max(0,o.h-dt*.25);const ny=o.by+o.h*6,dy=ny-c.y;if(st&&dy)pl.y+=dy;c.y=ny;g.position.y=ny;break}
    case 21:{const a=o.amp*Math.sin(t*o.sp+o.ph);o.pv.rotation.z=a;const bx=c.x+Math.sin(a)*o.R,by=c.y+8.7-Math.cos(a)*o.R;if(Math.hypot(pl.x-bx,pl.y+.9-by,pl.z-c.z)<1.45)pkDie('Kena palu! Kembali ke checkpoint');break}
    }}
  const zn=PKZ.find(q=>pl.z>=q.z0&&pl.z<=q.z1);if(zn!==pkZone){pkZone=zn;if(zn)toast(zn.t=='wind'?'ANGIN KENCANG! Imbangi lompatanmu':'GRAVITASI RENDAH! Lompat melayang')}
  if(pkZone){if(pkZone.t=='wind'){const wv=Math.sin(t*.9)*pkZone.dir;pl.x+=wv*(pl.vy!==0?4.4:1.2)*dt;pkWT-=dt;if(pkWT<=0){pkWT=.1;puff(pl.x-wv*3+(Math.random()-.5)*2,pl.z+(Math.random()-.5)*4,1,'#ffffff',1,pl.y+.5+Math.random()*2.5)}}else if(pl.vy!==0)pl.vy+=22*.52*dt}}
function lasStep(now,dt){const t=now/1000;lasCool-=dt;for(const l of LAS){const a=l.ph+t*l.sp;l.g.rotation.y=a;if(l.amp){l.z=l.bz+Math.sin(t*.9+l.ph)*l.amp;l.g.position.z=l.z}
  if(lasCool>0||pl.sitting||pl.balloon||Math.abs(l.z-pl.z)>l.L+4||Math.abs(l.x-pl.x)>l.L+4)continue;
  if(pl.y>l.y+.75||pl.y+1.7<l.y-.45)continue;
  const dx=pl.x-l.x,dz=pl.z-l.z;let hit=false;
  for(let k=0;k<l.arms&&!hit;k++){const th=a+k*Math.PI/2,c=Math.cos(th),s=Math.sin(th);if(Math.abs(dx*c-dz*s)<=l.L&&Math.abs(dx*s+dz*c)<.7)hit=true}
  if(hit){pkDie('Kena laser! Kembali ke checkpoint');break}}}
(function injectPk(){const st=document.createElement('style');st.textContent='#pkb{display:none;position:fixed;top:max(58px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);width:min(64vw,380px);z-index:11;pointer-events:none;font-family:inherit;text-align:center}body.pkr #pkb{display:block}#pkb .t{font-size:10px;color:#fff;letter-spacing:1px;text-shadow:0 2px 0 #17306b,0 0 4px #17306b;margin-bottom:4px}#pkb .bar{position:relative;height:14px;background:#17306b;box-shadow:0 0 0 3px #fff,0 0 0 5px #17306b}#pkb .f{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,#3fbf5f,#ffd23f,#ff5db1)}#pkb .k{position:absolute;top:0;bottom:0;width:2px;background:#fff6;margin-left:-1px}#pkb .k.on{background:#fff}';document.head.appendChild(st);
  const d=document.createElement('div');d.id='pkb';d.innerHTML='<div class="t"></div><div class="bar"><div class="f"></div></div>';document.body.appendChild(d)})();
function pkHud(){const b=$('pkb');if(!b||!PKCP.length)return;const ZE=PARKOUR[PARKOUR.length-1][2],bar=b.querySelector('.bar');
  if(b.dataset.n!=PKCP.length){b.dataset.n=PKCP.length;bar.querySelectorAll('.k').forEach(e=>e.remove());PKCP.forEach(q=>{const e=document.createElement('i');e.className='k';e.style.left=Math.min(100,q.z/ZE*100)+'%';bar.appendChild(e)})}
  const pct=Math.max(0,Math.min(100,pl.z/ZE*100)),n=cp?PKCP.indexOf(cp)+1:0;
  if(cp!==pkLast){pkLast=cp;bar.querySelectorAll('.k').forEach((e,i)=>e.classList.toggle('on',i<n))}
  b.querySelector('.f').style.width=pct+'%';b.querySelector('.t').textContent='CHECKPOINT '+n+'/'+PKCP.length+'  ·  '+Math.round(pct)+'%'+(pkZone?'  ·  '+(pkZone.t=='wind'?'ANGIN':'GRAVITASI RENDAH'):'')}
function movStep(now){const t=now/1000;for(const m of MOV){const c=m.c;let nx=m.bx,ny=m.by,nz=m.bz;const sn=Math.sin(t*m.sp+m.ph);if(m.t==6)nx+=sn*m.amp;else if(m.t==7)nz+=sn*m.amp;else if(m.t==8)ny+=sn*m.amp;else{nx+=Math.cos(t*m.sp+m.ph)*m.amp;nz+=sn*m.amp}
  const dx=nx-c.x,dy=ny-c.y,dz=nz-c.z;if(!pl.sitting&&!pl.balloon&&Math.abs(pl.x-c.x)<c.w/2+.1&&Math.abs(pl.z-c.z)<c.d/2+.1&&Math.abs(pl.y-(c.y+c.h))<.2&&pl.vy<=.01){pl.x+=dx;pl.z+=dz;pl.y+=dy}
  c.x=nx;c.y=ny;c.z=nz;m.g.position.set(nx,ny,nz)}}
const BX={lob:{x:0,z:0,r:36},gate:{x:0,z:21},ring:{x:0,z:130,h:22,fy:1.4},exit:{x:-16,z:114},
  REACH:3.5,ARC:.15,CD:.34,HP:10,HEAL:2,GRACE:2.5,KO:1.8,FIGHT:4};
const bx={king:null,kingName:'',kingKills:0,cd:0,combo:0,lastP:0,portalCd:0,fightAt:-1e9,shake:0,bags:[],boards:[],rank:[],sig:'',synced:false,
  pops:[],seenDc:{},hpBump:0,kt:0,h:{hp:-1,kl:-1,zone:-1,king:-1,bump:0}};
function gOff(x,z){return curMap=='boxing'&&Math.abs(x-BX.ring.x)<BX.ring.h&&Math.abs(z-BX.ring.z)<BX.ring.h?BX.ring.fy:0}

const AU={c:null,g:null};
function au(){try{if(!AU.c){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AU.c=new C();AU.g=AU.c.createGain();AU.g.gain.value=.55;AU.g.connect(AU.c.destination)}if(AU.c.state=='suspended')AU.c.resume()}catch(e){return null}return AU.c}
function tn(f0,f1,d,type,v,dl){const c=au();if(!c)return;const t=c.currentTime+(dl||0),o=c.createOscillator(),g=c.createGain();o.type=type||'square';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AU.g);o.start(t);o.stop(t+d+.03)}
function nz(d,v,f,dl){const c=au();if(!c)return;const n=Math.floor(c.sampleRate*d),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain(),t=c.currentTime+(dl||0);s.buffer=b;fl.type='bandpass';fl.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(AU.g);s.start(t)}
const SFX={swing:(v=1)=>nz(.09,.1*v,2600),hit:(h,v=1)=>{tn(h?150:220,45,.16,'square',.28*v);nz(.09,.22*v,h?700:1100)},ko:(v=1)=>{tn(420,50,.55,'sawtooth',.22*v);nz(.4,.25*v,500);tn(90,40,.5,'square',.25*v,.05)},
  king:()=>[523,659,784,1047,1319].forEach((f,i)=>tn(f,f,.2,'square',.13,i*.09)),portal:()=>{tn(180,1100,.4,'sine',.2);nz(.35,.1,1800)},heal:()=>{tn(660,1320,.14,'triangle',.2);tn(990,1650,.14,'triangle',.15,.08)},bag:(v=1)=>{tn(120,60,.12,'sine',.22*v);nz(.05,.12,400)}};
const sfxNear=(x,z)=>{const d=Math.hypot(x-pl.x,z-pl.z);return d>40?0:1-d/50};

const GLV_ART=['................','....kkkkkk......','...krrrrrrk.....','..krrhhrrrrk....','..krhhrrrrrkk...','..krrrrrrrrrrk..','..krrrrrrrrrrk..','..kRrrrrrrrrRk..','..kRRrrrrrrRRk..','...kRRRRRRRRk...','...kkkkkkkkkk...','...kwwwwwwwwk...','...kwwwwwwggk...','...kwwwwwwggk...','...kkkkkkkkkk...','................'];
const GLV_COL={k:'#17306b',r:'#ff4d5e',h:'#ffb0b8',R:'#b32b3c',w:'#ffffff',g:'#bcd0ea'};
const CRN_ART=['y...y...y','yy.yyy.yy','yyyyyyyyy','yyyyyyyyy','ggggggggg'],CRN_COL={y:'#ffd23f',g:'#c48a00'};
function pixArt(x,art,col,ox,oy,s){art.forEach((row,j)=>[...row].forEach((ch,i)=>{const c=col[ch];if(c){x.fillStyle=c;x.fillRect(ox+i*s,oy+j*s,s,s)}}))}
const drawGlove=(x,ox,oy,s)=>pixArt(x,GLV_ART,GLV_COL,ox,oy,s),drawCrown=(x,ox,oy,s)=>pixArt(x,CRN_ART,CRN_COL,ox,oy,s);

function signTex(txt,col,bg,ico){return tex(256,64,(x,w,h)=>{x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=col;x.fillRect(0,0,w,4);x.fillRect(0,h-4,w,4);x.font='bold 34px monospace';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#0b0724';x.fillText(txt,w/2+3,h/2+4);x.fillStyle=col;x.fillText(txt,w/2,h/2);if(ico){drawGlove(x,8,16,2);drawGlove(x,w-40,16,2)}})}
function swirlTex(c1,c2){return tex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);const g=x.createRadialGradient(64,64,3,64,64,62);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.4,c1);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h);x.lineWidth=7;for(let k=0;k<4;k++){x.strokeStyle=k%2?c2:'#ffffff';x.globalAlpha=.55;x.beginPath();for(let a=0;a<4.6;a+=.12){const r=6+a*11,t=a+k*1.5708,px=64+Math.cos(t)*r,py=64+Math.sin(t)*r;a?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}x.globalAlpha=1})}

function mkBoard(w,h,kind){const c=document.createElement('canvas');c.width=w;c.height=h;const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;const b={c,x:c.getContext('2d'),t,w,h,kind};bx.boards.push(b);drawBoard(b);return b}
function drawBoard(b){const x=b.x,w=b.w,h=b.h,cut=n=>n.length>11?n.slice(0,10)+'.':n;
  x.fillStyle='#0f0a2a';x.fillRect(0,0,w,h);x.fillStyle='#ff3a5a';x.fillRect(0,0,w,5);x.fillRect(0,h-5,w,5);x.fillStyle='#ffd23f';x.fillRect(0,5,w,3);x.fillRect(0,h-8,w,3);
  const T=(s,px,y,col,fs,al)=>{x.font='bold '+fs+'px monospace';x.textAlign=al||'center';x.textBaseline='middle';x.lineWidth=4;x.strokeStyle='#05030f';x.strokeText(s,px,y);x.fillStyle=col;x.fillText(s,px,y)};
  if(b.kind=='king'){drawCrown(x,w/2-22,10,5);T('RAJA KILL',w/2,52,'#ffd23f',14);
    if(bx.king){T(cut(bx.kingName||'?'),w/2,82,'#ffffff',26);T(bx.kingKills+' KILL',w/2,110,'#ffd23f',15)}else{T('BELUM ADA',w/2,82,'#ffffff',24);T('RAIH KILL PERTAMA!',w/2,110,'#7fd0ff',13)}}
  else{drawCrown(x,22,14,5);drawCrown(x,w-22-45,14,5);T('PAPAN KILL',w/2,28,'#ffd23f',22);
    if(!bx.rank.length){T('BELUM ADA KILL',w/2,106,'#ffffff',18);T('MASUK PORTAL & BERTARUNG!',w/2,136,'#7fd0ff',12)}
    bx.rank.forEach((r,i)=>{const y=64+i*25,c=i?'#ffffff':'#ffd23f';T(String(i+1),22,y,i?'#7fd0ff':'#ffd23f',16,'center');T(cut(r.n),44,y,c,16,'left');T(String(r.kl),w-22,y,'#ffd23f',16,'right')})}
  b.t.needsUpdate=true}
function bxBoards(){for(const b of bx.boards)drawBoard(b)}

function portal(cx,cy,cz,o){
  const g=new THREE.Group();g.position.set(cx,cy,cz);g.rotation.y=o.rot||0;g.scale.setScalar(o.s||1);world.add(g);
  const bas=(c,p)=>new THREE.MeshBasicMaterial(Object.assign({color:c},p||{})),add=(c,p)=>bas(c,Object.assign({transparent:true,blending:THREE.AdditiveBlending,depthWrite:false},p||{}));
  const dk=LM(o.dk),c1=bas(o.c1),m=(geo,mat,x,y,z)=>Mt(geo,mat,x,y,z,g);
  m(BOX(9,.5,3.4),dk,0,.25,0);
  for(const sx of[-1,1]){m(BOX(1.2,7.6,1.5),dk,sx*3.3,4.3,0);m(BOX(.28,6.6,1.56),c1,sx*3.3,4.4,0);m(BOX(1.5,.5,1.8),LM(0x4a4a66),sx*3.3,.75,0)}
  m(BOX(8.4,1.3,1.5),dk,0,8.4,0);m(BOX(7.4,.26,1.58),c1,0,7.85,0);m(BOX(7.4,.26,1.58),c1,0,8.95,0);
  const st=signTex(o.label,o.css1,o.css2,o.ico),sm=bas(0xffffff,{map:st,side:THREE.DoubleSide});
  m(BOX(8.6,2.3,.4),LM(0x120c24),0,10.6,0);m(new THREE.PlaneGeometry(8.2,2),sm,0,10.6,.22);m(new THREE.PlaneGeometry(8.2,2),sm,0,10.6,-.22);
  const back=m(new THREE.CircleGeometry(1,32),bas(o.back,{transparent:true,opacity:.75,side:THREE.DoubleSide}),0,4.3,0);back.scale.set(2.75,3.5,1);
  const d1=m(new THREE.CircleGeometry(1,32),add(0xffffff,{map:swirlTex(o.css1,o.css2),side:THREE.DoubleSide,opacity:.95}),0,4.3,.04);d1.scale.set(2.75,3.5,1);
  const d2=m(new THREE.CircleGeometry(1,32),add(0xffffff,{map:swirlTex(o.css2,o.css1),side:THREE.DoubleSide,opacity:.8}),0,4.3,.08);d2.scale.set(2.1,2.7,1);
  const fr=m(new THREE.TorusGeometry(1,.1,4,32),c1,0,4.3,0);fr.scale.set(2.9,3.6,1);
  const cs=Math.cos(o.rot||0),sn=Math.sin(o.rot||0),S=o.s||1;
  ANIM.push((dt,t)=>{d1.rotation.z+=dt*1.1;d2.rotation.z-=dt*1.7;const k=1+Math.sin(t/260)*.035;fr.scale.set(2.9*k,3.6*k,1);
    if(Math.random()<dt*9){const u=(Math.random()-.5)*4*S;puff(cx+cs*u,cz-sn*u,1,o.css1,4,cy+.5+Math.random()*6*S)}});
  return{x:cx,z:cz}}

function bagStand(x,z){
  addMerged([{geo:BOX(.45,5,.45),x:x-1.6,y:2.5,z,color:0x3a3a52},{geo:BOX(.45,5,.45),x:x+1.6,y:2.5,z,color:0x3a3a52},{geo:BOX(3.8,.4,.5),x,y:5,z,color:0xff3a5a},{geo:BOX(.9,.3,.9),x:x-1.6,y:.15,z,color:0x222233},{geo:BOX(.9,.3,.9),x:x+1.6,y:.15,z,color:0x222233}]);
  const pv=new THREE.Group();pv.position.set(x,4.8,z);world.add(pv);
  Mt(new THREE.CylinderGeometry(.04,.04,.9,4),LM(0x999999),0,-.45,0,pv);Mt(new THREE.CylinderGeometry(.62,.62,2.6,10),LM(0xd8344a,{shininess:30}),0,-2.3,0,pv);
  Mt(new THREE.CylinderGeometry(.66,.66,.3,10),LM(0x1f1f2e),0,-1.2,0,pv);Mt(new THREE.CylinderGeometry(.66,.66,.3,10),LM(0x1f1f2e),0,-3.4,0,pv);
  addCol(x-1.6,0,z,.6,5,.6);addCol(x+1.6,0,z,.6,5,.6);bx.bags.push({pv,x,z,ax:0,az:0,vx:0,vz:0})}

function trophy(x,z){
  addMerged([{geo:BOX(3.4,.8,3.4),x,y:.4,z,color:0x3a2c6a},{geo:BOX(2.6,.8,2.6),x,y:1.2,z,color:0x4a3a82},{geo:BOX(3.6,.2,3.6),x,y:.9,z,color:0xffd23f}]);
  const g=new THREE.Group();g.position.set(x,3.4,z);world.add(g);const gold=LM(0xffc83a,{shininess:80,emissive:0x5a3a00});
  Mt(new THREE.SphereGeometry(1.15,10,8),gold,0,.2,.2,g).scale.set(1,.95,1.15);Mt(new THREE.CylinderGeometry(.62,.7,.9,10),gold,0,-1,-.2,g);Mt(new THREE.SphereGeometry(.45,8,6),gold,.85,-.1,.5,g);
  ANIM.push((dt,t)=>{g.rotation.y+=dt*.9;g.position.y=3.4+Math.sin(t/500)*.15;if(Math.random()<dt*3)puff(x+(Math.random()-.5)*2,z+(Math.random()-.5)*2,1,'#ffd23f',2,3+Math.random()*2)});
  addCol(x,0,z,3.6,1.8,3.6)}

function lobbyBoard(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.atan2(-x,-z);world.add(g);
  Mt(BOX(.5,7,.5),LM(0x2a2240),-4.7,3.5,0,g);Mt(BOX(.5,7,.5),LM(0x2a2240),4.7,3.5,0,g);Mt(BOX(10.6,6.6,.5),LM(0x120c24),0,6.4,-.05,g);
  Mt(new THREE.PlaneGeometry(10,6),new THREE.MeshBasicMaterial({map:mkBoard(320,192,'lb').t}),0,6.4,.22,g);Mt(BOX(10.9,.3,.6),new THREE.MeshBasicMaterial({color:0xffd23f}),0,9.8,0,g)}

function buildBoxing(){
  const fl=FXL(),A=BX.ring,G=BX.gate,L=BX.lob;
  bx.bags.length=0;bx.boards.length=0;
  removeSky();makeSky(0x0a0620,0x5b2470);if(sunMesh){sunMesh.material.color.set(0xdde6ff);sunMesh.scale.setScalar(.65)}
  sc.children[0].color.set(0xc6baff);
  const bas=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{})),add=(c,o)=>bas(c,Object.assign({transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide},o||{}));
  const flat=(r,mat,y,x,z)=>Mt(new THREE.CircleGeometry(r,48).rotateX(-1.5708),mat,x||0,y,z||0);
  const band=(r0,r1,c,y,x,z)=>Mt(new THREE.RingGeometry(r0,r1,64).rotateX(-1.5708),bas(c,{side:THREE.DoubleSide}),x||0,y,z||0);
  {const n=fl>=1?320:160,pos=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*6.283,e=.06+Math.random()*1.3,r=430;pos[i*3]=Math.cos(a)*Math.cos(e)*r;pos[i*3+1]=Math.sin(e)*r;pos[i*3+2]=Math.sin(a)*Math.cos(e)*r}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,transparent:true,opacity:.9,depthWrite:false,fog:false});
    const pts=new THREE.Points(g,m);pts.renderOrder=1;pts.frustumCulled=false;if(skyDome)skyDome.add(pts);ANIM.push((dt,t)=>{m.opacity=.7+Math.sin(t/420)*.2})}
  flat(195,LM(0xffffff,{map:tex(TXS(),TXS(),(x,w,h)=>noise(x,w,h,'#1b1233',w*h/6,.22),40,40)}),-.02);

  flat(L.r,LM(0xffffff,{map:tex(128,128,(x,w,h)=>{x.fillStyle='#231849';x.fillRect(0,0,w,h);x.fillStyle='#2b1f5a';x.fillRect(0,0,64,64);x.fillRect(64,64,64,64);x.strokeStyle='rgba(143,92,255,.55)';x.lineWidth=2;x.strokeRect(1,1,w-2,h-2);for(let i=0;i<30;i++){x.fillStyle='rgba(255,255,255,.05)';x.fillRect(Math.random()*w|0,Math.random()*h|0,3,3)}},9,9)}),.02);
  band(11,11.6,0xff3a5a,.05);band(29.6,30.2,0x3a8dff,.05);band(34.6,35.6,0xffd23f,.05);
  Mt(new THREE.PlaneGeometry(9,9).rotateX(-1.5708),bas(0xffffff,{map:tex(32,32,x=>{x.clearRect(0,0,32,32);x.fillStyle='#17306b';for(let j=0;j<32;j++)for(let i=0;i<32;i++)if((i-15.5)**2+(j-15.5)**2<15.5**2)x.fillRect(i,j,1,1);drawGlove(x,8,8,1)}),transparent:true}),0,.06,3);
  portal(G.x,0,G.z,{label:'BOXING',css1:'#ff3a5a',css2:'#3a0a22',c1:0xff3a5a,dk:0x2a2240,back:0x2a0716,ico:true});
  addCol(G.x-3.3,0,G.z,1.2,8,1.5);addCol(G.x+3.3,0,G.z,1.2,8,1.5);
  {const P=[],N=40,R=L.r+1;for(let i=0;i<N;i++){const a=i/N*6.2832,x=Math.cos(a)*R,z=Math.sin(a)*R;P.push({geo:BOX(.5,2.2,.5),x,y:1.1,z,color:i%2?0xff3a5a:0xffffff},{geo:BOX(.8,.3,.8),x,y:2.3,z,color:0xffd23f})}addMerged(P);
    Mt(new THREE.TorusGeometry(R,.12,4,80).rotateX(1.5708),bas(0xff3a5a),0,1,0);Mt(new THREE.TorusGeometry(R,.12,4,80).rotateX(1.5708),bas(0xffffff),0,1.7,0)}
  for(let i=0;i<6;i++){const a=(i/6+.083)*6.2832;lamp(Math.cos(a)*29,Math.sin(a)*29)}
  bench(24,-4,Math.PI/2);bench(-24,-4,-Math.PI/2);bench(0,-28,0);
  bagStand(-17,5);bagStand(-12,10);trophy(-12,-8);lobbyBoard(19,9);
  ANIM.push(dt=>{for(const b of bx.bags){b.vx+=(-b.ax*26-b.vx*1.4)*dt;b.ax+=b.vx*dt;b.vz+=(-b.az*26-b.vz*1.4)*dt;b.az+=b.vz*dt;b.pv.rotation.x=b.ax;b.pv.rotation.z=b.az}});

  const ax=A.x,az=A.z;
  flat(66,LM(0xffffff,{map:tex(64,64,(x,w,h)=>{noise(x,w,h,'#150f2c',w*h/5,.2);x.strokeStyle='rgba(120,70,255,.25)';x.strokeRect(0,0,w,h)},20,20)}),.02,ax,az);
  band(47,47.8,0xff3a5a,.05,ax,az);band(57.6,58.2,0x3a8dff,.05,ax,az);
  {const P=[],tiers=[[49,3.2,0x2c1d5e],[55.6,6.4,0x37246f],[62.2,9.6,0x432b82]],N=36,list=[],sp=fl>=2?1.5:fl==1?2.2:3.5;
    tiers.forEach(([r,h,c],ti)=>{for(let i=0;i<N;i++){const a=i/N*6.2832,w=6.2832*r/N+.35,ry=Math.PI/2-a;
        P.push({geo:BOX(w,h,6.4),x:ax+Math.cos(a)*r,y:h/2,z:az+Math.sin(a)*r,color:c+(i%2)*0x0a0a0a,ry},{geo:BOX(w,.3,.3),x:ax+Math.cos(a)*(r-3.2),y:h+.15,z:az+Math.sin(a)*(r-3.2),color:ti%2?0x3a8dff:0xff3a5a,ry})}
      const n=Math.floor(6.2832*(r-1)/sp);for(let i=0;i<n;i++){const a=i/n*6.2832,rr=r-2.4+Math.random()*4.2;list.push({x:ax+Math.cos(a)*rr,y:h+.5,z:az+Math.sin(a)*rr})}});
    addMerged(P);CROWD=crowd(list)}
  const mt=tex(256,256,(x,w,h)=>{x.fillStyle='#ffffff';x.fillRect(0,0,w,h);x.fillStyle='#24418f';x.fillRect(12,12,w-24,h-24);for(let i=0;i<260;i++){x.fillStyle='rgba(255,255,255,.07)';x.fillRect(Math.random()*w|0,Math.random()*h|0,3,3)}
    x.fillStyle='#d8344a';x.beginPath();x.moveTo(12,12);x.lineTo(64,12);x.lineTo(12,64);x.fill();x.beginPath();x.moveTo(w-12,h-12);x.lineTo(w-64,h-12);x.lineTo(w-12,h-64);x.fill();
    x.fillStyle='#3a8dff';x.beginPath();x.moveTo(w-12,12);x.lineTo(w-64,12);x.lineTo(w-12,64);x.fill();x.beginPath();x.moveTo(12,h-12);x.lineTo(64,h-12);x.lineTo(12,h-64);x.fill();
    x.fillStyle='#d8344a';x.beginPath();x.arc(128,128,58,0,6.2832);x.fill();x.fillStyle='#24418f';x.beginPath();x.arc(128,128,50,0,6.2832);x.fill();drawGlove(x,96,96,4)},1,1);
  const sideM=LM(0x5a1020);Mt(BOX(49.5,1.2,49.5),sideM,ax,.6,az);
  Mt(BOX(46,.3,46),[sideM,sideM,LM(0xffffff,{map:mt,shininess:12}),sideM,sideM,sideM],ax,1.25,az);
  addCol(ax,0,az,46,A.fy,46);
  {const P=[],cc=[[-1,-1,0xd8344a],[1,-1,0x3a6dff],[-1,1,0x3a6dff],[1,1,0xd8344a]],RH=[2.7,3.7,4.7],RC=[0xff3a5a,0xffffff,0x3a8dff],H=A.h;
    for(const[sx,sz,c]of cc){const px=ax+sx*H,pz=az+sz*H;P.push({geo:new THREE.CylinderGeometry(.6,.6,5.4,8),x:px,y:A.fy+2.7,z:pz,color:c},{geo:ICO(.75,0),x:px,y:A.fy+5.5,z:pz,color:0xffd23f});for(const y of RH)P.push({geo:BOX(1.5,.9,1.5),x:px,y,z:pz,color:c+0x202020})}
    RH.forEach((y,i)=>{for(const s of[-1,1]){P.push({geo:BOX(H*2,.17,.17),x:ax,y,z:az+s*H,color:RC[i]},{geo:BOX(.17,.17,H*2),x:ax+s*H,y,z:az,color:RC[i]})}});addMerged(P)}
  portal(ax+BX.exit.x-ax,A.fy,BX.exit.z,{rot:Math.PI/4,s:.72,label:'KELUAR',css1:'#3fff9a',css2:'#0f6a3a',c1:0x3fff9a,dk:0x1a3a2a,back:0x063a22});
  {const g=new THREE.Group();g.position.set(ax,18,az);world.add(g);Mt(BOX(13,6.6,13),LM(0x15112a),0,0,0,g);Mt(BOX(13.4,.3,13.4),bas(0xff3a5a),0,-3.45,0,g);Mt(BOX(13.4,.3,13.4),bas(0xffd23f),0,3.45,0,g);
    const sm=new THREE.MeshBasicMaterial({map:mkBoard(256,128,'king').t}),pg=new THREE.PlaneGeometry(12,5.8);
    [[0,6.52,0],[Math.PI,-6.52,0],[Math.PI/2,0,6.52],[-Math.PI/2,0,-6.52]].forEach(([ry,a,b])=>{const fb=ry==0||ry==Math.PI,p=Mt(pg,sm,fb?0:ry>0?6.52:-6.52,0,fb?a:0,g);p.rotation.y=ry});
    for(const sx of[-1,1])for(const sz of[-1,1])Mt(new THREE.CylinderGeometry(.12,.12,9,5),LM(0x888899),sx*5.5,7.8,sz*5.5,g);
    ANIM.push(dt=>{g.rotation.y+=dt*.18})}
  Mt(new THREE.TorusGeometry(32,.45,5,48).rotateX(1.5708),LM(0x2a2a3a),ax,27,az);
  {const cl=[0xff3a5a,0x3a8dff,0xffd23f,0xb05dff,0x3fff9a,0xff8a3a,0x3a8dff,0xff3a5a],beams=[];
    for(let i=0;i<8;i++){const a=i/8*6.2832+.39,pv=new THREE.Group();pv.position.set(ax+Math.cos(a)*32,26.5,az+Math.sin(a)*32);world.add(pv);Mt(BOX(1.8,1.6,2.4),LM(0x222233),0,0,0,pv);
      const len=30;Mt(new THREE.ConeGeometry(5.2,len,14,1,true).translate(0,-len/2,0).rotateX(-Math.PI/2),add(cl[i],{opacity:.085}),0,0,0,pv);
      beams.push({pv,spot:Mt(new THREE.CircleGeometry(3.4,20).rotateX(-1.5708),add(cl[i],{opacity:.35}),ax,1.46,az),ph:i*1.1})}
    ANIM.push((dt,t)=>{const s=t/1000;for(const b of beams){const tx=ax+Math.cos(s*.45+b.ph)*13,tz=az+Math.sin(s*.6+b.ph*1.7)*13;b.pv.lookAt(tx,1.4,tz);b.spot.position.set(tx,1.46,tz)}})}
}

function mkGloves(p){
  const geo=mergeParts([{geo:new THREE.SphereGeometry(.4,8,6),z:.38,sx:1,sy:.92,sz:1.15,color:p.c1||'#ff5d5d'},{geo:new THREE.CylinderGeometry(.26,.3,.36,8),z:-.02,rx:Math.PI/2,color:'#ffffff'}]);
  const mat=new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:30}),L=new THREE.Mesh(geo,mat),R=new THREE.Mesh(geo,mat),g=new THREE.Group();g.add(L,R);p.m.add(g);
  return{g,m:[L,R],t:0,side:0,k:0}}
function gloveHit(p,k){if(!p.glv)p.glv=mkGloves(p);p.glv.t=1;p.glv.side^=1;p.glv.k=k}
function gloveStep(p,dt,now){
  if(!p.glv)p.glv=mkGloves(p);const G=p.glv,tt=now/1000;G.g.visible=true;G.t=Math.max(0,G.t-dt*3.2);
  for(let i=0;i<2;i++){const side=i?1:-1,act=G.side===i?G.t:0,ext=act>0?Math.sin((1-act)*Math.PI):0,hv=G.k===2;
    G.m[i].position.set(side*(.95-ext*.3),.62+Math.sin(tt*5+i*2)*.04-ext*.05,.35+ext*(hv?1.9:1.45));G.m[i].rotation.y=-side*ext*.4;G.m[i].scale.setScalar(1+ext*(hv?.35:.15))}
  const lg=G.t>0?Math.sin((1-G.t)*Math.PI)*(G.k===2?.55:.3):0;p.m.position.x=Math.sin(p.r)*lg;p.m.position.z=Math.cos(p.r)*lg}

function bxReset(){
  bx.seenDc={};bx.king=null;bx.kingName='';bx.kingKills=0;bx.sig='';bx.rank=[];bx.synced=false;bx.cd=0;bx.combo=0;bx.portalCd=0;bx.fightAt=-1e9;bx.shake=0;bx.h={hp:-1,kl:-1,zone:-1,king:-1,bump:0};
  for(const p of[pl,...Object.values(P)]){if(!p)continue;if(p.kfx){p.root.remove(p.kfx.g);p.kfx=null}p.king=false;if(p.hpB){p.root.remove(p.hpB.s);p.hpB=null}if(p.glv){p.glv.g.visible=false;p.m.position.x=p.m.position.z=0}}
  for(const q of bx.pops)sc.remove(q.sp);bx.pops.length=0;
  if(pl){pl.inArena=false;pl.dead=0;pl.kl=0;pl.kbx=pl.kbz=0}
  ['bxko','bxking'].forEach(i=>{const e=$(i);e&&e.classList.add('hide')});const f=$('bxfeed');if(f)f.innerHTML=''}
function bxStart(){bxReset();pl.hp=BX.HP;pl.kl=0;pl.dc=0;pl.pc=0;pl.inArena=false;pl.dead=0;pl.kbx=pl.kbz=0;bxRenderLb();bxBoards();bxHud(true);toast('Lobi Boxing! Masuk portal merah untuk bertarung di ring');bxSyncRoom(lastRoom)}
function bxFlash(c,a){const e=$('flash');e.style.transition='none';e.style.background=c;e.style.opacity=a;requestAnimationFrame(()=>{e.style.transition='opacity .5s';e.style.opacity=0})}
function bxSpawnPoint(){const A=BX.ring,E=BX.exit;let best=null,bd=-1;for(let i=0;i<10;i++){const x=A.x+(Math.random()*2-1)*(A.h-5),z=A.z+(Math.random()*2-1)*(A.h-5);if(Math.hypot(x-E.x,z-E.z)<6)continue;let m=99;for(const id in P){const q=P[id];if(q.ab&&!q.ko)m=Math.min(m,Math.hypot(x-q.x,z-q.z))}if(m>bd){bd=m;best={x,z}}}return best||{x:A.x,z:A.z+3}}
const r2=v=>+v.toFixed(2);
function bxSend(o){me&&me.update(Object.assign({x:r2(pl.x),z:r2(pl.z),y:r2(pl.y),r:r2(pl.r)},o))}
function bxEnter(){
  bx.portalCd=1.5;bxFlash('#ff3a5a',.85);SFX.portal();for(let i=0;i<24;i++)puff(pl.x+(Math.random()-.5)*2,pl.z,1,i%2?'#ff3a5a':'#ffd23f',5,Math.random()*5);
  const s=bxSpawnPoint();pl.x=s.x;pl.z=s.z;pl.y=BX.ring.fy+.05;pl.vx=pl.vz=pl.vy=0;pl.kbx=pl.kbz=0;pl.r=Math.atan2(BX.ring.x-s.x,BX.ring.z-s.z);cy=pl.r+Math.PI;
  pl.inArena=true;pl.hp=BX.HP;pl.invuln=BX.GRACE;pl.dead=0;bx.fightAt=-1e9;bxSend({ab:1,hp:pl.hp,ko:0});
  puff(pl.x,pl.z,18,'#7fd0ff',4,pl.y+.5);toast('ARENA! Pukul lawan pakai klik / F / tombol HIT. Kill = +'+BX.HEAL+' HP')}
function bxExit(){
  if(performance.now()-bx.fightAt<BX.FIGHT*1000){bx.portalCd=1;toast('Tidak bisa keluar saat sedang bertarung!');return}
  bx.portalCd=1.5;bxFlash('#3fff9a',.8);SFX.portal();const G=BX.gate;pl.x=G.x;pl.z=G.z-6;pl.y=0;pl.vx=pl.vz=pl.vy=0;pl.kbx=pl.kbz=0;pl.r=Math.PI;cy=0;
  pl.inArena=false;pl.invuln=0;bxSend({ab:0});puff(pl.x,pl.z,18,'#3fff9a',4,.5);toast('Kembali ke lobi')}
function bxRespawn(){
  const s=bxSpawnPoint();pl.x=s.x;pl.z=s.z;pl.y=BX.ring.fy+.05;pl.vx=pl.vz=pl.vy=0;pl.hp=BX.HP;pl.dead=0;pl.invuln=BX.GRACE;pl.r=Math.atan2(BX.ring.x-s.x,BX.ring.z-s.z);cy=pl.r+Math.PI;
  $('bxko').classList.add('hide');bxFlash('#ffffff',.35);puff(pl.x,pl.z,16,'#7fd0ff',4,pl.y+.5);bxSend({ko:0,ab:1,hp:pl.hp});toast('Bangkit lagi! HP kembali '+BX.HP)}

function boxPunch(){
  const now=performance.now();if(!playing||!pl||pl.dead>0||now<bx.cd)return;
  bx.cd=now+BX.CD*1000;bx.combo=(now-bx.lastP<850)?(bx.combo+1)%3:0;bx.lastP=now;const pk=bx.combo;
  if(pl.inArena){let bd=4.2,tg=null;for(const id in P){const q=P[id];if(!q.ab||q.ko)continue;const d=Math.hypot(q.x-pl.x,q.z-pl.z);if(d<bd){bd=d;tg=q}}if(tg)pl.r=Math.atan2(tg.x-pl.x,tg.z-pl.z);bx.fightAt=now}
  const fx=Math.sin(pl.r),fz=Math.cos(pl.r);pl.pc=(pl.pc|0)+1;gloveHit(pl,pk);SFX.swing();pl.kbx+=fx*4;pl.kbz+=fz*4;
  for(const b of bx.bags){const dx=b.x-pl.x,dz=b.z-pl.z,d=Math.hypot(dx,dz);if(d<3.9&&(d<1.5||(dx*fx+dz*fz)/d>.3)){const k=pk==2?3:1.9;b.vx-=fz*k;b.vz+=fx*k;puff(b.x,b.z,6,'#ffffff',3,1.6);SFX.bag(pk==2?1.3:1);bxPop(b.x,3.6,b.z,pk==2?'WHAM':'POK','#ffe27a',.8)}}
  bxSend({pc:pl.pc,pk,ab:pl.inArena?1:0})}

function bxNet(p,d,id){
  const oPc=p.lPc,oDc=p.lDc|0,oHp=p.bhp,dc=d.dc|0;
  p.ab=d.ab|0;p.ko=d.ko|0;p.kl=d.kl|0;
  if(typeof d.hp=='number')p.bhp=d.hp;p.lPc=d.pc;p.lDc=dc;
  if(curMap=='boxing'&&playing){
    if(Math.hypot(d.x-p.x,d.z-p.z)>25){p.x=d.x;p.z=d.z;p.y=d.y||0}
    try{
      if(p.init&&typeof d.hp=='number'&&oHp!==undefined&&d.hp<oHp)bxSeenHit(p,oHp-d.hp);
      if(p.init&&d.pc!==oPc)bxRemotePunch(p,d,id);
      if(p.init&&dc>oDc){const key=id+':'+dc;if(!bx.seenDc[key]){bx.seenDc[key]=1;bxSeenDeath(p,d)}}
    }catch(e){console.warn('[boxing]',e)}}}
function bxRemotePunch(p,d,id){gloveHit(p,d.pk|0);const v=sfxNear(p.x,p.z);if(v>0)SFX.swing(v);bxIncoming(d,id)}
function bxIncoming(d,id){
  if(!pl.inArena||pl.dead>0||pl.invuln>0||!d.ab||d.ko)return;
  const dx=pl.x-d.x,dz=pl.z-d.z,dist=Math.hypot(dx,dz);if(dist>BX.REACH||Math.abs(pl.y-(d.y||0))>2.2)return;
  const fx=Math.sin(d.r),fz=Math.cos(d.r);if(dist>1.1&&(dx*fx+dz*fz)/dist<BX.ARC)return;
  bxHurt((d.pk|0)==2?2:1,id,fx,fz)}
function bxHurt(dmg,id,fx,fz){
  const heavy=dmg>=2,kb=heavy?26:14;pl.hp-=dmg;pl.invuln=.16;bx.fightAt=performance.now();pl.kbx+=fx*kb;pl.kbz+=fz*kb;if(heavy&&pl.y<=gOff(pl.x,pl.z)+.1)pl.vy=Math.max(pl.vy,5.5);pl.js=.6;
  bxImpact(pl.x,pl.y+1.1,pl.z,heavy);bxPop(pl.x,pl.y+3.1,pl.z,'-'+dmg,'#ff5d5d',1);hitFx();bx.shake=Math.max(bx.shake,heavy?1:.55);SFX.hit(heavy);
  if(pl.hp<=0)bxKO(id);else me&&me.update({hp:pl.hp})}
function bxKO(id){
  bx.fx=pl.x;bx.fz=pl.z;const k=P[id],kn=k&&k.nm?k.nm:'???';pl.dc=(pl.dc|0)+1;pl.dead=BX.KO;pl.hp=0;pl.kbx=pl.kbz=0;pl.vx=pl.vz=pl.vy=0;
  me&&me.update({hp:BX.HP,dc:pl.dc,kb:id||'',ko:1,ab:0});bxKOFx(pl.x,pl.y,pl.z);SFX.ko();bx.shake=1.4;bxFlash('#ff3a5a',.45);
  const e=$('bxko');e.querySelector('small').textContent='Dikalahkan oleh '+kn;e.classList.remove('hide');bxFeed(kn,cfg.name,false)}
function bxSeenHit(p,dmg){bxImpact(p.x,p.y+1.1,p.z,dmg>=2);bxPop(p.x,p.y+3.4,p.z,'-'+dmg,'#ff8a8a',.9);const v=sfxNear(p.x,p.z);if(v>0)SFX.hit(dmg>=2,v)}
function bxSeenDeath(p,d){
  const mine=d.kb==uid,kn=mine?cfg.name:(P[d.kb]?P[d.kb].nm:'???');bxKOFx(p.x,p.y,p.z);const v=sfxNear(p.x,p.z);if(v>0)SFX.ko(v);if(mine)bxAward();bxFeed(kn,p.nm||'?',mine)}
function bxAward(){
  pl.hp+=BX.HEAL;pl.kl=(pl.kl|0)+1;me&&me.update({hp:pl.hp,kl:pl.kl,klt:TS});SFX.heal();
  bxPop(pl.x,pl.y+3.5,pl.z,'KILL!','#ffd23f',1.25);bxPop(pl.x+.4,pl.y+2.7,pl.z,'+'+BX.HEAL+' HP','#7dff9a',1);
  for(let i=0;i<14;i++){const a=i/14*6.28;puff(pl.x+Math.cos(a)*.8,pl.z+Math.sin(a)*.8,1,'#7dff9a',3,pl.y+.5+(i%3)*.4)}ring(pl.x,pl.z,'#7dff9a',pl.y+.1,1);bx.hpBump=.35;bxFlash('#ffd23f',.22)}

const POW=['POW','BAM','WHAM','BOP','SMASH'];
function bxImpact(x,y,z,heavy){puff(x,z,heavy?16:9,'#ffffff',4,y);puff(x,z,heavy?8:4,'#ffd23f',5,y);ring(x,z,heavy?'#ff8a3a':'#ffffff',y,1);
  if(FXL()>=1&&Math.random()<.7)bxPop(x+(Math.random()-.5)*1.2,y+1.2,z,POW[(Math.random()*POW.length)|0],heavy?'#ff9a3a':'#ffe27a',heavy?1.15:.9);
  if(Math.hypot(x-pl.x,z-pl.z)<14)bx.shake=Math.max(bx.shake,heavy?.5:.25)}
function bxKOFx(x,y,z){for(let i=0;i<30;i++){const a=i/30*6.28;puff(x+Math.cos(a)*.6,z+Math.sin(a)*.6,1,['#ff3a5a','#ffd23f','#ffffff'][i%3],6,y+.8+(i%4)*.3)}ring(x,z,'#ff3a5a',y+.2,1);ring(x,z,'#ffd23f',y+1,1);bxPop(x,y+2.4,z,'K.O.','#ff3a5a',1.7)}
function bxPop(x,y,z,t,c,s){if(bx.pops.length>24)return;s=s||1;const sp=spr(160,40,q=>{q.font='bold 24px monospace';q.textAlign='center';q.textBaseline='middle';q.lineWidth=6;q.strokeStyle='#0b1a44';q.strokeText(t,80,21);q.fillStyle=c;q.fillText(t,80,21)},4.4*s,1.1*s);sp.position.set(x,y,z);sp.renderOrder=12;sc.add(sp);bx.pops.push({sp,l:1,y,s})}
function bxFeed(a,v,mine){const f=$('bxfeed'),e=document.createElement('div'),A=document.createElement('span'),V=document.createElement('span'),m=document.createElement('span');e.className='fd'+(mine?' me':'');A.className='a';A.textContent=a;V.className='v';V.textContent=v;m.textContent=' mengalahkan ';e.append(A,m,V);f.append(e);while(f.children.length>4)f.firstChild.remove();setTimeout(()=>e.remove(),5000)}

function bxSyncRoom(v){
  if(curMap!='boxing'||!playing)return;
  const L=[];for(const id in v){const d=v[id];if(d&&(d.kl|0)>0)L.push({id,n:d.n||'?',kl:d.kl|0,klt:d.klt||0})}
  L.sort((a,b)=>b.kl-a.kl||a.klt-b.klt||(a.id<b.id?-1:1));
  const sig=L.slice(0,5).map(e=>e.id+':'+e.kl+':'+e.n).join('|');
  if(sig!==bx.sig){bx.sig=sig;bx.rank=L.slice(0,5);bxRenderLb();}
  bxSetKing(L.length?L[0].id:null,L.length?L[0].kl:0,L.length?L[0].n:'');
}
function bxSetKing(id,kills,name){
  const holder=id?(id==uid?pl:P[id]):null,changed=bx.king!==id,silent=!bx.synced;bx.synced=true;
  if(changed){const old=bx.king?(bx.king==uid?pl:P[bx.king]):null;if(old&&old.kfx){old.root.remove(old.kfx.g);old.kfx=null;old.king=false}bx.king=id}
  if(holder&&!holder.kfx){holder.kfx=mkKing();holder.root.add(holder.kfx.g);holder.king=true;holder.kfx.kills=-1;if(changed&&!silent)bxAnnounce(name||'?',holder)}
  if(holder&&holder.kfx.kills!==kills){holder.kfx.kills=kills;drawKingTag(holder.kfx,performance.now())}
  if(changed||bx.kingName!==name||bx.kingKills!==kills){bx.kingName=name;bx.kingKills=kills;bxBoards()}
}
function bxAnnounce(name,h){
  const e=$('bxking');e.querySelector('b').textContent=name;e.classList.remove('hide');e.style.animation='none';void e.offsetWidth;e.style.animation='';clearTimeout(bx.kt);bx.kt=setTimeout(()=>e.classList.add('hide'),3700);
  SFX.king();for(let i=0;i<46;i++){const a=Math.random()*6.28,r=Math.random()*3;puff(h.x+Math.cos(a)*r,h.z+Math.sin(a)*r,1,['#ffd23f','#ffffff','#ff5db1','#7fd0ff'][i%4],8,h.y+1+Math.random()*4)}
  ring(h.x,h.z,'#ffd23f',h.y+.2,1);ring(h.x,h.z,'#ffffff',h.y+1.2,1);bxFlash('#ffd23f',.18)}
function mkKing(){
  const g=new THREE.Group(),bas=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{})),add=(c,o)=>bas(c,Object.assign({transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide},o||{}));
  const c=document.createElement('canvas');c.width=176;c.height=52;const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;
  const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));tag.scale.set(5.6,1.65,1);tag.position.y=3.6;tag.renderOrder=10;g.add(tag);
  const crown=new THREE.Group();crown.position.y=4.8;g.add(crown);const gold=new THREE.MeshPhongMaterial({color:0xffc83a,emissive:0x7a5200,flatShading:true,shininess:90});
  crown.add(new THREE.Mesh(new THREE.CylinderGeometry(.55,.62,.34,8),gold));
  for(let i=0;i<5;i++){const a=i/5*6.2832,m=new THREE.Mesh(new THREE.ConeGeometry(.15,.55,4),gold);m.position.set(Math.cos(a)*.5,.42,Math.sin(a)*.5);crown.add(m);const gm=new THREE.Mesh(new THREE.OctahedronGeometry(.12),bas([0xff3a5a,0x3a8dff,0x3fff9a,0xff3a5a,0x3a8dff][i]));gm.position.set(Math.cos(a)*.5,.78,Math.sin(a)*.5);crown.add(gm)}
  const sp=[];for(let i=0;i<8;i++){const m=new THREE.Mesh(BOX(.2,.2,.2),bas(i%2?0xffffff:0xffd23f));g.add(m);sp.push(m)}
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.5,1,16,10,1,true),add(0xffd23f,{opacity:.14}));beam.position.y=8;g.add(beam);
  const gr=new THREE.Mesh(new THREE.RingGeometry(1.3,1.7,28).rotateX(-1.5708),add(0xffd23f,{opacity:.75}));gr.position.y=.08;g.add(gr);
  const gr2=new THREE.Mesh(new THREE.RingGeometry(1.3,1.5,28).rotateX(-1.5708),add(0xffffff,{opacity:.5}));gr2.position.y=.1;g.add(gr2);
  return{g,tag,crown,sp,beam,gr,gr2,x:c.getContext('2d'),t,kills:0,pt:0,sh:0}}
function drawKingTag(k,now){
  const x=k.x,w=176,h=52;x.clearRect(0,0,w,h);x.fillStyle='#ffd23f';x.fillRect(0,4,w,h-8);x.fillRect(4,0,w-8,h);x.fillStyle='#2a1200';x.fillRect(4,6,w-8,h-12);x.fillRect(6,4,w-12,h-8);
  drawCrown(x,12,10,2);drawCrown(x,w-30,10,2);
  x.font='bold 22px monospace';x.textAlign='center';x.textBaseline='middle';const gr=x.createLinearGradient(0,10,0,32);gr.addColorStop(0,'#fff6b0');gr.addColorStop(1,'#ffb02a');x.lineWidth=4;x.strokeStyle='#5a2a00';x.strokeText('RAJA KILL',w/2,22);x.fillStyle=gr;x.fillText('RAJA KILL',w/2,22);
  x.font='bold 12px monospace';x.fillStyle='#ffe27a';x.fillText(k.kills+' KILL',w/2,41);
  const p=((now/900)%1.6)-.3;x.globalCompositeOperation='source-atop';const sg=x.createLinearGradient(w*(p-.15),0,w*(p+.05),h);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.55)');sg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=sg;x.fillRect(0,0,w,h);x.globalCompositeOperation='source-over';k.t.needsUpdate=true}
function kingStep(k,dt,now,p){
  const t=now/1000;k.crown.rotation.y+=dt*2.2;k.crown.position.y=4.8+Math.sin(t*3)*.12;
  k.sp.forEach((m,i)=>{const a=t*2.2+i*.785,r=1.7+Math.sin(t*2+i)*.2;m.position.set(Math.cos(a)*r,1.2+(i%4)*.7+Math.sin(t*3+i)*.25,Math.sin(a)*r);m.rotation.y=a;m.scale.setScalar(.6+.5*Math.abs(Math.sin(t*5+i*1.7)))});
  k.gr.scale.setScalar(1+Math.sin(t*4)*.12);const u=(t*1.2)%1;k.gr2.scale.setScalar(1+u*1.2);k.gr2.material.opacity=.5*(1-u);k.beam.material.opacity=.13+Math.sin(t*5)*.04;
  k.pt-=dt;if(k.pt<=0&&FXL()>=1){k.pt=.22;puff(p.x+(Math.random()-.5)*1.4,p.z+(Math.random()-.5)*1.4,1,Math.random()<.5?'#ffd23f':'#fff3a0',3,p.y+3+Math.random()*1.6)}
  k.sh-=dt;if(k.sh<=0){k.sh=.08;drawKingTag(k,now)}}

function mkHpBar(){const c=document.createElement('canvas');c.width=64;c.height=10;const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(2.5,.4,1);s.position.y=2.65;s.renderOrder=9;return{s,x:c.getContext('2d'),t,v:-1}}
function drawHp(b,hp){const x=b.x;x.fillStyle='#0b1a44';x.fillRect(0,0,64,10);x.fillStyle='#17306b';x.fillRect(1,1,62,8);const f=Math.max(0,Math.min(1,hp/BX.HP));
  if(hp>BX.HP){x.fillStyle='#ffd23f';x.fillRect(2,2,60,6);x.fillStyle='#ff8c1a';x.fillRect(2,5,Math.min(60,Math.round((hp-BX.HP)*3)),3)}else{x.fillStyle=f>.5?'#3fdc6a':f>.25?'#ffd23f':'#ff4d4d';x.fillRect(2,2,Math.round(60*f),6)}b.v=hp;b.t.needsUpdate=true}

function boxStep(dt,now){
  const A=BX.ring,G=BX.gate,E=BX.exit;
  if(bx.portalCd>0)bx.portalCd-=dt;if(bx.hpBump>0)bx.hpBump-=dt;
  if(pl.dead>0){pl.dead-=dt;if(pl.dead<=0)bxRespawn();else if(bx.fx!==undefined){pl.x=bx.fx;pl.z=bx.fz;pl.vx=pl.vz=0;pl.kbx=pl.kbz=0}}
  if(pl.kbx||pl.kbz){pl.x+=pl.kbx*dt;pl.z+=pl.kbz*dt;const f=Math.exp(-9*dt);pl.kbx*=f;pl.kbz*=f;if(Math.abs(pl.kbx)+Math.abs(pl.kbz)<.3)pl.kbx=pl.kbz=0}
  if(pl.inArena){const m=A.h-.8;pl.x=Math.max(A.x-m,Math.min(A.x+m,pl.x));pl.z=Math.max(A.z-m,Math.min(A.z+m,pl.z))}
  else{const dx=pl.x-BX.lob.x,dz=pl.z-BX.lob.z,r=Math.hypot(dx,dz),m=BX.lob.r-.8;if(r>m){pl.x=BX.lob.x+dx/r*m;pl.z=BX.lob.z+dz/r*m}}
  let tip='';
  if(!pl.inArena){const d=Math.hypot(pl.x-G.x,pl.z-G.z);if(d<2.7&&bx.portalCd<=0)bxEnter();else if(d<11)tip='Masuk portal BOXING untuk bertarung di ring'}
  else{const d=Math.hypot(pl.x-E.x,pl.z-E.z);if(d<2.4&&bx.portalCd<=0&&pl.dead<=0)bxExit();else if(d<9)tip='Portal KELUAR menuju lobi (tidak bisa saat bertarung)'}
  const pr=$('prompt');if(tip){pr.textContent=tip;pr.classList.remove('hide')}else pr.classList.add('hide');
  bxFxStep(dt,now);bxHud(false)}
function bxFxStep(dt,now){
  for(let i=bx.pops.length-1;i>=0;i--){const q=bx.pops[i];q.l-=dt*1.05;if(q.l<=0){sc.remove(q.sp);q.sp.material.map.dispose();q.sp.material.dispose();bx.pops.splice(i,1);continue}
    q.sp.position.y=q.y+(1-q.l)*2.4;q.sp.material.opacity=Math.min(1,q.l*2.6);const k=q.s*(1+Math.max(0,q.l-.82)*2.2);q.sp.scale.set(4.4*k,1.1*k,1)}
  for(const p of[pl,...Object.values(P)])if(p.kfx)kingStep(p.kfx,dt,now,p);
  for(const id in P){const p=P[id],on=!!p.ab&&!p.ko;if(on&&!p.hpB){p.hpB=mkHpBar();p.root.add(p.hpB.s)}if(p.hpB){p.hpB.s.visible=on;if(on&&p.hpB.v!==p.bhp)drawHp(p.hpB,p.bhp===undefined?BX.HP:p.bhp)}}}

const bxd={};
function bxHud(force){
  if(!bxd.fl){bxd.fl=document.querySelector('#bxhp .fl');bxd.ov=document.querySelector('#bxhp .ov');bxd.hp=$('bxhp');bxd.n=bxd.hp.querySelector('b');bxd.kl=$('bxkl');bxd.kn=bxd.kl.querySelector('b');bxd.zone=$('bxzone')}
  const hp=Math.max(0,pl.hp|0),kl=pl.kl|0,zn=pl.inArena?1:0,kg=bx.king===uid?1:0,h=bx.h;
  if(force||h.hp!==hp){h.hp=hp;bxd.fl.style.transform='scaleX('+Math.min(1,hp/BX.HP)+')';bxd.ov.style.transform='scaleX('+Math.min(1,Math.max(0,hp-BX.HP)/20)+')';bxd.hp.classList.toggle('gold',hp>BX.HP);bxd.n.textContent=hp}
  if(force||h.kl!==kl){h.kl=kl;bxd.kn.textContent=kl}
  if(force||h.zone!==zn){h.zone=zn;bxd.zone.textContent=zn?'ARENA':'LOBI';bxd.zone.classList.toggle('ar',!!zn)}
  if(force||h.king!==kg){h.king=kg;bxd.kl.classList.toggle('king',!!kg)}
  document.body.classList.toggle('lowhp',pl.inArena&&hp>0&&hp<=3);const bp=bx.hpBump>0?1:0;if(h.bump!==bp){h.bump=bp;bxd.hp.classList.toggle('bump',!!bp)}}
function bxRenderLb(){
  const ol=document.querySelector('#bxlb ol');if(!ol)return;ol.innerHTML='';
  if(!bx.rank.length){const e=document.createElement('div');e.className='em';e.textContent='Belum ada kill';ol.append(e);return}
  bx.rank.forEach((r,i)=>{const li=document.createElement('li'),a=document.createElement('span'),b=document.createElement('span'),c=document.createElement('span');li.className=(i==0?'k1 ':'')+(r.id==uid?'me':'');a.className='rk';a.textContent=i+1;b.className='nm';b.textContent=r.n;c.className='kc';c.textContent=r.kl;li.append(a,b,c);ol.append(li)});
  bxBoards()}

function drawBoxMap(x){
  const A=BX.ring,L=BX.lob,W=96,inA=pl.inArena,k=(W-14)/((inA?A.h:L.r)*2),cx=inA?A.x:L.x,cz=inA?A.z:L.z,fx=v=>W/2+(v-cx)*k,fz=v=>W/2+(v-cz)*k;
  x.fillStyle='#17102f';x.fillRect(0,0,W,W);
  if(inA){x.fillStyle='#24418f';x.fillRect(W/2-A.h*k,W/2-A.h*k,A.h*2*k,A.h*2*k);x.strokeStyle='#fff';x.lineWidth=2;x.strokeRect(W/2-A.h*k,W/2-A.h*k,A.h*2*k,A.h*2*k);x.fillStyle='#3fff9a';x.fillRect(fx(BX.exit.x)-3,fz(BX.exit.z)-3,6,6)}
  else{x.fillStyle='#2b1f5a';x.beginPath();x.arc(W/2,W/2,L.r*k,0,6.2832);x.fill();x.strokeStyle='#ff3a5a';x.lineWidth=2;x.stroke();x.fillStyle='#ff3a5a';x.fillRect(fx(BX.gate.x)-3,fz(BX.gate.z)-3,7,5)}
  for(const id in P){const q=P[id];if(!!q.ab!==inA||q.ko)continue;x.fillStyle=bx.king===id?'#ffd23f':'#ff5d5d';const s=bx.king===id?5:4;x.fillRect(fx(q.x)-s/2,fz(q.z)-s/2,s,s)}
  x.fillStyle='#ffd23f';x.fillRect(fx(pl.x)-2.5,fz(pl.z)-2.5,5,5);x.strokeStyle='#0e1a3a';x.lineWidth=1;x.strokeRect(fx(pl.x)-3.5,fz(pl.z)-3.5,7,7)}

function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(!pl){R.render(sc,cam);return}
  if(playing){
    if(curMap=='builds'){
        updateBuildMode(now, dt);
        if(!buildPlay){pl.vx=pl.vz=pl.vy=0; pl.r=0}
    } else {
        if(curMap=='parkour'){movStep(now);lasStep(now,dt);spcStep(now,dt);pkHud();const lm=cfg.rd*1.65+30;for(const e of PKC){const v=Math.abs(e.z-pl.z)<lm;if(e.v!==v){e.v=v;for(const o of e.parts)o.visible=v}}}
        if(curMap=='parkour'){for(const p of plats){if(p.vanish){const t=((now/1000)+p.phase)%p.period;const on=t<p.period*.65;p.enabled=on;p.mesh.visible=on&&(t<p.period*.65-.6||((now/90)|0)%2==0)}}}
        if(curMap!='speedrace'){if(keys.ArrowLeft)cy+=dt*2;if(keys.ArrowRight)cy-=dt*2;
        if(keys.ArrowUp)pitch=Math.max(.05,pitch-dt*1.5);if(keys.ArrowDown)pitch=Math.min(1.35,pitch+dt*1.5)}
        const jumpInput=(jmp||keys.Space)&&!(pl.dead>0);const freshJump=jumpInput&&!pl._prevJump;pl._prevJump=jumpInput;jmp=false;
        if(pl.sitting!==null && swings[pl.sitting]){const s=swings[pl.sitting];const force=-iy*2.5-(keys.KeyW?1:0)*2.5+(keys.KeyS?1:0)*2.5;const atLimitF=(s.angle>0.8 && force>0);const atLimitB=(s.angle<-0.8 && force<0);if(!atLimitF && !atLimitB) s.vel += force*dt;s.vel -= Math.sin(s.angle)*6*dt;s.vel *= Math.pow(0.5,dt);s.vel = Math.max(-3.5, Math.min(3.5, s.vel));s.angle += s.vel*dt;if(s.angle>0.85){s.angle=0.85;if(s.vel>0)s.vel=0}if(s.angle<-0.85){s.angle=-0.85;if(s.vel<0)s.vel=0}s.pivot.rotation.x=s.angle;const cosA=Math.cos(s.angle),sinA=Math.sin(s.angle);const ly_=-6.1*cosA, lz_=-6.1*sinA;const cs=Math.cos(s.rot),sn=Math.sin(s.rot);const wx=s.x-lz_*sn;const wz=s.z+lz_*cs;const wy=7.8+ly_;pl.x=wx;pl.z=wz;pl.y=wy+0.9;pl.vx=pl.vz=pl.vy=0;pl.r=s.rot;if(freshJump){pl.sitting=null;pl.vy=6}$('prompt').classList.add('hide')}
        else if(pl.balloon && pl.balloon.rider===pl){const b=pl.balloon;const a=ix+(keys.KeyD?1:0)-(keys.KeyA?1:0);const bIn=iy+(keys.KeyW?1:0)-(keys.KeyS?1:0);const mx=Math.cos(cy)*a-Math.sin(cy)*bIn;const mz=-Math.sin(cy)*a-Math.cos(cy)*bIn;const sp=7;b.vx+=(mx*sp-b.vx)*Math.min(1,dt*1.5);b.vz+=(mz*sp-b.vz)*Math.min(1,dt*1.5);const up=mobileUp||keys.Space||keys.KeyQ;const down=mobileDown||keys.ShiftLeft||keys.KeyE;if(up)b.vy+=dt*8;if(down)b.vy-=dt*8;b.vy*=Math.pow(0.7,dt);if(!up&&!down&&b.y<6)b.vy+=dt*2;b.x+=b.vx*dt;b.z+=b.vz*dt;b.y+=b.vy*dt;b.y=Math.max(0,Math.min(80,b.y));const rr=Math.hypot(b.x,b.z);if(rr>LIM-10){b.x*=Math.max(0,LIM-10)/rr;b.z*=Math.max(0,LIM-10)/rr}b.g.position.set(b.x,b.y,b.z);if(Math.hypot(b.vx,b.vz)>0.3){const tr=Math.atan2(b.vx,b.vz);let dr=tr-b.g.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));b.g.rotation.y+=dr*Math.min(1,dt*3)}pl.x=b.x;pl.z=b.z;pl.y=b.y+12.6;pl.vx=pl.vz=pl.vy=0;pl.r=b.g.rotation.y;if(freshJump){b.rider=null;pl.balloon=null;pl.vy=4}$('prompt').classList.add('hide')}
        else if(curMap=='speedrace'){carStep(dt)}
        else{
          let nearest=-1,nd=4;for(let i=0;i<swings.length;i++){const s=swings[i];const d=Math.hypot(pl.x-s.x,pl.z-s.z);if(d<nd){nearest=i;nd=d}}pl.nearSwing=nearest;
          let nearestB=-1,ndB=5;for(let i=0;i<BALLOONS.length;i++){const b=BALLOONS[i];const d=Math.hypot(pl.x-b.x,pl.z-b.z);if(d<ndB && b.y<2){nearestB=i;ndB=d}}pl.nearBalloon=nearestB;
          if(nearest>=0){$('prompt').textContent='Tekan JUMP untuk duduk di ayunan';$('prompt').classList.remove('hide')}else if(nearestB>=0){$('prompt').textContent='Tekan JUMP untuk naik balon udara';$('prompt').classList.remove('hide')}else $('prompt').classList.add('hide');
          if(freshJump){if(pl.nearBalloon>=0){const b=BALLOONS[pl.nearBalloon];b.rider=pl;pl.balloon=b;pl.vx=pl.vz=pl.vy=0;toast('Balon udara! Joystick gerak · JUMP turun · RUN/Space naik')}else if(pl.nearSwing>=0 && pl.y<1.5){pl.sitting=pl.nearSwing;pl.vx=pl.vz=pl.vy=0;pl.r=swings[pl.nearSwing].rot}else{const GY=groundYSafe();if(pl.y<=GY+.01)pl.jc=0;if(pl.jc<2){pl.vy=pl.jc?9:8;pl.jc++}}}
          if(pl.boostTime>0){pl.boostTime-=dt;if(pl.boostTime<=0){pl.boostMul=1;pl.boostTime=0}if(Math.random()<dt*20){const a=Math.random()*6.28;puff(pl.x+Math.cos(a)*.8,pl.z+Math.sin(a)*.8,1,'#ff8c1a',1.8,pl.y+.5)}if(Math.random()<dt*15){const a=Math.random()*6.28;trail(pl.x+Math.cos(a)*.9,pl.z+Math.sin(a)*.9,'#ffd23f')}}if(pl.boostCooldown>0)pl.boostCooldown-=dt;
          let a=ix+(keys.KeyD?1:0)-(keys.KeyA?1:0),b=iy+(keys.KeyW?1:0)-(keys.KeyS?1:0);if(pl.dead>0)a=b=0;const l=Math.hypot(a,b);if(l>1)a/=l,b/=l;const mx=Math.cos(cy)*a-Math.sin(cy)*b,mz=-Math.sin(cy)*a-Math.cos(cy)*b;const sp=((run||keys.ShiftLeft)?9:5)*(pl.boostMul||1);const{GY,GSLIP,GBOUNCE}=groundY();const fric=GSLIP?2.5:24;pl.vx+=(mx*sp-pl.vx)*Math.min(1,dt*fric);pl.vz+=(mz*sp-pl.vz)*Math.min(1,dt*fric);pl.x+=pl.vx*dt;pl.z+=pl.vz*dt;resolveH();if(a||b){const t=Math.atan2(mx,mz);let d=t-pl.r;d=Math.atan2(Math.sin(d),Math.cos(d));pl.r+=d*Math.min(1,dt*12)}if(pl.y<=GY+.01)pl.jc=0;pl.vy-=22*dt;pl.y+=pl.vy*dt;if(pl.y<=GY){if(GBOUNCE&&pl.pvy<-1){pl.vy=16;pl.jc=0;puff(pl.x,pl.z,12,'#ff5db1',4);for(let k=0;k<10;k++){const ang=k/10*6.28;trail(pl.x+Math.cos(ang)*.9,pl.z+Math.sin(ang)*.9,'#ff5db1')}}else{pl.y=GY;if(pl.vy<0)pl.vy=0}}
          if(pl.spd>0.8 && !pl.air && pl.y<.3){
            pl.dustT=(pl.dustT||0)-dt;
            if(pl.dustT<=0){
              pl.dustT=0.045;
              puff(pl.x+(Math.random()-.5)*.5,pl.z+(Math.random()-.5)*.5,1,'#d4c8a8',1.2,.12);
              if(pl.boostTime>0){puff(pl.x,pl.z,1,'#ff8c1a',1,.1)}
            }
          }
          for(const j of JELLOGERS){
            j.sparkleT=(j.sparkleT||Math.random()*2)-dt;
            if(j.sparkleT<=0){
              j.sparkleT=2.5+Math.random()*3;
              const sx=j.x+(Math.random()-.5)*1.2;
              const sz=j.z+(Math.random()-.5)*1.2;
              puff(sx,sz,1,'#ffe27a',1.5,1.8);
              if(Math.random()<0.4)trail(sx,sz,'#7fd0ff');
            }
          }
        }
        if(curMap=='parkour'){for(const p of plats)if(p.w>=9&&!p.nocp&&p!==cp&&Math.abs(pl.x-p.x)<p.w/2&&Math.abs(pl.z-p.z)<p.d/2&&pl.y>=p.y+.9&&pl.y<p.y+3){if(cp){toast('Checkpoint');ring(p.x,p.z,'#7fd0ff',p.y+1.1,1);puff(p.x,p.z,18,'#7fd0ff',4,p.y+1.2)}cp=p;
          if(p===plats[plats.length-1]&&!pf){pf=true;cfg.jb+=100;sv();$('jbn').textContent=cfg.jb+' JB';me&&me.update({jb:cfg.jb});toast('Parkour selesai! +100 JB');for(let i=0;i<60;i++)puff(p.x+(Math.random()-.5)*8,p.z+(Math.random()-.5)*8,1,['#ff5d5d','#ffd23f','#3fbf5f','#3d8bff','#ff5db1'][i%5],7,p.y+1+Math.random()*3)}}
          if(pl.y<-30){const q=cp||{x:0,y:0,z:0};pl.x=q.x;pl.z=q.z;pl.y=q.y+3;pl.vx=pl.vz=pl.vy=0}}
        if(curMap=='parkour'){pl.x=Math.max(-90,Math.min(90,pl.x));pl.z=Math.max(-30,Math.min(PARKOUR[PARKOUR.length-1][2]+60,pl.z))}else if(curMap!='speedrace'&&curMap!='builds'){const rr=Math.hypot(pl.x,pl.z);if(rr>LIM){pl.x*=LIM/rr;pl.z*=LIM/rr}}
        let inAnyRing=false;for(const ring of rings){const dr=Math.hypot(pl.x-ring.x,pl.z-ring.z);if(dr<ring.r-0.5)inAnyRing=true}if(inAnyRing&&!pl.inRing){pl.hp=pl.maxHp;pl.invuln=1.5;toast('Masuk ring! HP kamu 10/10')}pl.inRing=inAnyRing;if(pl.koTimer>0)pl.koTimer-=dt;if(pl.invuln>0)pl.invuln-=dt;
        if(pl.inRing && pl.koTimer<=0 && pl.invuln<=0 && !pl.balloon){for(const id in P){const e=P[id];const dh=Math.hypot(pl.x-e.x,pl.z-e.z);if(dh<1.5 && e.y > pl.y + 1.3 && e.y < pl.y + 3.5){pl.hp-=10;pl.invuln=1.0;puff(pl.x,pl.z,18,'#ff5d5d',3,pl.y+1);for(let k=0;k<10;k++){const ang=k/10*6.28;trail(pl.x+Math.cos(ang)*1.1,pl.z+Math.sin(ang)*1.1,'#ff5d5d')}if(pl.hp<=0){pl.hp=pl.maxHp;pl.koTimer=3;pl.inRing=false;const ring=rings[0];if(ring){const a=Math.atan2(pl.x-ring.x,pl.z-ring.z);pl.x=ring.x+Math.sin(a)*(ring.r+4);pl.z=ring.z+Math.cos(a)*(ring.r+4);pl.y=1}toast('KO! Keluar dari ring, HP reset 10/10')}break;}}}
        const hpb=$('hpbar');if((pl.inRing||MON.on) && !pl.balloon){hpb.classList.remove('hide');hpb.querySelector('.fill').style.width=Math.max(0,(pl.hp/pl.maxHp)*100)+'%';hpb.querySelector('.txt').textContent='HP ('+pl.hp+'/'+pl.maxHp+')'}else hpb.classList.add('hide');
        for(const bb of boostBubbles){if(!bb.act){if(bb.respawn>0){bb.respawn-=dt;if(bb.respawn<=0){bb.act=true;bb.m.visible=true}}continue}bb.t+=dt;bb.m.position.y=bb.baseY+Math.sin(bb.t*2+bb.ph)*0.35;bb.m.rotation.y+=dt*1.8;bb.ring.rotation.z+=dt*2.5;bb.outer.material.opacity=0.25+Math.sin(bb.t*3+bb.ph)*0.15;if(Math.random()<dt*6){const a=Math.random()*6.28;puff(bb.x+Math.cos(a),bb.z+Math.sin(a),1,'#ffd23f',1.5,bb.m.position.y)}};
        for(let i=jbs.length-1;i>=0;i--){const j=jbs[i];const dx=pl.x-j.x,dz=pl.z-j.z,dy=pl.y+1-j.m.position.y;const d2=dx*dx+dz*dz+dy*dy;if(d2<9&&d2>2.4){const dd=Math.sqrt(d2)||.01;const pull=Math.min(1,dt*6/dd);j.x+=dx*pull;j.z+=dz*pull;j.y+=dy*pull*.6;j.m.position.x=j.x;j.m.position.z=j.z}j.m.position.y=j.y+Math.sin(now/500+j.ph)*.3;j.m.rotation.y=now/1000+j.ph;j.m.scale.setScalar(0.9+Math.sin(now/220+j.ph)*0.18);if(Math.random()<dt*4){puff(j.x,j.z,1,'#7fd0ff',1,1.5)};if(d2<2.4){const oldLvl=jbLvl();cfg.jb++;sv();$('jbn').textContent=cfg.jb+' JB';jbPop(j.x,j.y+.5,j.z);for(let k=0;k<12;k++){const ang=k/12*6.28;puff(j.x+Math.cos(ang)*.7,j.z+Math.sin(ang)*.7,1,'#7fd0ff',1.5,j.m.position.y)}sc.remove(j.m);jbs.splice(i,1);if(pl.boostTime>0&&curMap!='speedrace'){pl.boostTime=0;pl.boostMul=1;for(let k=0;k<18;k++){const ang=k/18*6.28;puff(pl.x+Math.cos(ang)*.8,pl.z+Math.sin(ang)*.8,1,k%2?'#ffffff':'#ffb84a',2,pl.y+.8)}trail(pl.x,pl.z,'#ffffff');trail(pl.x,pl.z,'#ffb84a')}pl.jbLvl=jbLvlOf(cfg.jb);me&&me.update({jb:cfg.jb});if(jbLvl()>oldLvl)toast('Chat bubble baru! ('+cfg.jb+' JB)')}}
        if(curMap=='boxing')boxStep(dt,now);
        if(curMap=='speedrace'&&BOTS.length)botsStep(dt,now);
        raceHud(dt);
        updateBoards(now);
        if(MON.on)monStep(dt,now);
        for(const a of ANIM)a(dt,now);
        for(const b of BEACONS){b.t+=dt;b.beam.rotation.y=b.t*.8}
        for(const w of WINDMILLS){w.t+=dt;w.g.rotation.z=w.t*1.2}
        for(const f of FLAGPOLES){f.t+=dt;f.g.rotation.y=Math.sin(f.t*2)*0.3}
        for(const ww of WATERWHEELS){ww.t+=dt;ww.g.rotation.z=ww.t*1.5}
        for(const bl of BELLS){bl.t+=dt;bl.g.rotation.z=Math.sin(bl.t*1.5)*0.12}
        for(const lp of LANTERNS){lp.t+=dt;lp.g.rotation.y=Math.sin(lp.t*.5)*0.05}
        for(const wf of WATERFALLS){wf.tex.offset.y-=dt*1.8;if(Math.random()<dt*8){puff(wf.x+(Math.random()-.5)*wf.poolR*1.5,wf.z+(Math.random()-.5)*wf.poolR*1.5,1,'#9ee0ff',1.5,.5)}}
        for(const fo of FOUNTAINS){for(const p of fo.parts){if(p.isFlame){p.t=(p.t+dt*3)%1;const s=1-p.t*.7;p.m.scale.set(s,s,s);p.m.material.opacity=.75-Math.abs(p.t-.5)*.8;continue}p.t=(p.t+dt*1.3)%1;const a=p.baseAng+p.t*2;const r=Math.abs(Math.sin(p.t*Math.PI));const xr=Math.cos(a)*r*1.5;const zr=Math.sin(a)*r*1.5;p.m.position.set(fo.x+xr,fo.topY+p.t*2-r*0.5,fo.z+zr);p.m.material.opacity=1-p.t*.7;p.m.scale.setScalar(1-p.t*.5)}}
        for(const b of BALLOONS){b.t+=dt;if(b.flame){b.flame.scale.set(1,.8+Math.sin(b.t*20)*.4,1);b.flame.material.opacity=.7+Math.sin(b.t*15)*.2}if(!b.rider){b.y=Math.max(0,b.y);b.g.position.y=b.y+Math.sin(b.t*1.5)*0.15}b.smokeT=(b.smokeT||0)-dt;if(b.smokeT<=0){b.smokeT=0.15;puff(b.x,b.z,1,'#cccccc',1.5,b.y+13)}}
        for(const a of ANIMALS){a.t+=dt;a.wanderCd-=dt;const dxT=a.targetX-a.x,dzT=a.targetZ-a.z;const distT=Math.hypot(dxT,dzT);if(distT<0.6 || a.wanderCd<=0){const ang=Math.random()*6.28;const d=Math.random()*a.r*0.7+a.r*0.3;a.targetX=a.spawnX+Math.cos(ang)*d;a.targetZ=a.spawnZ+Math.sin(ang)*d;a.wanderCd=2.5+Math.random()*3}if(distT>0.1){const nx=dxT/distT, nz=dzT/distT;const desiredVx=nx*a.spd, desiredVz=nz*a.spd;a.vx+=(desiredVx-a.vx)*Math.min(1,dt*2.5);a.vz+=(desiredVz-a.vz)*Math.min(1,dt*2.5)}else{a.vx*=Math.pow(0.2,dt);a.vz*=Math.pow(0.2,dt)}a.x+=a.vx*dt;a.z+=a.vz*dt;const speed=Math.hypot(a.vx,a.vz);if(speed>0.05){const targetRot=Math.atan2(a.vx,a.vz);let dr=targetRot-a.g.rotation.y;dr=Math.atan2(Math.sin(dr),Math.cos(dr));a.g.rotation.y+=dr*Math.min(1,dt*6)}const y=groundYSafeAt(a.x,a.z);a.g.position.set(a.x,y,a.z);for(let i=0;i<a.legs.length;i++){const leg=a.legs[i];const phase=(i%2)*Math.PI;const amp=Math.min(0.4,speed*0.8);leg.rotation.x=Math.sin(a.t*10+phase)*amp}const bob=Math.abs(Math.sin(a.t*10))*0.05*Math.min(1,speed*3);a.g.position.y+=bob}
        wanderJellogers(dt);
        for(const q of AMB.butterflies){if(!q.act)continue;q.t+=dt;const a=q.t*q.spd+q.ph;q.m.position.set(q.cx+Math.cos(a)*q.r,q.y+Math.sin(q.t*3)*.4,q.cz+Math.sin(a)*q.r);q.m.rotation.y=-a;q.m.rotation.z=Math.sin(q.t*8)*.4;q.spark=(q.spark||0)-dt;if(q.spark<=0&&Math.random()<0.15){q.spark=1.2;trail(q.m.position.x,q.m.position.z,'#ffe27a')}}
        for(const q of AMB.fireflies){if(!q.act)continue;q.t+=dt;const a=q.t*q.spd+q.ph;q.m.position.set(q.cx+Math.cos(a)*q.r,q.y+Math.sin(q.t*2)*.5,q.cz+Math.sin(a)*q.r);q.m.material.opacity=.5+Math.sin(q.t*3+q.ph)*.5}
        for(const q of AMB.birds){if(!q.act)continue;q.t+=dt;const a=q.t*q.spd+q.ph;q.m.position.set(Math.cos(a)*q.r,q.y0+Math.sin(q.t*2)*1.5,Math.sin(a)*q.r);q.m.rotation.y=-a+Math.PI/2}
        for(const q of AMB.clouds){if(!q.act)continue;q.t+=dt;q.m.position.x+=q.spd*dt;if(curMap=='speedrace'){const p=q.m.position;if(Math.abs(p.x-pl.x)>320||Math.abs(p.z-pl.z)>320){p.x=pl.x+(Math.random()-.5)*560;p.z=pl.z+(Math.random()-.5)*560}}else if(q.m.position.x>250)q.m.position.x=-250;q.m.scale.set(q.sx,q.sy,q.sz)}
        {const sn=SNOW,tt=now/1000,ph=tt%80;sn.bl=ph>56?Math.sin((ph-56)/24*Math.PI):0;sn.wx=Math.sin(tt*.13)*1.2+Math.sin(tt*.41)*.5+sn.bl*5;sn.wz=Math.cos(tt*.1)*.8+sn.bl*1.5;
          if(curMap=='snow'){if(sc.fog){const f=1-.45*sn.bl;sc.fog.near=cfg.rd*f;sc.fog.far=cfg.rd*1.6*f}if(sn.bl>.15&&!sn.on){sn.on=1;toast('Badai salju datang!')}else if(sn.bl<.02)sn.on=0}
          for(const q of AMB.snow){if(!q.act)continue;q.t+=dt;const p=q.m.position,dr=q.dr||1,fp=q.ph||0;p.x+=(q.vx+sn.wx*dr+Math.sin(q.t*1.3+fp)*.4)*dt;p.y+=q.vy*(1+sn.bl*.6)*dt;p.z+=(q.vz+sn.wz*dr+Math.cos(q.t*1.1+fp)*.4)*dt;q.m.rotation.x+=dt*2;q.m.rotation.y+=dt*1.5;
            if(p.y<0||Math.abs(p.x-pl.x)>110||Math.abs(p.z-pl.z)>110){p.set(pl.x+(Math.random()-.5)*200,p.y<0?26+Math.random()*8:Math.random()*30,pl.z+(Math.random()-.5)*200);q.vx=(Math.random()-.5)*.8;q.vz=(Math.random()-.5)*.8;q.vy=-1.2-Math.random()*2;q.dr=.5+Math.random()*.8;q.ph=Math.random()*6.28;q.m.scale.setScalar(.5+Math.random()*.9)}}}
        for(const q of AMB.leaves){if(!q.act)continue;q.t+=dt;q.m.position.x+=(q.vx+Math.sin(q.t*2+q.ph)*1.2)*dt;q.m.position.y+=(-1.5-Math.sin(q.t)*.5)*dt;q.m.position.z+=q.vz*dt;q.m.rotation.x+=dt*3;q.m.rotation.z+=dt*2;if(q.m.position.y<0)spawnAmb('leaves',{x:(Math.random()-.5)*200,y:12+Math.random()*8,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*2,vz:(Math.random()-.5)*2,ph:Math.random()*6.28})}
        for(const q of AMB.petals){if(!q.act)continue;q.t+=dt;q.m.position.x+=(q.vx+Math.sin(q.t*2.5+q.ph)*1.4)*dt;q.m.position.y+=(-1-Math.sin(q.t*.8)*.4)*dt;q.m.position.z+=q.vz*dt;q.m.rotation.x+=dt*2;q.m.rotation.z+=dt*2.5;if(q.m.position.y<0)spawnAmb('petals',{x:(Math.random()-.5)*200,y:12+Math.random()*6,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*1.5,vz:(Math.random()-.5)*1.5,ph:Math.random()*6.28})}
        for(const s of AMB.smokes){if(!s.act)continue;s.t+=dt;s.m.position.x+=s.vx*dt;s.m.position.y+=s.vy*dt;s.m.position.z+=s.vz*dt;const k=Math.max(0,1-s.t/3);s.m.material.opacity=k*.5;s.m.scale.setScalar(1+(1-k)*2);if(s.t>3){s.act=false;s.m.visible=false}}
        for(const q of AMB.stars){if(!q.act)continue;if(curMap=='parkour'&&Math.abs(q.m.position.z-pl.z)>260)q.m.position.z=pl.z+(Math.random()-.5)*400;q.m.material.opacity=.6+Math.sin(now/500+q.m.position.x)*.4}
        for(const q of AMB.orbs){if(!q.act)continue;q.t+=dt;if(curMap=='parkour'&&Math.abs(q.m.position.z-pl.z)>260)q.m.position.z=pl.z+(Math.random()-.5)*400;q.m.position.y+=Math.sin(q.t*1.5+q.ph)*dt*1.5;q.m.position.x+=Math.cos(q.t*.7+q.ph)*dt;q.m.position.z+=Math.sin(q.t*.7+q.ph)*dt}
        for(const q of AMB.bubbles){if(!q.act)continue;q.t+=dt;q.m.position.y+=q.vy*dt;q.m.material.opacity=Math.max(0,.6-q.t*.3);if(q.m.position.y>8||q.t>2){q.act=false;q.m.visible=false;const a=Math.random()*6.28,d=20+Math.random()*100;spawnAmb('bubbles',{x:Math.cos(a)*d,y:0.1,z:Math.sin(a)*d,vy:.6+Math.random()*.8})}}
        for(const q of AMB.dust){if(!q.act)continue;q.t+=dt;q.m.position.x+=q.vx*dt;q.m.position.y+=Math.sin(q.t*2+q.ph)*.3*dt;q.m.position.z+=q.vz*dt;q.m.material.opacity=.4+Math.sin(q.t*2)*.3;if(q.t>6){q.act=false;q.m.visible=false}}
        for(const q of AMB.wind){if(!q.act)continue;q.t+=dt;q.m.position.x+=q.vx*dt;q.m.position.z+=q.vz*dt;q.m.rotation.y=Math.atan2(q.vx,q.vz);q.m.material.opacity=.15+Math.sin(q.t*2+q.ph)*.2;if(Math.abs(q.m.position.x)>200||Math.abs(q.m.position.z)>200){q.act=false;q.m.visible=false;const a=Math.random()*6.28,d=15+Math.random()*150;spawnAmb('wind',{x:Math.cos(a)*d,y:1+Math.random()*15,z:Math.sin(a)*d,vx:(Math.random()-.5)*3,vz:(Math.random()-.5)*3,ph:Math.random()*6.28})}}
    }
  } else {
    pl.r=0;pl.vx=pl.vz=0;$('prompt').classList.add('hide');
    if($('act'))$('act').classList.remove('show');
  }

  const all=[pl,...Object.values(P),...JELLOGERS,...BOTS.map(b=>b.p)];
  for(const p of all){
    if(p!==pl)p.root.visible=playing&&!(p.ko&&curMap=='boxing');
    if(p!==pl){p.x+=(p.tx-p.x)*Math.min(1,dt*10);p.z+=(p.tz-p.z)*Math.min(1,dt*10);p.y+=((p.ty||0)-p.y)*Math.min(1,dt*14);let d=p.tr-p.r;d=Math.atan2(Math.sin(d),Math.cos(d));p.r+=d*Math.min(1,dt*10)}
    if(Math.hypot(p.x-p.lx,p.z-p.lz)>.015&&p.y<gOff(p.x,p.z)+.15&&!p.car&&(p.tt-=dt)<=0){trail(p.x,p.z,p.c1);p.tt=.06}
    p.spd=Math.hypot(p.x-p.lx,p.z-p.lz)/Math.max(dt,.001);
    p.lx=p.x;p.lz=p.z;jelly(p,dt);if(p.car)p.lean=0;
    if(FXL()>=2&&p.jbLvl>=2&&Math.random()<dt*6)puff(p.x+(Math.random()-.5)*1.6,p.z+(Math.random()-.5)*1.6,1,['#7fd0ff','#ffd23f','#ff5db1'][p.jbLvl%3],2.5,p.y+.2+Math.random()*1.4);
    p.root.position.set(p.x,p.y,p.z);p.m.rotation.y=p.r;animE(p,now);if(playing&&curMap=='boxing')gloveStep(p,dt,now);else if(p.glv){p.glv.g.visible=false;p.m.position.x=p.m.position.z=0}
    const rc=curMap=='speedrace'&&playing&&!JELLOGERS.includes(p);
    if(rc&&!p.car){p.car=mkCar(p.c1,p.carType||'starter');p.root.add(p.car.g)}else if(!rc&&p.car){p.root.remove(p.car.g);p.car=null}
    if(p.car){p.car.g.rotation.y=p.r;p.car.g.rotation.z=p===pl?-car.st*.07*Math.min(1,Math.abs(car.sp)/30):0;p.car.w.forEach(w=>w.rotation.x+=p.spd*dt*1.8);p.m.position.y+=(p.car.seatY||.55);p.m.scale.multiplyScalar(p.car.seatScale||.62);p.m.rotation.x=p.m.rotation.z=0}
  }
  pl.root.visible=!(curMap=='boxing'&&playing&&(pl.dead>0||(pl.inArena&&pl.invuln>.3&&((now/70)|0)%2)));
  RG.forEach(q=>{if(q.l>0){q.l-=dt;q.m.scale.setScalar(1+(.6-q.l)*14);q.m.material.opacity=Math.max(0,q.l/.6);if(q.l<=0)q.m.visible=false}});
  for(const q of AMB.streaks){if(!q.act)continue;q.t+=dt;q.m.rotation.y=q.r;q.m.material.opacity=Math.max(0,.55-q.t*1.6);if(q.t>.34){q.act=false;q.m.visible=false}}
  if(playing&&FXL()>=2){for(const sp of SPIN)sp.rotation.y+=dt*1.5;if(CROWD){CROWD.l.forEach((p,i)=>{_m4.makeTranslation(p.x,p.y+Math.abs(Math.sin(now/230+i*1.3))*.5,p.z);CROWD.im.setMatrixAt(i,_m4)});CROWD.im.instanceMatrix.needsUpdate=true}}
  PT.forEach(q=>{if(q.l>0){q.l-=dt;q.vy-=14*dt;q.m.position.x+=q.vx*dt;q.m.position.y+=q.vy*dt;q.m.position.z+=q.vz*dt;q.m.material.opacity=Math.min(1,q.l*3);q.m.scale.setScalar(Math.max(.2,q.l*1.5));if(q.l<=0)q.m.visible=false}});
  TR.forEach(t=>{if(t.l>0){t.l-=dt;t.m.material.opacity=Math.max(0,t.l/3.5)*.9;t.m.scale.setScalar(.5+.5*t.l/3.5);if(t.l<=0)t.m.visible=false}});
  for(let i=jbPops.length-1;i>=0;i--){const p=jbPops[i];p.l-=dt;p.sp.position.y+=dt*2.2;p.sp.material.opacity=Math.max(0,p.l);if(p.l<=0){sc.remove(p.sp);jbPops.splice(i,1)}}
  if(playing){
    if(curMap=='builds'){
        // Kamera dihandle oleh updateBuildMode
    } else {
        const cp=Math.cos(pitch);
        cam.position.set(pl.x+Math.sin(cy)*cp*zd,pl.y+1+Math.sin(pitch)*zd,pl.z+Math.cos(cy)*cp*zd);
        if(bx.shake>0){cam.position.x+=(Math.random()-.5)*bx.shake;cam.position.y+=(Math.random()-.5)*bx.shake;bx.shake=Math.max(0,bx.shake-dt*2.6)}
        cam.lookAt(pl.x,pl.y+.8,pl.z);
        placeActBubble();
        if(skyDome){skyDome.position.set(pl.x,0,pl.z);(curMap=='speedrace'&&THEMES[rtrack]&&THEMES[rtrack].scene?sunMesh.position.set(pl.x+60,62,pl.z+260):sunMesh.position.set(pl.x-150,140,pl.z-200));sunMesh.lookAt(pl.x,50,pl.z)}
        dl.position.set(pl.x+60,100,pl.z+40);dlTarget.position.set(pl.x,0,pl.z);
        if(R.shadowMap.enabled)dl.shadow.camera.updateProjectionMatrix();
    }
  } else {
    menuG.rotation.y+=dt*.55;const t=now/1000;
    const shT=(!$('skin').classList.contains('hide')||!$('set').classList.contains('hide'))&&innerWidth>innerHeight?1.7:0;menuSh+=(shT-menuSh)*Math.min(1,dt*6);cam.position.set(Math.sin(t*.3)*.4+menuSh,2.1,5.2);cam.lookAt(menuSh,.85,0);
    if(skyDome){skyDome.position.set(0,0,0)}
  }
  R.render(sc,cam);
  if(playing){
    const x=$('mm').getContext('2d'),f=v=>(v/LIM+1)*48;if(curMap=='speedrace')drawTrkMap(x);else if(curMap=='boxing')drawBoxMap(x);else if(curMap=='parkour'){const zm=PARKOUR[PARKOUR.length-1][2],h=Math.max(0,Math.min(1,pl.z/zm))*90;x.fillStyle='#17306b';x.fillRect(0,0,96,96);x.fillStyle='#3d8bff';x.fillRect(40,93-h,16,h);x.fillStyle='#ffd23f';x.fillRect(36,90-h,24,6);for(const id in P){const hh=Math.max(0,Math.min(1,P[id].z/zm))*90;x.fillStyle='#e22';x.fillRect(62,92-hh,6,4)}}else if(curMap=='builds'){
      x.fillStyle='#5cb85c';x.fillRect(0,0,96,96);
      x.strokeStyle='rgba(0,0,0,.15)';x.lineWidth=1;
      for(let i=0;i<96;i+=8){x.beginPath();x.moveTo(i,0);x.lineTo(i,96);x.stroke();x.beginPath();x.moveTo(0,i);x.lineTo(96,i);x.stroke();}
      x.fillStyle='#ffd23f';x.fillRect(48+(pl.x/1000)*48-2,48+(pl.z/1000)*48-2,4,4);
    } else {
      x.fillStyle='#'+(MAPS[curMap]?MAPS[curMap][1]:0x2f6b3a).toString(16).padStart(6,'0');
      x.fillRect(0,0,96,96);
      x.fillStyle='rgba(0,0,0,.15)';
      for(let i=0;i<96;i+=8)x.fillRect(i,0,1,96);
      for(let i=0;i<96;i+=8)x.fillRect(0,i,96,1);
      for(const r of rings){x.strokeStyle='#d05040';x.lineWidth=2;x.beginPath();x.arc(f(r.x),f(r.z),r.r/LIM*48,0,6.28);x.stroke()}
      x.fillStyle='#7fd0ff';
      for(const j of jbs){if(j.x*j.x+j.z*j.z<LIM*LIM)x.fillRect(f(j.x)-1,f(j.z)-1,2,2)}
      for(const bb of boostBubbles){if(bb.act){x.fillStyle='#ff8c1a';x.fillRect(f(bb.x)-2,f(bb.z)-2,4,4)}}
      for(const b of BALLOONS){x.fillStyle='#ff5d5d';x.fillRect(f(b.x)-3,f(b.z)-3,6,6)}
      for(const a of ANIMALS){x.fillStyle='#ffffff';x.fillRect(f(a.x)-1,f(a.z)-1,3,3)}
      for(const j of JELLOGERS){x.fillStyle=j.secret?'#ffe27a':'#8fd08f';x.fillRect(f(j.x)-1,f(j.z)-1,3,3)}
      for(const id in P){x.fillStyle='#e22';x.fillRect(f(P[id].x)-2,f(P[id].z)-2,4,4)}
      for(const b of BOARDS){x.fillStyle=b.active?'#ffd23f':'#e0a000';x.fillRect(f(b.x)-2,f(b.z)-2,4,4)}
      x.fillStyle='#ffd23f';x.fillRect(f(pl.x)-2,f(pl.z)-2,4,4);
      x.strokeStyle='#0e1a3a';x.lineWidth=1;x.strokeRect(f(pl.x)-3.5,f(pl.z)-3.5,7,7);
    }
  }
}
applyGfx();rs();requestAnimationFrame(frame);
setInterval(()=>{
  if(playing&&me&&pl&&(Math.abs(pl.x-(pl.sx||0))>.05||Math.abs(pl.z-(pl.sz||0))>.05||Math.abs(pl.r-(pl.sr||0))>.05||Math.abs(pl.y-(pl.sy2||0))>.05)){
    pl.sx=pl.x;pl.sz=pl.z;pl.sr=pl.r;pl.sy2=pl.y;
    const u={x:+pl.x.toFixed(2),z:+pl.z.toFixed(2),y:+pl.y.toFixed(2),r:+pl.r.toFixed(2)};if(curMap=='speedrace')u.pg=+Math.max(0,raceDist).toFixed(1);me.update(u);
  }
},120);

(async()=>{
  try{
    setLoad('Memeriksa koneksi...',0.15);await new Promise(r=>setTimeout(r,200));
    setLoad('Login & database...',0.5);const er=await ready;
    if(er&&er!=''&&er!='net'){setLoad(''+(ERR[er]||er)+' — lanjut offline (solo)',0.8);await new Promise(r=>setTimeout(r,1800))}
    else {setLoad('Login berhasil!',0.9);await new Promise(r=>setTimeout(r,250))}
    setLoad('Siap!',1);finishBoot(300);
  }catch(e){console.error('Bootstrap:',e);setLoad('Error — lanjut offline',0.8);finishBoot(500)}
})();


if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js',{scope:'./'})
      .then(r=>console.log('[SW] OK:',r.scope))
      .catch(e=>console.error('[SW] Gagal:',e));
  });
}
