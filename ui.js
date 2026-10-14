/* Meet-UP UI v3 — dekorasi, jello photocard (tilt + foil), kartu pemain. Dimuat setelah game.js */
(()=>{
const $=i=>document.getElementById(i),qa=(s,r)=>[...(r||document).querySelectorAll(s)];
const el=(t,c,css,html)=>{const e=document.createElement(t);if(c)e.className=c;if(css)e.style.cssText=css;if(html)e.innerHTML=html;return e};
const R=(a,b)=>a+Math.random()*(b-a);

/* ---- dekorasi latar: awan melayang, bintang berkedip, koin & hati mengambang ---- */
const deco=el('div');deco.id='deco';
for(let i=0;i<5;i++)deco.append(el('i','px-cloud cl',`top:${R(4,46)}%;--s:${R(1.6,3.2).toFixed(1)};--d:${R(70,130)|0}s;--w:-${R(0,100)|0}s;opacity:${R(.45,.9).toFixed(2)}`));
for(let i=0;i<16;i++){const big=i%4==0;deco.append(el('i',(big?'px-star2':'px-star')+' st',`left:${R(2,98).toFixed(1)}%;top:${R(3,62).toFixed(1)}%;--w:-${R(0,2).toFixed(1)}s`))}
[['px-coin',2,82,1],['px-heart',95,88,1],['px-coin',96,6,.8],['px-heart',1,6,.8],['px-star2',49,8,1]].forEach(([c,x,y,s],i)=>deco.append(el('i',c+' fl',`left:${x}%;top:${y}%;--s:${s*1.1};--d:${(2.4+i*.5).toFixed(1)}s;--w:-${i*.4}s`)));
const cv=$('c');cv?cv.after(deco):document.body.prepend(deco);

/* ---- minimap: radar sweep + penanda N ---- */
if($('mm')){{const f=el('div');f.id='mmfx';document.body.append(f)}const n=el('div');n.id='mmn';n.textContent='N';document.body.append(n);
  const sync=()=>{const h=$('hud'),v=h&&!h.classList.contains('hide');$('mmfx').style.display=$('mmn').style.display=v?'':'none'};
  new MutationObserver(sync).observe($('hud'),{attributes:true,attributeFilter:['class']});sync()}

/* ---- loading: jello pixel melompat ---- */
const sp=$('loadSpinner');if(sp)sp.className='px-jello';

/* ---- kartu peta: tag data-map + class photocard ---- */
const MK={Pulau:'island',Gurun:'desert',Jungle:'jungle',Salju:'snow',Parkour:'parkour',Balapan:'speedrace',Boxing:'boxing'};
const tag=(root)=>{qa('#playMaps button,#maps button',root).forEach((b,i)=>{if(b.classList.contains('jc'))return;const s=b.querySelector('span');b.dataset.map=b.dataset.map||MK[s&&s.textContent]||'island';b.classList.add('jc');b.style.setProperty('--i',i)})
  qa('.tkg button.tk',root).forEach((b,i)=>{b.classList.add('jc');b.style.setProperty('--i',i)});
  qa('.row:not(.jc)',$('ll')).forEach((b,i)=>{b.classList.add('jc');b.style.setProperty('--i',i)})};
tag();new MutationObserver(()=>tag()).observe(document.body,{childList:true,subtree:true});

/* ---- kartu pemain (menu utama) ---- */
const chip=document.querySelector('.mchip');
if(chip){chip.classList.add('jc','foil');chip.innerHTML='<div class="ph"><i></i></div><div class="nf"><em>PLAYER CARD</em><b id="mcn"></b><span id="mcj"></span></div>';
  const rc=window.refreshChip;window.refreshChip=()=>{const c=chip.querySelector('#mcn');if(c){c.textContent=cfg.name||'Pemain';$('mcj').textContent=cfg.jb+' JB'}chip.style.setProperty('--j1',cfg.c1);chip.style.setProperty('--j2',cfg.c2);chip.querySelector('.ph i').style.setProperty('--j1',cfg.c1);chip.querySelector('.ph i').style.setProperty('--j2',cfg.c2)};
  window.refreshChip()}
const shop=document.querySelector('.shop');if(shop)shop.classList.add('jc','foil');

/* ---- tilt 3D + kilau foil mengikuti pointer, jiggle saat disentuh ---- */
let cur=null,raf=0,px=0,py=0;
const rest=c=>{c.classList.add('rest');c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg');c.style.setProperty('--mx','50%');c.style.setProperty('--my','50%')};
const upd=()=>{raf=0;if(!cur)return;const r=cur.getBoundingClientRect(),x=Math.min(1,Math.max(0,(px-r.left)/r.width)),y=Math.min(1,Math.max(0,(py-r.top)/r.height)),q=v=>Math.round(v/2)*2;
  cur.style.setProperty('--rx',q((.5-y)*22)+'deg');cur.style.setProperty('--ry',q((x-.5)*22)+'deg');cur.style.setProperty('--mx',(x*100|0)+'%');cur.style.setProperty('--my',(y*100|0)+'%')};
addEventListener('pointermove',e=>{const t=e.target.closest&&e.target.closest('.jc');if(cur&&cur!==t)rest(cur);cur=t;if(t){t.classList.remove('rest');px=e.clientX;py=e.clientY;if(!raf)raf=requestAnimationFrame(upd)}},{passive:true});
addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('.jc');if(!t)return;t.classList.remove('jig');void t.offsetWidth;t.classList.add('jig');setTimeout(()=>t.classList.remove('jig'),450)},{passive:true});
addEventListener('pointerup',e=>{if(e.pointerType!=='mouse'&&cur){const c=cur;cur=null;setTimeout(()=>rest(c),250)}},{passive:true});
document.addEventListener('mouseleave',()=>{if(cur){rest(cur);cur=null}});
})();
