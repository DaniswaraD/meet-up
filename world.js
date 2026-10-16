/* ═══ world.js — bagian 1/2 ═══
   Konfigurasi, mesin 3D, builder semua map, avatar, efek.
   Dimuat SEBELUM game.js (keduanya berbagi scope global). ═══ */
const $=i=>document.getElementById(i);
const cfg=Object.assign({name:'',c1:'#3a8dff',c2:'#7fd0ff',sh:0,hat:0,nc:'#ffffff',nf:'monospace',rd:180,jb:0,gfx:'low',car:'f1',cars:['f1'],vc:[],hats:[0]},JSON.parse(localStorage.mu||'{}'));
if(!Array.isArray(cfg.cars)||!cfg.cars.length)cfg.cars=['f1'];
if(!Array.isArray(cfg.vc))cfg.vc=[];
if(!Array.isArray(cfg.hats))cfg.hats=[0];
if(!cfg.hats.includes(0))cfg.hats.unshift(0);

// ═══════════════════════════════════════════════════════════════════════
// DISCORD WEBHOOK — untuk "Kotak Masukan"
// Ganti URL di bawah dengan webhook Discord milikmu!
// ═══════════════════════════════════════════════════════════════════════
const DISCORD_WEBHOOK='https://discord.com/api/webhooks/1560506376868987086/ybIdSB7ewJNqWJPsN5bajeklfek9gCs_40CRT0nRLVun4yOt_i4eeZ_Lm9jKn6LIbzA8';

// ── Harga aksesori (JB) — paling murah 25, paling mahal 1000 ──
const HAT_PRICES=[0,1000,150,75,200,350,250,100,100,25,500,400];

// Palet warna untuk CSS color picker
const C_PALETTE=[
  '#ff5d5d','#ff8c1a','#ffd23f','#3fdc6a','#3d8bff','#7fd0ff',
  '#b05dff','#ff5db1','#ff90b8','#8b5a2b','#f0e6d0','#ffffff',
  '#c0c0c0','#808080','#404040','#17306b','#0e1a3a','#000000'
];
const C_LIGHT=new Set(['#ffffff','#f0e6d0','#ffd23f','#7fd0ff','#c0c0c0','#ffe27a']);

const CARS=[
  {id:'f1',    n:'F1 Ferrari',      price:0,    top:48.6, boost:76.4,  acc:1,    col:0xd8342a, col2:0xffe27a, seatY:.55, seatScale:.62},
  {id:'yaris', n:'Toyota Yaris GR', price:750,  top:52.8, boost:90.3,  acc:1.75, col:0xe8e8e8, col2:0xd8342a, seatY:1.05, seatScale:.55},
  {id:'vette', n:'Corvette ZR1',    price:1500, top:63.9, boost:104.2, acc:2.25, col:0xffd23f, col2:0x1a1a1a, seatY:.95,  seatScale:.6},
  {id:'chiron',n:'Bugatti Chiron',  price:3000, top:73.6, boost:118.1, acc:2.75, col:0x2a3a8a, col2:0x7fa8ff, seatY:1.0,  seatScale:.58},
  {id:'jesko', n:'Jesko Absolut',   price:4000,  top:131.9, boost:148.6, acc:3,  col:0xf0f2f5, col2:0xff7a1a, seatY:1.05, seatScale:.52},
  {id:'vbb3',  n:'Venturi VBB-3',   price:5000,  top:176.4, boost:194.4, acc:4,  col:0x1f4fd8, col2:0xffffff, seatY:1.2,  seatScale:.46},
  {id:'ssc',   n:'Thrust SSC',      price:10000, top:305.6, boost:347.2, acc:6,  col:0xdfe3e8, col2:0xd8342a, seatY:1.45, seatScale:.46},
  {id:'xars',  n:'Xarsdada',        price:15000, top:486.1, boost:555.6, acc:10, col:0x6a2bd8, col2:0x39e6ff, seatY:1.2,  seatScale:.5}
];
const carOf=id=>CARS.find(c=>c.id===id)||CARS[0];
const sv=()=>localStorage.mu=JSON.stringify(cfg);
const FXL=()=>({lowest:0,low:1,high:2,highest:3})[cfg.gfx]??1;
const loadMsg=$('loadMsg'),loadBar=$('loadBar');
function setLoad(m,p){if(loadMsg)loadMsg.textContent=m;if(loadBar)loadBar.style.width=(p*100)+'%'}
let booted=false;
const SCREENS=['name','menu','playpick','skin','croom','lobby','set','voucher'];
function finishBoot(delay){if(booted)return;booted=true;setTimeout(()=>{const l=$('load');if(l)l.classList.add('hide');const n=$('nm');if(n)n.value=cfg.name;SCREENS.forEach(s=>{const e=$(s);if(e)e.classList.toggle('hide',s!=(cfg.name?'menu':'name'))})},delay||400)}
setTimeout(()=>{if(!booted){setLoad('Memuat paksa...',1);finishBoot(0)}},7000);

// Pengganti try/catch pembungkus lama (file sudah dibelah, jadi try{} tidak bisa lintas-file)
addEventListener('error',e=>{console.error('Init error:',e.error||e.message);if(!booted){setLoad(''+e.message,1);finishBoot(500)}});

if(typeof firebase!=='undefined')firebase.initializeApp({apiKey:"AIzaSyBrcEg6Ddw8PLmKJxi8rf9-N7eGsy4AUFs",authDomain:"meet-up-e1be8.firebaseapp.com",databaseURL:"https://meet-up-e1be8-default-rtdb.firebaseio.com",projectId:"meet-up-e1be8",storageBucket:"meet-up-e1be8.firebasestorage.app",messagingSenderId:"47326775225",appId:"1:47326775225:web:290a6644c0559ee2979868"});
const TS=typeof firebase!=='undefined'?firebase.database.ServerValue.TIMESTAMP:0,KX='X';let db,uid,tT;
const toast=t=>{const e=$('toast');e.textContent=t;e.classList.remove('hide');clearTimeout(tT);tT=setTimeout(()=>e.classList.add('hide'),5000)};
const URLS=['https://meet-up-e1be8-default-rtdb.asia-southeast1.firebasedatabase.app','https://meet-up-e1be8-default-rtdb.firebaseio.com'];
const ready=Promise.race([
  (async()=>{
    if(typeof firebase==='undefined')return'net';
    try{uid=await Promise.race([firebase.auth().signInAnonymously().then(r=>r.user.uid),new Promise((_,rej)=>setTimeout(()=>rej(new Error('auth-timeout')),10000))])}
    catch(e){console.error('[Meet-UP] Auth error:',e.code||e.message,e);if(e.code==='auth/operation-not-allowed'){toast('Anonymous Auth belum ON');return'auth'}if(e.code==='auth/unauthorized-domain'){toast('Domain belum didaftarkan');return'auth'}if(e.message==='auth-timeout'){toast('Login timeout 10s');return'auth'}toast('Auth: '+(e.code||e.message));return'auth'}
    for(const u of URLS){const d=firebase.app().database(u);const ok=await Promise.race([new Promise(r=>{const ref=d.ref('.info/connected'),f=x=>{if(x.val()){ref.off('value',f);r(1)}};ref.on('value',f)}),new Promise(r=>setTimeout(()=>r(0),2000))]);if(ok){db=d;return''}d.goOffline()}
    return'db';
  })(),
  new Promise(r=>setTimeout(()=>r('timeout'),12000))
]);
const ERR={net:'Tidak ada internet',auth:'Auth gagal — cek Console',db:'Database tidak terhubung',timeout:'Koneksi timeout'};
const G={M:'10001 11011 10101 10001 10001 10001 10001',e:'00000 00000 01110 10001 11111 10000 01110',t:'00100 00100 01110 00100 00100 00100 00011','-':'00000 00000 00000 01110 00000 00000 00000',U:'000000100 000001110 000011111 001000100 001000100 001000100 000111000',P:'11110 10001 10001 11110 10000 10000 10000'};
document.querySelectorAll('.ttl').forEach(c=>{c.width=50;c.height=10;const x=c.getContext('2d');let ox=2;for(const ch of'Meet-UP'){const rw=G[ch].split(' ');[[2,2,'#0e1a3a'],[1,1,'#17306b'],[0,0,ch=='U'?'#ffd23f':'#fff']].forEach(([dx,dy,col])=>{x.fillStyle=col;rw.forEach((r,j)=>[...r].forEach((v,i)=>v=='1'&&x.fillRect(ox+i+dx,1+j+dy,1,1)))});ox+=rw[0].length+1}});

(function injectStyles(){const st=document.createElement('style');st.textContent=`
.shop{padding:12px 14px;background:#fff5e0;box-shadow:var(--bd),inset 0 -3px 0 #e0c080,inset 0 3px 0 #fff;display:flex;flex-direction:column;gap:5px}
.shop .shop-lbl{font-size:9px;color:#a05000;text-align:center;letter-spacing:2px;margin-bottom:4px;font-weight:bold}
.shop-row{display:flex;justify-content:space-between;align-items:center;background:#fffbe8;padding:7px 10px;box-shadow:inset 0 2px 0 #fff,0 2px 0 #c9a060;cursor:pointer;transition:filter .1s}
.shop-row:active{filter:brightness(.94);transform:translateY(2px)}
.shop-row .amt{color:#c05000;font-size:10px;font-weight:bold;letter-spacing:1px}
.shop-row .prc{display:flex;gap:8px;align-items:center;font-size:9px}
.shop-row .prc s{opacity:.5;color:#888;text-decoration:line-through;font-size:8px}
.shop-row .prc b{color:#3fbf5f;font-size:11px}
.shop .shop-lbl{cursor:pointer;margin:0}.shop .shop-body{display:none;flex-direction:column;gap:5px;margin-top:6px}.shop.open .shop-body{display:flex}.shop-arw{display:inline-block;width:10px}
.menu-left{display:flex;flex-direction:column;align-items:flex-start;gap:16px;flex-shrink:0;width:min(44vw,400px)}
.mchip{display:flex;align-items:center;gap:10px;background:#f4f9ff;padding:10px 14px;box-shadow:var(--bd),inset 0 -3px 0 #cfe0f7;font-size:11px;max-width:min(46vw,320px)}.mchip i{width:16px;height:16px;background:#3d8bff;box-shadow:0 0 0 2px var(--k);flex:none}.mchip b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}.mchip span{margin-left:auto;color:#3d8bff;white-space:nowrap}
#menu .mb .big{animation:pls 1.2s steps(2) infinite}@keyframes pls{50%{filter:brightness(1.12)}}
.shop .shop-note{font-size:7px;color:#a05000;text-align:center;opacity:.75;margin-top:4px;letter-spacing:1px;line-height:1.5}
#menu{flex-direction:row!important;align-items:center!important;justify-content:space-between!important;padding:max(20px,env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) max(20px,env(safe-area-inset-bottom)) max(24px,env(safe-area-inset-left))!important;gap:20px}
#menu .ttl{width:100%!important;max-width:min(48vw,420px);flex-shrink:0;margin:0!important}
#menu .menu-right{display:flex;flex-direction:column;gap:14px;width:min(42vw,320px);margin-left:auto;max-height:calc(100vh - 40px);overflow-y:auto;padding:4px}
#menu .menu-right .mb{width:100%!important;margin:0!important}
#menu .menu-right .shop{width:100%!important;margin:0!important}
#menu .menu-right::-webkit-scrollbar{width:4px}
#menu .menu-right::-webkit-scrollbar-thumb{background:#17306b}
.grid.map button small{display:block;font-size:7px;line-height:1;margin-top:4px;opacity:.8;font-weight:normal;letter-spacing:0}
.grid.map button.on small{opacity:1}
.grid.map button small.on-live{color:#3fbf5f}
@media(max-height:430px){#menu{padding:14px 3vw!important;gap:12px}#menu .ttl{max-width:min(42vw,320px)}.mchip{padding:7px 10px;font-size:10px}.menu-left{gap:10px;width:min(40vw,320px)}#menu .menu-right .mb button{min-height:38px;padding:8px}#menu .menu-right .mb .big{padding:10px}#menu .menu-right{width:min(46vw,300px);gap:10px}.shop{padding:9px 11px}.shop-row{padding:5px 8px}.shop-row .amt{font-size:9px}.shop-row .prc b{font-size:10px}.shop-row .prc s{font-size:7px}}
#hpbar{position:fixed;top:64px;left:50%;transform:translateX(-50%);width:200px;height:24px;background:#17306b;box-shadow:0 0 0 3px #17306b,0 0 0 6px #7fd0ff,0 4px 0 #0005;z-index:9;display:flex;align-items:center;padding:2px;gap:0}
#hpbar.hide{display:none}
#hpbar .fill{position:absolute;left:2px;top:2px;bottom:2px;width:calc(100% - 4px);background:linear-gradient(#ff5d5d,#b32b30);transition:width .2s}
#hpbar .txt{position:relative;z-index:1;width:100%;text-align:center;font-size:10px;color:#fff;font-weight:bold;text-shadow:1px 1px 0 #000}
#prompt{background:rgba(23,48,107,.95);color:#fff;padding:10px 18px;font-size:11px;box-shadow:0 0 0 3px #ffd23f,0 4px 0 #0005}
#dlgBtn{position:fixed;bottom:270px;left:50%;transform:translateX(-50%);background:#ffd23f;color:#17306b;padding:12px 22px;font:inherit;font-size:11px;font-weight:bold;box-shadow:0 0 0 4px #17306b,0 4px 0 #0005;cursor:pointer;z-index:12;display:none;border:0;font-family:inherit;letter-spacing:1px;animation:dpop .18s ease-out}
#dlgBtn.show{display:block}
#dlgBtn:active{transform:translateX(-50%) translateY(3px);filter:brightness(.92)}
@keyframes dpop{from{transform:translateX(-50%) scale(.75)}to{transform:translateX(-50%) scale(1)}}
`;document.head.appendChild(st)})();
(function(){const h=document.createElement('div');h.id='hpbar';h.className='hide';h.innerHTML='<div class="fill"></div><div class="txt">10/10</div>';document.body.appendChild(h)})();

let currentDlgTarget=null;
let dlgBtnEl=null;
// Dialog jelloger sekarang lewat bubble ACT (lihat talkTo/updateBoards)

const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'low-power'}),sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,1,.1,900);
R.shadowMap.enabled=false;
R.shadowMap.autoUpdate=true;
sc.add(new THREE.HemisphereLight(0xffffff,0x667788,.95));
const dl=new THREE.DirectionalLight(0xffffff,.55);
dl.position.set(60,100,40);
sc.add(dl);
const dlTarget=new THREE.Object3D();sc.add(dlTarget);dl.target=dlTarget;

let AMB_MULT=1;
function applyGfx(){
  const g=cfg.gfx||'low';
  R.setPixelRatio(g==='lowest'?0.6:g==='low'?1:g==='high'?1:1.3);
  R.shadowMap.enabled=(g==='high'||g==='highest');
  R.shadowMap.type=g==='highest'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
  dl.castShadow=R.shadowMap.enabled;
  if(R.shadowMap.enabled){
    sc.children[0].intensity=.75;dl.intensity=.7;
    const size=g==='highest'?2048:1024;
    dl.shadow.mapSize.set(size,size);
    const s=g==='highest'?40:32;
    dl.shadow.camera.left=-s;dl.shadow.camera.right=s;
    dl.shadow.camera.top=s;dl.shadow.camera.bottom=-s;
    dl.shadow.camera.near=1;dl.shadow.camera.far=180;
    dl.shadow.camera.updateProjectionMatrix();
    dl.shadow.bias=-0.0006;dl.shadow.normalBias=0.03;
    dl.shadow.radius=g==='highest'?3:2;
  } else {sc.children[0].intensity=.95;dl.intensity=.55}
  AMB_MULT=g==='lowest'?0.4:g==='low'?1:g==='high'?1.5:2;
}

function rs(){const h=240,w=Math.round(h*innerWidth/innerHeight);R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}addEventListener('resize',rs);
function setRD(){const r=cfg.rd;const rl=$('rl');if(rl)rl.textContent='Render: '+r+'J';if(sc.fog){sc.fog.near=r;sc.fog.far=r*1.6}cam.far=r*1.7+10;cam.updateProjectionMatrix()}
const MAPS={island:[0x87c8ff,0x5cb85c],desert:[0xf5d99a,0xe0c070],jungle:[0x3a6a4a,0x2f6b3a],snow:[0xdcecff,0xf4f8ff],parkour:[0x0e1a3a,0x1a1a3a],speedrace:[0x87ceeb,0x4a4a5a],boxing:[0x14082e,0x1a1232]};
let world=new THREE.Group(),cols=[],plats=[],jbs=[],boostBubbles=[],swings=[],rings=[],WINDMILLS=[],FLAGPOLES=[],hillGrass=[],ANIMALS=[],FOUNTAINS=[],WATERFALLS=[],BALLOONS=[],WATERWHEELS=[],BELLS=[],LANTERNS=[],curMap='island',LIM=200;
const JELLOGERS=[];
const JSPARK=[];

let skyDome,sunMesh;
function makeSky(sc1,sc2){const geo=new THREE.SphereGeometry(450,32,16);const c1=new THREE.Color(sc1),c2=new THREE.Color(sc2);const p=geo.attributes.position,cl=[];for(let i=0;i<p.count;i++){const y=p.getY(i)/450;const t=Math.max(0,Math.min(1,(y+1)/2));const c=c2.clone().lerp(c1,t);cl.push(c.r,c.g,c.b)}geo.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));skyDome=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,depthWrite:false}));sc.add(skyDome);sunMesh=new THREE.Mesh(new THREE.CircleGeometry(28,32),new THREE.MeshBasicMaterial({color:0xfff4c2,transparent:true,opacity:.9}));sunMesh.position.set(-150,140,-200);sunMesh.lookAt(0,50,0);sc.add(sunMesh)}
function removeSky(){if(skyDome){sc.remove(skyDome);skyDome=null}if(sunMesh){sc.remove(sunMesh);sunMesh=null}}

const LM=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,flatShading:true,shininess:5},o||{}));
const LS=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,flatShading:false,shininess:8},o||{}));
const Mt=(g,mat,x,y,z,par)=>{const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);if(R.shadowMap.enabled){m.castShadow=true;m.receiveShadow=true}(par||world).add(m);return m};
const BOX=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const ICO=(r,d)=>new THREE.IcosahedronGeometry(r,d||0);
const addCol=(x,y,z,w,h,d,opt)=>cols.push(Object.assign({x,y,z,w,h,d,enabled:true,slip:0},opt||{}));
function addColDome(x,z,r,h){cols.push({x,y:0,z,w:r*2,h,d:r*2,enabled:true,type:'dome',radius:r,domeH:h})}

function mergeParts(parts){const geos=[];let total=0;const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();const pos=new THREE.Vector3(),scl=new THREE.Vector3();for(const p of parts){let g=p.geo.index?p.geo.toNonIndexed():p.geo.clone();e.set(p.rx||0,p.ry||0,p.rz||0);q.setFromEuler(e);pos.set(p.x||0,p.y||0,p.z||0);const s=p.s||1;scl.set(p.sx||s,p.sy||s,p.sz||s);m4.compose(pos,q,scl);g.applyMatrix4(m4);if(!g.attributes.normal)g.computeVertexNormals();const c=new THREE.Color(p.color);const n=g.attributes.position.count;const cl=new Float32Array(n*3);for(let i=0;i<n;i++){cl[i*3]=c.r;cl[i*3+1]=c.g;cl[i*3+2]=c.b}g.setAttribute('color',new THREE.BufferAttribute(cl,3));total+=n;geos.push(g)}const P=new Float32Array(total*3),N=new Float32Array(total*3),C=new Float32Array(total*3);let off=0;for(const g of geos){P.set(g.attributes.position.array,off*3);N.set(g.attributes.normal.array,off*3);C.set(g.attributes.color.array,off*3);off+=g.attributes.position.count}const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.BufferAttribute(P,3));m.setAttribute('normal',new THREE.BufferAttribute(N,3));m.setAttribute('color',new THREE.BufferAttribute(C,3));return m}
function addMerged(parts){if(!parts.length)return;const mesh=new THREE.Mesh(mergeParts(parts),new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:8}));if(R.shadowMap.enabled){mesh.castShadow=true;mesh.receiveShadow=true}world.add(mesh)}
function instance1(geo,list,parent,cull){if(!list||!list.length)return null;const mat=new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:4});const im=new THREE.InstancedMesh(geo,mat,list.length);im.instanceMatrix.setUsage(THREE.StaticDrawUsage);const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();const pos=new THREE.Vector3(),scl=new THREE.Vector3();for(let i=0;i<list.length;i++){const t=list[i];pos.set(t.x,t.y||0,t.z);e.set(0,t.r||0,0);q.setFromEuler(e);const s=t.s||1;scl.set(t.sx||s,t.sy||s,t.sz||s);m4.compose(pos,q,scl);im.setMatrixAt(i,m4)}im.instanceMatrix.needsUpdate=true;if(!cull)im.frustumCulled=false;if(R.shadowMap.enabled){im.castShadow=true;im.receiveShadow=true}(parent||world).add(im);return im}
function instance(geo,list,parent){if(!list||!list.length)return null;if(curMap!='speedrace'||list.length<400)return instance1(geo,list,parent,false);let r=null;for(let i=0;i<list.length;i+=250){const ch=list.slice(i,i+250),g=geo.clone();let cx=0,cz=0;for(const t of ch){cx+=t.x;cz+=t.z}cx/=ch.length;cz/=ch.length;let rr=0;for(const t of ch)rr=Math.max(rr,Math.hypot(t.x-cx,t.z-cz));g.boundingSphere=new THREE.Sphere(new THREE.Vector3(cx,20,cz),rr+110);r=instance1(g,ch,parent,true)}return r}

const SNOW={bl:0,wx:0,wz:0,on:0};
const AMB={butterflies:[],birds:[],clouds:[],snow:[],leaves:[],petals:[],smokes:[],stars:[],orbs:[],fireflies:[],bubbles:[],dust:[],wind:[],streaks:[]};
function clearAmb(){for(const k in AMB){for(const m of AMB[k])sc.remove(m.m);AMB[k]=[]}}
function pool(kind,geo,mat,n){n=Math.max(1,Math.round(n*AMB_MULT));for(let i=0;i<n;i++){const m=new THREE.Mesh(geo,mat.clone());m.visible=false;sc.add(m);AMB[kind].push({m,act:false,t:0})}}
function get(kind){for(const q of AMB[kind])if(!q.act)return q;return null}
function spawnAmb(kind,data){const q=get(kind);if(!q)return;q.act=true;q.t=0;Object.assign(q,data);q.m.visible=true;q.m.position.set(q.x,q.y,q.z)}

function road(pts,width,fill,trim){const V=[],C=[],I=[];const p3=pts.map(p=>new THREE.Vector3(p[0],0,p[1]));const curve=new THREE.CatmullRomCurve3(p3,false,'centripetal',0.5);const steps=Math.max(24,Math.ceil(curve.getLength()/1.6));const points=curve.getSpacedPoints(steps);const cF=new THREE.Color(fill),cT=new THREE.Color(trim);const iw=width*0.5,ow=width*0.5+0.7,Y=0.14;for(let i=0;i<points.length;i++){const p=points[i];const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];let dx=b.x-a.x,dz=b.z-a.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const nx=dz,nz=-dx;V.push(p.x-nx*ow,Y,p.z-nz*ow);C.push(cT.r,cT.g,cT.b);V.push(p.x-nx*iw,Y+.01,p.z-nz*iw);C.push(cF.r,cF.g,cF.b);V.push(p.x+nx*iw,Y+.01,p.z+nz*iw);C.push(cF.r,cF.g,cF.b);V.push(p.x+nx*ow,Y,p.z+nz*ow);C.push(cT.r,cT.g,cT.b);if(i>0){const p0=(i-1)*4,p1=i*4;I.push(p0,p1,p0+1,p1,p1+1,p0+1);I.push(p0+1,p1+1,p0+2,p1+1,p1+2,p0+2);I.push(p0+2,p1+2,p0+3,p1+2,p1+3,p0+3)}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(V,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));geo.setIndex(I);const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));mesh.renderOrder=1;if(R.shadowMap.enabled)mesh.receiveShadow=true;world.add(mesh);return{points,width}}
function plaza(r,fill,trim){const outer=Mt(new THREE.CircleGeometry(r,36).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:trim}),0,.12,0);outer.renderOrder=1;if(R.shadowMap.enabled)outer.receiveShadow=true;const inner=Mt(new THREE.CircleGeometry(r-1.2,36).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:fill}),0,.13,0);inner.renderOrder=2;if(R.shadowMap.enabled)inner.receiveShadow=true}

function hill(x,z,r,h,edgeCol,grassCol){const geo=new THREE.SphereGeometry(1,24,18,0,Math.PI*2,0,Math.PI/2);const pos=geo.attributes.position,cl=[];const cT=new THREE.Color(grassCol),cB=new THREE.Color(edgeCol);for(let i=0;i<pos.count;i++){const ny=Math.max(0,Math.min(1,pos.getY(i)));const t=ny*ny;const c=cB.clone().lerp(cT,t);const noise=(Math.sin(pos.getX(i)*9)*Math.cos(pos.getZ(i)*7))*0.025;cl.push(Math.max(0,c.r+noise),Math.max(0,c.g+noise),Math.max(0,c.b+noise))}geo.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));const m=new THREE.Mesh(geo,new THREE.MeshPhongMaterial({vertexColors:true,shininess:3,flatShading:false}));m.scale.set(r,h,r);m.position.set(x,0,z);if(R.shadowMap.enabled){m.castShadow=true;m.receiveShadow=true}world.add(m);addColDome(x,z,r,h);const n=Math.floor(r/3)+4;for(let i=0;i<n;i++){const a=Math.random()*6.28,d=Math.random()*r*.75;const gx=x+Math.cos(a)*d,gz=z+Math.sin(a)*d;const gy=h*Math.sqrt(Math.max(0,1-(d/r)**2));hillGrass.push({x:gx,y:gy,z:gz,s:.7+Math.random()*.5,r:Math.random()*6.28})}}

const _treeGeos={};
function treeGeo(type){if(_treeGeos[type])return _treeGeos[type];const P=[];
if(type=='oak'){P.push({geo:new THREE.CylinderGeometry(.9,1.4,4.5,7),y:2.25,color:0x5a3a1a});P.push({geo:new THREE.CylinderGeometry(.7,1,2,6),y:6,color:0x6b4a2b});P.push({geo:ICO(3,0),y:7,color:0x3aa84a});P.push({geo:ICO(2.4,0),x:1.8,y:8.3,z:.4,color:0x2f8a3a});P.push({geo:ICO(2.2,0),x:-1.7,y:8.5,z:-.3,color:0x3aa84a});P.push({geo:ICO(2,0),x:.3,y:9.6,z:.9,color:0x4ac05a})}
else if(type=='birch'){P.push({geo:new THREE.CylinderGeometry(.6,.8,7,6),y:3.5,color:0xf0e6d0});P.push({geo:BOX(.5,.3,.15),x:.4,y:2,color:0x2a2a2a});P.push({geo:BOX(.5,.3,.15),x:.4,y:4,color:0x2a2a2a});P.push({geo:ICO(2.4,0),y:9,color:0xc8d878});P.push({geo:ICO(1.8,0),x:1.2,y:10,color:0xc8d878});P.push({geo:ICO(1.6,0),x:-1,y:10.2,color:0xc8d878})}
else if(type=='cherry'){P.push({geo:new THREE.CylinderGeometry(.8,1.2,4,6),y:2,color:0x5a3a1a});P.push({geo:new THREE.CylinderGeometry(.6,.9,2.5,6),y:4.5,color:0x6b4a2b});P.push({geo:ICO(2.8,0),y:7,color:0xffb0d0});P.push({geo:ICO(2.2,0),x:1.6,y:8,z:.3,color:0xff90b8});P.push({geo:ICO(2,0),x:-1.5,y:8.2,z:-.3,color:0xffb0d0});P.push({geo:ICO(1.8,0),x:.2,y:9,z:.8,color:0xff90b8})}
else if(type=='pine'||type=='snowpine'){const snowy=type=='snowpine';P.push({geo:new THREE.CylinderGeometry(.8,1.1,4,6),y:2,color:0x4a2a1a});P.push({geo:new THREE.ConeGeometry(3.8,6,7),y:7,color:0x1a5a2a});if(snowy)P.push({geo:new THREE.ConeGeometry(3.4,1.5,7),y:7.7,color:0xffffff});P.push({geo:new THREE.ConeGeometry(2.8,4.5,7),y:10.5,color:0x2a6a3a});if(snowy)P.push({geo:new THREE.ConeGeometry(2.6,1.3,7),y:11.2,color:0xffffff});P.push({geo:new THREE.ConeGeometry(2,3,7),y:13,color:0x1a5a2a});if(snowy)P.push({geo:new THREE.ConeGeometry(1.8,1,7),y:13.8,color:0xffffff})}
else if(type=='palm'){P.push({geo:new THREE.CylinderGeometry(.45,.65,5,6),y:2.5,color:0x8b5a2b});P.push({geo:new THREE.CylinderGeometry(.4,.55,5,6),y:7,x:.3,color:0x7a4a1b});const tx=.6,ty=9.5;for(let i=0;i<7;i++){const a=i/7*6.2832;P.push({geo:new THREE.ConeGeometry(2.4,.6,4),x:tx+Math.cos(a)*1.7,y:ty+Math.sin(i)*.15,z:Math.sin(a)*1.7,ry:-a,rz:Math.PI/2.3,color:i%2?0x2e8b3a:0x3aa04a})}P.push({geo:ICO(.4,0),x:tx+.5,y:ty-.4,color:0x4a2a1a});P.push({geo:ICO(.4,0),x:tx-.5,y:ty-.5,z:.3,color:0x4a2a1a})}
else if(type=='cactus'){P.push({geo:new THREE.CylinderGeometry(.8,.9,7,7),y:3.5,color:0x3c8f4a});P.push({geo:new THREE.CylinderGeometry(.6,.6,3.5,6),x:1.5,y:4.5,color:0x3c8f4a});P.push({geo:ICO(.7,0),x:1.5,y:6.3,color:0x2a7a3a});P.push({geo:new THREE.CylinderGeometry(.55,.55,3,6),x:-1.4,y:3.8,color:0x3c8f4a});P.push({geo:ICO(.65,0),x:-1.4,y:5.3,color:0x2a7a3a});P.push({geo:ICO(.35,0),y:7.2,color:0xff5d5d})}
else if(type=='dead'){P.push({geo:new THREE.CylinderGeometry(.5,.7,3,6),y:1.5,rz:.15,color:0x5a4a3a});P.push({geo:new THREE.CylinderGeometry(.35,.5,2.5,6),x:.3,y:4,rz:.4,color:0x5a4a3a});P.push({geo:new THREE.CylinderGeometry(.2,.3,1.8,5),x:.9,y:5.5,rz:1.2,color:0x5a4a3a});P.push({geo:new THREE.CylinderGeometry(.2,.3,1.6,5),x:-.4,y:5.2,rz:-1.1,color:0x5a4a3a})}
else if(type=='bush'){P.push({geo:ICO(1.2,0),y:.9,color:0x4f8f3f});P.push({geo:ICO(.9,0),x:.8,y:.8,z:-.3,color:0x3a7a2f});P.push({geo:ICO(.85,0),x:-.7,y:.85,z:.4,color:0x4f8f3f});P.push({geo:ICO(.7,0),x:.2,y:1.5,z:.5,color:0x3a7a2f})}
else if(type=='rock'){P.push({geo:new THREE.DodecahedronGeometry(.7,0),y:.4,color:0x7a7a72});P.push({geo:new THREE.DodecahedronGeometry(.45,0),x:.55,y:.28,z:.25,color:0x8a8a82});P.push({geo:new THREE.DodecahedronGeometry(.35,0),x:-.45,y:.22,z:-.25,color:0x6a6a62})}
else if(type=='grassTuft'){P.push({geo:new THREE.ConeGeometry(.15,.7,3),y:.35,color:0x4fa040});P.push({geo:new THREE.ConeGeometry(.13,.6,3),x:.2,y:.3,z:.15,color:0x5fb050});P.push({geo:new THREE.ConeGeometry(.12,.55,3),x:-.15,y:.28,z:-.2,color:0x4fa040});P.push({geo:new THREE.ConeGeometry(.11,.5,3),x:.1,y:.25,z:-.25,color:0x3a8030})}
else if(type=='grassDry'){P.push({geo:new THREE.ConeGeometry(.15,.7,3),y:.35,color:0xa89868});P.push({geo:new THREE.ConeGeometry(.13,.6,3),x:.2,y:.3,z:.15,color:0xbfae78});P.push({geo:new THREE.ConeGeometry(.12,.55,3),x:-.15,y:.28,z:-.2,color:0xa89868})}
else if(type=='flower'){P.push({geo:new THREE.CylinderGeometry(.05,.05,.4,4),y:.2,color:0x3a7a2f});P.push({geo:ICO(.18,0),y:.45,color:0xff6688})}
else if(type=='snowMound'){P.push({geo:new THREE.SphereGeometry(1,10,6,0,6.2832,0,1.5708),y:0,sx:1,sy:1.2,sz:1,color:0xffffff});P.push({geo:new THREE.SphereGeometry(.6,8,5,0,6.2832,0,1.5708),x:.7,y:0,z:.4,sx:1,sy:1,sz:1,color:0xf0f6ff})}
const g=mergeParts(P);_treeGeos[type]=g;return g}

const BEACONS=[];
function hut(x,z,rot,woodCol,roofCol){const P=[];const w=6,h=5,d=6,t=.4,doorW=1.8;const c=Math.cos(rot),s=Math.sin(rot);const add=(geo,lx,ly,lz,color,extra)=>{const wx=x+c*lx-s*lz,wz=z+s*lx+c*lz;P.push(Object.assign({geo,x:wx,y:ly,z:wz,color,ry:rot},extra||{}))};add(BOX(w+.4,.4,d+.4),0,-.2,0,0x5a3a1a);add(BOX(w,h,t),0,h/2,-d/2,woodCol);add(BOX(t,h,d),-w/2,h/2,0,woodCol);add(BOX(t,h,d),w/2,h/2,0,woodCol);const segW=(w-doorW)/2,segOff=doorW/2+segW/2;add(BOX(segW,h,t),-segOff,h/2,d/2,woodCol);add(BOX(segW,h,t),segOff,h/2,d/2,woodCol);add(BOX(doorW,h-4,t),0,4+(h-4)/2,d/2,woodCol);add(new THREE.ConeGeometry(w*.85,3.5,4),0,h+1.5,0,roofCol,{ry:rot+Math.PI/4});addMerged(P);addCol(x,0,z,w,h,d,{});addCol(x-w/2,0,z,t,h,d);addCol(x+w/2,0,z,t,h,d)}
function lighthouse(x,z){addMerged([{geo:new THREE.CylinderGeometry(3.5,4.5,20,12),x,y:10,z,color:0xf4f4f4},{geo:new THREE.CylinderGeometry(4,4,1,12),x,y:4,z,color:0xff5d5d},{geo:new THREE.CylinderGeometry(4,4,1,12),x,y:8,z,color:0xff5d5d},{geo:new THREE.CylinderGeometry(4,4,1,12),x,y:12,z,color:0xff5d5d},{geo:new THREE.CylinderGeometry(4,4,1,12),x,y:16,z,color:0xff5d5d},{geo:new THREE.CylinderGeometry(4.5,4.5,1,12),x,y:20.5,z,color:0x2a2a2a},{geo:new THREE.CylinderGeometry(3,3,4,8),x,y:23,z,color:0x2a2a2a}]);Mt(ICO(1.8,1),new THREE.MeshBasicMaterial({color:0xffe27a}),x,23,z);const beam=Mt(new THREE.ConeGeometry(15,30,4).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.15,side:THREE.DoubleSide}),x,23,z);BEACONS.push({beam,t:Math.random()*6.28});addCol(x,0,z,8,20,8)}
function obelisk(x,z,col){addMerged([{geo:BOX(6,.8,6),x,y:.4,z,color:0x6a5a4a},{geo:BOX(3.5,.8,3.5),x,y:1.2,z,color:0x6a5a4a},{geo:new THREE.CylinderGeometry(1.5,2.5,16,4),x,y:9,z,color:col,ry:Math.PI/4},{geo:new THREE.ConeGeometry(2.5,3,4),x,y:18.5,z,color:0xffd23f,ry:Math.PI/4}]);Mt(ICO(1,1),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.6}),x,18.5,z);addCol(x,0,z,5,18,5)}
function shrine(x,z,col){const cc=col||0x8a8a7a;addMerged([{geo:BOX(12,1,12),x,y:.5,z,color:cc},{geo:BOX(9,1,9),x,y:1.5,z,color:cc},{geo:new THREE.CylinderGeometry(1,1.2,7,8),x:x-3,y:5.5,z:z-3,color:cc},{geo:new THREE.CylinderGeometry(1,1.2,7,8),x:x+3,y:5.5,z:z-3,color:cc},{geo:new THREE.CylinderGeometry(1,1.2,7,8),x,y:5.5,z:z+3,color:cc},{geo:BOX(10,1,8),x,y:9.5,z,color:cc},{geo:BOX(2.5,1.5,2.5),x,y:2.75,z,color:0x6a5a4a}]);Mt(ICO(.6,1),new THREE.MeshBasicMaterial({color:0x7fd0ff}),x,3.7,z);addCol(x,0,z,12,2,12);addCol(x-3,2,z-3,2,7,2);addCol(x+3,2,z-3,2,7,2);addCol(x,2,z+3,2,7,2)}
function watchtower(x,z){addMerged([{geo:new THREE.CylinderGeometry(.6,.8,16,6),x:x-3,y:8,z:z-3,color:0x8b5a2b},{geo:new THREE.CylinderGeometry(.6,.8,16,6),x:x+3,y:8,z:z-3,color:0x8b5a2b},{geo:new THREE.CylinderGeometry(.6,.8,16,6),x:x-3,y:8,z:z+3,color:0x8b5a2b},{geo:new THREE.CylinderGeometry(.6,.8,16,6),x:x+3,y:8,z:z+3,color:0x8b5a2b},{geo:BOX(7.5,.4,7.5),x,y:4,z,color:0x5a3a1a},{geo:BOX(7.5,.4,7.5),x,y:8,z,color:0x5a3a1a},{geo:BOX(7.5,.4,7.5),x,y:12,z,color:0x5a3a1a},{geo:BOX(8.5,.5,8.5),x,y:16,z,color:0x8b5a2b},{geo:BOX(9,.3,.4),x,y:17,z:z-4,color:0x8b5a2b},{geo:BOX(9,.3,.4),x,y:17,z:z+4,color:0x8b5a2b},{geo:BOX(.4,.3,9),x:x-4,y:17,z,color:0x8b5a2b},{geo:BOX(.4,.3,9),x:x+4,y:17,z,color:0x8b5a2b},{geo:new THREE.ConeGeometry(7,4,4),x,y:19,z,color:0xa04030,ry:Math.PI/4}]);addCol(x-3,0,z-3,1.5,16,1.5);addCol(x+3,0,z-3,1.5,16,1.5);addCol(x-3,0,z+3,1.5,16,1.5);addCol(x+3,0,z+3,1.5,16,1.5)}
function oasis(x,z,r){Mt(new THREE.CircleGeometry(r,24).rotateX(-1.5708),new THREE.MeshPhongMaterial({color:0x3aa0d0,shininess:90,transparent:true,opacity:.9}),x,.06,z);Mt(new THREE.TorusGeometry(r,.6,4,24).rotateX(1.5708),LM(0xb8a878),x,.3,z)}
function well(x,z){addMerged([{geo:new THREE.CylinderGeometry(2.2,2.4,2,8),x,y:1,z,color:0x8a8a8a},{geo:BOX(.35,4.5,.35),x:x-1.6,y:2.5,z:z-1.6,color:0x8b5a2b},{geo:BOX(.35,4.5,.35),x:x+1.6,y:2.5,z:z-1.6,color:0x8b5a2b},{geo:BOX(.35,4.5,.35),x:x-1.6,y:2.5,z:z+1.6,color:0x8b5a2b},{geo:BOX(.35,4.5,.35),x:x+1.6,y:2.5,z:z+1.6,color:0x8b5a2b},{geo:new THREE.ConeGeometry(3.5,2,4),x,y:5.8,z,color:0xa04030,ry:Math.PI/4}]);Mt(new THREE.CircleGeometry(1.7,20).rotateX(-1.5708),new THREE.MeshPhongMaterial({color:0x2a6a9a,shininess:90,transparent:true,opacity:.9}),x,1.9,z);addCol(x,0,z,4.8,3,4.8)}
function bench(x,z,rot){rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];const p1=T(0,0),p2=T(0,-.55),p3=T(-1.8,0),p4=T(1.8,0);addMerged([{geo:BOX(4.4,.35,1.4),x:p1[0],y:.9,z:p1[1],color:0x8b5a2b,ry:rot},{geo:BOX(4.4,1.1,.3),x:p2[0],y:1.6,z:p2[1],color:0x8b5a2b,ry:rot},{geo:BOX(.3,.9,.3),x:p3[0],y:.4,z:p3[1],color:0x5a3a1a,ry:rot},{geo:BOX(.3,.9,.3),x:p4[0],y:.4,z:p4[1],color:0x5a3a1a,ry:rot}]);addCol(x,.5,z,4.4,.4,1.4,{ry:rot})}
function camp(x,z){const P=[];for(let i=0;i<8;i++){const a=i/8*6.28;P.push({geo:new THREE.DodecahedronGeometry(.8),x:x+Math.cos(a)*3.2,y:.4,z:z+Math.sin(a)*3.2,color:0x8a8a8a})}for(let i=0;i<3;i++)P.push({geo:new THREE.CylinderGeometry(.5,.5,4,5),x,y:.5,z,color:0x6b4a2b,rx:Math.PI/2,rz:i*2.09});P.push({geo:new THREE.ConeGeometry(3.5,4,4),x:x+7,y:2,z,color:0xd05040,ry:Math.PI/4});P.push({geo:new THREE.ConeGeometry(3,3.5,4),x:x-7,y:1.75,z:z+2,color:0x4a7bd0,ry:Math.PI/4});addMerged(P);Mt(ICO(.6,0),new THREE.MeshBasicMaterial({color:0xff8c1a}),x,.5,z);Mt(ICO(.35,0),new THREE.MeshBasicMaterial({color:0xffd23f}),x,.8,z);addCol(x,0,z,2,1.2,2);addCol(x+7,0,z,6,4,6);addCol(x-7,0,z+2,5,3.5,5)}
function igloo(x,z){addMerged([{geo:new THREE.SphereGeometry(5.5,12,8,0,6.28,0,1.57),x,y:0,z,color:0xf0f8ff},{geo:BOX(1.8,2.6,.7),x,y:1.3,z:z+5.4,color:0x5a7a9a}]);addCol(x,0,z,10,5,10)}
function frozenLake(x,z,r){Mt(new THREE.CircleGeometry(r,32).rotateX(-1.5708),new THREE.MeshPhongMaterial({color:0xaee0ff,transparent:true,opacity:.85,shininess:90}),x,.08,z);const P=[];for(let i=0;i<10;i++){const a=Math.random()*6.28,rr=Math.random()*r*.85;P.push({geo:BOX(.3,.03,3+Math.random()*4),x:x+Math.cos(a)*rr,y:.1,z:z+Math.sin(a)*rr,color:0xffffff,ry:Math.random()*6.28})}addMerged(P)}
function dock(x,z,len,wid){const P=[];P.push({geo:BOX(wid,.4,len),x,y:.5,z:z+len/2,color:0x8b5a2b});for(let i=0;i<len;i+=3){P.push({geo:BOX(.4,3,.4),x:x+wid/2-.4,y:.5,z:z+i,color:0x8b5a2b});P.push({geo:BOX(.4,3,.4),x:x-wid/2+.4,y:.5,z:z+i,color:0x8b5a2b})}P.push({geo:BOX(.3,1.8,.3),x:x-wid/2+.4,y:1.6,z:z+len,color:0x8b5a2b});P.push({geo:BOX(.3,1.8,.3),x:x+wid/2-.4,y:1.6,z:z+len,color:0x8b5a2b});addMerged(P);addCol(x,.3,z+len/2,wid,.5,len)}
function lamp(x,z){addMerged([{geo:new THREE.CylinderGeometry(.25,.35,10,6),x,y:5,z,color:0x2a2a2a},{geo:BOX(1.8,.4,1.8),x,y:10.2,z,color:0x2a2a2a}]);Mt(ICO(.7,1),new THREE.MeshBasicMaterial({color:0xffe27a}),x,10,z);addCol(x,0,z,.8,10,.8)}
function fountain(x,z,r){r=r||3;addMerged([{geo:new THREE.CylinderGeometry(r,r+.3,.8,16),x,y:.4,z,color:0xa8a8a0},{geo:new THREE.CylinderGeometry(r-.5,r-.5,.4,16),x,y:.8,z,color:0x5a7a9a},{geo:new THREE.CylinderGeometry(.6,.9,2,8),x,y:2,z,color:0xa8a8a0},{geo:new THREE.CylinderGeometry(1.3,1.3,.3,12),x,y:3,z,color:0xa8a8a0},{geo:ICO(.7,1),x,y:3.6,z,color:0x7fd0ff}]);addCol(x,0,z,r*2,.9,r*2);const parts=[];for(let i=0;i<10;i++){const drop=new THREE.Mesh(ICO(.13,0),new THREE.MeshBasicMaterial({color:0x9ee0ff,transparent:true,opacity:.9}));world.add(drop);parts.push({m:drop,baseAng:(i/10)*6.28,t:Math.random()})}FOUNTAINS.push({parts,x,z,topY:3.6})}
function gazebo(x,z){const P=[];for(let i=0;i<6;i++){const a=i/6*6.28;P.push({geo:new THREE.CylinderGeometry(.25,.3,4,6),x:x+Math.cos(a)*3,y:2,z:z+Math.sin(a)*3,color:0xf0e6d0})}P.push({geo:new THREE.ConeGeometry(4.5,2,6),x,y:5,z,color:0xa04030});P.push({geo:new THREE.CylinderGeometry(3.5,3.5,.3,6),x,y:.15,z,color:0xc8b088});addMerged(P);addCol(x,0,z,6.5,4,6.5)}
function statue(x,z){addMerged([{geo:BOX(3,.6,3),x,y:.3,z,color:0x8a8a8a},{geo:BOX(2.4,1,2.4),x,y:1.1,z,color:0x9a9a9a},{geo:new THREE.SphereGeometry(.9,10,8),x,y:2.4,z,color:0xffd23f},{geo:new THREE.SphereGeometry(.7,8,6),x,y:3.3,z,color:0xffd23f}]);addCol(x,0,z,3,3,3)}
function windmill(x,z){addMerged([{geo:new THREE.CylinderGeometry(2.5,3.5,8,12),x,y:4,z,color:0xf0e6d0},{geo:new THREE.ConeGeometry(4,3,8),x,y:9.5,z,color:0x8b3030},{geo:new THREE.CylinderGeometry(.4,.4,6,6),x:x+3.5,y:8,z,color:0x5a3a1a},{geo:BOX(2,1.2,.15),x:x+3.5,y:7.5,z:z+.3,color:0x5a3a1a}]);const g=new THREE.Group();g.position.set(x+3.5,8,z+.9);const mkBlade=()=>{const b=new THREE.Mesh(BOX(.7,7,.4),LM(0xf0e6d0,{shininess:10}));if(R.shadowMap.enabled)b.castShadow=true;return b};const b1=mkBlade(),b2=mkBlade(),b3=mkBlade(),b4=mkBlade();b2.rotation.z=Math.PI/2;b3.rotation.z=Math.PI;b4.rotation.z=-Math.PI/2;g.add(b1,b2,b3,b4);world.add(g);WINDMILLS.push({g,t:Math.random()*6.28});addCol(x,0,z,7,8,7)}
function watertower(x,z){addMerged([{geo:BOX(.5,10,.5),x:x-1.8,y:5,z:z-1.8,color:0x8a8a8a},{geo:BOX(.5,10,.5),x:x+1.8,y:5,z:z-1.8,color:0x8a8a8a},{geo:BOX(.5,10,.5),x:x-1.8,y:5,z:z+1.8,color:0x8a8a8a},{geo:BOX(.5,10,.5),x:x+1.8,y:5,z:z+1.8,color:0x8a8a8a},{geo:BOX(4.5,.6,4.5),x,y:10,z,color:0x8a8a8a},{geo:new THREE.CylinderGeometry(2.5,2.5,4,12),x,y:12.5,z,color:0xb0b0b0},{geo:new THREE.ConeGeometry(3,1.5,12),x,y:15.5,z,color:0x5a3a1a}]);addCol(x-1.8,0,z-1.8,.8,10,.8);addCol(x+1.8,0,z-1.8,.8,10,.8);addCol(x-1.8,0,z+1.8,.8,10,.8);addCol(x+1.8,0,z+1.8,.8,10,.8)}
function flagpole(x,z){addMerged([{geo:new THREE.CylinderGeometry(.15,.15,14,6),x,y:7,z,color:0x8a8a8a},{geo:new THREE.SphereGeometry(.4,8,6),x,y:14,z,color:0xffd23f}]);const g=new THREE.Group();g.position.set(x,13,z);const flag=new THREE.Mesh(BOX(3,1.8,.08),new THREE.MeshBasicMaterial({color:0xff5d5d,side:THREE.DoubleSide}));if(R.shadowMap.enabled)flag.castShadow=true;flag.position.x=1.5;g.add(flag);world.add(g);FLAGPOLES.push({g,t:Math.random()*6.28});addCol(x,0,z,.4,14,.4)}
function pond(x,z,r){r=r||6;Mt(new THREE.CircleGeometry(r,32).rotateX(-1.5708),new THREE.MeshPhongMaterial({color:0x3aa0d0,transparent:true,opacity:.85,shininess:90}),x,.06,z);Mt(new THREE.TorusGeometry(r,.5,4,32).rotateX(1.5708),LM(0x7a7a6a),x,.2,z);const lily=new THREE.CircleGeometry(.6,8).rotateX(-1.5708);for(let i=0;i<6;i++){const a=Math.random()*6.28,d=Math.random()*r*.7;Mt(lily,new THREE.MeshPhongMaterial({color:0x3aa84a,shininess:20}),x+Math.cos(a)*d,.1,z+Math.sin(a)*d)}for(let i=0;i<10;i++){const a=Math.random()*6.28;const px=x+Math.cos(a)*(r+.8),pz=z+Math.sin(a)*(r+.8);Mt(new THREE.ConeGeometry(.12,1.6,4),LM(0x5a7a3a),px,.8,pz)}}
function rockFormation(x,z){const P=[];const n=5+Math.floor(Math.random()*3);for(let i=0;i<n;i++){const a=Math.random()*6.28,d=Math.random()*2;const s=.8+Math.random()*1.5;P.push({geo:new THREE.DodecahedronGeometry(s,0),x:x+Math.cos(a)*d,y:s*.5,z:z+Math.sin(a)*d,color:[0x7a7a72,0x8a8a82,0x6a6a62][i%3]})}addMerged(P);addCol(x,0,z,4,2.5,4)}
function flowerbed(x,z,r){r=r||3;Mt(new THREE.CylinderGeometry(r,r,.4,16),LM(0x8a7a5a),x,.2,z);Mt(new THREE.CylinderGeometry(r-.5,r-.5,.3,16),LM(0x4a3020),x,.5,z);const cols=[0xff6688,0xffee55,0xffffff,0xb05dff,0xff8c1a];for(let i=0;i<18;i++){const a=Math.random()*6.28,d=Math.random()*(r-.6);const c=cols[(Math.random()*cols.length)|0];const fx=x+Math.cos(a)*d,fz=z+Math.sin(a)*d;Mt(new THREE.CylinderGeometry(.05,.05,.4,4),LM(0x3a7a2f),fx,.7,fz);Mt(ICO(.18,0),LM(c,{shininess:30}),fx,.95,fz)}}
function fence(x1,z1,x2,z2){const P=[];const dx=x2-x1,dz=z2-z1;const len=Math.hypot(dx,dz);const n=Math.max(2,Math.floor(len/2));const rot=Math.atan2(dx,dz);for(let i=0;i<=n;i++){const t=i/n;P.push({geo:BOX(.2,1.5,.2),x:x1+dx*t,y:.75,z:z1+dz*t,color:0x8b5a2b})}for(let y=0.5;y<=1.2;y+=0.5){P.push({geo:BOX(.1,.1,len),x:(x1+x2)/2,y,z:(z1+z2)/2,color:0x6b4a2b,ry:rot})}addMerged(P)}
function crates(x,z){const s=1.2;addMerged([{geo:BOX(s,s,s),x,y:s/2,z,color:0xa07040},{geo:BOX(s,s,s),x:x+s,y:s/2,z:z+s*.5,color:0xb08050},{geo:BOX(s,s,s),x,y:s*1.5,z,color:0x906030},{geo:BOX(s,s,s),x:x-s*.7,y:s/2,z:z-s*.5,color:0xa07040}]);addCol(x,0,z,s*2.4,s*2.5,s*2.4)}
function barn(x,z){const w=10,h=7,d=8;addMerged([{geo:BOX(w,h,d),x,y:h/2,z,color:0xa04030},{geo:BOX(w+.3,.4,d+.3),x,y:.2,z,color:0x5a3a1a},{geo:BOX(3.5,4,.2),x,y:2.5,z:z+d/2+.1,color:0x8b5a2b},{geo:new THREE.ConeGeometry(w*.7,4,4),x,y:h+2,z,color:0x8b3030,ry:Math.PI/4},{geo:new THREE.CylinderGeometry(2,2.5,8,12),x:x+w/2+3,y:4,z:z+d/2-2,color:0xc8c0a8},{geo:new THREE.ConeGeometry(2.5,2.5,12),x:x+w/2+3,y:9.2,z:z+d/2-2,color:0x8b3030}]);Mt(BOX(.15,4,1.2),new THREE.MeshBasicMaterial({color:0xffffff}),x-w/2-.1,3.5,z);Mt(BOX(.15,1.2,4),new THREE.MeshBasicMaterial({color:0xffffff}),x-w/2-.1,3.5,z);addCol(x,0,z,w,h,d,{});addCol(x+w/2+3,0,z+d/2-2,5,8,5)}
function haystack(x,z){const P=[];for(let i=0;i<3;i++){const y=i*1.2+.6,r=2.5-i*.5;P.push({geo:new THREE.CylinderGeometry(r,r,.5,12),x,y,z,color:0xd4a848});P.push({geo:new THREE.CylinderGeometry(r-.3,r-.3,.6,12),x,y:.6,z,color:0xc09840})}P.push({geo:new THREE.ConeGeometry(1.2,1.5,12),x,y:4.35,z,color:0xd4a848});addMerged(P);for(let i=0;i<8;i++){const a=Math.random()*6.28,d=2.5+Math.random()*1;Mt(new THREE.ConeGeometry(.1,.8,3),LM(0xd4a848),x+Math.cos(a)*d,.4,z+Math.sin(a)*d)}addCol(x,0,z,5,4.5,5)}
function cart(x,z,rot){rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];const P=[];const p1=T(0,0);P.push({geo:BOX(4,1.2,2.5),x:p1[0],y:1.8,z:p1[1],color:0x8b5a2b,ry:rot});P.push({geo:BOX(3.6,.15,2.1),x:p1[0],y:2.4,z:p1[1],color:0x6b4a2b,ry:rot});[[-1.4,-1.3],[1.4,-1.3],[-1.4,1.3],[1.4,1.3]].forEach(([lx,lz])=>{const w=T(lx,lz);P.push({geo:new THREE.CylinderGeometry(.7,.7,.3,10),x:w[0],y:.7,z:w[1],color:0x3a2a1a,rz:Math.PI/2,ry:rot})});const h1=T(-2.4,0);P.push({geo:BOX(2.5,.2,.2),x:h1[0],y:2.4,z:h1[1],color:0x8b5a2b,ry:rot});addMerged(P);addCol(x,0,z,4.5,2.5,3)}
function barrels(x,z){const P=[];[[0,0],[1.4,.8],[-1.2,.5],[.3,-1.4],[1.5,-1]].forEach(([ox,oz],i)=>{const bx=x+ox,bz=z+oz;P.push({geo:new THREE.CylinderGeometry(.6,.65,1.4,10),x:bx,y:.7,z:bz,color:i%2?0x8b5a2b:0x7a4a1b});P.push({geo:new THREE.CylinderGeometry(.68,.68,.15,10),x:bx,y:.7,z:bz,color:0x3a2a1a});P.push({geo:new THREE.CylinderGeometry(.68,.68,.15,10),x:bx,y:1.3,z:bz,color:0x3a2a1a})});addMerged(P);addCol(x,0,z,4,1.5,4)}
function signpost(x,z){addMerged([{geo:new THREE.CylinderGeometry(.15,.18,5,6),x,y:2.5,z,color:0x8b5a2b},{geo:new THREE.SphereGeometry(.25,8,6),x,y:5,z,color:0xffd23f}]);[0.3,2.4,4.1].forEach((a,i)=>{const g=new THREE.Group();g.position.set(x,3.5-i*.7,z);g.rotation.y=a;const sign=new THREE.Mesh(BOX(1.8,.5,.06),LM([0xf0e6d0,0xffd23f,0xff5d5d][i]));if(R.shadowMap.enabled)sign.castShadow=true;sign.position.x=.9;const tip=new THREE.Mesh(new THREE.ConeGeometry(.25,.5,4).rotateZ(-Math.PI/2),LM([0xf0e6d0,0xffd23f,0xff5d5d][i]));if(R.shadowMap.enabled)tip.castShadow=true;tip.position.x=1.95;g.add(sign,tip);world.add(g)});addCol(x,0,z,.5,5,.5)}
function hotAirBalloon(x,z){const g=new THREE.Group();g.position.set(x,0,z);const mkShadowMesh=(mesh)=>{if(R.shadowMap.enabled)mesh.castShadow=true;return mesh};const env=mkShadowMesh(new THREE.Mesh(new THREE.SphereGeometry(4,16,12),LM(0xff5d5d)));env.scale.set(1,1.2,1);env.position.y=20;g.add(env);[0,1,2,3].forEach(i=>{const stripe=mkShadowMesh(new THREE.Mesh(new THREE.SphereGeometry(4.05,16,12,0,0.3,i*Math.PI/2),LM([0xffd23f,0xffffff,0x3d8bff,0xffd23f][i])));stripe.scale.set(1,1.2,1);stripe.position.y=20;g.add(stripe)});const basket=mkShadowMesh(new THREE.Mesh(BOX(2.4,1.8,2.4),LM(0x8b5a2b)));basket.position.y=12;g.add(basket);const beam1=mkShadowMesh(new THREE.Mesh(BOX(2.5,.1,2.5),LM(0x5a3a1a)));beam1.position.y=12.9;g.add(beam1);for(let i=0;i<4;i++){const a=i/4*6.28;const rope=mkShadowMesh(new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,5,4),LM(0x5a3a1a)));rope.position.set(Math.cos(a)*1.1,15.5,Math.sin(a)*1.1);g.add(rope)}const flame=new THREE.Mesh(new THREE.ConeGeometry(.5,1.2,6),new THREE.MeshBasicMaterial({color:0xff8c1a,transparent:true,opacity:.9}));flame.position.y=13.5;g.add(flame);world.add(g);const b={g,x,z,y:0,vx:0,vz:0,vy:0,flame,t:Math.random()*6.28,rider:null,smokeT:0};BALLOONS.push(b);return b}
function campfire(x,z){const P=[];for(let i=0;i<6;i++){const a=i/6*6.28;P.push({geo:new THREE.CylinderGeometry(.15,.15,1.4,5),x:x+Math.cos(a)*.7,y:.5,z:z+Math.sin(a)*.7,color:0x5a3a1a,rx:Math.PI/2.3,ry:a})}for(let i=0;i<8;i++){const a=i/8*6.28;P.push({geo:new THREE.DodecahedronGeometry(.3,0),x:x+Math.cos(a)*1.2,y:.15,z:z+Math.sin(a)*1.2,color:0x5a5a52})}addMerged(P);const f1=new THREE.Mesh(new THREE.ConeGeometry(.6,1.4,6),new THREE.MeshBasicMaterial({color:0xff5d1a,transparent:true,opacity:.85}));f1.position.set(x,1,z);const f2=new THREE.Mesh(new THREE.ConeGeometry(.4,1,6),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.9}));f2.position.set(x,1.2,z);world.add(f1,f2);FOUNTAINS.push({parts:[{m:f1,baseAng:0,t:0,isFlame:true},{m:f2,baseAng:1,t:.5,isFlame:true}],x,z,topY:1});addCol(x,0,z,3,.6,3)}
function totem(x,z){addMerged([{geo:new THREE.CylinderGeometry(1.2,1.4,.5,8),x,y:.25,z,color:0x6a5a4a},{geo:new THREE.BoxGeometry(2,3,2),x,y:2,z,color:0xa07040},{geo:new THREE.BoxGeometry(1.8,2.5,1.8),x,y:4.5,z,color:0x8b5a2b},{geo:new THREE.BoxGeometry(2,2.5,2),x,y:6.8,z,color:0xa07040}]);for(let i=0;i<3;i++){const y=1.5+i*2.3;Mt(BOX(.3,.3,.15),new THREE.MeshBasicMaterial({color:0x0e1a3a}),x-.5,y,z+1.05);Mt(BOX(.3,.3,.15),new THREE.MeshBasicMaterial({color:0x0e1a3a}),x+.5,y,z+1.05);Mt(BOX(1.2,.15,.15),new THREE.MeshBasicMaterial({color:0x0e1a3a}),x,y-.6,z+1.05)}Mt(new THREE.ConeGeometry(.8,3,4).rotateZ(Math.PI/2),LM(0xffd23f),x-2.5,7,z);Mt(new THREE.ConeGeometry(.8,3,4).rotateZ(-Math.PI/2),LM(0xffd23f),x+2.5,7,z);addCol(x,0,z,2.4,8,2.4)}
function archway(x,z,rot){rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];const P=[];const p1=T(-3,0),p2=T(3,0);P.push({geo:BOX(.8,7,.8),x:p1[0],y:3.5,z:p1[1],color:0x8a8a82});P.push({geo:BOX(.8,7,.8),x:p2[0],y:3.5,z:p2[1],color:0x8a8a82});P.push({geo:BOX(7,.8,.8),x,y:7,z,color:0x9a9a92,ry:rot});P.push({geo:BOX(8,.4,.4),x,y:6.6,z,color:0x8a8a82,ry:rot});P.push({geo:new THREE.TorusGeometry(1,.15,4,16),x,y:8.2,z,color:0xffd23f,ry:rot});addMerged(P);addCol(x-3,0,z,.8,7,.8);addCol(x+3,0,z,.8,7,.8)}
function marketStall(x,z,rot){rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];const P=[];P.push({geo:BOX(4,1.8,2),x,y:.9,z,color:0x8b5a2b,ry:rot});P.push({geo:BOX(4.2,.15,2.2),x,y:1.9,z,color:0xa07040,ry:rot});[[-1.8,-.8],[1.8,-.8],[-1.8,.8],[1.8,.8]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:new THREE.CylinderGeometry(.1,.1,3.5,6),x:p[0],y:3.5,z:p[1],color:0x5a3a1a})});P.push({geo:new THREE.ConeGeometry(3.5,1.2,4),x,y:5.5,z,color:0xff5d5d,ry:rot+Math.PI/4});for(let i=0;i<5;i++){const a=Math.random()*6.28,d=Math.random()*1.2;const px=T(d*Math.cos(a),d*Math.sin(a));P.push({geo:ICO(.2,0),x:px[0],y:2.1,z:px[1],color:[0xff6688,0xffee55,0xff8c1a,0xb05dff,0x3fbf5f][i]})}addMerged(P);addCol(x,0,z,4.5,2,2.5)}

function stonewall(x1,z1,x2,z2){
  const P=[];const dx=x2-x1,dz=z2-z1;const len=Math.hypot(dx,dz);const n=Math.max(2,Math.floor(len/1.2));const rot=Math.atan2(dx,dz);
  for(let i=0;i<=n;i++){const t=i/n;const px=x1+dx*t,pz=z1+dz*t;
    P.push({geo:BOX(.8,.55,.8),x:px,y:.3,z:pz,color:i%2?0x7a7a72:0x8a8a82,ry:rot});
    P.push({geo:BOX(.85,.5,.85),x:px,y:.85,z:pz,color:i%2?0x8a8a82:0x7a7a72,ry:rot});
    P.push({geo:BOX(.75,.45,.75),x:px+(i%2?.15:-.15),y:1.35,z:pz,color:i%3?0x6a6a62:0x8a8a82,ry:rot});
  }
  addMerged(P);
  for(let i=0;i<=n;i+=2){const t=i/n;addCol(x1+dx*t,0,z1+dz*t,1.2,2,1.2)}
}
function waterwheel(x,z){
  addMerged([
    {geo:BOX(.6,3,.6),x:x-2,y:1.5,z,color:0x5a3a1a},
    {geo:BOX(.6,3,.6),x:x+2,y:1.5,z,color:0x5a3a1a},
    {geo:BOX(4.5,.5,.5),x,y:3,z,color:0x5a3a1a}
  ]);
  const g=new THREE.Group();g.position.set(x,2,z);
  const ring1=new THREE.Mesh(new THREE.TorusGeometry(1.8,.25,6,16),LM(0x8b5a2b));if(R.shadowMap.enabled)ring1.castShadow=true;g.add(ring1);
  for(let i=0;i<8;i++){const a=i/8*6.28;const spoke=new THREE.Mesh(BOX(.15,3.4,.15),LM(0x6b4a2b));spoke.rotation.z=a;if(R.shadowMap.enabled)spoke.castShadow=true;g.add(spoke)}
  for(let i=0;i<8;i++){const a=i/8*6.28;const p=new THREE.Mesh(BOX(.4,.6,.6),LM(0x7a4a1b));p.position.set(Math.cos(a)*1.8,Math.sin(a)*1.8,0);if(R.shadowMap.enabled)p.castShadow=true;g.add(p)}
  g.rotation.y=Math.PI/2;world.add(g);
  WATERWHEELS.push({g,t:Math.random()*6.28});
  addCol(x-2,0,z,.8,3,.8);addCol(x+2,0,z,.8,3,.8);
}
function woodenBridge(x,z,rot){
  rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);
  const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];
  const P=[];const len=14,wid=5;
  for(let i=0;i<14;i++){
    const t=i/13;const py=Math.sin(t*Math.PI)*.8;
    const p=T(0,-len/2+t*len);
    P.push({geo:BOX(wid,.2,len/14+.05),x:p[0],y:.6+py,z:p[1],color:0x8b5a2b,ry:rot});
  }
  [-wid/2,wid/2].forEach(xr=>{
    for(let i=0;i<=6;i++){const t=i/6;const py=Math.sin(t*Math.PI)*.8;const p=T(xr,-len/2+t*len);P.push({geo:BOX(.3,2.5,.3),x:p[0],y:1.5+py,z:p[1],color:0x5a3a1a})}
    for(let i=0;i<=12;i++){const t=i/12;const py=Math.sin(t*Math.PI)*.8;const p=T(xr,-len/2+t*len);P.push({geo:BOX(.15,.15,len/12+.1),x:p[0],y:2.2+py,z:p[1],color:0x6b4a2b,ry:rot})}
  });
  addMerged(P);
  addCol(x,0,z,wid,.5,len);
}
function ruinPillar(x,z){
  const P=[];
  P.push({geo:new THREE.CylinderGeometry(1.4,1.6,.5,8),x,y:.25,z,color:0x9a9a8a});
  P.push({geo:new THREE.CylinderGeometry(1,1.1,4+Math.random()*2,8),x,y:2.5,z,color:0x9a9a8a});
  if(Math.random()<.6)P.push({geo:new THREE.CylinderGeometry(1.2,1,.4,8),x,y:5.2,z,color:0x9a9a8a});
  P.push({geo:BOX(.3,.3,.1),x:x+.9,y:3,z:z+.6,color:0x6a6a5a});
  P.push({geo:BOX(.2,.4,.1),x:x-.8,y:2,z:z-.5,color:0x6a6a5a});
  addMerged(P);
  addCol(x,0,z,3,5,3);
}
function bellTower(x,z){
  addMerged([
    {geo:BOX(4,1,4),x,y:.5,z,color:0x8a8a82},
    {geo:BOX(3,1,3),x,y:1.5,z,color:0x9a9a92},
    {geo:BOX(2.5,8,2.5),x,y:6,z,color:0xa8a8a0},
    {geo:BOX(3.5,.4,3.5),x,y:10.2,z,color:0x8a8a82},
    {geo:new THREE.ConeGeometry(3,2.5,4),x,y:11.7,z,color:0xa04030,ry:Math.PI/4},
    {geo:BOX(.4,.4,2.5),x,y:10,z,color:0x5a3a1a}
  ]);
  const g=new THREE.Group();g.position.set(x,10,z);
  const bell=new THREE.Mesh(new THREE.ConeGeometry(.9,1.4,10),LM(0xffd23f,{shininess:60}));
  if(R.shadowMap.enabled)bell.castShadow=true;
  bell.position.y=-.9;g.add(bell);
  const clapper=new THREE.Mesh(ICO(.2,0),LM(0x8b5a2b));clapper.position.y=-1.6;g.add(clapper);
  world.add(g);
  BELLS.push({g,t:Math.random()*6.28});
  addCol(x,0,z,4,10,4);
}
function picnicTable(x,z,rot){
  rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);
  const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];
  const P=[];
  const p1=T(0,0);P.push({geo:BOX(4,.2,1.6),x:p1[0],y:1.2,z:p1[1],color:0x8b5a2b,ry:rot});
  [[-2.2,0],[2.2,0]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(2,.15,1),x:p[0],y:.7,z:p[1],color:0x8b5a2b,ry:rot})});
  [[-1.5,-.6],[1.5,-.6],[-1.5,.6],[1.5,.6]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(.2,1.3,.2),x:p[0],y:.65,z:p[1],color:0x6b4a2b,ry:rot})});
  [[-2.2,-.4],[2.2,-.4],[-2.2,.4],[2.2,.4]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(.15,.8,.15),x:p[0],y:.4,z:p[1],color:0x6b4a2b,ry:rot})});
  addMerged(P);
  addCol(x,0,z,4.5,1.5,2);
}
function boat(x,z,rot){
  rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);
  const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];
  const P=[];
  P.push({geo:BOX(2,.6,4),x,y:.4,z,color:0x8b5a2b,ry:rot});
  P.push({geo:BOX(2.2,.3,4.2),x,y:.1,z,color:0x5a3a1a,ry:rot});
  const bow1=T(0,-2);const bow2=T(0,2);
  P.push({geo:new THREE.ConeGeometry(.8,1,4),x:bow1[0],y:.5,z:bow1[1],color:0x8b5a2b,ry:rot+Math.PI/4});
  P.push({geo:new THREE.ConeGeometry(.8,1,4),x:bow2[0],y:.5,z:bow2[1],color:0x8b5a2b,ry:rot-Math.PI/4});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(1.8,.15,.4),x:p[0],y:.75,z:p[1],color:0xa07040,ry:rot})});
  const mastP=T(0,0);P.push({geo:new THREE.CylinderGeometry(.08,.1,3,6),x:mastP[0],y:2.2,z:mastP[1],color:0x5a3a1a});
  const oarP=T(1.2,0);P.push({geo:new THREE.CylinderGeometry(.1,.1,3,5),x:oarP[0],y:.5,z:oarP[1],color:0x6b4a2b,rx:Math.PI/2,ry:rot});
  addMerged(P);
  const g=new THREE.Group();g.position.set(mastP[0],2.5,mastP[1]);g.rotation.y=rot;
  const sail=new THREE.Mesh(new THREE.PlaneGeometry(1.8,2),new THREE.MeshBasicMaterial({color:0xf0e6d0,side:THREE.DoubleSide}));
  if(R.shadowMap.enabled)sail.castShadow=true;
  sail.position.x=.9;g.add(sail);world.add(g);
  addCol(x,0,z,2.5,1,4.5);
}
function beachHut(x,z,rot){
  rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);
  const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];
  const P=[];
  [[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(.2,3,.2),x:p[0],y:1.5,z:p[1],color:0x8b5a2b,ry:rot})});
  P.push({geo:BOX(3.5,.2,3.5),x,y:.15,z,color:0xa07040,ry:rot});
  P.push({geo:new THREE.ConeGeometry(3,2,4),x,y:4,z,color:0xd4a848,ry:rot+Math.PI/4});
  P.push({geo:new THREE.ConeGeometry(3.2,.4,8),x,y:4.9,z,color:0xc09840,ry:rot});
  P.push({geo:BOX(3.6,.4,3.6),x,y:3,z,color:0xc09840,ry:rot});
  addMerged(P);
  addCol(x,0,z,3.5,3,3.5);
}
function beachUmbrella(x,z){
  addMerged([
    {geo:new THREE.CylinderGeometry(.08,.1,3,6),x,y:1.5,z,color:0x5a3a1a},
    {geo:new THREE.ConeGeometry(2.5,1,8),x,y:3.2,z,color:0xff5d5d},
    {geo:new THREE.ConeGeometry(2.5,1,8,0,6.28,0),x,y:3.3,z,color:0xffffff,ry:Math.PI/8}
  ]);
  Mt(BOX(1.8,.05,1),LM(0x3d8bff),x+.9,.12,z);
}
function logPile(x,z){
  const P=[];
  for(let row=0;row<3;row++){
    for(let i=0;i<5-row;i++){
      P.push({geo:new THREE.CylinderGeometry(.35,.35,3,8),x:x+(i-(4-row)/2)*.75,y:.35+row*.7,z,color:[0x8b5a2b,0x7a4a1b][row%2],rz:Math.PI/2});
    }
  }
  addMerged(P);
  addCol(x,0,z,4,2.5,1.5);
}
function statueGarden(x,z){
  const P=[];
  P.push({geo:new THREE.CylinderGeometry(4,4,.3,20),x,y:.15,z,color:0xa8a8a0});
  P.push({geo:new THREE.TorusGeometry(4,.3,4,20).rotateX(1.5708),x,y:.35,z,color:0x8a8a82});
  addMerged(P);
  for(let i=0;i<3;i++){
    const a=i/3*6.28;const sx=x+Math.cos(a)*2.4,sz=z+Math.sin(a)*2.4;
    addMerged([
      {geo:BOX(1,.4,1),x:sx,y:.5,z:sz,color:0x8a8a8a},
      {geo:new THREE.SphereGeometry(.35,8,6),x:sx,y:1.1,z:sz,color:0xc0c0b8},
      {geo:BOX(.6,.8,.4),x:sx,y:1.6,z:sz,color:0xc0c0b8}
    ]);
  }
  addCol(x,0,z,7,1,7);
}
function potShelf(x,z,rot){
  rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);
  const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];
  const P=[];
  [[-1,-.3],[1,-.3],[-1,.3],[1,.3]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(.1,2,.1),x:p[0],y:1,z:p[1],color:0x5a3a1a})});
  for(let y=0.5;y<=1.8;y+=0.65){P.push({geo:BOX(2.3,.1,.7),x,y,z,color:0x8b5a2b,ry:rot})}
  addMerged(P);
  for(let i=0;i<5;i++){
    const sx=Math.random()*2-1;const sz=(Math.random()-.5)*.4;
    const sy=[0.7,1.35,2][i%3];const p=T(sx,sz);
    Mt(new THREE.CylinderGeometry(.15,.2,.3,8),LM([0xa07040,0xd05040,0xa8a8a0,0x8b5a2b][i%4]),p[0],sy,p[1]);
  }
  addCol(x,0,z,2.5,2,.8);
}
function lanternPost(x,z){
  addMerged([{geo:new THREE.CylinderGeometry(.15,.2,4.5,6),x,y:2.25,z,color:0x3a2a1a}]);
  const g=new THREE.Group();g.position.set(x,4.2,z);
  const box=new THREE.Mesh(BOX(.7,1,.7),LM(0x5a3a1a));g.add(box);
  const glass=new THREE.Mesh(BOX(.6,.8,.62),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.7}));g.add(glass);
  const top=new THREE.Mesh(new THREE.ConeGeometry(.55,.3,4),LM(0x3a2a1a));top.position.y=.65;top.rotation.y=Math.PI/4;g.add(top);
  world.add(g);
  LANTERNS.push({g,t:Math.random()*6.28});
  addCol(x,0,z,.5,4.5,.5);
}
function stoneCircle(x,z){
  const P=[];
  const r=7;const n=10;
  for(let i=0;i<n;i++){
    const a=i/n*6.28;
    const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
    const h=2.5+Math.random()*1.5;
    P.push({geo:BOX(.7,h,.7),x:px,y:h/2,z:pz,color:i%3?0x8a8a82:0x7a7a72,ry:Math.random()*.4});
    P.push({geo:BOX(.75,.3,.75),x:px,y:h+.1,z:pz,color:0x9a9a92,ry:Math.random()*.4});
    addCol(px,0,pz,1.2,h,1.2);
  }
  P.push({geo:BOX(2.5,.5,2.5),x,y:.25,z,color:0x8a8a82});
  P.push({geo:BOX(1.8,.8,1.8),x,y:.9,z,color:0x9a9a92});
  P.push({geo:ICO(.6,1),x,y:1.8,z,color:0x7fd0ff});
  addMerged(P);
  Mt(ICO(.6,1),new THREE.MeshBasicMaterial({color:0x7fd0ff,transparent:true,opacity:.7}),x,1.8,z);
  addCol(x,0,z,2.8,1,2.8);
}
function giantMushroom(x,z,r){
  r=r||1;
  addMerged([
    {geo:new THREE.CylinderGeometry(.5*r,.6*r,3*r,8),x,y:1.5*r,z,color:0xf0e6d0},
    {geo:new THREE.SphereGeometry(2*r,12,8,0,6.28,0,1.57),x,y:3*r,z,color:0xff5d5d},
    {geo:new THREE.SphereGeometry(.3*r,6,5),x:x+.8*r,y:3.6*r,z:z+.5*r,color:0xffffff},
    {geo:new THREE.SphereGeometry(.25*r,6,5),x:x-1.1*r,y:3.4*r,z:z-.3*r,color:0xffffff}
  ]);
  addCol(x,0,z,1.4*r,3.5*r,1.4*r);
}
function stumpLog(x,z){
  addMerged([
    {geo:new THREE.CylinderGeometry(.9,1.1,1.4,10),x,y:.7,z,color:0x5a3a1a},
    {geo:new THREE.CylinderGeometry(.9,.9,.15,10),x,y:1.5,z,color:0xa07040}
  ]);
  const g=new THREE.Group();g.position.set(x,1.6,z);g.rotation.y=Math.random()*6.28;
  const handle=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.2,5),LM(0x8b5a2b));handle.rotation.z=Math.PI/2.2;handle.position.x=.5;g.add(handle);
  const blade=new THREE.Mesh(BOX(.5,.35,.1),LM(0xc0c0b8));blade.position.x=1.05;g.add(blade);
  world.add(g);
  addCol(x,0,z,2,1.5,2);
}
function scarecrow(x,z){
  addMerged([
    {geo:new THREE.CylinderGeometry(.1,.1,3.5,6),x,y:1.75,z,color:0x8b5a2b},
    {geo:BOX(3,.15,.15),x,y:2.8,z,color:0x8b5a2b},
    {geo:BOX(1.6,1.4,.3),x,y:2.2,z,color:0xff8c1a},
    {geo:BOX(1.6,1.5,.3),x,y:2.2,z:z+.25,color:0xffd23f},
    {geo:new THREE.SphereGeometry(.5,10,8),x,y:3.4,z,color:0xd4a848},
    {geo:new THREE.ConeGeometry(.8,.8,6),x,y:4,z,color:0xa04030}
  ]);
  Mt(ICO(.08,0),new THREE.MeshBasicMaterial({color:0x0e1a3a}),x-.15,3.4,z+.45);
  Mt(ICO(.08,0),new THREE.MeshBasicMaterial({color:0x0e1a3a}),x+.15,3.4,z+.45);
  addCol(x,0,z,2,4,2);
}
function beehive(x,z){
  addMerged([
    {geo:new THREE.CylinderGeometry(.1,.1,2,6),x,y:1,z,color:0x5a3a1a},
    {geo:BOX(1.2,.15,1.2),x,y:.1,z,color:0x5a3a1a},
    {geo:new THREE.CylinderGeometry(.5,.5,.7,10),x,y:2.4,z,color:0xffd23f},
    {geo:new THREE.CylinderGeometry(.55,.55,.65,10),x,y:2.9,z,color:0xffc020},
    {geo:new THREE.CylinderGeometry(.45,.45,.55,10),x,y:3.35,z,color:0xffd23f}
  ]);
  for(let i=0;i<3;i++){
    const a=i/3*6.28;
    Mt(BOX(.15,.1,.1),new THREE.MeshBasicMaterial({color:0xffd23f}),x+Math.cos(a)*1.2,3.5,z+Math.sin(a)*1.2);
  }
  addCol(x,0,z,1,3,1);
}
function flowerArch(x,z,rot){
  rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);
  const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];
  const P=[];
  const p1=T(-3,0),p2=T(3,0);
  P.push({geo:BOX(.8,7,.8),x:p1[0],y:3.5,z:p1[1],color:0xe8e0d0});
  P.push({geo:BOX(.8,7,.8),x:p2[0],y:3.5,z:p2[1],color:0xe8e0d0});
  P.push({geo:new THREE.TorusGeometry(3.2,.5,8,20,Math.PI),x,y:7,z,color:0x3aa84a,ry:rot});
  addMerged(P);
  const cols=[0xff6688,0xffee55,0xffffff,0xb05dff,0xff8c1a];
  for(let i=0;i<20;i++){
    const a=Math.PI*(i/19);
    const lx=Math.cos(Math.PI-a)*3.2;
    const ly=Math.sin(a)*3.2;
    const p=T(lx,0);
    Mt(ICO(.25,0),LM(cols[i%cols.length],{shininess:30}),p[0],7+ly,p[1]);
  }
  addCol(x-3,0,z,.8,7,.8);addCol(x+3,0,z,.8,7,.8);
}
function wishingWell(x,z){
  addMerged([
    {geo:new THREE.CylinderGeometry(2,2.2,1.5,10),x,y:.75,z,color:0x8a8a82},
    {geo:new THREE.CylinderGeometry(1.7,1.7,.6,10),x,y:.5,z,color:0x2a6a9a},
    {geo:BOX(.3,4,.3),x:x-1.6,y:2,z:z-1.6,color:0x8b5a2b},
    {geo:BOX(.3,4,.3),x:x+1.6,y:2,z:z-1.6,color:0x8b5a2b},
    {geo:BOX(.3,4,.3),x:x-1.6,y:2,z:z+1.6,color:0x8b5a2b},
    {geo:BOX(.3,4,.3),x:x+1.6,y:2,z:z+1.6,color:0x8b5a2b},
    {geo:new THREE.ConeGeometry(3,1.8,4),x,y:5,z,color:0xa04030,ry:Math.PI/4}
  ]);
  Mt(ICO(.4,0),new THREE.MeshBasicMaterial({color:0xffd23f}),x,.8,z);
  addCol(x,0,z,4.5,2.5,4.5);
}
function garden(x,z,r){
  r=r||6;
  addMerged([
    {geo:new THREE.CylinderGeometry(r,r,.3,20),x,y:.15,z,color:0xc8b088}
  ]);
  for(let i=0;i<16;i++){
    const a=i/16*6.28;
    const px=x+Math.cos(a)*(r*.7), pz=z+Math.sin(a)*(r*.7);
    const cols=[0xff6688,0xffee55,0xffffff,0xb05dff,0xff8c1a];
    Mt(new THREE.CylinderGeometry(.06,.06,.6,4),LM(0x3a7a2f),px,.6,pz);
    Mt(ICO(.22,0),LM(cols[i%5],{shininess:30}),px,.95,pz);
  }
  addCol(x,0,z,r*2,.4,r*2);
}
function statueJello(x,z){
  addMerged([
    {geo:BOX(2.5,.6,2.5),x,y:.3,z,color:0x8a8a8a},
    {geo:BOX(1.8,.8,1.8),x,y:1,z,color:0x9a9a9a},
    {geo:new THREE.SphereGeometry(1,10,8),x,y:2.4,z,color:0xffd23f},
    {geo:new THREE.SphereGeometry(.7,8,6),x,y:3.5,z,color:0xff5d5d}
  ]);
  addCol(x,0,z,3,3,3);
}
function torch(x,z){
  addMerged([
    {geo:new THREE.CylinderGeometry(.15,.2,4,6),x,y:2,z,color:0x5a3a1a}
  ]);
  const fl=new THREE.Mesh(ICO(.4,0),new THREE.MeshBasicMaterial({color:0xff8c1a,transparent:true,opacity:.9}));
  fl.position.set(x,4.3,z); world.add(fl);
  const fl2=new THREE.Mesh(ICO(.25,0),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.95}));
  fl2.position.set(x,4.6,z); world.add(fl2);
  FOUNTAINS.push({parts:[{m:fl,baseAng:0,t:0,isFlame:true},{m:fl2,baseAng:1,t:.5,isFlame:true}],x,z,topY:4.3});
  addCol(x,0,z,.5,4,.5);
}

/* ══════════════════════════════════════════════════════════════════
   PAPAN MASUKAN — tiap map punya bentuk sendiri (kecuali balapan)
   Koordinat lokal papan: lx = kanan, ly = atas, lz = depan (arah hadap).
   Rumus dunia sama dengan rotation.y Three.js: x+c*lx+s*lz, z-s*lx+c*lz
   ══════════════════════════════════════════════════════════════════ */
const BOARDS=[];
const BOARD_PAL={
  island :{bg:'#f6e7b8',hd:'#2f8fb8',hf:'#fff3b0',tx:'#17506b',ac:'#d2661e',ring:0xffd23f},
  desert :{bg:'#ead29a',hd:'#8a5a1e',hf:'#ffd23f',tx:'#5a3410',ac:'#1f8f8a',ring:0xffd23f},
  jungle :{bg:'#d9e6b0',hd:'#2f6b2f',hf:'#e8ffb0',tx:'#1d4a1f',ac:'#c23a2e',ring:0xb6ff5a},
  snow   :{bg:'#eef7ff',hd:'#3b78b8',hf:'#ffffff',tx:'#17306b',ac:'#d63a3a',ring:0x9fe0ff},
  parkour:{bg:'#0a1030',hd:'#2a6aff',hf:'#e8f4ff',tx:'#bfe4ff',ac:'#ff5db1',ring:0x4adfff},
  boxing :{bg:'#1c1c26',hd:'#c22a2a',hf:'#ffd23f',tx:'#ffffff',ac:'#ffd23f',ring:0xff5a4a}
};
function feedbackBoard(x,z,rot,y,style){
  rot=rot||0;y=y||0;style=BOARD_PAL[style]?style:'island';
  const K=BOARD_PAL[style],c=Math.cos(rot),s=Math.sin(rot),P=[],ANIM=[],PY=style=='boxing'?3.6:3.2,PH=2.2;
  const W=(lx,lz)=>[x+c*lx+s*lz,z-s*lx+c*lz];
  const add=(geo,lx,ly,lz,color,ex)=>{const p=W(lx,lz);P.push(Object.assign({geo,x:p[0],y:y+ly,z:p[1],color,ry:rot},ex||{}))};
  const glow=(geo,lx,ly,lz,color,op)=>{const p=W(lx,lz);const m=Mt(geo,new THREE.MeshBasicMaterial({color,transparent:op!==undefined,opacity:op===undefined?1:op}),p[0],y+ly,p[1]);m.rotation.y=rot;return m};
  const post=(lx)=>{const p=W(lx,0);addCol(p[0],y,p[1],1.1,PY+1.5,1.1)};
  const slab=(w,h,d,ang)=>BOX(w,h,d).rotateX(ang);

  switch(style){
  case'island':{
    add(new THREE.CylinderGeometry(3.7,4.0,.18,10),0,.09,.2,0xe6cf93);
    [-1,1].forEach(k=>{
      add(new THREE.CylinderGeometry(.2,.27,4.7,6),k*2.55,2.35,0,0x8a6a42,{rz:k*.03});
      add(BOX(.55,.14,.55),k*2.55,4.72,0,0x5a3a1a);
    });
    [[2.55,0x9a6a3c],[3.2,0xb08050],[3.85,0xa8794a]].forEach(([ly,col])=>add(BOX(5.0,.7,.2),0,ly-.05,-.06,col));
    add(BOX(5.0,.16,.3),0,4.42,.02,0x5a3a1a);add(BOX(5.0,.16,.3),0,1.98,.02,0x5a3a1a);
    // pelampung di tiang kiri
    add(new THREE.TorusGeometry(.5,.17,6,12),-2.55,1.3,.4,0xe03a3a);
    [[.5,0],[-.5,0],[0,.5],[0,-.5]].forEach(([a,b])=>add(BOX(.26,.26,.38),-2.55+a,1.3+b,.4,0xffffff));
    // bendera kecil di tiang kanan
    add(new THREE.CylinderGeometry(.05,.05,1.3,4),2.55,5.35,0,0x6a4a2a);
    add(new THREE.ConeGeometry(.34,1.5,3).rotateZ(-Math.PI/2),3.3,5.7,0,0xff6a3a);
    // kerang & bintang laut
    add(ICO(.24,0),1.3,.28,1.3,0xff9ec4,{sy:.6});add(ICO(.2,0),-1.1,.26,1.7,0xffd27a,{sy:.55});add(ICO(.18,0),2.2,.25,1.0,0xf6f0e0,{sy:.6});
    break}
  case'desert':{
    add(BOX(6.2,.3,2.4),0,.15,0,0xc9a468);add(BOX(5.6,.3,1.9),0,.45,0,0xd6b078);
    [-1,1].forEach(k=>{
      add(BOX(.95,4.5,.95),k*2.55,2.7,0,0xd9b878);
      add(BOX(1.15,.28,1.15),k*2.55,.74,0,0xb8903f);add(BOX(1.15,.28,1.15),k*2.55,4.85,0,0xb8903f);
      add(BOX(.98,.16,.98),k*2.55,3.7,0,0x2aa5a0);
      add(new THREE.ConeGeometry(.78,.95,4),k*2.55,5.45,0,0xffd23f,{ry:rot+Math.PI/4});
    });
    add(BOX(4.9,2.6,.36),0,PY,0,0xcfa866);
    add(BOX(4.95,.24,.4),0,PY+1.2,0,0x2aa5a0);add(BOX(4.95,.2,.4),0,PY-1.2,0,0xffd23f);
    // matahari bersayap
    add(new THREE.CylinderGeometry(.55,.55,.16,10).rotateX(Math.PI/2),0,5.2,0,0xffd23f);
    add(new THREE.CylinderGeometry(.3,.3,.2,10).rotateX(Math.PI/2),0,5.2,0,0xff8c1a);
    [-1,1].forEach(k=>{add(BOX(1.1,.14,.14),k*1.0,5.3,0,0xffd23f);add(BOX(.9,.12,.14),k*1.0,5.1,0,0x2aa5a0)});
    // guci tanah liat
    [-1,1].forEach(k=>{add(new THREE.CylinderGeometry(.38,.3,.8,7),k*1.9,.85,1.0,0xb5532f);add(new THREE.CylinderGeometry(.2,.3,.2,7),k*1.9,1.35,1.0,0x8a3a1f)});
    break}
  case'jungle':{
    [-1,1].forEach(k=>{
      add(new THREE.CylinderGeometry(.3,.4,4.9,7),k*2.55,2.45,0,0x5a3a22,{rz:k*.05});
      add(ICO(.55,0),k*2.7,.25,.4,0x3f8a3a,{sy:.5});
    });
    // rangka bambu
    [2.0,4.4].forEach(ly=>add(new THREE.CylinderGeometry(.12,.12,5.3,6).rotateZ(Math.PI/2),0,ly,.05,0xc6b44a));
    [-1.7,-.57,.57,1.7].forEach(lx=>add(BOX(.07,2.4,.07),lx,PY,-.12,0x8a7a2a));
    add(BOX(4.7,2.4,.16),0,PY,-.08,0x6a5a22);
    // atap daun
    add(slab(5.8,.14,1.8,.5),0,5.05,.8,0x2f7a30);add(slab(5.8,.14,1.8,-.5),0,5.05,-.8,0x3a8d3a);
    add(new THREE.CylinderGeometry(.1,.1,5.8,5).rotateZ(Math.PI/2),0,5.42,0,0x234f23);
    // sulur menjuntai
    [-2.1,-1.85,1.85,2.1].forEach((lx,i)=>add(BOX(.07,.9+(i%2)*.5,.07),lx,4.35-(i%2)*.25,.45,0x2a6a2a));
    for(let i=-4;i<=4;i++)add(new THREE.ConeGeometry(.24,.75,4).rotateX(Math.PI),i*.7,4.62,1.62,i&1?0x2f7a30:0x3f9a3a,{sx:1.2,sz:.5});
    // daun besar & jamur
    add(ICO(.9,0),-3.3,.3,.7,0x2f8a3a,{sx:1.4,sy:.35,sz:.8});add(ICO(.9,0),3.3,.3,.9,0x3fa04a,{sx:1.3,sy:.35,sz:.8});
    [[1.6,1.1],[2.0,1.4]].forEach(([lx,lz],i)=>{add(new THREE.CylinderGeometry(.08,.1,.4,5),lx,.2,lz,0xf2ead0);add(ICO(.3,0),lx,.5,lz,i?0xe8b020:0xd03a2a,{sy:.6})});
    break}
  case'snow':{
    add(ICO(1.5,0),0,.1,.1,0xffffff,{sx:2.8,sy:.2,sz:1.1});
    [-1,1].forEach(k=>{
      add(BOX(.5,4.6,.5),k*2.55,2.3,0,0xb08a5a);
      add(ICO(.5,0),k*2.55,4.7,0,0xffffff,{sx:1.15,sy:.6,sz:1.15});
    });
    add(BOX(5.0,.2,.3),0,1.98,.02,0x8a6a3a);
    add(BOX(5.5,.42,.9),0,4.52,0,0xffffff);
    [-1.8,0,1.7].forEach((lx,i)=>add(ICO(.5,0),lx,4.85,0,0xffffff,{sx:1.2,sy:.6+i*.05,sz:.9}));
    [-2.0,-1.7,-1.4,1.4,1.7,2.0].forEach((lx,i)=>add(new THREE.ConeGeometry(.09,.38+((i&1)?.2:0),4).rotateX(Math.PI),lx,4.2,.34,0xbfe8ff));
    // manusia salju
    add(ICO(.55,0),3.7,.55,.7,0xffffff);add(ICO(.4,0),3.7,1.25,.7,0xffffff);add(ICO(.29,0),3.7,1.74,.7,0xffffff);
    add(new THREE.TorusGeometry(.3,.07,5,8).rotateX(Math.PI/2),3.7,1.5,.7,0xd63a3a);
    add(new THREE.ConeGeometry(.06,.36,4).rotateX(Math.PI/2),3.7,1.74,1.0,0xff8c1a);
    add(BOX(.07,.07,.05),3.58,1.84,.97,0x222222);add(BOX(.07,.07,.05),3.82,1.84,.97,0x222222);
    { const p=W(3.7,.7);addCol(p[0],y,p[1],1.0,1.9,1.0) }
    // lampu gantung
    add(BOX(.1,.1,.7),2.55,4.2,.35,0x4a3a2a);
    const lamp=glow(BOX(.36,.46,.36),2.55,3.85,.7,0xffd96a);
    ANIM.push(t=>{const f=1+Math.sin(t*9)*.05+Math.sin(t*23)*.03;lamp.scale.setScalar(f)});
    break}
  case'parkour':{
    add(new THREE.CylinderGeometry(3.7,4.0,.2,6),0,.1,.1,0x141c46);
    add(new THREE.CylinderGeometry(3.0,3.2,.1,6),0,.24,.1,0x1b2a66);
    const strips=[],crys=[];
    [-1,1].forEach(k=>{
      add(BOX(.42,4.3,.42),k*2.55,2.15,0,0x1b2a66);
      strips.push(glow(BOX(.1,3.7,.46),k*2.55,2.15,0,0x4adfff,.9));
      const cr=glow(new THREE.OctahedronGeometry(.34),k*2.55,4.9,0,0xff5db1);crys.push(cr);
    });
    add(BOX(4.7,2.3,.12),0,PY,-.06,0x0a1030);
    glow(BOX(4.8,.1,.14),0,PY+1.2,0,0x4adfff);glow(BOX(4.8,.1,.14),0,PY-1.2,0,0x4adfff);
    glow(BOX(.1,2.4,.14),-2.27,PY,.02,0xff5db1);glow(BOX(.1,2.4,.14),2.27,PY,.02,0xff5db1);
    const holo=glow(new THREE.TorusGeometry(.6,.05,6,20),0,5.2,0,0x4adfff,.85);
    ANIM.push(t=>{strips.forEach(m=>m.material.opacity=.7+Math.sin(t*3)*.25);crys.forEach((m,i)=>{m.rotation.y=t*1.6*(i?-1:1);m.position.y=y+4.9+Math.sin(t*2+i)*.12});holo.rotation.x=t*1.2;holo.rotation.y=rot+t*.8});
    break}
  case'boxing':{
    add(BOX(6.5,.12,2.3),0,.06,0,0xf0f0f0);add(BOX(6.0,.1,1.9),0,.17,0,0x2a4fb8);
    [-1,1].forEach(k=>{
      add(new THREE.CylinderGeometry(.22,.27,5.3,8),k*2.55,2.65,0,0x8a8f9a);
      add(new THREE.CylinderGeometry(.36,.36,1.5,8),k*2.55,1.4,0,0xd02a2a);
      add(new THREE.CylinderGeometry(.3,.3,.18,8),k*2.55,5.35,0,0x5a5f6a);
    });
    [[.9,0xf2f2f2],[1.4,0xd02a2a],[1.9,0x3a6aff]].forEach(([ly,col])=>add(new THREE.CylinderGeometry(.07,.07,5.1,6).rotateZ(Math.PI/2),0,ly,.05,col));
    add(BOX(4.7,2.3,.14),0,PY,-.05,0x0e0e16);
    [PY+1.2,PY-1.2].forEach(ly=>add(BOX(4.95,.16,.3),0,ly,0,0xffd23f));
    [-2.4,2.4].forEach(lx=>add(BOX(.16,2.5,.3),lx,PY,0,0xffd23f));
    // sepasang sarung tinju di atas
    [-1,1].forEach(k=>{
      add(ICO(.42,0),k*.65,PY+1.75,0,0xd02a2a,{sx:1,sy:.9,sz:1.1});
      add(ICO(.2,0),k*.65+k*.38,PY+1.65,.18,0xd02a2a);
      add(new THREE.CylinderGeometry(.26,.26,.3,7),k*.65,PY+1.42,0,0xf2f2f2);
    });
    break}
  }
  [-2.55,-1.3,0,1.3,2.55].forEach(post);
  addMerged(P);

  // papan teks (tekstur dibuat sesuai palet map)
  const texBoard=tex(256,128,(q,w,h)=>{
    q.fillStyle=K.bg;q.fillRect(0,0,w,h);
    q.fillStyle=K.hd;q.fillRect(0,0,w,22);
    q.fillStyle=K.hf;q.font='bold 14px monospace';q.textAlign='center';q.fillText('KOTAK MASUKAN',w/2,16);
    const ex=w/2-14,ey=30;
    q.fillStyle=K.tx;q.fillRect(ex,ey,28,20);q.fillStyle=K.bg;q.fillRect(ex+2,ey+2,24,16);
    q.fillStyle=K.ac;for(let i=0;i<12;i++){const dy=(i*.8)|0;q.fillRect(ex+2+i,ey+2+dy,2,2);q.fillRect(ex+24-i,ey+2+dy,2,2)}
    q.fillStyle=K.tx;q.font='bold 11px monospace';q.fillText('Dekati lalu tekan ACT',w/2,72);
    q.fillStyle=K.ac;q.font='9px monospace';q.fillText('Masukan tak berguna',w/2,98);q.fillText('bakal dihiraukan',w/2,111);
    q.strokeStyle=K.hd;q.lineWidth=3;q.strokeRect(1.5,1.5,w-3,h-3);
  },1,1);
  const fp=W(0,.24);
  const signMesh=Mt(new THREE.PlaneGeometry(4.4,PH),new THREE.MeshBasicMaterial({map:texBoard}),fp[0],y+PY,fp[1]);
  signMesh.rotation.y=rot;

  // efek bulat ACT di lantai, tepat di depan papan (tempat pemain berdiri)
  const ix=x+s*2.7,iz=z+c*2.7,mk=(a,b,col,op)=>Mt(new THREE.RingGeometry(a,b,32).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),ix,y+op,iz);
  const ring=mk(.8,1.15,K.ring,.14),ring2=mk(.5,.85,0xffffff,.16),ring3=mk(.35,.55,0xff8c1a,.18);

  BOARDS.push({x,z,y,rot,ix,iz,top:PY+PH/2+2.4,ring,ring2,ring3,anim:ANIM,t:Math.random()*6.28,active:false,style});
  return{x,z};
}

/* ══════════════════════════════════════════════════════════════════
   ACT — satu tombol untuk semua yang bisa diajak berinteraksi
   (papan masukan = MASUKAN, jelloger = BICARA). Serang monster tetap tombol HIT.
   ══════════════════════════════════════════════════════════════════ */
let nearBoard=null,actTarget=null,_actKey='';
const ACT_R_BOARD=4.4,ACT_R_JELLO=3.8;
function updateBoards(now){
  nearBoard=null;actTarget=null;
  const on=playing&&curMap!=='speedrace'&&pl&&!pl.balloon&&!(pl.koTimer>0);
  let bd=1e9;
  if(on){
    for(const b of BOARDS){
      const d=Math.min(Math.hypot(pl.x-b.ix,pl.z-b.iz),Math.hypot(pl.x-b.x,pl.z-b.z));
      if(d<ACT_R_BOARD&&d<bd){bd=d;nearBoard=b}
    }
    if(nearBoard)actTarget={type:'board',ref:nearBoard,x:nearBoard.x,y:nearBoard.y+nearBoard.top,z:nearBoard.z,label:'MASUKAN',name:''};
    let jd=Math.min(ACT_R_JELLO,bd);
    for(const j of JELLOGERS){
      const d=Math.hypot(pl.x-j.x,pl.z-j.z);
      if(d<jd){jd=d;actTarget={type:'jello',ref:j,x:j.x,y:(j.y||0)+5.4,z:j.z,label:'BICARA',name:j._jname||''}}
    }
  }
  for(const b of BOARDS){
    const isNear=b===nearBoard&&actTarget&&actTarget.ref===b;
    b.t+=0.02;
    const tgt=isNear?1:0,k=.12;
    b.ring.material.opacity+=(tgt*.75-b.ring.material.opacity)*k;
    b.ring2.material.opacity+=(tgt*.55-b.ring2.material.opacity)*k;
    b.ring3.material.opacity+=(tgt*.85-b.ring3.material.opacity)*k;
    b.ring.scale.setScalar(1+Math.sin(b.t*3)*.12);
    b.ring2.scale.setScalar(1+Math.sin(b.t*3+1)*.18);
    b.ring3.scale.setScalar(1+Math.sin(b.t*3+2)*.25);
    b.ring.rotation.y+=0.02;b.ring2.rotation.y-=0.015;b.ring3.rotation.y+=0.03;
    b.active=isNear;
    for(const f of b.anim)f(b.t);
  }
  const ab=$('act');
  if(ab){
    if(actTarget){
      const coarse=matchMedia('(pointer:coarse)').matches,hint=coarse?'TAP':(curMap=='boxing'?'TEKAN E':'E / KLIK');
      const key=actTarget.type+'|'+actTarget.name+'|'+hint;
      if(key!==_actKey){
        _actKey=key;
        $('actl').textContent=actTarget.label;$('actn').textContent=actTarget.name;$('actk').textContent=hint;
        ab.setAttribute('aria-label',actTarget.type=='board'?'Kirim masukan':'Bicara dengan '+(actTarget.name||'jelloger'));
      }
      ab.classList.add('show');
    }else ab.classList.remove('show');
  }
}

// Posisikan bubble ACT di layar tepat di atas target (proyeksi 3D -> 2D).
// Dipanggil dari frame() SETELAH kamera diposisikan, supaya bubble tidak telat satu frame.
const _actV=new THREE.Vector3();
function placeActBubble(){
  const ab=$('act');
  if(!ab||!actTarget||!ab.classList.contains('show'))return;
  cam.updateMatrixWorld();
  _actV.set(actTarget.x,actTarget.y,actTarget.z).project(cam);
  const W=innerWidth,H=innerHeight;
  let x=W/2,y=H*.36;
  if(_actV.z>-1&&_actV.z<1){x=(_actV.x*.5+.5)*W;y=(-_actV.y*.5+.5)*H}   // target di depan kamera
  x=Math.max(90,Math.min(W-195,x));                                     // minimap kanan-atas (~135px) tidak tertutup
  y=Math.max(175,Math.min(H-175,y));                                    // di bawah HP bar/toast, di atas bar emote & joystick
  ab.style.left=x+'px';ab.style.top=y+'px';
}

function talkTo(j){
  const line=j.lines[j.lineIdx%j.lines.length];
  j.lineIdx++;
  j.talkT=4;j.tr=Math.atan2(pl.x-j.x,pl.z-j.z);                         // jelloger berhenti & menoleh ke pemain
  for(let k=0;k<8;k++){const a=k/8*6.28;puff(j.x+Math.cos(a)*.6,j.z+Math.sin(a)*.6,1,'#ffd23f',2,1.5)}
  say(j,line);
  if(j.secret&&j.lineIdx===1)toast('Kamu menemukan jelloger rahasia: '+j._jname);
}

function openFeedback(){
  const fb=$('fb');
  if(!fb)return;
  $('fbn').textContent=cfg.name||'Pemain';
  $('fbi').value='';
  fb.classList.remove('hide');
  const btn=$('fbs');btn.disabled=false;btn.textContent='Kirim';
  setTimeout(()=>{try{$('fbi').focus()}catch(e){}},120);
}
function closeFeedback(){
  const fb=$('fb');if(fb)fb.classList.add('hide');
}
async function submitFeedback(){
  const msg=($('fbi').value||'').trim();
  if(!msg){toast('Tulis masukanmu dulu');return}
  if(msg.length<3){toast('Masukan terlalu pendek');return}
  if(!DISCORD_WEBHOOK){toast('Webhook Discord belum diatur di game.js');return}
  const name=cfg.name||'Pemain';
  const btn=$('fbs');btn.disabled=true;btn.textContent='Mengirim...';
  try{
    const res=await fetch(DISCORD_WEBHOOK,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        username:'Meet-UP Kotak Masukan',
        content:'**Dikirim oleh :** '+name+'\n**Masukan :** '+msg,
        allowed_mentions:{parse:[]}
      })
    });
    if(res.ok||res.status===204){
      toast('Masukan terkirim! Terima kasih ✨');
      if(nearBoard){
        for(let i=0;i<24;i++){
          const a=i/24*6.28;
          puff(nearBoard.x+Math.cos(a)*.9,nearBoard.z+Math.sin(a)*.9,1,['#ffd23f','#7fd0ff','#3fdc6a','#ff5db1'][i%4],5,1.5+Math.random()*2);
        }
      }
      ring(pl.x,pl.z,'#ffd23f',.2,1);
      closeFeedback();
    }else{
      toast('Gagal kirim (HTTP '+res.status+')');
    }
  }catch(e){
    console.error('[feedback]',e);
    toast('Gagal kirim: koneksi bermasalah');
  }
  btn.disabled=false;btn.textContent='Kirim';
}
function doAction(){
  if(!playing||!pl||curMap=='speedrace'||!actTarget)return;
  if(!$('fb').classList.contains('hide'))return;
  if(actTarget.type=='board')openFeedback();
  else talkTo(actTarget.ref);
}

function makeAnimal(type){
  const g=new THREE.Group();
  const col={cow:0xf0f0f0,sheep:0xffffff,chicken:0xffd23f,pig:0xffb0d0,horse:0x8b5a2b}[type];
  const darkCol={cow:0x1a1a1a,sheep:0xcccccc,chicken:0xff8c1a,pig:0xd080a0,horse:0x5a3a1a}[type];
  if(type==='cow'){
    const body=new THREE.Mesh(BOX(2,1.2,1.1),LM(col));body.position.y=1.3;g.add(body);
    for(let i=0;i<4;i++){const s=new THREE.Mesh(BOX(.5,.5,.05),LM(0x1a1a1a));s.position.set(Math.random()*1.5-.75,1.3+Math.random()*.5-.25,.55);g.add(s);const s2=s.clone();s2.position.z=-.55;g.add(s2)}
    const head=new THREE.Mesh(BOX(.7,.7,.7),LM(col));head.position.set(1.2,1.7,0);g.add(head);
    const horn1=new THREE.Mesh(new THREE.ConeGeometry(.1,.3,4),LM(0x8b5a2b));horn1.position.set(1.5,2.1,.2);horn1.rotation.z=-.4;g.add(horn1);
    const horn2=horn1.clone();horn2.position.z=-.2;g.add(horn2);
    [-.6,.6].forEach(x=>[-.4,.4].forEach(z=>{const leg=new THREE.Mesh(BOX(.25,.9,.25),LM(darkCol));leg.position.set(x,.45,z);leg.userData.leg=true;g.add(leg)}));
  } else if(type==='sheep'){
    const body=new THREE.Mesh(ICO(.9,1),LM(col));body.position.y=1.2;body.scale.set(1.3,.9,.9);g.add(body);
    for(let i=0;i<5;i++){const f=new THREE.Mesh(ICO(.4,0),LM(col));f.position.set((Math.random()-.5)*1.5,1.2+(Math.random()-.5)*.4,(Math.random()-.5)*.6);g.add(f)}
    const head=new THREE.Mesh(ICO(.4,0),LM(0x3a3a3a));head.position.set(1,1.4,0);g.add(head);
    [-.55,.55].forEach(x=>[-.3,.3].forEach(z=>{const leg=new THREE.Mesh(BOX(.18,.7,.18),LM(0x3a3a3a));leg.position.set(x,.35,z);leg.userData.leg=true;g.add(leg)}));
  } else if(type==='chicken'){
    const body=new THREE.Mesh(ICO(.4,0),LM(col));body.position.y=.6;body.scale.set(1.2,1,1);g.add(body);
    const head=new THREE.Mesh(ICO(.25,0),LM(col));head.position.set(.5,.9,0);g.add(head);
    const beak=new THREE.Mesh(new THREE.ConeGeometry(.08,.15,4).rotateZ(-Math.PI/2),LM(0xff8c1a));beak.position.set(.75,.9,0);g.add(beak);
    const comb=new THREE.Mesh(new THREE.ConeGeometry(.1,.2,4),LM(0xff5d5d));comb.position.set(.5,1.15,0);g.add(comb);
    [-.25,.25].forEach(x=>[-.15,.15].forEach(z=>{const leg=new THREE.Mesh(BOX(.08,.4,.08),LM(0xff8c1a));leg.position.set(x,.2,z);leg.userData.leg=true;g.add(leg)}));
    const tail=new THREE.Mesh(new THREE.ConeGeometry(.2,.5,4).rotateZ(Math.PI/2),LM(0xff8c1a));tail.position.set(-.55,.7,0);g.add(tail);
  } else if(type==='pig'){
    const body=new THREE.Mesh(BOX(1.4,1,.9),LM(col));body.position.y=.9;g.add(body);
    const head=new THREE.Mesh(BOX(.6,.6,.6),LM(col));head.position.set(.9,1.1,0);g.add(head);
    const snout=new THREE.Mesh(BOX(.2,.2,.3),LM(0xd080a0));snout.position.set(1.25,1,0);g.add(snout);
    [-.5,.5].forEach(x=>[-.3,.3].forEach(z=>{const leg=new THREE.Mesh(BOX(.18,.6,.18),LM(darkCol));leg.position.set(x,.3,z);leg.userData.leg=true;g.add(leg)}));
    const ear1=new THREE.Mesh(new THREE.ConeGeometry(.15,.25,3),LM(darkCol));ear1.position.set(.9,1.45,.2);g.add(ear1);
    const ear2=ear1.clone();ear2.position.z=-.2;g.add(ear2);
  } else if(type==='horse'){
    const body=new THREE.Mesh(BOX(2.4,1.3,1.1),LM(col));body.position.y=1.5;g.add(body);
    const neck=new THREE.Mesh(BOX(.7,1.5,.7),LM(col));neck.position.set(1.1,2.4,0);g.add(neck);
    const head=new THREE.Mesh(BOX(1.1,.55,.55),LM(col));head.position.set(1.7,3.1,0);g.add(head);
    const mane=new THREE.Mesh(BOX(.15,.6,1.3),LM(darkCol));mane.position.set(1.1,2.6,0);g.add(mane);
    const tail=new THREE.Mesh(new THREE.ConeGeometry(.25,1.5,5),LM(darkCol));tail.position.set(-1.4,1.6,0);tail.rotation.z=Math.PI/4;g.add(tail);
    [-.8,.8].forEach(x=>[-.4,.4].forEach(z=>{const leg=new THREE.Mesh(BOX(.25,1.1,.25),LM(darkCol));leg.position.set(x,.55,z);leg.userData.leg=true;g.add(leg)}));
  }
  if(R.shadowMap.enabled)g.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});
  return g;
}
function spawnAnimal(type,x,z,r,spd){
  const g=makeAnimal(type);
  world.add(g);
  ANIMALS.push({g,x,z,y:0,vx:0,vz:0,targetX:x,targetZ:z,wanderCd:Math.random()*2,spawnX:x,spawnZ:z,r:r||5,spd:spd||.4,t:Math.random()*6.28,type,legs:g.children.filter(c=>c.userData&&c.userData.leg)});
}

function spawnJelloger(def){
  const sh=Math.floor(Math.random()*7);
  const p=mkP({n:def.n,c1:def.c1,c2:def.c2,sh,nc:def.nc||'#fff',nf:def.nf||'monospace',noName:true});
  sc.remove(p.root); world.add(p.root);
  p.x=def.x; p.z=def.z; p.y=0;
  p.tx=def.x; p.tz=def.z;
  p.tr=Math.random()*6.28; p.r=p.tr;
  p.spawnX=def.x; p.spawnZ=def.z;
  p.wanderR=def.r||5;
  p.moveSpd=(def.spd!==undefined?def.spd:0.4);
  p.spd=p.moveSpd;
  p.wanderCd=Math.random()*3;
  p.wanderTX=def.x; p.wanderTZ=def.z;
  p.lines=def.lines||['...']; p.lineIdx=0;
  p.secret=!!def.secret;
  p.frozen=(def.spd===0);
  p.tt=0; p.lx=def.x; p.lz=def.z; p.init=1;
  p.isJelloger=true; p.jbLvl=0; p._jname=def.n;
  p.sparkleT=Math.random()*2;
  JELLOGERS.push(p);
  return p;
}
function clearJellogers(){ JELLOGERS.length=0; }
function wanderJellogers(dt){
  for(const j of JELLOGERS){
    if(j.talkT>0){ j.talkT-=dt; j.tx=j.x; j.tz=j.z; continue; }
    if(j.frozen){ j.tx=j.x; j.tz=j.z; continue; }
    j.wanderCd-=dt;
    const dxT=j.wanderTX-j.x, dzT=j.wanderTZ-j.z;
    const distT=Math.hypot(dxT,dzT);
    if(distT<0.8 || j.wanderCd<=0){
      const ang=Math.random()*6.28;
      const d=Math.random()*j.wanderR*0.8;
      j.wanderTX=j.spawnX+Math.cos(ang)*d;
      j.wanderTZ=j.spawnZ+Math.sin(ang)*d;
      j.wanderCd=3+Math.random()*4;
    }
    if(distT>0.05){
      const nx=dxT/distT, nz=dzT/distT;
      j.x+=nx*j.moveSpd*dt*2.2;
      j.z+=nz*j.moveSpd*dt*2.2;
      j.tx=j.x; j.tz=j.z;
      j.tr=Math.atan2(nx,nz);
    } else { j.tx=j.x; j.tz=j.z; }
  }
}

function waterfall(x,z,h,w){addMerged([{geo:BOX(w+4,h,w+4),x,y:h/2,z,color:0x5a5a52},{geo:BOX(w+5,1,w+5),x,y:h,z,color:0x6a6a62},{geo:new THREE.ConeGeometry(w*0.7,1.5,6),x,y:h+.7,z,color:0x4a4a42}]);addCol(x,0,z,w+4,h,w+4);Mt(new THREE.CircleGeometry(w*0.5,24).rotateX(-1.5708),new THREE.MeshPhongMaterial({color:0x3aa0d0,transparent:true,opacity:.85,shininess:90}),x,h+.05,z);const cvs=document.createElement('canvas');cvs.width=32;cvs.height=32;const c2=cvs.getContext('2d');c2.fillStyle='rgba(120,200,240,.6)';c2.fillRect(0,0,32,32);for(let i=0;i<12;i++){c2.fillStyle='rgba(255,255,255,.85)';c2.fillRect(0,Math.random()*32,32,1+Math.random()*2)}const tex=new THREE.CanvasTexture(cvs);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1,6);tex.magFilter=tex.minFilter=THREE.LinearFilter;const sheet=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,opacity:.9}));sheet.position.set(x,h/2,z+w/2+2.05);world.add(sheet);const poolR=w*1.3;Mt(new THREE.CircleGeometry(poolR,32).rotateX(-1.5708),new THREE.MeshPhongMaterial({color:0x3aa0d0,transparent:true,opacity:.85,shininess:90}),x,.08,z+w/2+2+poolR*0.5);Mt(new THREE.TorusGeometry(poolR,.5,4,32).rotateX(1.5708),LM(0x7a7a6a),x,.2,z+w/2+2+poolR*0.5);WATERFALLS.push({tex,x,z:z+w/2+2,poolR})}

function addSwing(x,z,rot){rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];const p1=T(-2.5,0),p2=T(2.5,0);addMerged([{geo:BOX(.4,8,.4),x:p1[0],y:4,z:p1[1],color:0x8b5a2b},{geo:BOX(.4,8,.4),x:p2[0],y:4,z:p2[1],color:0x8b5a2b},{geo:BOX(5.4,.4,.4),x,y:8,z,color:0x5a3a1a,ry:rot}]);const pivot=new THREE.Group();pivot.position.set(x,7.8,z);pivot.rotation.y=rot;const c1=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,6,5),LM(0x2a2a2a));if(R.shadowMap.enabled)c1.castShadow=true;c1.position.set(-1.1,-3,0);const c2=c1.clone();c2.position.x=1.1;const seat=new THREE.Mesh(BOX(2.4,.2,1),LM(0x8b5a2b));if(R.shadowMap.enabled)seat.castShadow=true;seat.position.y=-6.1;const back=new THREE.Mesh(BOX(2.4,1.2,.15),LM(0x8b5a2b));if(R.shadowMap.enabled)back.castShadow=true;back.position.y=-5.4;back.position.z=-.4;pivot.add(c1,c2,seat,back);world.add(pivot);swings.push({pivot,x,z,rot,angle:0,vel:0});addCol(x-2.5,0,z,.6,8,.6);addCol(x+2.5,0,z,.6,8,.6)}
function addRing(x,z,r){r=r||10;const P=[];for(let i=0;i<12;i++){const a=i/12*6.28;P.push({geo:new THREE.CylinderGeometry(.3,.4,3,6),x:x+Math.cos(a)*r,y:1.5,z:z+Math.sin(a)*r,color:0x8a8a8a})}for(let i=0;i<4;i++){const a=i/4*6.28+0.39;P.push({geo:BOX(.6,5,.6),x:x+Math.cos(a)*r,y:2.5,z:z+Math.sin(a)*r,color:0xa04030})}addMerged(P);const floor=Mt(new THREE.CircleGeometry(r,32).rotateX(-1.5708),LM(0xc8b088),x,.08,z);if(R.shadowMap.enabled)floor.receiveShadow=true;Mt(new THREE.TorusGeometry(r,.3,4,40).rotateX(1.5708),LM(0xd05040),x,.15,z);Mt(new THREE.TorusGeometry(r,.15,4,40).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xd05040}),x,1.8,z);Mt(new THREE.TorusGeometry(r,.12,4,40).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xffffff}),x,3,z);rings.push({x,z,r})}

const PARKOUR=[
  [0,0,0,14,14,3],[0,1,14,5,5,0],[4,2,24,5,5,0],[-2,3,34,5,5,0],[0,4,44,5,5,0],[0,4,54,9,9,0],
  [7,5,63,3,3,5],[12,7,72,3,3,5],[10,9,82,3,3,5],[4,11,90,3,3,5],[-2,13,94,4,4,5],[-2,13,104,8,8,0],
  [-10,13,110,4,4,1],[-16,14,118,4,4,1],[-12,15,126,4,4,1],[-4,16,130,5,5,1],[4,16,132,7,7,0],
  [12,16,136,4,4,2],[18,16,142,4,4,2],[22,16,150,4,4,2],[22,16,158,8,8,0],
  [24,17,168,4,4,4],[20,21,176,4,4,4],[14,25,182,4,4,4],
  [6,27,186,6,6,0],[0,27,192,4,4,3],[0,27,200,12,12,0]
];
const MOV=[],PKC=[],LAS=[],SPC=[],PKZ=[];let PKCP=[];let pkPush={x:0,z:0,t:0,T:1},pkZone=null;
const ZC=[[0x5cb85c,0x3d8bff,0xff8c1a],[0x2fd9b0,0x3ad0ff,0x7a8cff],[0xff7a5a,0xff4a7a,0xffb040],[0xb06aff,0xff5db1,0x7a5aff],[0xe8f4ff,0x9ad8ff,0xc8b8ff],[0x7aff5a,0xd0ff3a,0x3aff9a]];
(()=>{let x=0,y=27,z=200;const MA=[6,3.5,2.5,4],MS=[.9,1.1,.8,1],NS=40,f1=v=>+v.toFixed(1),rn=(a,b)=>{const v=Math.abs(Math.sin(a*12.9898+b*78.233)*43758.5453);return v-Math.floor(v)},
 P=(px,py,pz,w,d,t,a,b,c,zn,e)=>{PARKOUR.push([f1(px),f1(py),f1(pz),+(+w).toFixed(1),+(+d).toFixed(1),t,a||0,b||0,c||0,zn,e||0]);return PARKOUR.length-1},
 W=[['mv',5,.22],['va',6,.10],['ic',3,.09],['bo',4,.04],['ro',0,.10],['mud',2,.07],['cv',3,.11],['cr',4,.12],['tt',6,.06],['hot',7,.08],['pen',6,.05],['sw',5,.05],['lau',3,.04],['lift',8,.03]];
for(let s=0;s<NS;s++){const k=s/(NS-1),zn=Math.floor(s/7)%6,n=6+Math.floor(s/5),sz=Math.max(3,5-k*2),ev=s%8==5?'wind':s%9==7?'moon':'',up=(s%2?-.9:1+k*.2)+(ev=='moon'?.5:0),gap=8.2+k*.9+(ev=='moon'?2.2:0),zs=z,idxs=[];
 const ws=W.filter(q=>s>=q[1]).map(q=>[q[0],q[2]*Math.min(1,(s-q[1]+1)/6)]),tot=ws.reduce((a,q)=>a+q[1],0),sc=Math.min(1,.78/tot);
 for(let i=0;i<n;i++){z+=gap+rn(s,i)*.3*k;x=Math.max(-26,Math.min(26,x+Math.sin(s*1.7+i*1.1)*(3+k*2.5)));y+=up;
  const r=rn(s*3+1,i*5+2);let acc=0,pk='';for(const q of ws){acc+=q[1]*sc;if(r<acc){pk=q[0];break}}
  if(i>=n-2&&(pk=='lift'||pk=='lau'||pk=='sw'))pk='';if(pk=='sw'&&i>n-5)pk='';
  const ph=f1(rn(s,i)*6.28);
  if(pk=='mv'){const t=6+Math.floor(rn(i,s)*4)%4,w=Math.max(3.6,sz+.4);idxs.push(P(x,y,z,w,w,t,MA[t-6],MS[t-6],ph,zn))}
  else if(pk=='va'){const w=Math.max(3.6,sz+.3);idxs.push(P(x,y,z,w,w,2,0,0,0,zn))}
  else if(pk=='ic')idxs.push(P(x,y,z,4,4,1,0,0,0,zn));
  else if(pk=='bo')idxs.push(P(x,y,z,4,4,4,0,0,0,zn));
  else if(pk=='ro'){const r2=2.4+(1-k)*.5;idxs.push(P(x,y,z,r2,r2,5,0,0,0,zn))}
  else if(pk=='mud')idxs.push(P(x,y,z,5,5,16,0,0,0,zn));
  else if(pk=='cv'){const q=rn(s,i+9),dir=s>=10&&q<.3?[0,-1]:q<.6?[0,1]:[q<.8?1:-1,0];idxs.push(P(x,y,z,4.5,6,11,dir[0],dir[1],0,zn))}
  else if(pk=='cr')idxs.push(P(x,y,z,4,4,13,0,0,0,zn));
  else if(pk=='tt')idxs.push(P(x,y,z,7,7,18,+((1.1+k*1.2)*(rn(s,i+3)<.5?-1:1)).toFixed(2),0,0,zn));
  else if(pk=='hot')idxs.push(P(x,y,z,5,5,19,ph,0,0,zn));
  else if(pk=='pen')idxs.push(P(x,y,z,7,8,21,+(1.3+k*.8).toFixed(2),0,ph,zn));
  else if(pk=='sw'){const m=s>=15?4:3;for(let q=0;q<m;q++){if(q){z+=gap-.5;x=Math.max(-26,Math.min(26,x+(q%2?2.5:-2.5)))}idxs.push(P(x,y,z,4.2,4.2,14+q%2,0,0,0,zn))}i+=m-1}
  else if(pk=='lau'){idxs.push(P(x,y,z,4.5,4.5,12,0,0,0,zn));z+=9;y+=3}
  else if(pk=='lift'){idxs.push(P(x,y,z,6,6,20,0,0,0,zn));y+=5.5}
  else idxs.push(P(x,y,z,sz,sz,0,0,0,0,zn))}
 if(s>=4&&idxs.length>=7&&rn(s,99)<.45){const a=1+Math.floor(rn(s,5)*(idxs.length-6)),h=PARKOUR[idxs[a]],sd=h[0]>0?-1:1;P(h[0]+sd*8.5,h[1],h[2],4,4,17,0,0,0,zn,idxs[a+4])}
 if(s>=2){z+=gap+8;x*=.5;P(x,y,z,12,16,10,+((1+k*1.6)*(s%2?-1:1)).toFixed(2),s>=9?1:0,s>=14?4:0,zn,f1(rn(s,7)*6.28));z+=8+gap*.8}else z+=gap;
 x*=.5;y+=s%2?0:.5;const f=s==NS-1;P(x,y,z,f?8:10,f?8:10,f?3:0,0,0,0,zn);
 if(ev)PKZ.push({z0:zs,z1:z,t:ev,dir:s%2?1:-1})}})();

const SAFE_STRUCTS=[
  ['windmill',125,55],['barn',88,48],['haystack',108,35],['haystack',113,42],
  ['scarecrow',75,55],['beehive',80,48],['beehive',100,58],
  ['fence',65,30,65,68],['fence',65,30,115,30],['fence',115,30,115,68],
  ['crates',72,72],['crates',95,72],
  ['stumplog',118,75],['logpile',130,35],
  ['marketstall',100,-20,.5],['marketstall',110,-30,-.3],['marketstall',115,-45,.8],
  ['barrels',120,-20],['barrels',90,-40],
  ['crates',95,-55],['potshelf',105,-60],
  ['lanternpost',95,-30],['lanternpost',112,-35],
  ['stonecircle',-115,-95],['ruinpillar',-100,-75],['ruinpillar',-130,-80],
  ['ruinpillar',-105,-110],['obelisk',-110,-10,0xa89868],
  ['statuegarden',-105,-60],['totem',-105,105],
  ['boat',45,-180,Math.PI/6],['boat',-35,-185,-Math.PI/4],
  ['beachhut',55,-165,Math.PI/3],['beachhut',-50,-165,-Math.PI/3],
  ['beachumbrella',30,-172],['beachumbrella',-35,-175],['beachumbrella',65,-148],
  ['waterwheel',140,65],['woodenbridge',145,80,Math.PI/2],
  ['belltower',150,30],['stonewall',135,25,135,60],
  ['picnictable',120,-95],['picnictable',105,-100],
  ['windmill',-125,-55],['watertower',-145,30],
  ['stonewall',-135,-35,-135,-75],['belltower',-150,65],
  ['picnictable',-120,95],['picnictable',-130,85],
  ['flagpole',125,-65],['flagpole',-125,-65],
  ['pond',60,125,6],['pond',-60,125,6],['pond',135,-105,5],
  ['rockformation',60,-125],['rockformation',-60,-125],
  ['rockformation',160,15],['rockformation',-160,15],
  ['rockformation',105,145],['rockformation',-105,-145],
  ['flowerbed',42,95,2.5],['flowerbed',-42,95,2.5],
  ['flowerbed',42,-95,2.5],['flowerbed',-42,-95,2.5],
  ['flowerbed',85,95,2.5],['flowerbed',-85,-95,2.5],
  ['crates',145,-85],['crates',-145,-85],
  ['archway',110,65,0],['archway',-110,65,0],
  ['giantmushroom',-95,65,.8],['giantmushroom',-90,70,.6],['giantmushroom',-100,70,.7],
  ['logpile',155,115],['logpile',-155,115],
  ['stumplog',-85,-35],['stumplog',160,-35],
  ['flowerarch',138,-55,0],['flowerarch',-138,-55,0],
  ['wishingwell',45,-70],['wishingwell',-45,-70],
  ['garden',90,42,5],['garden',-90,42,5],['garden',90,-48,5],['garden',-90,-48,5],
  ['statuejello',75,-30],['statuejello',-75,-30],['statuejello',75,30],['statuejello',-75,30],
  ['torch',55,15],['torch',-55,15],['torch',55,-15],['torch',-55,-15],
  ['torch',15,55],['torch',-15,55],['torch',15,-55],['torch',-15,-55]
];

const LAYOUTS={
  island:{
    sky:[0x5ba8ff,0xfff4c2],edge:0x2d7a3a,roadFill:0xe8d8b8,roadTrim:0x8b6a4b,plaza:20,
    hills:[{x:0,z:230,r:80,h:28},{x:180,z:170,r:65,h:22},{x:-180,z:170,r:65,h:22},{x:210,z:20,r:55,h:18},{x:-210,z:20,r:55,h:18},{x:180,z:-170,r:60,h:18},{x:-180,z:-170,r:60,h:18},{x:0,z:-230,r:70,h:20}],
    roads:[{w:7,pts:[[0,20],[6,60],[0,110],[0,160]]},{w:6,pts:[[20,0],[60,-8],[100,-5]]},{w:6,pts:[[-20,0],[-60,-8],[-100,-5]]},{w:6,pts:[[14,14],[45,50],[70,75]]},{w:5,pts:[[-14,14],[-45,50],[-70,75]]},{w:5,pts:[[0,-20],[-8,-55],[-15,-95]]},{w:5,pts:[[14,-14],[45,-45],[70,-75]]},{w:5,pts:[[-14,-14],[-45,-45],[-70,-75]]},{w:5,pts:[[30,30],[60,60],[95,95],[125,125],[142,144]]}],
    treeZones:[{type:'oak',cx:85,cz:-35,r:45,count:26},{type:'cherry',cx:-85,cz:-35,r:45,count:24},{type:'pine',cx:0,cz:135,r:60,count:38},{type:'birch',cx:120,cz:80,r:40,count:22},{type:'palm',cx:-50,cz:150,r:22,count:14},{type:'palm',cx:50,cz:150,r:22,count:14},{type:'palm',cx:0,cz:-165,r:28,count:16},{type:'pine',cx:135,cz:-110,r:42,count:24},{type:'oak',cx:100,cz:-140,r:38,count:20},{type:'pine',cx:-135,cz:-110,r:42,count:24},{type:'oak',cx:-100,cz:-140,r:38,count:20},{type:'oak',cx:-135,cz:80,r:38,count:20},{type:'birch',cx:-155,cz:40,r:30,count:16},{type:'oak',cx:150,cz:25,r:30,count:16},{type:'cherry',cx:0,cz:65,r:28,count:16},{type:'oak',cx:0,cz:-65,r:28,count:16},{type:'pine',cx:60,cz:170,r:28,count:16},{type:'pine',cx:-60,cz:170,r:28,count:16}],
    grassCount:220,flowerCount:150,rockCount:20,
    landmarks:[
      ['lighthouse',0,165],['hut',125,70,-Math.PI/2,0x8b5a2b,0xa04030],['hut',-130,35,Math.PI/2,0xa07850,0x8b3030],['watchtower',-90,-70],['shrine',100,-95,0x8a8a7a],['well',30,62],['well',-30,-62],['fountain',0,0,3],['gazebo',70,-30],['gazebo',-95,100],['statue',-22,42],['camp',-60,-120],['camp',115,-125],['bench',26,10,0],['bench',-26,10,0],['bench',10,26,Math.PI/2],['bench',-10,-26,-Math.PI/2]
    ],
    structures:[['beachhut',-149,-93,5.27],['boat',-121,-128,5.52],['beachumbrella',-85,-154,5.78],['beachhut',-44,-170,6.03],['beachumbrella',0,-176,6.28],['boat',44,-170,6.54],['beachhut',85,-154,6.79],['boat',121,-128,7.04],['beachumbrella',149,-93,7.3],['windmill',-125,65],['waterwheel',140,-45],['woodenbridge',150,-22,1.57],['archway',0,72,0],['pond',-70,115,6],['pond',95,110,5],['rockformation',150,100],['rockformation',-160,-25],['rockformation',-120,-115],['flowerbed',35,45,2.5],['flowerbed',-35,-45,2.5],['flowerbed',60,-65,2.5],['wishingwell',62,48],['flagpole',112,-62],['picnictable',-100,-100],['picnictable',-85,-110],['marketstall',-62,-55,0.4],['marketstall',-75,-48,-0.3],['marketstall',-68,-68,0.8],['crates',-52,-70],['barrels',-80,-62],['statuejello',42,0],['statuejello',-42,0],['giantmushroom',-45,115,0.7],['torch',28,0],['torch',14,24],['torch',-14,24],['torch',-28,0],['torch',-14,-24],['torch',14,-24]],
    extras:[['hotairballoon',-100,100],['hotairballoon',100,-100],['campfire',60,-45],['campfire',-60,60]],
    animals:[['cow',70,20,12,.5],['cow',75,25,10,.45],['cow',-70,20,12,.5],['cow',-75,25,10,.45],['sheep',90,-30,12,.6],['sheep',85,-35,8,.7],['sheep',-90,-30,12,.6],['sheep',-85,-35,8,.7],['chicken',60,10,4,.9],['chicken',63,13,4,1],['chicken',-60,10,4,.9],['chicken',-63,13,4,1],['pig',100,10,10,.45],['pig',-100,10,10,.45],['horse',130,-20,14,.7],['horse',-130,-20,14,.7]],
    waterfalls:[['island_wf',180,-60,20,7]],
    swings:[[58,-14,0],[-58,-14,0]],
    battleRing:[-115,-105,12],
    lamps:[[0,55],[0,105],[-60,-8],[60,-8],[-40,48],[40,48],[0,-115],[42,-42],[-42,-42]],
    ambient:['butterflies','birds','clouds','petals','bubbles','dust','wind']
  },
  desert:{
    sky:[0xf5d99a,0xfff4c2],edge:0xc99a5b,roadFill:0xe6d6b0,roadTrim:0xa88850,plaza:18,
    hills:[{x:0,z:230,r:70,h:14},{x:180,z:170,r:58,h:12},{x:-180,z:170,r:58,h:12},{x:210,z:-20,r:55,h:10},{x:-210,z:-20,r:55,h:10},{x:180,z:-170,r:55,h:11},{x:-180,z:-170,r:55,h:11},{x:0,z:-230,r:65,h:12}],
    roads:[{w:7,pts:[[0,18],[10,55],[20,90]]},{w:6,pts:[[18,0],[55,-5],[100,0]]},{w:6,pts:[[-18,0],[-55,-8],[-95,-5]]},{w:6,pts:[[12,12],[45,50],[75,80]]},{w:5,pts:[[-12,12],[-45,50],[-75,80]]},{w:5,pts:[[0,-18],[-5,-60],[-10,-100]]},{w:5,pts:[[12,-12],[45,-45],[75,-75]]},{w:5,pts:[[-12,-12],[-45,-45],[-75,-75]]},{w:5,pts:[[30,30],[60,60],[95,95],[125,125],[142,144]]}],
    oasis:{x:105,z:0,r:28},
    treeZones:[{type:'palm',cx:105,cz:0,r:22,count:14},{type:'cactus',cx:55,cz:55,r:40,count:20},{type:'cactus',cx:-55,cz:-55,r:40,count:20},{type:'dead',cx:110,cz:90,r:35,count:14},{type:'dead',cx:-110,cz:90,r:35,count:14},{type:'cactus',cx:145,cz:-40,r:32,count:14},{type:'dead',cx:-145,cz:-40,r:32,count:14},{type:'cactus',cx:0,cz:125,r:40,count:18},{type:'dead',cx:0,cz:-140,r:38,count:14},{type:'cactus',cx:75,cz:-100,r:35,count:16},{type:'cactus',cx:-75,cz:-100,r:35,count:16},{type:'dead',cx:80,cz:80,r:32,count:14},{type:'dead',cx:-80,cz:80,r:32,count:14}],
    grassCount:120,flowerCount:0,rockCount:22,
    landmarks:[
      ['obelisk',0,0,0xb8a878],['obelisk',-140,0,0xa89868],['obelisk',130,105,0xa89868],['watchtower',-110,-95],['shrine',60,-110,0x8a8a7a],['well',105,-36],['well',140,-32],['well',22,22],['well',-22,-22],['gazebo',-65,70],['camp',85,60],['camp',-90,-40],['camp',150,-50],['bench',16,8,0],['bench',-16,-8,0],['statue',-30,55]
    ],
    structures:[['marketstall',-100,-45,0.1],['marketstall',-88,-45,-0.1],['marketstall',-76,-45,0.1],['marketstall',-64,-45,-0.1],['marketstall',-52,-45,0.1],['barrels',-100,-58],['crates',-82,-58],['potshelf',-66,-58],['lanternpost',-92,-38],['lanternpost',-58,-38],['stonecircle',-115,85],['ruinpillar',-95,70],['ruinpillar',-135,72],['ruinpillar',-95,105],['ruinpillar',-135,108],['ruinpillar',-115,60],['archway',0,62,0],['archway',0,-62,1.57],['totem',60,-100],['totem',-60,115],['statuegarden',-130,-95],['stonewall',-150,-10,-150,35],['stonewall',140,70,140,110],['wishingwell',105,35],['rockformation',70,100],['rockformation',-30,-130],['rockformation',160,-20],['rockformation',-160,60],['rockformation',10,135],['crates',130,-70],['barrels',140,-62],['flagpole',45,0],['flagpole',-45,0],['stumplog',150,10],['haystack',70,60],['haystack',76,66],['torch',26,0],['torch',13,23],['torch',-13,23],['torch',-26,0],['torch',-13,-23],['torch',13,-23]],
    extras:[['hotairballoon',-130,50],['campfire',-40,25],['campfire',60,-60],['campfire',140,40]],
    animals:[['sheep',70,20,12,.6],['cow',-70,20,12,.5],['chicken',60,0,4,.9],['chicken',-60,0,4,.9],['horse',130,-20,14,.7]],
    waterfalls:[],
    swings:[[-35,-70,0]],
    battleRing:[0,-142,12],
    lamps:[[0,55],[-60,-8],[60,-8],[40,45],[-40,45],[0,-115],[40,-40],[-40,-40]],
    ambient:['birds','clouds','dust','wind']
  },
  jungle:{
    sky:[0x3a6a4a,0x8fd0a0],edge:0x1f5a2a,roadFill:0xb09068,roadTrim:0x6a5040,plaza:16,
    hills:[{x:0,z:230,r:80,h:32},{x:180,z:170,r:70,h:28},{x:-180,z:170,r:70,h:28},{x:210,z:-20,r:65,h:24},{x:-210,z:-20,r:65,h:24},{x:180,z:-170,r:65,h:24},{x:-180,z:-170,r:65,h:24},{x:0,z:-230,r:75,h:26}],
    roads:[{w:6,pts:[[0,16],[8,55],[0,100]]},{w:6,pts:[[16,0],[55,10],[95,45]]},{w:6,pts:[[-16,0],[-55,15],[-90,60]]},{w:5,pts:[[10,10],[45,55],[60,80]]},{w:5,pts:[[-10,10],[-45,55],[-70,75]]},{w:5,pts:[[0,-16],[-15,-55],[-30,-95]]},{w:5,pts:[[10,-10],[45,-45],[70,-70]]},{w:5,pts:[[-10,-10],[-45,-45],[-70,-70]]},{w:5,pts:[[28,28],[58,58],[95,95],[125,125],[142,144]]}],
    treeZones:[{type:'pine',cx:55,cz:-55,r:38,count:22},{type:'pine',cx:-55,cz:-55,r:38,count:22},{type:'pine',cx:55,cz:55,r:38,count:20},{type:'pine',cx:-55,cz:55,r:38,count:20},{type:'birch',cx:100,cz:80,r:35,count:17},{type:'birch',cx:-100,cz:80,r:35,count:17},{type:'pine',cx:100,cz:-80,r:35,count:18},{type:'pine',cx:-100,cz:-80,r:35,count:18},{type:'pine',cx:0,cz:135,r:50,count:26},{type:'birch',cx:0,cz:-160,r:45,count:22},{type:'pine',cx:150,cz:0,r:35,count:16},{type:'pine',cx:-150,cz:0,r:35,count:16},{type:'pine',cx:0,cz:-55,r:26,count:14},{type:'birch',cx:60,cz:35,r:28,count:14},{type:'pine',cx:-60,cz:35,r:28,count:14}],
    grassCount:260,flowerCount:80,rockCount:24,
    landmarks:[
      ['statue',0,0],['shrine',120,100,0x7a7a6a],['shrine',-100,-110,0x8a8a7a],['watchtower',-60,100],['hut',-110,45,1.5,0x6b4a2b,0x2f5a2a],['hut',100,-45,2.2,0x8b5a2b,0x8b3030],['hut',130,10,-1.6,0x7a5030,0x2f5a2a],['gazebo',55,-95],['camp',-130,-5],['camp',45,60],['well',28,-28],['well',-28,28],['bench',16,8,0],['bench',-16,-8,0]
    ],
    structures:[['giantmushroom',100,-105,0.8],['giantmushroom',108,-98,0.6],['giantmushroom',94,-96,0.7],['giantmushroom',-60,-90,0.9],['giantmushroom',-68,-84,0.6],['giantmushroom',-52,-82,0.7],['giantmushroom',20,125,0.8],['totem',75,15],['totem',-75,-15],['totem',15,-75],['totem',-30,-120],['stonecircle',120,100],['ruinpillar',100,85],['ruinpillar',140,88],['ruinpillar',100,120],['ruinpillar',140,122],['waterwheel',-150,-40],['woodenbridge',-142,-12,0],['stumplog',-80,70],['stumplog',60,40],['logpile',-95,95],['logpile',150,-65],['beehive',-100,30],['beehive',-108,36],['beehive',-95,40],['pond',60,105,6],['pond',-95,115,5],['pond',-10,-100,5],['flowerarch',0,60,0],['wishingwell',-45,70],['statuegarden',45,-70],['picnictable',100,50],['rockformation',-150,70],['rockformation',150,-100],['rockformation',0,-140],['crates',70,-60],['flagpole',-120,-70],['archway',-60,35,0.8],['torch',24,0],['torch',7,23],['torch',-19,14],['torch',-19,-14],['torch',7,-23]],
    extras:[['hotairballoon',50,100],['campfire',-50,-50],['campfire',85,-25],['campfire',-110,70]],
    animals:[['chicken',60,10,4,.9],['chicken',-60,10,4,.9],['pig',80,-25,10,.45],['pig',-80,-25,10,.45],['cow',100,20,12,.5]],
    waterfalls:[['jungle_wf',-185,-60,24,8]],
    swings:[[75,20,0],[-45,-30,0]],
    battleRing:[-115,100,12],
    lamps:[[0,45],[0,-105],[45,5],[-45,5],[40,40],[-40,40]],
    ambient:['butterflies','leaves','clouds','fireflies','bubbles','dust','wind']
  },
  snow:{
    sky:[0xdcecff,0xf0f6ff],edge:0xcfe4ff,roadFill:0xdee6ee,roadTrim:0xa8b8c8,plaza:18,
    hills:[{x:0,z:230,r:75,h:30},{x:180,z:170,r:65,h:26},{x:-180,z:170,r:65,h:26},{x:210,z:-20,r:58,h:22},{x:-210,z:-20,r:58,h:22},{x:180,z:-170,r:62,h:24},{x:-180,z:-170,r:62,h:24}],
    roads:[{w:6,pts:[[0,18],[8,55],[0,95]]},{w:6,pts:[[18,0],[55,-5],[100,5]]},{w:6,pts:[[-18,0],[-55,-5],[-100,5]]},{w:6,pts:[[12,12],[45,50],[70,75]]},{w:5,pts:[[-12,12],[-45,50],[-70,75]]},{w:5,pts:[[0,-18],[-5,-55],[-10,-85]]},{w:5,pts:[[12,-12],[45,-45],[70,-75]]},{w:5,pts:[[-12,-12],[-45,-45],[-70,-75]]},{w:5,pts:[[30,30],[60,60],[95,95],[125,125],[142,144]]}],
    lake:{x:0,z:-115,r:38},
    treeZones:[{type:'snowpine',cx:60,cz:-60,r:38,count:22},{type:'snowpine',cx:-60,cz:-60,r:38,count:22},{type:'snowpine',cx:60,cz:60,r:38,count:22},{type:'snowpine',cx:-60,cz:60,r:38,count:22},{type:'snowpine',cx:0,cz:140,r:50,count:26},{type:'snowpine',cx:0,cz:-170,r:42,count:20},{type:'snowpine',cx:135,cz:-90,r:35,count:17},{type:'snowpine',cx:-135,cz:-90,r:35,count:17},{type:'snowpine',cx:135,cz:90,r:35,count:17},{type:'snowpine',cx:-135,cz:90,r:35,count:17},{type:'snowpine',cx:0,cz:60,r:28,count:14},{type:'snowpine',cx:60,cz:0,r:26,count:13},{type:'snowpine',cx:-60,cz:0,r:26,count:13}],
    grassCount:0,flowerCount:0,rockCount:24,
    landmarks:[
      ['igloo',-60,-30],['igloo',-75,-45],['igloo',-90,-25],['igloo',60,70],['igloo',80,85],['igloo',95,65],['igloo',-30,95],['hut',-115,15,1.2,0x6b4a2b,0x5a3050],['hut',110,-15,-1.2,0x8b5a2b,0x503020],['watchtower',125,-70],['shrine',-85,-90,0xc8d0dc],['gazebo',0,-62],['statue',-18,30],['camp',70,-120],['camp',-100,60],['well',24,24],['well',-24,-24],['bench',16,8,0],['bench',-16,-8,0]
    ],
    structures:[['belltower',45,-55],['watertower',-125,75],['windmill',135,95],['logpile',60,-35],['logpile',-110,-60],['logpile',-95,95],['logpile',110,45],['stonewall',-145,85,-145,130],['stonewall',100,100,150,100],['lanternpost',30,70],['lanternpost',-30,60],['lanternpost',70,30],['picnictable',-60,75],['picnictable',-48,82],['flagpole',90,-45],['statuegarden',115,-90],['rockformation',-155,-30],['rockformation',150,30],['rockformation',40,-140],['rockformation',-45,135],['pond',-75,115,6],['pond',60,125,5],['crates',122,38],['barrels',132,48],['crates',-135,-80],['marketstall',-30,115,0.3],['marketstall',-45,120,-0.2],['marketstall',-18,122,0.5],['archway',60,0,1.57],['wishingwell',-70,10],['beehive',100,70],['torch',30,0],['torch',21,21],['torch',0,30],['torch',-21,21],['torch',-30,0],['torch',-21,-21],['torch',0,-30],['torch',21,-21]],
    extras:[['hotairballoon',-120,115],['campfire',0,0],['campfire',-80,-35],['campfire',75,78]],
    animals:[['cow',70,0,12,.5],['sheep',-70,0,12,.6],['chicken',60,15,4,.9],['chicken',-60,15,4,.9],['horse',130,-20,14,.7]],
    waterfalls:[],
    swings:[[-20,45,0],[35,-45,0]],
    battleRing:[-125,-70,12],
    lamps:[[0,55],[-55,-8],[55,-8],[40,48],[-40,48],[0,-115],[42,-42],[-42,-42]],
    ambient:['snow','clouds','dust','wind']
  }
};

const JELLOGER_DEFS={
  island:[
    {n:'Petani Jelloger',   c1:'#8b5a2b', c2:'#d4a848', x:92, z:52, r:5, spd:.35, lines:['Hewan ni bikin kesal, soalnya dia tak mau makan, padahal udah di belikan makan 200 kilo']},
    {n:'Peternak Jelloger', c1:'#c8a878', c2:'#8b5a2b', x:112,z:32, r:5, spd:.4,  lines:['Ayam-ayamku bertelur 30 butir hari ini!']},
    {n:'Penggembala',       c1:'#a0d0a0', c2:'#4a7a4a', x:88, z:38, r:6, spd:.4,  lines:['Kambing-kambingku lepas lagi, dasar nakal']},
    {n:'Tukang Kayu',       c1:'#8b5a2b', c2:'#5a3a1b', x:118,z:66, r:5, spd:.3,  lines:['Kayu dari pohon ini kuat sekali, tahan air']},
    {n:'Penambang',         c1:'#5a5a52', c2:'#2a2a22', x:155,z:28, r:6, spd:.3,  lines:['Aku mencari emas di dalam tanah, belum ketemu']},
    {n:'Pedagang Jelloger', c1:'#ff8c1a', c2:'#d05000', x:100,z:-13, r:4, spd:.35, lines:['Beli barang murah-murah! Beli banyak lebih murah!']},
    {n:'Pedagang Buah',     c1:'#ffe27a', c2:'#b08b20', x:117,z:-43,r:4, spd:.3,  lines:['Buah-buahan segar! Baru dipetik pagi ini!']},
    {n:'Penjual Roti',      c1:'#d4a848', c2:'#8b6010', x:105,z:-35,r:4, spd:.3,  lines:['Roti hangat! Roti hangat!']},
    {n:'Guru Jelloger',     c1:'#3aa8d0', c2:'#1a6080', x:14, z:14, r:4, spd:.3,  lines:['Belajar itu penting, tapi bermain juga perlu']},
    {n:'Dokter Jelloger',   c1:'#ffffff', c2:'#ff5d5d', x:-14,z:14, r:4, spd:.3,  lines:['Kalau kamu sakit, minum ramuan dari aku']},
    {n:'Pemusik Jelloger',  c1:'#ffd23f', c2:'#8b6a10', x:22, z:22, r:4, spd:.25, lines:['Dengarkan lagu baruku, judulnya "Jello Bahagia"']},
    {n:'Penari Jelloger',   c1:'#ff90b8', c2:'#8b3060', x:-22,z:22, r:4, spd:.5,  lines:['Ayo menari bersama! Goyangkan badanmu!']},
    {n:'Seniman Jelloger',  c1:'#b05dff', c2:'#5a1a8b', x:24, z:36, r:4, spd:.35, lines:['Aku sedang melukis matahari terbit, indah sekali']},
    {n:'Pendeta Jelloger',  c1:'#ffffff', c2:'#c0c0c0', x:-66,z:40, r:4, spd:.2,  lines:['Semoga harimu menyenangkan, anakku']},
    {n:'Prajurit Jelloger', c1:'#8a8a82', c2:'#3a3a32', x:80, z:82, r:5, spd:.4,  lines:['Aku berjaga di sini dari pagi sampai pagi lagi']},
    {n:'Petualang Jelloger',c1:'#3fbf5f', c2:'#1a6a2a', x:110,z:140,r:8, spd:.55, lines:['Kudengar ada harta karun di puncak gunung!']},
    {n:'Koki Jelloger',     c1:'#ff5d5d', c2:'#8b1a1a', x:54, z:45, r:3, spd:.3,  lines:['Makanan di sini paling enak seantero pulau!']},
    {n:'Penjaga Api',       c1:'#ff5d1a', c2:'#8b1a00', x:45, z:55, r:3, spd:.25, lines:['Jangan biarkan api unggun ini padam ya']},
    {n:'Nelayan Jelloger',  c1:'#3a8dff', c2:'#1a4a9a', x:12, z:-175,r:5, spd:.3,  lines:['Ikan hari ini banyak sekali, tapi badai akan datang']},
    {n:'Pelaut Jelloger',   c1:'#4a6a8a', c2:'#1a2a4a', x:-25,z:-178,r:5, spd:.4,  lines:['Kapalku siap berlayar ke pulau seberang']},
    {n:'Penjaga Mercusuar', c1:'#f4f4f4', c2:'#8a8a8a', x:8,  z:160, r:4, spd:.2,  lines:['Aku menjaga cahaya ini agar kapal tidak tersesat']},
    {n:'Penjaga Hutan',     c1:'#2f6b3a', c2:'#1a3a20', x:-80,z:-30, r:6, spd:.3,  lines:['Pohon-pohon ini umurnya lebih tua dari kakekku']},
    {n:'Pemandu Jelloger',  c1:'#7fd0ff', c2:'#3a80b0', x:-10,z:95,  r:5, spd:.35, lines:['Ikuti aku, aku tunjukkan tempat terbaik di pulau ini']},
    {n:'@@) JEl00G335',     c1:'#00ff00', c2:'#003300', x:130,z:130, r:2, spd:0, secret:true, lines:['QUFYWDIwMTE=']},
    {n:'DANIS Jelloger',    c1:'#ff00ff', c2:'#660066', x:-130,z:-130,r:2,spd:0, secret:true, lines:['Halo saya danis, ini game buatanku']},
    {n:'Cepu Jelloger',     c1:'#ffff00', c2:'#666600', x:130,z:-130, r:2, spd:0, secret:true, lines:['ada 3 jelloger rahasia di sini selain saya']},
    {n:'Weird Jelloger',    c1:'#ff0000', c2:'#330000', x:-130,z:130, r:2, spd:0, secret:true, lines:['jangan']}
  ],
  desert:[
    {n:'Pedagang Permadani',c1:'#c0501a', c2:'#7a2a00', x:117,z:-43, r:5, spd:.35,lines:['Permadani ini ditenun oleh nenekku, kualitasnya terbaik!']},
    {n:'Penenun Jelloger',  c1:'#b05dff', c2:'#5a1a8b', x:105,z:-35, r:4, spd:.25,lines:['Kain ini dibuat dari bulu unta asli']},
    {n:'Pembuat Tembikar',  c1:'#a07040', c2:'#5a3a1b', x:100,z:-13, r:4, spd:.25,lines:['Hati-hati, tembikar ini mudah pecah']},
    {n:'Penjaga Oasis',     c1:'#3aa0d0', c2:'#1a6080', x:118,z:0,   r:5, spd:.3, lines:['Oasis ini adalah sumber kehidupan kami']},
    {n:'Penjual Air',       c1:'#7fd0ff', c2:'#3a80b0', x:118,z:18,  r:4, spd:.4, lines:['Air! Air segar! Hanya 5 koin!']},
    {n:'Penunggang Unta',   c1:'#d4a848', c2:'#8b6010', x:125,z:-20, r:6, spd:.55,lines:['Untaku bernama Jelly, dia suka meludah ke orang asing']},
    {n:'Penggali Sumur',    c1:'#8b5a2b', c2:'#5a3a1b', x:42, z:18,  r:3, spd:.25,lines:['Aku menggali 30 meter, belum ketemu air juga']},
    {n:'Penjaga Piramida',  c1:'#c8a878', c2:'#7a5a30', x:5,  z:108, r:3, spd:.2, lines:['Jangan masuk! Kutukan akan menimpamu']},
    {n:'Prajurit Firaun',   c1:'#ffd23f', c2:'#8b6010', x:-100,z:-10,r:4, spd:.3, lines:['Firaun memerintahkan aku berjaga di sini']},
    {n:'Penjaga Kuil',      c1:'#c8a878', c2:'#7a5a30', x:-18,z:-105,r:4, spd:.2, lines:['Kuil ini berumur 5000 tahun']},
    {n:'Pemburu Harta',     c1:'#ffd23f', c2:'#8b6a10', x:75, z:-78, r:5, spd:.6, lines:['Aku dengar ada emas di piramida tua itu']},
    {n:'Penambang Emas',    c1:'#ffd23f', c2:'#8b6010', x:-115,z:-10,r:5, spd:.3, lines:['Aku cari emas di tambang itu, sumpah!']},
    {n:'Penari Perut',      c1:'#ff90b8', c2:'#8b3060', x:65, z:40,  r:4, spd:.55,lines:['Ayo lihat tarianku! Hanya 10 koin!']},
    {n:'Penyanyi Jelloger', c1:'#ff8c1a', c2:'#d05000', x:-65,z:40,  r:4, spd:.3, lines:['Dengarkan suaraku! Aku penyanyi terbaik!']},
    {n:'Pembuat Roti',      c1:'#d4a848', c2:'#8b6010', x:45, z:-40, r:3, spd:.25,lines:['Roti baru keluar dari oven!']},
    {n:'Ahli Bintang',      c1:'#3a3a8a', c2:'#101040', x:-25,z:55,  r:4, spd:.2, lines:['Bintang-bintang di gurun lebih terang dari di kota']},
    {n:'Pengembara Pasir',  c1:'#d4a848', c2:'#8b6010', x:140,z:60,  r:8, spd:.55,lines:['Aku sudah 3 hari berjalan tanpa air, tolong...']},
    {n:'Kurir Jelloger',    c1:'#ff5d5d', c2:'#8b1a1a', x:25, z:-65, r:5, spd:.8, lines:['Permisi! Aku sedang buru-buru!']},
    {n:'Penggembala Kambing',c1:'#c8a878',c2:'#7a5a30', x:128,z:52,  r:6, spd:.4, lines:['Kambing-kambingku suka kabur kalau tidak dijaga']},
    {n:'Pelukis Pasir',     c1:'#ffb84a', c2:'#8b6010', x:88, z:72,  r:4, spd:.3, lines:['Aku melukis dengan pasir, seni unik bukan?']},
    {n:'Penjaga Gerbang',   c1:'#8a8a82', c2:'#3a3a32', x:-10,z:10,  r:3, spd:.2, lines:['Selamat datang di kota gurun!']},
    {n:'Penjaga Harta',     c1:'#ffd23f', c2:'#8b6010', x:-148,z:-45,r:5, spd:.25,lines:['Harta ini tidak boleh disentuh siapapun!']},
    {n:'Firaun Jelloger',   c1:'#ffd700', c2:'#8b6010', x:130,z:130, r:2, spd:0, secret:true, lines:['Piramida itu bukan milikku, tapi aku yang membuatnya']},
    {n:'Pedagang Unta J.',  c1:'#c0501a', c2:'#5a1a00', x:-130,z:-130,r:2,spd:0, secret:true, lines:['Untaku bernama Jelly, dia suka meludah ke orang']},
    {n:'Mumi Jelloger',     c1:'#e0d8b0', c2:'#8a8050', x:130,z:-130, r:2, spd:0, secret:true, lines:['Aku sudah tidur 3000 tahun, jangan bangunkan aku']},
    {n:'Fatamorgana J.',    c1:'#ffffff', c2:'#ffd23f', x:-130,z:130, r:2, spd:0, secret:true, lines:['Aku tidak ada di sini, kamu hanya berhalusinasi']}
  ],
  jungle:[
    {n:'Penjaga Candi',     c1:'#8a8a82', c2:'#3a3a32', x:8,  z:108, r:3, spd:.2, lines:['Candi ini dibangun oleh jello kuno 10000 tahun lalu']},
    {n:'Dukun Jelloger',    c1:'#b05dff', c2:'#5a1a8b', x:-95,z:60,  r:5, spd:.25,lines:['Ramuan ini bisa menyembuhkan segala penyakit']},
    {n:'Pemanjat Pohon',    c1:'#5a3a1b', c2:'#2a1a00', x:65, z:80,  r:4, spd:.4, lines:['Aku bisa memanjat pohon tertinggi dalam 10 detik']},
    {n:'Pengumpul Buah',    c1:'#ffe27a', c2:'#b08b20', x:-95,z:-30, r:6, spd:.4, lines:['Buah durian di pohon itu sudah matang!']},
    {n:'Penebang Kayu',     c1:'#8b5a2b', c2:'#5a3a1b', x:95, z:50,  r:5, spd:.4, lines:['Kayu jati dari hutan ini paling kuat']},
    {n:'Penari Hutan',      c1:'#ff90b8', c2:'#8b3060', x:-30,z:30,  r:4, spd:.55,lines:['Aku menari untuk roh hutan']},
    {n:'Pemusik Tradisional',c1:'#ffd23f',c2:'#8b6a10', x:-25,z:60,  r:4, spd:.3, lines:['Aku mainkan alat musik dari bambu']},
    {n:'Penjaga Api Unggun',c1:'#ff5d1a', c2:'#8b1a00', x:50, z:-45, r:3, spd:.25,lines:['Api ini tidak boleh padam, ini penjaga malam']},
    {n:'Penjaga Sungai',    c1:'#3aa0d0', c2:'#1a6080', x:45, z:-85, r:5, spd:.3, lines:['Jangan buang sampah ke sungai!']},
    {n:'Pemandu Air Terjun',c1:'#3aa0d0', c2:'#1a6080', x:-150,z:-40,r:5, spd:.35,lines:['Air terjun di utara sangat indah!']},
    {n:'Penjaga Mata Air',  c1:'#7fd0ff', c2:'#3a80b0', x:25, z:60,  r:4, spd:.3, lines:['Mata air ini suci, jangan dikotori']},
    {n:'Penjaga Goa',       c1:'#5a5a52', c2:'#2a2a22', x:135,z:-58, r:4, spd:.25,lines:['Di dalam goa itu ada kelelawar raksasa']},
    {n:'Penjaga Hutan',     c1:'#1a5a2a', c2:'#0a2a10', x:65, z:65,  r:5, spd:.35,lines:['Hutan ini adalah rumah bagi ribuan makhluk']},
    {n:'Pemburu Jelloger',  c1:'#5a3a1b', c2:'#2a1a00', x:-65,z:65,  r:6, spd:.5, lines:['Aku melihat jejak jaguar tadi malam']},
    {n:'Pawang Ular',       c1:'#3fbf5f', c2:'#1a6a2a', x:75, z:-52, r:4, spd:.35,lines:['Ular-ular di sini jinak, tenang saja']},
    {n:'Ahli Herbal',       c1:'#4fa040', c2:'#1a3a10', x:-85,z:35,  r:4, spd:.3, lines:['Daun ini bisa jadi obat, daun itu racun']},
    {n:'Penjaga Satwa',     c1:'#ff8c1a', c2:'#d05000', x:60, z:-85, r:5, spd:.4, lines:['Jangan ganggu hewan-hewan di sini!']},
    {n:'Pembuat Perahu',    c1:'#8b5a2b', c2:'#5a3a1b', x:-115,z:-75,r:5, spd:.3, lines:['Perahu ini akan kupakai menyusuri sungai']},
    {n:'Pengrajin Bambu',   c1:'#4fa040', c2:'#1a3a10', x:95, z:-38, r:4, spd:.3, lines:['Bambu ini bisa jadi apa saja!']},
    {n:'Pengrajin Anyaman', c1:'#d4a848', c2:'#8b6010', x:-105,z:-5, r:4, spd:.3, lines:['Anyaman bambu ini tahan air loh']},
    {n:'Petani Karet',      c1:'#c8a878', c2:'#7a5a30', x:-105,z:-75,r:5, spd:.35,lines:['Getah karet ini bisa jadi ban mobil']},
    {n:'Pengembara Rimba',  c1:'#3fbf5f', c2:'#1a6a2a', x:130,z:80,  r:8, spd:.6, lines:['Aku tersesat 3 hari di hutan ini']},
    {n:'Dewa Rimba',        c1:'#3fbf5f', c2:'#0a2a10', x:130,z:130, r:2, spd:0, secret:true, lines:['Hutan ini menyimpan rahasia yang tidak boleh kau ketahui']},
    {n:'Orang Utan J.',     c1:'#c0501a', c2:'#5a1a00', x:-130,z:-130,r:2,spd:0, secret:true, lines:['Ugh ugh ugh, aku bukan monyet, aku jello']},
    {n:'Penjaga Candi Kuno',c1:'#c8a878', c2:'#7a5a30', x:130,z:-130, r:2, spd:0, secret:true, lines:['Candi ini menyimpan kekuatan jello purba']},
    {n:'Ratu Lebah',        c1:'#ffd23f', c2:'#8b6a10', x:-130,z:130, r:2, spd:0, secret:true, lines:['Lebah-lebahku membuat madu terbaik di dunia']}
  ],
  snow:[
    {n:'Penjaga Igloo',     c1:'#f0f8ff', c2:'#a8b8c8', x:65, z:80,  r:4, spd:.3, lines:['Igloo ini hangat di dalam, percaya deh']},
    {n:'Pembuat Salju',     c1:'#ffffff', c2:'#c0c0c0', x:-55,z:60,  r:4, spd:.25,lines:['Aku membuat boneka salju setiap hari']},
    {n:'Nelayan Es',        c1:'#7fd0ff', c2:'#3a80b0', x:15, z:-115,r:5, spd:.35,lines:['Aku memancing di bawah es, dingin sekali']},
    {n:'Penjaga Danau',     c1:'#aee0ff', c2:'#5a90b0', x:-20,z:-118,r:4, spd:.25,lines:['Danau ini membeku sepanjang tahun']},
    {n:'Pemancing Es',      c1:'#7fd0ff', c2:'#3a80b0', x:18, z:-100,r:4, spd:.3, lines:['Ikan di bawah es sangat besar']},
    {n:'Penjaga Api',       c1:'#ff5d1a', c2:'#8b1a00', x:55, z:-55, r:3, spd:.3, lines:['Api ini tidak boleh padam, ini nyawa kami']},
    {n:'Pembuat Pakaian',   c1:'#b05dff', c2:'#5a1a8b', x:105,z:-5,  r:4, spd:.3, lines:['Mantel bulu ini hangat sekali']},
    {n:'Pengukir Es',       c1:'#aee0ff', c2:'#5a90b0', x:80, z:80,  r:4, spd:.25,lines:['Ukiran es ini akan bertahan sampai musim panas']},
    {n:'Penjaga Mercusuar Es',c1:'#f4f4f4',c2:'#8a8a8a', x:8,  z:140, r:4, spd:.2, lines:['Cahaya ini menuntun kapal di badai salju']},
    {n:'Penjaga Hutan Pinus',c1:'#2f6b3a',c2:'#1a3a20', x:65, z:65,  r:5, spd:.35,lines:['Pohon pinus ini berumur 200 tahun']},
    {n:'Pemburu Anjing Laut',c1:'#5a5a52',c2:'#2a2a22', x:-65,z:-65, r:5, spd:.5, lines:['Anjing laut di sini sangat lincah']},
    {n:'Penggembala Rusa',  c1:'#8b5a2b', c2:'#5a3a1b', x:125,z:-22, r:6, spd:.4, lines:['Rusa-rusa ini suka makan wortel']},
    {n:'Pemanjat Gunung',   c1:'#3a3a8a', c2:'#101040', x:-105,z:5,  r:6, spd:.55,lines:['Aku sudah mendaki 3 gunung tertinggi!']},
    {n:'Pengembara Salju',  c1:'#dcecff', c2:'#8aa8c8', x:-150,z:80, r:8, spd:.6, lines:['Aku berjalan 100 km untuk sampai sini']},
    {n:'Ahli Cuaca',        c1:'#3aa0d0', c2:'#1a6080', x:-25,z:55,  r:4, spd:.2, lines:['Besok akan turun salju lebih lebat']},
    {n:'Pembuat Sepatu Salju',c1:'#8b5a2b',c2:'#5a3a1b', x:-130,z:25,r:4, spd:.3, lines:['Sepatu ini bisa dipakai di salju tebal']},
    {n:'Penjaga Goa Es',    c1:'#aee0ff', c2:'#5a90b0', x:135,z:62,  r:4, spd:.25,lines:['Di dalam goa itu suhunya -40 derajat']},
    {n:'Pemusik Es',        c1:'#7fd0ff', c2:'#3a80b0', x:-35,z:35,  r:4, spd:.3, lines:['Aku main seruling dari tulang']},
    {n:'Penjual Coklat',    c1:'#8b5a2b', c2:'#5a3a1b', x:25, z:25,  r:4, spd:.25,lines:['Coklat panas! Coklat panas!']},
    {n:'Kurir Salju',       c1:'#ff5d5d', c2:'#8b1a1a', x:25, z:-60, r:5, spd:.8, lines:['Permisi! Aku antar paket!']},
    {n:'Penjaga Ski',       c1:'#3a8dff', c2:'#1a4a9a', x:95, z:-95, r:5, spd:.5, lines:['Jalur ski di sini paling menantang']},
    {n:'Penjaga Perbatasan',c1:'#8a8a82', c2:'#3a3a32', x:-8, z:95,  r:4, spd:.2, lines:['Berhenti! Siapa kau?']},
    {n:'Yeti Jelloger',     c1:'#f0f8ff', c2:'#7fa0c0', x:130,z:130, r:2, spd:0, secret:true, lines:['Aku bukan monster, aku hanya kesepian']},
    {n:'Santa Jelloger',    c1:'#ff0000', c2:'#8b0000', x:-130,z:-130,r:2,spd:0, secret:true, lines:['Ho ho ho, apa kamu sudah jadi anak baik tahun ini?']},
    {n:'Penguin Jelloger',  c1:'#1a1a2a', c2:'#ffffff', x:130,z:-130, r:2, spd:0, secret:true, lines:['Aku bisa berenang lebih cepat dari kamu']},
    {n:'Ratu Es Jelloger',  c1:'#aee0ff', c2:'#5a90b0', x:-130,z:130, r:2, spd:0, secret:true, lines:['Sentuh aku dan kau akan membeku']}
  ]
};

function makeBoostBubble(x,y,z){const g=new THREE.Group();g.position.set(x,y,z);const inner=new THREE.Mesh(new THREE.SphereGeometry(0.7,10,8),new THREE.MeshBasicMaterial({color:0xffb84a}));const outer=new THREE.Mesh(new THREE.SphereGeometry(1.1,10,8),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.3,side:THREE.DoubleSide}));const ring=new THREE.Mesh(new THREE.TorusGeometry(1.3,0.08,4,16),new THREE.MeshBasicMaterial({color:0xff5d5d}));ring.rotation.x=Math.PI/2;g.add(inner,outer,ring);world.add(g);return{m:g,inner,outer,ring,x,y,z,baseY:y,t:Math.random()*6.28,ph:Math.random()*6.28,act:true,respawn:0}}

const TRK={kind:'drag',pts:[],ci:0,par:[250,300,400],bb:{x0:0,z0:0,w:1,h:1},loop:false,len:5000,laps:1,s0:24,curv:[]};let racePrg=0,raceDist=0,lastS=0,myFt=0;
const TBASE={rally:[[116,0],[72,.9],[48,-1.3],[60,1.3],[40,0],[72,-1.3],[60,1.3],[40,0],[80,-1.3],[72,1.3],[48,-1.3],[60,1.3],[40,0],[80,-1.3],[72,1.3],[60,-.9]],neon:[[96,0],[120,.8],[100,-1.2],[80,1.2],[60,0],[120,-.8],[96,1],[96,-1],[100,.6],[72,-.6],[60,0]],beach:[[140,.5],[160,-.7],[120,.4],[180,-.5],[100,.6],[152,-.3]],canyon:[[48,1.3],[44,-1.4],[92,.7],[60,-1.2],[48,1.3],[100,-.7],[72,0]],jelly:[[72,1],[72,-1],[72,1],[72,-1],[120,0],[92,-1.1],[92,1.1],[60,0]]},TPAR={drag:[250,300,400],rally:[280,340,450],neon:[270,330,440],beach:[270,330,440],canyon:[290,350,460],jelly:[280,340,450]};
const LOOPS={rally2:{h:[[3,.15,.6],[5,.11,1.3],[7,.07,.2],[10,.03,2.1]],sx:1.35,sz:.8},neon2:{h:[[2,.2,.4],[3,.1,1.1],[5,.05,2.2]],sx:1.5,sz:.85}};
const isLoop=k=>k=='rally2'||k=='neon2',isNeon=k=>k=='neon'||k=='neon2';
const THEMES={
 drag:{sky:[0x87c8ff,0xfff4c2]},
 rally:{sky:[0x6fb4e8,0xf6d9a0]},
 neon:{sky:[0x080826,0x4a1a7a]},
 beach:{scene:'beach',sky:[0xff7a5c,0xffe0a8],gc:'#2aa8d8',rc:'#5e6270',tt:'rgba(0,0,0,.2)',cl:'#ffd23f',re:'rgba(255,255,255,.6)',cb:['#ff7a3a','#ffffff'],bar:[0xf4efe0,0xff7a3a],gate:0xff7a3a,sun:0xfff0b0,sunS:1.7},
 canyon:{scene:'canyon',sky:[0x5f93d8,0xffc890],gc:'#c06a40',rc:'#5c4540',tt:'rgba(40,20,10,.3)',re:'rgba(255,230,190,.5)',cb:['#d0602a','#f0d8b0'],bar:[0xb08060,0xffd23f],gate:0xffb040,sun:0xfff4c2,sunS:1.2},
 jelly:{scene:'jelly',sky:[0xb878ff,0xffd0f0],gc:'#ff9ad8',rc:'#e4e8ff',tt:'rgba(150,100,230,.25)',cl:'#ff5db1',re:'rgba(120,80,200,.6)',cb:['#7fd0ff','#ff5db1'],bar:[0xffffff,0x7fd0ff],gate:0xff5db1,sun:0xffffff,sunS:1.3}
};
const SCENES={
scatter(from,to,step,o0,o1,minD,mk){const L=[];for(let sd=from;sd<to;sd+=step)for(const sx of[-1,1]){const q=trkAt(sd+Math.random()*step,sx*(o0+Math.random()*(o1-o0)));if(trkDist(q.x,q.z)<minD)continue;L.push(mk?mk(q,sx):{x:q.x,z:q.z,s:.8+Math.random()*.5,r:Math.random()*6.28})}return L},
clouds(){for(let i=0;i<Math.round(10*AMB_MULT);i++){const q=trkAt(Math.random()*TRK.len,0);spawnAmb('clouds',{x:q.x+(Math.random()-.5)*400,y:45+Math.random()*20,z:q.z+(Math.random()-.5)*400,spd:.5+Math.random(),sx:1+Math.random()*1.2,sy:1+Math.random()*.4,sz:.8+Math.random()*.8})}},
beach(lv){
  const W=RW,LL=TRK.len,S=SCENES,sand=(c,rx)=>LM(0xffffff,{map:tex(32,32,(x,w,h)=>noise(x,w,h,c,w*h/3,.3),rx,1)});
  ribbon(-56,56,0,24,sand('#f2d68a',8));ribbon(-64,-56,-.02,24,sand('#d9bf80',1));ribbon(56,64,-.02,24,sand('#d9bf80',1));
  const foam=[ribbon(-69,-64,-.035,10,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false})),ribbon(64,69,-.035,10,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false}))];
  ANIM.push((dt,t)=>{const o=.55+Math.sin(t/420)*.3;foam.forEach(m=>m.material.opacity=o)});
  instance(treeGeo('palm'),S.scatter(0,LL,[26,18,13,9][lv],22,52,W/2+9));
  instance(treeGeo('rock'),S.scatter(0,LL,[80,50,34,24][lv],14,50,W/2+7));
  instance(treeGeo('grassDry'),S.scatter(0,LL,[999,14,8,5][lv],12,50,W/2+5));
  const um=[[],[]];for(let sd=60;sd<LL;sd+=85){const sx=Math.random()<.5?-1:1,q=trkAt(sd,sx*(20+Math.random()*12));um[(Math.random()*2)|0].push({x:q.x,z:q.z,s:1,r:Math.random()*6.28})}
  [0xff5d5d,0x3d8bff].forEach((c,i)=>instance(mergeParts([{geo:BOX(.18,3.2,.18),y:1.6,color:0xf0f0f0},{geo:new THREE.ConeGeometry(2.6,1,8),y:3.4,color:c},{geo:BOX(2.6,.08,1.2),z:2.4,y:.05,color:c==0xff5d5d?0xffffff:0xffd23f}]),um[i]));
  const lg=[];for(let sd=150;sd<LL;sd+=420){const sx=(sd/420|0)%2?1:-1,q=trkAt(sd,sx*24);lg.push({x:q.x,z:q.z,s:1,r:q.h})}
  const legs=[[-1.2,-1.2],[1.2,-1.2],[-1.2,1.2],[1.2,1.2]].map(([x,z])=>({geo:BOX(.3,3,.3),x,y:1.5,z,color:0x8b5a2b}));
  instance(mergeParts(legs.concat([{geo:BOX(3.4,2,3.4),y:4,color:0xffffff},{geo:BOX(3.5,.5,3.5),y:5.2,color:0xff5d5d},{geo:new THREE.ConeGeometry(2.8,1.6,4),y:6.3,ry:Math.PI/4,color:0xff5d5d}])),lg);
  const lh=[];for(let sd=300;sd<LL;sd+=1100){const sx=(sd/1100|0)%2?1:-1,q=trkAt(sd,sx*105);lh.push({x:q.x,z:q.z,s:1,r:0})}
  instance(mergeParts([{geo:new THREE.CylinderGeometry(3.5,4.5,22,10),y:11,color:0xf4f4f4},{geo:new THREE.CylinderGeometry(3.6,4.6,3,10),y:6,color:0xff5d5d},{geo:new THREE.CylinderGeometry(3.4,4.1,3,10),y:14,color:0xff5d5d},{geo:new THREE.CylinderGeometry(4.5,4.5,1,10),y:22.5,color:0x2a2a2a},{geo:new THREE.CylinderGeometry(2.6,2.6,4,8),y:25,color:0xffe27a},{geo:new THREE.ConeGeometry(3.4,2.5,8),y:28.2,color:0xff5d5d}]),lh);
  const sb=[];for(let sd=100;sd<LL;sd+=190){const sx=Math.random()<.5?-1:1,q=trkAt(sd,sx*(85+Math.random()*130));sb.push({x:q.x,z:q.z,s:.9+Math.random()*.6,r:Math.random()*6.28})}
  instance(mergeParts([{geo:BOX(2,.8,6),y:.4,color:0xffffff},{geo:BOX(2.1,.25,6.1),y:.75,color:0xff5d5d},{geo:BOX(.2,7,.2),y:4,color:0x8b5a2b},{geo:new THREE.ConeGeometry(2.4,6.5,3),y:4.6,x:.05,sx:.12,color:0xfff6e0}]),sb);
  S.clouds()
},
canyon(lv){
  const W=RW,LL=TRK.len,S=SCENES;
  const mesa=mergeParts([{geo:BOX(1,.34,1),y:.17,color:0xb5573a},{geo:BOX(.84,.3,.84),y:.49,color:0xd07a4a},{geo:BOX(.7,.2,.7),y:.74,color:0xe0a060},{geo:BOX(.62,.2,.62),y:.94,color:0xc86a40}]);
  const far=[],wall=[];
  for(let sd=-20;sd<LL+40;sd+=[34,26,20,15][lv])for(const sx of[-1,1]){const w=14+Math.random()*16,h=30+Math.random()*44,q=trkAt(sd+Math.random()*20,sx*(46+w*.5+Math.random()*50));if(trkDist(q.x,q.z)<W/2+10+w*.55)continue;far.push({x:q.x,z:q.z,sx:w,sy:h,sz:w*(.8+Math.random()*.5),r:Math.random()*6.28})}
  for(let sd=-20;sd<LL+40;sd+=[28,20,15,12][lv])for(const sx of[-1,1]){const q=trkAt(sd+Math.random()*10,sx*(W/2+24+Math.random()*6));if(trkDist(q.x,q.z)<W/2+17)continue;wall.push({x:q.x,z:q.z,sx:16,sy:16+Math.random()*20,sz:16+Math.random()*6,r:q.h})}
  instance(mesa,far);instance(mesa,wall);
  const arch=[];for(let d=700;d<LL-200;d+=900){const q=trkAt(d,0);arch.push({x:q.x,z:q.z,r:q.h,s:1})}
  instance(mergeParts([{geo:BOX(7,24,8),x:-(W/2+9),y:12,color:0xc0603a},{geo:BOX(7,24,8),x:W/2+9,y:12,color:0xc0603a},{geo:BOX(W+26,7,9),y:25,color:0xd07a4a},{geo:BOX(W+20,2,10),y:29,color:0xe0a060}]),arch);
  instance(treeGeo('cactus'),S.scatter(0,LL,[60,36,24,16][lv],12,24,W/2+5));
  instance(treeGeo('dead'),S.scatter(0,LL,[110,70,45,30][lv],12,26,W/2+5));
  instance(treeGeo('rock'),S.scatter(0,LL,[40,26,18,12][lv],11,26,W/2+4));
  instance(treeGeo('grassDry'),S.scatter(0,LL,[999,18,10,6][lv],10,30,W/2+4));
  S.clouds()
},
jelly(lv){
  const W=RW,LL=TRK.len,S=SCENES;
  const dome=c=>mergeParts([{geo:new THREE.SphereGeometry(1,12,8,0,6.2832,0,1.5708),sy:.85,color:c},{geo:BOX(.16,.28,.1),x:-.3,y:.45,z:.8,color:0x17306b},{geo:BOX(.16,.28,.1),x:.3,y:.45,z:.8,color:0x17306b}]);
  [0xff8ad8,0x7fd0ff,0x9af0a8,0xffe27a].forEach(c=>{const L=S.scatter(0,LL,[110,70,45,32][lv],26,70,W/2+14,(q,sx)=>({x:q.x,z:q.z,s:4+Math.random()*7,r:Math.atan2(-sx*Math.cos(q.h),sx*Math.sin(q.h))+(Math.random()-.5)*.8}));instance(dome(c),L)});
  [0xff5db1,0x7fd0ff].forEach(c=>{const L=S.scatter(0,LL,[60,40,28,20][lv],14,28,W/2+6,(q)=>({x:q.x,z:q.z,s:1+Math.random()*.4,r:q.h}));instance(mergeParts([{geo:BOX(.3,7,.3),y:3.5,color:0xffffff},{geo:new THREE.CylinderGeometry(2.2,2.2,.6,10),y:8.2,rx:Math.PI/2,color:c},{geo:new THREE.CylinderGeometry(1.4,1.4,.7,10),y:8.2,rx:Math.PI/2,color:0xffffff}]),L)});
  const bm=[0xffb0f0,0x9fe0ff,0xc8ffd0].map(c=>new THREE.MeshPhongMaterial({color:c,transparent:true,opacity:.5,shininess:100,flatShading:true})),bl=[];
  for(let i=0;i<[20,40,70,110][lv];i++){const q=trkAt(Math.random()*LL,(Math.random()<.5?-1:1)*(24+Math.random()*70));if(trkDist(q.x,q.z)<W/2+14)continue;const r=2+Math.random()*6,m=Mt(new THREE.SphereGeometry(r,10,8),bm[i%3],q.x,r*.9+Math.random()*8,q.z);bl.push({m,y0:m.position.y,ph:Math.random()*6.28,sp:.6+Math.random()*.8})}
  ANIM.push((dt,t)=>{for(const b of bl)b.m.position.y=b.y0+Math.sin(t/900*b.sp+b.ph)*1.2});
  S.clouds()
}};

function setTrack(k){const loop=isLoop(k),P=[];
  if(loop){const c=LOOPS[k],M=4000,L=5000,N=1250,raw=[],cum=[0];
    for(let i=0;i<M;i++){const t=i/M*6.2832;let r=1;for(const[n,a,p]of c.h)r+=a*Math.cos(n*t+p);raw.push([Math.cos(t)*r*c.sx,Math.sin(t)*r*c.sz])}
    let len=0;for(let i=1;i<=M;i++){const a=raw[i-1],b=raw[i%M];len+=Math.hypot(b[0]-a[0],b[1]-a[1]);cum.push(len)}
    const k2=L/len;let j=0;
    for(let i=0;i<N;i++){const s=i/N*len;while(cum[j+1]<s)j++;const u=(s-cum[j])/(cum[j+1]-cum[j]),a=raw[j],b=raw[(j+1)%M];P.push({x:(a[0]+(b[0]-a[0])*u)*k2,z:(a[1]+(b[1]-a[1])*u)*k2,s:i*4})}
    P.push({x:P[0].x,z:P[0].z,s:L});
    let pv=null;for(let i=0;i<N;i++){const a=P[i],b=P[i+1];let hh=Math.atan2(b.x-a.x,b.z-a.z);if(pv!==null){while(hh-pv>Math.PI)hh-=6.2832;while(hh-pv<-Math.PI)hh+=6.2832}a.h=hh;pv=hh}
    let h0=P[0].h;while(h0-pv>Math.PI)h0-=6.2832;while(h0-pv<-Math.PI)h0+=6.2832;P[N].h=h0}
  else{const base=TBASE[k],sg=[[24,0]];let tot=0;
    if(!base)sg.push([5000,0]);else outer:for(let r=0;r<30;r++)for(const[l,a]of base){if(tot+l>=5000){sg.push([5000-tot,a*(5000-tot)/l]);break outer}sg.push([l,a]);tot+=l}
    sg.push([40,0]);let x=0,z=-24,h=0;P.push({x,z,h,s:-24});
    for(const[len,da]of sg){const n=len/4;for(let i=0;i<n;i++){const h2=h+da/n/2;x+=Math.sin(h2)*4;z+=Math.cos(h2)*4;h+=da/n;P.push({x,z,h,s:P[P.length-1].s+4})}}}
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;P.forEach(p=>{p.nx=Math.cos(p.h);p.nz=-Math.sin(p.h);x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z)});
  const n=P.length-1,cv=[];for(let i=0;i<=n;i++){const j=loop?(i+5)%n:Math.min(n,i+5);let d=P[j].h-P[i].h;d=Math.atan2(Math.sin(d),Math.cos(d));cv.push(Math.abs(d)/20)}
  Object.assign(TRK,{pts:P,kind:k,ci:0,par:TPAR[k],bb:{x0,z0,w:Math.max(1,x1-x0),h:z1-z0},loop,len:5000,laps:1,s0:loop?0:24,curv:cv})}
function trkAt(s,off){const P=TRK.pts;let f;if(TRK.loop){s=(s%TRK.len+TRK.len)%TRK.len;f=s/4}else f=Math.max(0,Math.min(P.length-1.001,(s+TRK.s0)/4));const i=f|0,u=f-i,a=P[i],b=P[i+1];return{x:a.x+(b.x-a.x)*u+a.nx*(off||0),z:a.z+(b.z-a.z)*u+a.nz*(off||0),h:a.h}}
function trkNear(x,z,from){const P=TRK.pts,n=P.length-1,lp=TRK.loop;let bi=from,bd=1e9,bu=0,bx=0,bz=0;const i0=lp?from-6:Math.max(0,from-6),i1=lp?from+10:Math.min(P.length-2,from+10);for(let ii=i0;ii<=i1;ii++){const i=lp?(ii%n+n)%n:ii,a=P[i],b=P[i+1],dx=b.x-a.x,dz=b.z-a.z;let u=((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz);u=Math.max(0,Math.min(1,u));const px=a.x+dx*u,pz=a.z+dz*u,d=Math.hypot(x-px,z-pz);if(d<bd){bd=d;bi=i;bu=u;bx=px;bz=pz}}const p=P[bi];return{i:bi,s:p.s+bu*4,d:(x-bx)*p.nx+(z-bz)*p.nz,px:bx,pz:bz}}
function trkDist(x,z){let m=1e9;for(const p of TRK.pts){const d=Math.hypot(x-p.x,z-p.z);if(d<m)m=d}return m}
function ribbon(o0,o1,y,vs,mat){const P=TRK.pts,pos=[],uv=[],idx=[];P.forEach((p,i)=>{pos.push(p.x+p.nx*o0,y,p.z+p.nz*o0,p.x+p.nx*o1,y,p.z+p.nz*o1);uv.push(0,p.s/vs,1,p.s/vs);if(i<P.length-1){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3)}});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return Mt(g,mat,0,0,0)}
function drawTrkMap(x){const b=TRK.bb,k=84/Math.max(b.w,b.h,1),ox=(96-b.w*k)/2,fx=v=>ox+(v-b.x0)*k,fz=v=>90-(v-b.z0)*k;x.fillStyle='#17306b';x.fillRect(0,0,96,96);x.strokeStyle='#7fd0ff';x.lineWidth=3;x.beginPath();TRK.pts.forEach((p,i)=>i?x.lineTo(fx(p.x),fz(p.z)):x.moveTo(fx(p.x),fz(p.z)));x.stroke();x.fillStyle='#e22';for(const id in P)x.fillRect(fx(P[id].x)-2,fz(P[id].z)-2,4,4);for(const b of BOTS){x.fillStyle=b.d.c1;x.fillRect(fx(b.p.x)-2,fz(b.p.z)-2,4,4)}x.fillStyle='#ffd23f';x.fillRect(fx(pl.x)-3,fz(pl.z)-3,6,6)}
function buildCurved(){
  const k=TRK.kind,neon=isNeon(k),TH=THEMES[k]||THEMES.rally,loop=TRK.loop,LL=TRK.len,T=TXS(),lv=FXL(),P=TRK.pts,W=RW,b=TRK.bb,mat=m=>LM(0xffffff,{map:m}),bas=m=>new THREE.MeshBasicMaterial({map:m}),gm=neon?bas:mat;
  const gw=b.w+900,gh=b.h+900;
  Mt(new THREE.PlaneGeometry(gw,gh).rotateX(-1.5708),gm(tex(T,T,(x,w,h)=>{noise(x,w,h,neon?'#0a0e2a':(TH.gc||'#4f9a45'),w*h/5,.3);if(neon){x.strokeStyle='#1a2a7a';x.strokeRect(0,0,w,h)}},gw/12,gh/12)),b.x0+b.w/2,-.05,b.z0+b.h/2);
  ribbon(-W/2,W/2,.04,8,gm(tex(64,64,(x,w,h)=>{if(neon){noise(x,w,h,'#15182e',w*h/3,.2);x.fillStyle='#00e5ff';x.fillRect(1,0,2,h);x.fillRect(w-3,0,2,h);x.fillStyle='#ff2bd6';x.fillRect(w/2-1,0,2,h/2)}else{noise(x,w,h,TH.rc||'#a0805a',w*h/2,.35);x.fillStyle=TH.tt||'rgba(60,40,20,.35)';x.fillRect(w*.28,0,5,h);x.fillRect(w*.65,0,5,h);x.fillStyle=TH.re||'rgba(255,255,255,.35)';x.fillRect(0,0,2,h);x.fillRect(w-2,0,2,h);if(TH.cl){x.fillStyle=TH.cl;x.fillRect(w/2-1,0,2,h/2)}}})));
  const cb=tex(8,16,(x,w,h)=>{x.fillStyle=neon?'#00e5ff':(TH.cb?TH.cb[0]:'#e33');x.fillRect(0,0,w,h/2);x.fillStyle=neon?'#ff2bd6':(TH.cb?TH.cb[1]:'#fff');x.fillRect(0,h/2,w,h/2)},1,1);
  ribbon(W/2,W/2+1.2,.1,2,bas(cb));ribbon(-W/2-1.2,-W/2,.1,2,bas(cb));
  const bar=[],sg=[];P.forEach((p,i)=>{if(i<2)return;if(i%2==0)[-1,1].forEach(sd=>bar.push({x:p.x+p.nx*sd*(W/2+2.2),z:p.z+p.nz*sd*(W/2+2.2),r:p.h-1.5708}));const dh=P[Math.min(P.length-1,i+1)].h-P[i-1].h;if(!neon&&Math.abs(dh)>.03&&i%6==0){const sd=dh>0?-1:1;sg.push({x:p.x+p.nx*sd*(W/2+4),z:p.z+p.nz*sd*(W/2+4),r:p.h,s:1.2})}});
  instance(mergeParts([{geo:BOX(8.3,1.1,.8),y:.55,color:neon?0x1a1f4a:(TH.bar?TH.bar[0]:0xc9ced6)},{geo:BOX(8.32,.3,.82),y:.85,color:neon?0x00e5ff:(TH.bar?TH.bar[1]:0xdd3333)}]),bar);
  if(sg.length)instance(mergeParts([{geo:BOX(.2,3,.2),y:1.5,color:0x444444},{geo:BOX(2.4,1.8,.2),y:3,color:0xffd23f},{geo:BOX(1.4,.5,.22),y:3,color:0x111111}]),sg);
  const ck=tex(16,16,(x,w,h)=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#fff':'#111';x.fillRect(i*8,j*8,8,8)}},W/2,1);
  (loop?[0]:[0,LL]).forEach(d=>{const c=trkAt(d,0);Mt(new THREE.PlaneGeometry(W,2).rotateX(-1.5708),new THREE.MeshBasicMaterial({map:ck}),c.x,.12,c.z).rotation.y=c.h});
  for(let d=0;loop?d<LL:d<=LL;d+=500){const e=d==0||d==LL,col=neon?(d%1000?0x00e5ff:0xff2bd6):e?0x222233:(TH.gate||0xffd23f),c=trkAt(d,0);
    [-1,1].forEach(sd=>{const a=trkAt(d,sd*(W/2+3.2));Mt(BOX(.9,9,.9),LM(col),a.x,4.5,a.z)});Mt(BOX(W+7,2.4,.9),LM(col),c.x,9.4,c.z).rotation.y=c.h;
    const lb=d==0?(loop?'START/FINISH':'START'):d==LL?'FINISH':d+'J',sp=spr(128,32,x=>{x.fillStyle='#17306b';x.fillRect(0,0,128,32);x.fillStyle='#fff';x.font=(lb.length>7?'bold 15px':'bold 22px')+' monospace';x.textAlign='center';x.fillText(lb,64,24)},9,2.2);sp.position.set(c.x,9.4,c.z);world.add(sp)}
  const cr=[];for(const d of(loop?[0]:[0,LL]))for(const sd of[-1,1])for(let t=0;t<4;t++){const c=trkAt(d,sd*(W/2+7+t*2.6));Mt(BOX(2.6,1.4*(t+1),44),LM(0x6b7380),c.x,.7*(t+1),c.z).rotation.y=c.h;for(let q=0;q<30;q++){const a=trkAt(d-21+q*1.4,sd*(W/2+7+t*2.6));cr.push({x:a.x,y:1.4*(t+1)+.5,z:a.z})}}
  CROWD=crowd(cr);
  const A=loop?0:-12,Z=loop?LL:LL+40,sc1=LL/1000;
  if(neon){
    const wt=tex(32,64,(x,w,h)=>{x.fillStyle='#10163a';x.fillRect(0,0,w,h);for(let i=0;i<8;i++)for(let j=0;j<16;j++)if(Math.random()<.45){x.fillStyle=['#ffe27a','#7fe8ff','#ff7ad9'][(Math.random()*3)|0];x.fillRect(i*4+1,j*4+1,2,2)}},1,1),bl=[[],[],[]],gap=[22,16,12,9][lv];
    for(let sd=A;sd<Z;sd+=gap)for(const sx of[-1,1]){const q=trkAt(sd+Math.random()*gap,sx*(26+Math.random()*34));if(trkDist(q.x,q.z)<W/2+16)continue;bl[(Math.random()*3)|0].push(q)}
    [28,48,76].forEach((H,bi)=>{const l=bl[bi];if(!l.length)return;const g=new THREE.BoxGeometry(14,H,14),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*2,uv.getY(i)*H/14);const im=new THREE.InstancedMesh(g,new THREE.MeshBasicMaterial({map:wt}),l.length),m4=new THREE.Matrix4(),c=new THREE.Color();im.frustumCulled=false;l.forEach((p,i)=>{m4.makeTranslation(p.x,H/2,p.z);im.setMatrixAt(i,m4);im.setColorAt(i,c.setHSL(Math.random(),.6,.75))});world.add(im)});
    [[-1,0x00e5ff],[1,0xff2bd6]].forEach(([sd,c])=>{const m=ribbon(sd*(W/2+1.2)-.3,sd*(W/2+1.2)+.3,.14,8,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.9}));if(lv>=2)ANIM.push((dt,t)=>{m.material.opacity=.65+Math.sin(t/250+sd)*.3})});
    const st=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:0xffffff,size:2.2,fog:false})),sp=[];for(let i=0;i<[120,200,300,420][lv];i++){const a=Math.random()*6.28,e=.15+Math.random()*1.2;sp.push(Math.cos(a)*Math.cos(e)*250,Math.sin(e)*250,Math.sin(a)*Math.cos(e)*250)}st.geometry.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));st.frustumCulled=false;world.add(st);ANIM.push(()=>st.position.set(pl.x,0,pl.z));
  }else if(TH.scene){SCENES[TH.scene](lv)}else{
    const ts={},step=[24,16,11,8][lv];
    for(let sd=0;sd<LL;sd+=step)for(const sx of[-1,1]){const q=trkAt(sd+Math.random()*step,sx*(24+Math.random()*18));if(trkDist(q.x,q.z)<W/2+10)continue;const t=['pine','oak','cherry'][(Math.random()*(sd%1500>750?3:2))|0];(ts[t]=ts[t]||[]).push({x:q.x,z:q.z,s:.8+Math.random()*.5,r:Math.random()*6.28})}
    for(const t in ts)instance(treeGeo(t),ts[t]);
    const gt=[];for(let i=0,n=Math.round([0,120,260,480][lv]*sc1/2);i<n;i++){const q=trkAt(Math.random()*LL,(Math.random()<.5?-1:1)*(12+Math.random()*10));gt.push({x:q.x,z:q.z,s:.8+Math.random()*.6,r:Math.random()*6.28})}if(gt.length)instance(treeGeo('grassTuft'),gt);
    const mt=[];for(let sd=-40;sd<(loop?LL:LL+60);sd+=45)[-1,1].forEach(sx=>{const q=trkAt(sd,sx*(150+Math.random()*90)),h=26+Math.random()*34;if(loop&&trkDist(q.x,q.z)<100)return;mt.push({x:q.x,z:q.z,sx:h*.9,sy:h,sz:h*.9,r:Math.random()*6})});
    instance(mergeParts([{geo:new THREE.ConeGeometry(1,1,7),y:.5,color:0x6e7f94},{geo:new THREE.ConeGeometry(.4,.4,7),y:.8,color:0xffffff}]),mt);
    for(let i=0;i<Math.round(10*AMB_MULT);i++){const q=trkAt(Math.random()*LL,0);spawnAmb('clouds',{x:q.x+(Math.random()-.5)*400,y:45+Math.random()*20,z:q.z+(Math.random()-.5)*400,spd:.5+Math.random(),sx:1+Math.random()*1.2,sy:1+Math.random()*.4,sz:.8+Math.random()*.8})}
  }
  for(let sd=45;sd<LL-30;sd+=110){const q=trkAt(sd,(Math.random()-.5)*10);boostBubbles.push(makeBoostBubble(q.x,1.6,q.z))}
  if(lv>=2)pool('streaks',BOX(.06,.06,4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5}),24);
}

const RL=5000,RW=18,SPIN=[],RG=[],_m4=new THREE.Matrix4();let CROWD=null,cp=null,pf=false;
function tex(w,h,f,rx,ry){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.NearestFilter;t.repeat.set(rx||1,ry||1);return t}
function noise(x,w,h,col,n,a){x.fillStyle=col;x.fillRect(0,0,w,h);for(let i=0;i<n;i++){const v=(Math.random()-.5)*a;x.fillStyle=v>0?'rgba(255,255,255,'+v+')':'rgba(0,0,0,'+-v+')';x.fillRect(Math.random()*w|0,Math.random()*h|0,2,2)}}
const TXS=()=>[32,64,128,256][FXL()];
function ring(x,z,c,y,min){if(FXL()<(min??2))return;let q=RG.find(o=>o.l<=0);if(!q){if(RG.length>=14)return;q={l:0,m:Mt(new THREE.RingGeometry(.6,.85,24).rotateX(-1.5708),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide}),0,0,0,sc)};RG.push(q)}q.l=.6;q.m.material.color.set(c);q.m.position.set(x,y??(.12+gOff(x,z)),z);q.m.visible=true}
function crowd(l){const im=new THREE.InstancedMesh(BOX(.6,1,.6),new THREE.MeshPhongMaterial({flatShading:true}),l.length),m=new THREE.Matrix4(),c=new THREE.Color();im.frustumCulled=false;l.forEach((p,i)=>{m.makeTranslation(p.x,p.y,p.z);im.setMatrixAt(i,m);im.setColorAt(i,c.setHSL(Math.random(),.75,.55))});world.add(im);return{im,l}}
function buildRace(){
  const T=TXS(),lv=FXL(),ZL=RL+40,ZN=1000,zAt=z=>(Math.floor((z+100)/ZN)%4+4)%4,mat=m=>LM(0xffffff,{map:m});
  const zones=[['#4a9a4a',['pine','oak'],'grassTuft'],['#d8b878',['palm','cactus'],'grassDry'],['#eef6ff',['snowpine','snowMound'],'snowMound'],['#5ab05a',['cherry','oak'],'grassTuft']];
  const zt=zones.map(([c])=>tex(T,T,(x,w,h)=>noise(x,w,h,c,w*h/5,.35),90,ZN/10));
  for(let i=0;i<17;i++)Mt(new THREE.PlaneGeometry(900,ZN+.4).rotateX(-1.5708),mat(zt[i%4]),0,-.05-(i%2)*.002,-100+i*ZN+ZN/2);
  Mt(new THREE.PlaneGeometry(RW,ZL).rotateX(-1.5708),mat(tex(64,64,(x,w,h)=>{noise(x,w,h,'#3d414b',w*h/3,.3);x.fillStyle='#fff';x.fillRect(1,0,2,h);x.fillRect(w-3,0,2,h);x.fillStyle='#ffd23f';x.fillRect(w/2-1,0,2,h/2)},1,ZL/8)),0,.04,RL/2);
  const cb=tex(8,16,(x,w,h)=>{x.fillStyle='#e33';x.fillRect(0,0,w,h/2);x.fillStyle='#fff';x.fillRect(0,h/2,w,h/2)},1,ZL/2);
  [-1,1].forEach(s=>Mt(BOX(1.2,.16,ZL),mat(cb),s*(RW/2+.6),.1,RL/2));
  const bar=[];for(let z=-16;z<RL+20;z+=8.2)[-1,1].forEach(s=>bar.push({x:s*(RW/2+2.2),z,r:Math.PI/2}));
  instance(mergeParts([{geo:BOX(8.1,1.1,.8),y:.55,color:0xc9ced6},{geo:BOX(8.12,.3,.82),y:.85,color:0xdd3333}]),bar);
  const ck=tex(16,16,(x,w,h)=>{for(let i=0;i<2;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?'#fff':'#111';x.fillRect(i*8,j*8,8,8)}},RW/2,1);
  [0,RL].forEach(d=>Mt(new THREE.PlaneGeometry(RW,2).rotateX(-1.5708),new THREE.MeshBasicMaterial({map:ck}),0,.09,d));
  for(let d=0;d<=RL;d+=500){const e=d==0||d==RL,c=e?0x222233:0xffd23f;
    [-1,1].forEach(s=>Mt(BOX(.9,9,.9),LM(c),s*(RW/2+3.2),4.5,d));Mt(BOX(RW+7,2.4,.9),LM(c),0,9.4,d);
    const sp=spr(128,32,x=>{x.fillStyle='#17306b';x.fillRect(0,0,128,32);x.fillStyle='#fff';x.font='bold 22px monospace';x.textAlign='center';x.fillText(d==0?'START':d==RL?'FINISH':d+'J',64,24)},9,2.2);sp.position.set(0,9.4,d-.6);world.add(sp)}
  [[900,'GURUN',0xd8a850],[1900,'SALJU',0x8fd0ff],[2900,'SAKURA',0xff8ac8],[3900,'HUTAN',0x4a9a4a],[4900,'GURUN',0xd8a850]].forEach(([d,nm,c])=>{[-1,1].forEach(s=>Mt(BOX(.9,9,.9),LM(c),s*(RW/2+3.2),4.5,d));Mt(BOX(RW+7,2.4,.9),LM(c),0,9.4,d);const sp=spr(128,32,x=>{x.fillStyle='#17306b';x.fillRect(0,0,128,32);x.fillStyle='#fff';x.font='bold 18px monospace';x.textAlign='center';x.fillText(nm,64,24)},9,2.2);sp.position.set(0,9.4,d-.6);world.add(sp)});
  const cr=[];
  for(const d of[0,RL])for(const s of[-1,1])for(let t=0;t<4;t++){const x=s*(RW/2+7+t*2.6);Mt(BOX(2.6,1.4*(t+1),44),LM(0x6b7380),x,.7*(t+1),d);for(let k=0;k<30;k++)cr.push({x:x+(Math.random()-.5)*1.4,y:1.4*(t+1)+.5,z:d-21+k*1.4+Math.random()*.3})}
  CROWD=crowd(cr);
  const ts={},step=[22,15,10,7][lv];
  for(let z=0;z<RL;z+=step)for(const s of[-1,1]){const t=zones[zAt(z)][1][((z/step|0)+(s>0?1:0))%2];(ts[t]=ts[t]||[]).push({x:s*(24+Math.random()*16),z:z+Math.random()*step,s:.8+Math.random()*.5,r:Math.random()*6.28})}
  for(const t in ts)instance(treeGeo(t),ts[t]);
  const gt=[];for(let i=0;i<[0,120,260,480][lv]*5;i++)gt.push({x:(Math.random()<.5?-1:1)*(12+Math.random()*10),z:Math.random()*RL,s:.8+Math.random()*.6,r:Math.random()*6.28});
  gt.sort((a,b)=>a.z-b.z);
  for(let i=0;i<4;i++){const l=gt.filter(g=>zAt(g.z)==i);if(l.length)instance(treeGeo(zones[i][2]),l)}
  const mt=[];for(let z=-40;z<RL+60;z+=45)[-1,1].forEach(s=>{const h=26+Math.random()*34;mt.push({x:s*(130+Math.random()*90),z,sx:h*.9,sy:h,sz:h*.9,r:Math.random()*6})});
  instance(mergeParts([{geo:new THREE.ConeGeometry(1,1,7),y:.5,color:0x6e7f94},{geo:new THREE.ConeGeometry(.4,.4,7),y:.8,color:0xffffff}]),mt);
  const bt=[['#ff5db1','MEET-UP'],['#3d8bff','BALAPAN 5000J'],['#ffd23f','JELLO RACING']].map(([c,t])=>tex(128,48,x=>{x.fillStyle=c;x.fillRect(0,0,128,48);x.fillStyle='#fff';x.strokeStyle='#17306b';x.lineWidth=4;x.font='bold 13px monospace';x.textAlign='center';x.strokeText(t,64,28);x.fillText(t,64,28)}));
  for(let z=70,i=0;z<RL;z+=260,i++)[-1,1].forEach(s=>{Mt(BOX(.4,7,.4),LM(0x555a66),s*(RW/2+13),3.5,z);Mt(new THREE.PlaneGeometry(12,4.5).rotateY(-s*Math.PI/2),new THREE.MeshBasicMaterial({map:bt[i%3]}),s*(RW/2+13),7.5,z)});
  for(let z=45;z<RL-30;z+=110)boostBubbles.push(makeBoostBubble((Math.random()-.5)*10,1.6,z));
  for(let i=0;i<Math.round(14*AMB_MULT);i++)spawnAmb('clouds',{x:(Math.random()-.5)*400,y:45+Math.random()*20,z:(Math.random()-.5)*500,spd:.5+Math.random(),sx:1+Math.random()*1.2,sy:1+Math.random()*.4,sz:.8+Math.random()*.8});
  if(lv>=2)pool('streaks',BOX(.06,.06,4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5}),24);
}

const MON={on:false,list:[],atk:0,last:9,regen:0,pops:[]},JDR=[];let SLASH=null;
const MDEF={
  kepiting:{n:'Kepiting',hp:4,jb:5,spd:3.2,dmg:1,col:0xe8553a},
  tengkorak:{n:'Tengkorak',hp:7,jb:12,spd:3.8,dmg:1,col:0xe8e4d0},
  raja_kepiting:{n:'Raja Kepiting',hp:16,jb:45,spd:3,dmg:2,sz:2.2,boss:1,col:0xc0301a},
  kalajengking:{n:'Kalajengking',hp:6,jb:10,spd:4,dmg:1,col:0xd9a050},
  mumi:{n:'Mumi',hp:9,jb:16,spd:2.8,dmg:1,col:0xe8dcc0},
  golem_pasir:{n:'Golem Pasir',hp:22,jb:60,spd:2.6,dmg:2,sz:2.2,boss:1,col:0xc9a050,core:0xffe27a},
  laba:{n:'Laba-laba',hp:6,jb:10,spd:4.2,dmg:1,col:0x3a2a4a},
  ular:{n:'Ular Hijau',hp:5,jb:8,spd:4,dmg:1,col:0x3fbf5f},
  golem_lumut:{n:'Golem Lumut',hp:24,jb:65,spd:2.4,dmg:2,sz:2.2,boss:1,col:0x4a7a3a,core:0x7fff7f},
  serigala:{n:'Serigala Es',hp:6,jb:10,spd:5,dmg:1,col:0xbcd4e8},
  yeti:{n:'Yeti',hp:12,jb:22,spd:3.2,dmg:1,sz:1.4,col:0xf4f8ff},
  golem_es:{n:'Golem Es',hp:26,jb:70,spd:2.4,dmg:2,sz:2.3,boss:1,col:0x8fd8ff,core:0xffffff}};
const MKIND={kepiting:'crab',raja_kepiting:'crab',tengkorak:'skel',mumi:'mummy',kalajengking:'scorp',laba:'spider',ular:'snake',serigala:'wolf',yeti:'yeti',golem_pasir:'golem',golem_lumut:'golem',golem_es:'golem'};
function monMesh(t,d){const c=d.col,P=[],k=MKIND[t],B=(w,h,dd,x,y,z,col,o)=>P.push(Object.assign({geo:BOX(w,h,dd),x,y,z,color:col},o||{})),I=(r,x,y,z,col,o)=>P.push(Object.assign({geo:ICO(r,0),x,y,z,color:col},o||{})),eye=(x,y,z)=>B(.16,.16,.1,x,y,z,0xff2020);
  if(k=='crab'){I(.75,0,.5,0,c,{sx:1.3,sy:.55});I(.3,-1,.8,.5,c);I(.3,1,.8,.5,c);B(.1,.5,.1,-.3,1.05,.45,0x222222);B(.1,.5,.1,.3,1.05,.45,0x222222);eye(-.3,1.35,.45);eye(.3,1.35,.45);for(const q of[-1,1])for(let j=0;j<3;j++)B(.8,.1,.1,q*.95,.3,-.3+j*.3,c,{rz:q*.4})}
  else if(k=='skel'||k=='mummy'){const w=k=='mummy';B(.6,.9,.32,0,1.1,0,w?0xe8dcc0:c);I(.38,0,1.85,0,w?0xd8ccb0:c);eye(-.14,1.88,.3);eye(.14,1.88,.3);for(const q of[-1,1]){B(.15,.8,.15,q*.45,1.1,w?.3:0,w?0xd8ccb0:c,w?{rx:-1.3}:{});B(.18,.8,.18,q*.18,.4,0,w?0xe8dcc0:c)}if(!w)B(.1,1.2,.1,.6,1.1,.2,0x999999);else B(.65,.12,.34,0,1.2,0,0xb8a888)}
  else if(k=='scorp'){I(.6,0,.5,0,c,{sx:1.3,sy:.5});for(let i=0;i<4;i++)I(.22,0,.7+i*.28,-.7-i*.12,c);P.push({geo:new THREE.ConeGeometry(.15,.4,4),x:0,y:1.9,z:-1.1,rx:2.3,color:0xff3030});for(const q of[-1,1]){I(.28,q*.7,.5,.8,c);for(let j=0;j<3;j++)B(.7,.08,.08,q*.8,.25,-.3+j*.3,0x6a4a20,{rz:q*.4})}eye(-.2,.8,.55);eye(.2,.8,.55)}
  else if(k=='spider'){I(.55,0,.7,0,c);I(.33,0,.8,.6,c);eye(-.14,.95,.85);eye(.14,.95,.85);for(const q of[-1,1])for(let j=0;j<4;j++)B(1.2,.1,.1,q*.9,.45,-.4+j*.35,0x1a1226,{rz:q*.6,ry:q*(j-1.5)*.25})}
  else if(k=='snake'){for(let i=0;i<7;i++)I(.34-i*.025,Math.sin(i*.9)*.35,.3,-i*.45,c);I(.38,0,.38,.4,c);eye(-.16,.6,.7);eye(.16,.6,.7)}
  else if(k=='wolf'){B(.8,.7,1.5,0,.85,0,c);B(.55,.5,.6,0,1.15,1,c);B(.2,.15,.2,0,1.05,1.35,0x222222);eye(-.18,1.3,1.28);eye(.18,1.3,1.28);for(const q of[-1,1]){B(.18,.6,.18,q*.28,.3,.5,c);B(.18,.6,.18,q*.28,.3,-.5,c);P.push({geo:new THREE.ConeGeometry(.12,.3,4),x:q*.2,y:1.55,z:.9,color:c})}B(.2,.2,.7,0,1,-1,c,{rx:.6})}
  else if(k=='yeti'){B(1.1,1.3,.7,0,1.55,0,c);I(.55,0,2.5,0,c);B(.5,.3,.1,0,2.5,.5,0x335577);eye(-.2,2.55,.55);eye(.2,2.55,.55);for(const q of[-1,1]){B(.38,1.3,.38,q*.85,1.5,.2,c,{rx:-.4});B(.45,.9,.45,q*.3,.45,0,c)}}
  else{B(1.6,1.8,1.1,0,2,0,c);B(.9,.8,.9,0,3.3,0,c);eye(-.25,3.4,.46);eye(.25,3.4,.46);B(.5,.5,.2,0,2.2,.56,d.core||0xffe27a);for(const q of[-1,1]){B(.6,1.8,.6,q*1.2,2.1,0,c);B(.7,1.2,.7,q*.45,.6,0,c)}B(.5,.2,.5,.4,2.95,.3,0x5a8a4a)}
  return new THREE.Mesh(mergeParts(P),new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:10}))}
function monLabel(m){if(m.lab)m.g.remove(m.lab);const d=m.def;m.lab=spr(128,28,x=>{x.fillStyle='rgba(23,48,107,.88)';x.fillRect(0,0,128,28);x.fillStyle='#fff';x.font='bold 11px monospace';x.textAlign='center';x.fillText(d.n+' ('+Math.max(0,m.hp)+'/'+d.hp+')',64,12);x.fillStyle='#401018';x.fillRect(8,16,112,8);x.fillStyle=d.boss?'#ffb02a':'#ff4d4d';x.fillRect(8,16,112*Math.max(0,m.hp)/d.hp,8)},4.4,.96);m.lab.position.y=(d.sz||1)*2.4+1.2;m.g.add(m.lab)}
function monAt(t,x,z){const d=MDEF[t],g=new THREE.Group(),body=monMesh(t,d);body.scale.setScalar(d.sz||1);g.add(body);g.position.set(x,0,z);world.add(g);const m={t,def:d,g,body,x,z,hx:x,hz:z,hp:d.hp,state:0,cd:1,h:Math.random()*6.28,rad:.9*(d.sz||1)+.3,ph:Math.random()*6,hit:0,dead:false,rt:0,wt:0,tx:x,tz:z,aggro:d.boss?17:12};monLabel(m);MON.list.push(m);MON.on=true;return m}
function dmgPop(x,y,z,t,c){const sp=spr(96,24,q=>{q.font='bold 16px monospace';q.textAlign='center';q.lineWidth=4;q.strokeStyle='#17306b';q.strokeText(t,48,18);q.fillStyle=c;q.fillText(t,48,18)},3,.75);sp.position.set(x,y,z);world.add(sp);MON.pops.push({s:sp,t:0,y})}
function hitFx(){let e=document.getElementById('hitfx');if(!e){e=document.createElement('div');e.id='hitfx';e.style.cssText='position:fixed;inset:0;background:rgba(255,40,40,.35);pointer-events:none;opacity:0;transition:opacity .35s;z-index:7';document.body.append(e)}e.style.transition='none';e.style.opacity=1;requestAnimationFrame(()=>{e.style.transition='opacity .35s';e.style.opacity=0})}
function monHit(m,nx,nz){pl.hp-=m.def.dmg;pl.invuln=1;MON.last=0;pl.x+=nx*1.6;pl.z+=nz*1.6;puff(pl.x,pl.z,10,'#ff5d5d',3,pl.y+1);dmgPop(pl.x,pl.y+2.8,pl.z,'-'+m.def.dmg,'#ff5d5d');hitFx();if(pl.hp<=0){toast('Kamu kalah! Kembali ke titik awal');pl.hp=pl.maxHp;pl.x=6;pl.z=-8;pl.y=0;pl.invuln=3;for(const o of MON.list)o.state=0}}
function monKill(m){m.dead=true;m.rt=m.def.boss?60:25;m.g.visible=false;const j=m.def.jb;cfg.jb+=j;sv();$('jbn').textContent=cfg.jb+' JB';me&&me.update({jb:cfg.jb});pl.jbLvl=jbLvlOf(cfg.jb);toast(m.def.n+' dikalahkan! +'+j+' JB');dmgPop(m.x,2.6,m.z,'+'+j+' JB','#ffd23f');for(let i=0;i<(m.def.boss?60:18);i++)puff(m.x+(Math.random()-.5)*3,m.z+(Math.random()-.5)*3,1,['#ffd23f','#ff8c1a','#ffffff'][i%3],5,.5+Math.random()*2);ring(m.x,m.z,'#ffd23f',.2,1)}
function attack(){if(curMap=='boxing'){boxPunch();return}if(!playing||!MON.on||MON.atk>0||pl.balloon||pl.koTimer>0)return;MON.atk=.45;const fx=Math.sin(pl.r),fz=Math.cos(pl.r);
  if(!SLASH)SLASH={life:0,m:Mt(new THREE.RingGeometry(1.1,2.5,14,1,-1,2).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,side:THREE.DoubleSide}),0,0,0,sc)};
  SLASH.life=.18;SLASH.m.visible=true;SLASH.m.position.set(pl.x,pl.y+.6,pl.z);SLASH.m.rotation.y=pl.r-1.5708;
  for(const m of MON.list){if(m.dead)continue;const dx=m.x-pl.x,dz=m.z-pl.z,d=Math.hypot(dx,dz)||.01;if(d<3.6+m.rad*.5&&(d<1.2||(dx*fx+dz*fz)/d>.1)){const dm=1+(cfg.jb>=300?1:0);m.hp-=dm;m.hit=.25;m.x+=dx/d*.8;m.z+=dz/d*.8;dmgPop(m.x,(m.def.sz||1)*2.2,m.z,'-'+dm,'#ffffff');puff(m.x,m.z,8,'#ffffff',2,1);ring(m.x,m.z,'#ffffff',.2,2);if(m.hp<=0)monKill(m);else monLabel(m)}}}
function monStep(dt,now){
  MON.atk-=dt;MON.last+=dt;
  for(const q of MON.pops){q.t+=dt;q.s.position.y=q.y+q.t*2;q.s.material.opacity=Math.max(0,1-q.t/.9);if(q.t>.9){world.remove(q.s);q.dead=1}}MON.pops=MON.pops.filter(q=>!q.dead);
  if(SLASH&&SLASH.life>0){SLASH.life-=dt;SLASH.m.material.opacity=Math.max(0,SLASH.life/.18);if(SLASH.life<=0)SLASH.m.visible=false}
  for(const m of MON.list){
    if(m.dead){m.rt-=dt;if(m.rt<=0){m.dead=false;m.hp=m.def.hp;m.x=m.hx;m.z=m.hz;m.g.visible=true;monLabel(m)}continue}
    const dx=pl.x-m.x,dz=pl.z-m.z,d=Math.hypot(dx,dz)||.01,calm=pl.balloon||pl.koTimer>0||pl.inRing;let mv=0;
    m.state=(!calm&&d<m.aggro)?1:(d>m.aggro*1.5||calm)?0:m.state;
    if(m.state){m.h=Math.atan2(dx,dz);if(d>m.rad+.8){const sp=m.def.spd*dt;m.x+=dx/d*sp;m.z+=dz/d*sp;mv=1}else{m.cd-=dt;if(m.cd<=0&&pl.invuln<=0){m.cd=1.3;monHit(m,dx/d,dz/d)}}}
    else{m.wt-=dt;if(m.wt<=0){m.wt=2+Math.random()*3;const a=Math.random()*6.28,r=Math.random()*6;m.tx=m.hx+Math.cos(a)*r;m.tz=m.hz+Math.sin(a)*r}const ex=m.tx-m.x,ez=m.tz-m.z,e=Math.hypot(ex,ez);if(e>.4){const sp=m.def.spd*.35*dt;m.x+=ex/e*sp;m.z+=ez/e*sp;m.h=Math.atan2(ex,ez);mv=1}}
    m.hit=Math.max(0,m.hit-dt);
    m.g.position.set(m.x,Math.abs(Math.sin(now/140+m.ph))*(mv?.22:.04),m.z);
    let da=m.h-m.body.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));m.body.rotation.y+=da*Math.min(1,dt*8);
    m.body.scale.setScalar((m.def.sz||1)*(1+Math.sin(now/200+m.ph)*.03)*(m.hit>0?1+m.hit*.8:1));
    m.body.material.emissive.setHex(m.hit>0?0xff2020:0);
  }
  if(pl.hp<pl.maxHp&&MON.last>6&&(MON.regen+=dt)>3){MON.regen=0;pl.hp++}
}

function climateStructure(n){
  const P=[],bx=(x,z,w,d,h,c,y0)=>{y0=y0||0;P.push({geo:BOX(w,h,d),x,y:y0+h/2,z,color:c});addCol(x,y0,z,w,h,d)},
    pil=(x,z,w,h,c)=>{bx(x,z,w,w,h,c);P.push({geo:BOX(w*1.4,.5,w*1.4),x,y:h+.25,z,color:c+0x101010})};
  if(n=='island'){
    for(let i=0;i<8;i++){const a=i/8*6.283+.2,x=Math.cos(a)*150,z=Math.sin(a)*150,t=a+Math.PI/2,dx=Math.cos(t)*4,dz=Math.sin(t)*4;
      pil(x+dx,z+dz,2.4,9,0x8a8f96);pil(x-dx,z-dz,2.4,9,0x8a8f96);P.push({geo:BOX(10,1.6,2.4),x,y:9.8,z,ry:-t,color:0x9aa0a8})}
  }else if(n=='desert'){
    [[0,-120],[-105,70],[105,70]].forEach(([x,z])=>pyramid(x,z,26,8,0xd9b86a,0x7fd0ff));
    for(const sx of[-1,1])for(let k=0;k<5;k++)bx(150+sx*9,-40+k*20,6,18,7+k%2*3,0xc79a5a);
  }else if(n=='jungle'){
    for(let k=0;k<3;k++){const w=34-k*10;bx(-115,-105,w,w,3,k%2?0x7a8a6a:0x6b7a5a,k*3)}
    [[-128,-118],[-102,-118],[-128,-92],[-102,-92]].forEach(([x,z])=>pil(x,z,3,14,0x6b7a5a));
    for(let k=0;k<7;k++)for(const sz of[-1,1])pil(-60+k*22,95+sz*9,2.6,11,0x5f6f4f)
  }else if(n=='snow'){
    const g=[[1,1,1,0,1],[0,0,1,0,1],[1,0,0,0,1],[1,1,1,0,0],[0,0,1,1,1]];
    g.forEach((r,i)=>r.forEach((v,j)=>{if(v)bx(70+j*16,-150+i*16,15,15,7,0xbfe4ff)}));
    for(let i=0;i<9;i++){const a=i*.7,x=-110+Math.cos(a)*18,z=-100+Math.sin(a)*18;P.push({geo:new THREE.ConeGeometry(2+i%3,10+i%4*3,5),x,y:6,z,color:0xe8f6ff});addCol(x,0,z,3,9,3)}
  }
  addMerged(P)}
const ANIM=[];
function pyramid(x,z,base,tiers,col,gc){const P=[],h=2;for(let k=0;k<tiers;k++){const w=base*(1-k/tiers*.85);P.push({geo:BOX(w,h,w),x,y:k*h+h/2,z,color:k%2?col:col+0x101008});addCol(x,k*h,z,w,h,w)}addMerged(P);ANIM.push(glowAt(x,tiers*h+1.2,z,gc,1.1))}
function glowAt(x,y,z,c,r){const m=Mt(ICO(r,1),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.8}),x,y,z);return(dt,t)=>{const k=Math.sin(t/300+x);m.material.opacity=.6+k*.3;m.material.scale?m.scale.setScalar(1+k*.12):m.scale.setScalar(1+k*.12)}}
function enrich(n,tc,dr,hh,bz){
  const lv=FXL(),lim=LIM-14,K=[.6,1,1.4,1.8][lv],placed=[];
  const spot=(r0,r1,pad)=>{for(let i=0;i<30;i++){const a=Math.random()*6.28,d=r0+Math.random()*(Math.min(r1,lim)-r0),x=Math.cos(a)*d,z=Math.sin(a)*d;if(!tc(x,z,pad)&&dr(x,z)>2&&!hh(x,z,0)&&!placed.some(p=>Math.hypot(p[0]-x,p[1]-z)<pad+p[2])){placed.push([x,z,pad]);return[x,z]}}return null};
  const many=(c,r0,r1,pad,f)=>{c=Math.round(c*K);for(let i=0;i<c;i++){const p=spot(r0,r1,pad);if(p)f(p[0],p[1])}};
  const mesh=(P,col)=>{const m=new THREE.Mesh(mergeParts(P),new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:20}));world.add(m);return m};
  const glow=(x,y,z,c,r)=>{ANIM.push(glowAt(x,y,z,c,r))};
  const tcN=(x,z,r)=>bz.some(b=>!b.j&&Math.hypot(x-b.x,z-b.z)<b.r+r);
  const big=(need,zs)=>{const c=[];for(let x=-175;x<=175;x+=5)for(let z=-175;z<=175;z+=5){if(zs&&z*zs<=0)continue;const r=Math.hypot(x,z);if(r>lim-need*.5||r<50||dr(x,z)<6||hh(x,z,6)||placed.some(p=>Math.hypot(p[0]-x,p[1]-z)<need+p[2]))continue;let f=1e9;for(const b of bz)if(!b.j)f=Math.min(f,Math.hypot(x-b.x,z-b.z)-b.r);if(f>=need)c.push([f,x,z])}if(!c.length)return null;c.sort((a,b)=>b[0]-a[0]);const q=c[Math.floor(Math.random()*Math.min(8,c.length))];placed.push([q[1],q[2],need]);return[q[1],q[2]]},bigZ=need=>big(need,1)||big(need);
  const chest=(x,z,y,jb)=>{addMerged([{geo:BOX(1.2,.7,.8),x,y:y+.35,z,color:0x8b5a2b},{geo:BOX(1.25,.2,.85),x,y:y+.8,z,color:0xffd23f}]);let open=false;ANIM.push(glowAt(x,y+1.5,z,0xffd23f,.3));ANIM.push(()=>{if(!open&&Math.hypot(pl.x-x,pl.z-z)<2&&Math.abs(pl.y-y)<2.5){open=true;cfg.jb+=jb;sv();$('jbn').textContent=cfg.jb+' JB';me&&me.update({jb:cfg.jb});toast('Peti harta! +'+jb+' JB');for(let i=0;i<40;i++)puff(x+(Math.random()-.5)*2,z+(Math.random()-.5)*2,1,['#ffd23f','#fff3a0'][i%2],5,y+.8+Math.random()*2);ring(x,z,'#ffd23f',y+.2,1)}})};
  const beam=(x,z,y,c)=>{if(lv<1)return;const m=Mt(new THREE.CylinderGeometry(.7,1.8,70,8,1,true),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false}),x,y+35,z);ANIM.push((dt,t)=>{m.material.opacity=.1+Math.sin(t/700)*.05;m.rotation.y+=dt*.5})};
  if(n=='desert'){const p=bigZ(34);if(p){const[x,z]=p,B=52,T=24,P=[];
    for(let k=0;k<T;k++){const w=B*(1-k/T*.92);P.push({geo:BOX(w,1,w),x,y:k+.5,z,color:k%2?0xd9b86a:0xcaa85a});addCol(x,k,z,w,1,w)}
    P.push({geo:BOX(8,8,1),x,y:4,z:z-B/2-.1,color:0x1a1208},{geo:new THREE.ConeGeometry(1.8,3,4),x:x-2,y:T+1.5,z,color:0xffd23f});
    for(const a of[-1,1])for(const c of[-1,1])P.push({geo:BOX(2,12,2),x:x+a*(B/2+5),y:6,z:z+c*(B/2+5),color:0xc8a878});
    addMerged(P);ANIM.push(glowAt(x-2,T+4,z,0xffe27a,1.3));glow(x-5,3,z-B/2-2,0xff8c1a,.4);glow(x+5,3,z-B/2-2,0xff8c1a,.4);beam(x,z,T,0xffe27a);chest(x+2,z+1,T,80);
    monAt('golem_pasir',x,z-B/2-10);monAt('mumi',x-8,z-B/2-14);monAt('mumi',x+8,z-B/2-14)}}
  if(n=='jungle'){const p=bigZ(30);if(p){const[x,z]=p,P=[],rock=0x6a7468;
    for(const[a,b,w,h,d]of[[-12.5,0,5,16,26],[12.5,0,5,16,26],[0,10.5,30,16,5]]){P.push({geo:BOX(w,h,d),x:x+a,y:h/2,z:z+b,color:rock});addCol(x+a,0,z+b,w,h,d)}
    P.push({geo:BOX(30,4,26),x,y:14,z,color:0x5a6458});addCol(x,12,z,30,4,26);
    for(let i=0;i<6;i++)P.push({geo:ICO(4+Math.random()*3,1),x:x+(Math.random()-.5)*24,y:16.5,z:z+(Math.random()-.5)*20,sx:1.4,sy:.6,color:i%2?0x4a7a3a:rock});
    for(let i=0;i<7;i++){const h=2.2*(i+1);P.push({geo:BOX(3.4,h,6),x:x-15-3.4*i,y:h/2,z:z+4,color:i%2?0x5a6a52:rock});addCol(x-15-3.4*i,0,z+4,3.4,h,6)}
    for(let i=0;i<14;i++)P.push({geo:new THREE.ConeGeometry(.6,2.5,5),x:x+(Math.random()-.5)*18,y:10.5,z:z+(Math.random()-.5)*20,rx:3.1416,color:0x7a8a7a});
    for(let i=0;i<9;i++){const c=i%2?0x00e5ff:0xff5dff,cx=x+(Math.random()-.5)*16,cz=z+(Math.random()-.5)*16;P.push({geo:ICO(.6,0),x:cx,y:1.1,z:cz,sy:2,color:c});if(i%3==0)glow(cx,2.4,cz,c,.35)}
    addMerged(P);glow(x-6,9,z,0x00e5ff,.5);glow(x+6,9,z+4,0xff5dff,.5);chest(x,z+6,0,60);
    if(lv>=1)ANIM.push(()=>{if(Math.random()<.05)puff(x+(Math.random()-.5)*16,z+(Math.random()-.5)*16,1,'#7fe8ff',-1.5,11)});
    monAt('golem_lumut',x,z-22);monAt('ular',x-6,z-26)}}
  if(n=='island'){const p=big(28);if(p){const[x,z]=p,P=[];
    P.push({geo:new THREE.CylinderGeometry(3.6,5,26,8),x,y:13,z,color:0x7a4a22});addCol(x,0,z,8,26,8);
    for(let i=0;i<5;i++){const a=i*1.26;P.push({geo:ICO(1.8,0),x:x+Math.cos(a)*5.5,y:.4,z:z+Math.sin(a)*5.5,sx:1.8,sy:.4,ry:-a,color:0x6a3a1a})}
    for(let i=0;i<14;i++){const a=i*.72,px=x+Math.cos(a)*7.2,pz=z+Math.sin(a)*7.2,py=1.6+i*1.75;P.push({geo:BOX(5.4,.6,5.4),x:px,y:py,z:pz,color:i%2?0x8b5a2b:0x9a6a3a});addCol(px,py-.3,pz,5.4,.6,5.4);if(i%3==2)glow(px,py+1.6,pz,0xffe27a,.3)}
    P.push({geo:BOX(14,.8,14),x,y:23.7,z,color:0x9a6a3a});addCol(x,23.3,z,14,.8,14);
    for(const[a,b,w,d]of[[-6.5,0,.4,10],[6.5,0,.4,10],[0,6.5,10,.4]])P.push({geo:BOX(w,3,d),x:x+a,y:25.6,z:z+b,color:0xc8a878});
    P.push({geo:new THREE.ConeGeometry(7,3,4),x,y:28.6,z,ry:.785,color:0xc84a2a},{geo:BOX(.15,5,.15),x:x-5,y:27,z:z-5,color:0xdddddd},{geo:BOX(1.4,.8,.05),x:x-4.3,y:28.8,z:z-5,color:0xff5db1});
    for(const[a,b,r,h]of[[0,0,11,31],[9,3,7,28],[-8,-4,7,28],[2,-9,6,27],[-3,9,6,29]])P.push({geo:ICO(r,1),x:x+a,y:h,z:z+b,sx:1.2,sy:.8,sz:1.2,color:0x2f8a3a});
    addMerged(P);chest(x+3,z-3,24.1,60);glow(x,24.2+3,z,0xffe27a,.4);
    monAt('raja_kepiting',x+10,z-10);monAt('kepiting',x-10,z-9)}}
  if(n=='snow'){const p=bigZ(36);if(p){const[x,z]=p,P=[],ice=0xbfeaff,ice2=0x8fd8ff;
    for(const[a,b,w,d]of[[-12.5,-20,15,2],[12.5,-20,15,2],[0,20,40,2],[-20,0,2,40],[20,0,2,40]]){P.push({geo:BOX(w,9,d),x:x+a,y:4.5,z:z+b,color:ice});addCol(x+a,0,z+b,w,9,d)}
    for(const a of[-1,1])for(const c of[-1,1]){const tx=x+a*20,tz=z+c*20;P.push({geo:BOX(6,24,6),x:tx,y:12,z:tz,color:ice2},{geo:new THREE.ConeGeometry(4.6,8,6),x:tx,y:28,z:tz,color:0x5fb8ff});addCol(tx,0,tz,6,24,6);glow(tx,33,tz,0xcff4ff,.6)}
    P.push({geo:BOX(22,8,16),x,y:4,z:z+6,color:ice});addCol(x,0,z+6,22,8,16);P.push({geo:BOX(8,18,8),x,y:17,z:z+8,color:ice2},{geo:new THREE.ConeGeometry(6,9,6),x,y:30.5,z:z+8,color:0x5fb8ff});addCol(x,8,z+8,8,18,8);
    for(let i=0;i<8;i++){const sz=z-17+i*2;P.push({geo:BOX(10,i+1,2),x,y:(i+1)/2,z:sz,color:i%2?0xdff6ff:ice});addCol(x,0,sz,10,i+1,2)}
    for(const a of[-1,1])P.push({geo:new THREE.OctahedronGeometry(1.4),x:x+a*10,y:3,z:z-10,sy:2,color:0x9fe8ff},{geo:BOX(1.2,6,1.2),x:x+a*7,y:3,z:z-22,color:ice2});
    addMerged(P);glow(x,36,z+8,0xffffff,.8);glow(x-7,6.5,z-22,0xcff4ff,.4);glow(x+7,6.5,z-22,0xcff4ff,.4);chest(x+6,z+3,8,70);
    monAt('golem_es',x,z-30);monAt('yeti',x-10,z-30);monAt('serigala',x+10,z-32)}}
  const TH={island:{w:0x8b5a2b,r:0xc84a2a},desert:{w:0xb08a58,r:0xd9b86a},jungle:{w:0x6a4a2a,r:0x3a8a3a},snow:{w:0x9a8a7a,r:0xdce8f4}}[n];
  const ROLES=[[/koki|roti|coklat/,'kitchen'],[/dokter|herbal|dukun/,'clinic'],[/petani|peternak|penggembala|karet|satwa|rusa/,'farm'],[/kayu|penebang|perahu|pengukir|bambu|anyaman/,'wood'],[/pedagang|penjual|pengrajin|pakaian|sepatu|kurir|permadani|penenun|tembikar/,'stall'],[/penambang|harta|penggali|gunung/,'mine'],[/guru|cuaca|bintang/,'school'],[/pemusik|penyanyi|penari/,'stage'],[/seniman|pelukis/,'easel'],[/pendeta|kuil|candi|dewa|goa/,'shrine'],[/prajurit|gerbang|perbatasan|firaun|ski|pemburu|penjaga hutan|pawang|sungai/,'post'],[/api/,'fire'],[/nelayan|pemancing|pelaut|danau|air/,'dock'],[/mercusuar/,'light'],[/pemandu|petualang|pengembara|pemanjat|pengumpul/,'sign']];
  const workplace=(k,x,z)=>{const P=[],W=TH.w,R=TH.r,b=(w,h,d,lx,lz,c,y0,col)=>{P.push({geo:BOX(w,h,d),x:x+lx,y:(y0||0)+h/2,z:z+lz,color:c});if(col)addCol(x+lx,y0||0,z+lz,w,h,d)},ic=(r,lx,y,lz,c,o)=>P.push(Object.assign({geo:ICO(r,0),x:x+lx,y,z:z+lz,color:c},o||{})),roof=(w,d,lz,y,c)=>{b(.2,y,.2,-w/2+.2,lz-d/2+.2,W);b(.2,y,.2,w/2-.2,lz-d/2+.2,W);b(w,.2,d,0,lz,c,y)};
    switch(k){
    case'kitchen':b(3.4,1,1.3,0,2.6,W,0,1);b(1.3,1.2,1.3,-2.8,2.6,0x444444,0,1);b(.4,2.8,.4,-2.8,2.9,0x555555);ic(.45,0,1.5,2.6,0xcccccc,{sy:.8});roof(4.6,2.6,2.6,2.6,R);glow(x-2.8,1.4,z+2.6,0xff8c1a,.35);break;
    case'clinic':b(2.2,.5,1,0,2.6,0xffffff,.3,1);b(1.4,.8,.8,-2.2,2.6,W,0,1);b(1.4,.35,.12,2.4,2.2,0xff4d4d,2.2);b(.35,1.4,.12,2.4,2.2,0xff4d4d,1.7);roof(4.8,3,2.6,2.8,0xffffff);break;
    case'farm':b(5.5,.2,3.5,0,3,0x5a3a1b);for(let i=0;i<10;i++)ic(.3,-2.2+(i%5)*1.1,.45,2.2+(i/5|0)*1.4,0x4aa84a,{sy:1.3});b(.15,2,.15,3.4,2.4,W);b(1.4,.15,.15,3.4,2.4,W,1.5);ic(.3,3.4,2.2,2.4,0xe8d8a0);b(1,.9,1,-3.4,2.4,0xd9b86a,0,1);b(5.5,.6,.1,0,4.9,W);break;
    case'wood':b(3,.9,1.2,0,2.6,W,0,1);for(let i=0;i<3;i++)b(2.4,.5,.5,-3.2,2.4,0x7a4a22,i*.5);b(.9,.6,.9,3,2.4,0x8b5a2b,0,1);b(.12,.8,.12,3,2.4,0x888888,.6);b(1.6,.8,.15,-.6,4.2,W);break;
    case'mine':ic(1,-2.2,.6,2.8,0x6a6a62,{sy:.8});ic(.8,-.8,.5,3.6,0x7a7a72);ic(.25,-2,1.3,2.6,0xffd23f);ic(.25,-1,1,3.2,0xffd23f);b(1.8,.8,1.1,2.6,2.8,0x5a3a1b,.3,1);b(.4,3.2,.4,-.9,4.8,W);b(.4,3.2,.4,.9,4.8,W);b(2.2,.4,.4,0,4.8,W,3.2);break;
    case'school':b(.2,2,.2,-1.6,3.2,W);b(.2,2,.2,1.6,3.2,W);b(3.6,1.5,.15,0,3.2,0x1f4a30,1);b(2.2,.45,.7,-1,5,W,0,1);b(2.2,.45,.7,1.2,5,W,0,1);break;
    case'stage':b(5.4,.6,4,0,3,0x8b6a4a,0,1);b(5.4,3,.3,0,4.8,R,.6);b(.8,1.2,.8,-2.2,3,0x222222,.6);b(.8,1.2,.8,2.2,3,0x222222,.6);glow(x-2,5,z+2.5,0xff5db1,.3);glow(x+2,5,z+2.5,0x3d8bff,.3);break;
    case'easel':b(.15,2,.15,-.6,2.8,W);b(.15,2,.15,.6,2.8,W);b(1.5,1.7,.1,0,2.8,0xffffff,.8);ic(.15,-.4,1.8,2.7,0xff4d4d);ic(.15,.3,1.4,2.7,0x3d8bff);b(1.2,.8,.8,2.2,2.4,W,0,1);break;
    case'shrine':b(2,1,1,0,2.8,0xcfc8b8,0,1);for(const a of[-1,1])for(const c of[0,1])b(.5,3,.5,a*1.5,2.8+c*1.6,0xd8d0c0);b(3.8,.4,3,0,3.6,0xb8b0a0,3);glow(x-.7,1.4,z+2.8,0xffe27a,.2);glow(x+.7,1.4,z+2.8,0xffe27a,.2);break;
    case'post':for(const a of[-1,1])for(const c of[-1,1])b(.4,3.6,.4,a*1.2,3+c*1.2,W);b(3.2,.3,3.2,0,3,W,3.6);P.push({geo:new THREE.ConeGeometry(2.6,1.6,4),x,y:5.2,z:z+3,ry:.785,color:R});b(.1,3,.1,1.6,3,0x888888,3.6);b(1,.6,.05,2.1,3,R,5.6);ic(.5,-2,.4,2,0xc8a878,{sy:.6});break;
    case'fire':for(let i=0;i<8;i++){const a=i*.785;ic(.3,Math.cos(a)*.9,.2,2.8+Math.sin(a)*.9,0x777777)}b(1.2,.2,.2,0,2.8,0x5a3a1b,.2);b(.2,.2,1.2,0,2.8,0x5a3a1b,.4);b(1.4,.5,.5,-2.2,2.8,W,0,1);b(1.4,.5,.5,2.2,2.8,W,0,1);glow(x,.9,z+2.8,0xff8c1a,.45);break;
    case'dock':b(6,.3,2.4,0,2.8,W,.1);b(.3,1.4,.3,-3,2.8,W);b(.3,1.4,.3,3,2.8,W);b(.8,1,.8,-2.4,3.6,0x6a4a2a,0,1);b(.1,3,.1,2,3,W,0);b(2,.1,.1,2.9,3,0xdddddd,2.8);break;
    case'light':b(.3,5,.3,1.5,2.5,0x555555);b(1.6,1.2,1.6,-2,3,0xdddddd,0,1);glow(x+1.5,5.3,z+2.5,0xffe9a0,.4);break;
    case'sign':b(.3,3,.3,1.5,2.5,W);b(1.4,.4,.1,1.5,2.5,W,2.5);b(1.4,.4,.1,1.5,2.5,R,2);P.push({geo:new THREE.ConeGeometry(2,2.4,4),x:x-2.4,y:1.2,z:z+3,ry:.785,color:R});break;
    case'stall':b(3.4,1,1.3,0,2.6,W,0,1);b(.2,2.6,.2,-1.8,2.6,W);b(.2,2.6,.2,1.8,2.6,W);for(let i=0;i<4;i++)b(1,.15,2.3,-1.5+i,2.6,i%2?R:0xffffff,2.6);b(.8,.8,.8,-2.5,3.8,0xc8a060,0,1);b(.8,.8,.8,2.5,3.8,0xa88040,0,1);for(let i=0;i<3;i++)ic(.25,-.8+i*.8,1.25,2.6,[0xff5d5d,0xffd23f,0x3fbf5f][i]);break;
    default:b(2.4,.5,.7,0,2.6,W,.5,1);b(.2,3,.2,2.2,2.6,0x444444);glow(x+2.2,3.2,z+2.6,0xffe9a0,.3)}
    addMerged(P)};
  const tiers=[0,3,6,9,12,16,20,26,32,40,50,60];
  for(const d of JELLOGER_DEFS[n]||[]){const o=Object.assign({},d);if(!d.secret&&d.spd!==0){let ok=null;for(const t of tiers){for(let k=0;k<(t?10:1)&&!ok;k++){const a=k/10*6.283+Math.random()*.3,x=d.x+Math.cos(a)*t,z=d.z+Math.sin(a)*t;if(!tcN(x,z,t>26?3.5:4.5)&&dr(x,z)>2&&!hh(x,z,2)&&Math.hypot(x,z)<lim-4&&!placed.some(q=>Math.hypot(q[0]-x,q[1]-z)<(t>26?4:5)+q[2]))ok=[x,z]}if(ok)break}
      if(ok){o.x=ok[0];o.z=ok[1];placed.push([o.x,o.z,3.5]);o.r=Math.min(d.r||4,2.6);workplace((ROLES.find(r=>r[0].test(d.n.toLowerCase()))||[0,'bench'])[1],o.x,o.z)}}JDR.push(o)}
  const MS={island:[['kepiting',7,60,185],['tengkorak',4,95,185]],desert:[['kalajengking',7,60,185],['mumi',5,90,185]],jungle:[['laba',7,60,185],['ular',6,60,185]],snow:[['serigala',7,60,185],['yeti',5,95,185]]}[n];
  if(MS)for(const[t,c,r0,r1]of MS)for(let i=0;i<c;i++){const p=spot(r0,r1,6);if(p)monAt(t,p[0],p[1])}
  if(n=='island'){
    for(let k=0;k<3;k++){const m=Mt(new THREE.RingGeometry(226+k*5,228.5+k*5,72).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}),0,.12,0);ANIM.push((dt,t)=>{const u=(t/2400+k*.33)%1;m.scale.setScalar(1+u*.05);m.material.opacity=.55*(1-u)})}
    const dp=[{geo:ICO(1,1),sx:2.2,sy:.8,sz:.8,color:0x7aa0c0},{geo:new THREE.ConeGeometry(.5,1.4,4),x:-2.4,rz:1.5708,color:0x7aa0c0},{geo:new THREE.ConeGeometry(.3,.8,3),x:.2,y:.8,color:0x5a80a0},{geo:ICO(.7,0),sx:1.6,sy:.5,sz:.6,x:1.8,y:-.15,color:0xe8f0f8}];
    for(let i=0;i<[2,3,4,5][lv];i++){const d=mesh(dp),R=255+i*14,dir=i%2?1:-1;let last=0;ANIM.push((dt,t)=>{const a=t/9000*dir+i*2,u=(t/2600+i*.31)%1,x=Math.cos(a)*R,z=Math.sin(a)*R;d.position.set(x,Math.sin(u*Math.PI)*7-1.5,z);d.rotation.y=Math.atan2(-dir*Math.cos(a),-dir*Math.sin(a));d.rotation.z=.9*Math.cos(u*Math.PI);if(u<last){ring(x,z,'#ffffff',.12,2);puff(x,z,8,'#cfeaff',3,.2)}last=u})}
    if(lv>=2)for(let i=0;i<[0,0,4,7][lv];i++){const kk=mesh([{geo:BOX(1.4,1.4,.05),rz:.785,color:[0xff5db1,0xffd23f,0x3fbf5f,0x3d8bff][i%4]},{geo:BOX(.12,.12,.12),y:-1.4,color:0xffffff},{geo:BOX(.12,.12,.12),y:-2,color:0xff5d5d}]),R=50+i*14;ANIM.push((dt,t)=>{const a=t/7000+i*1.3;kk.position.set(Math.cos(a)*R,34+Math.sin(t/900+i)*4,Math.sin(a)*R);kk.rotation.y=-a;kk.rotation.z=Math.sin(t/500+i)*.2})}
    many(6,170,205,5,(x,z)=>beachUmbrella(x,z));many(3,40,100,6,(x,z)=>flowerArch(x,z,Math.random()*6));
    many(12,25,160,3,(x,z)=>{Mt(new THREE.CylinderGeometry(.12,.15,3.2,5),LM(0x3a8a3a),x,1.6,z);const g=new THREE.Group();g.position.set(x,3.3,z);Mt(new THREE.CylinderGeometry(.9,.9,.2,12).rotateX(1.5708),LM(0xffd23f),0,0,0,g);Mt(new THREE.CylinderGeometry(.45,.45,.25,10).rotateX(1.5708),LM(0x5a3a1a),0,0,.05,g);world.add(g);ANIM.push((dt,t)=>{g.rotation.y=Math.sin(t/2000+x)*.5;g.rotation.x=Math.sin(t/1500+z)*.08})});
  }
  if(n=='desert'){
    many(2,70,165,24,(x,z)=>pyramid(x,z,22+Math.random()*8,7,0xd9b86a,0x7fd0ff));
    many(8,45,170,14,(x,z)=>hill(x,z,10+Math.random()*8,2.5+Math.random()*3,0xc99a5b,0xe6c88a));
    for(let i=0;i<Math.round(6*K);i++){const w=Mt(ICO(.9,1),LM(0x9a7a4a),0,.9,0);let x=-lim+Math.random()*lim*2,z=(Math.random()-.5)*lim*1.6,sp=5+Math.random()*4;ANIM.push((dt,t)=>{x+=sp*dt;z+=Math.sin(t/3000+i)*dt*2;if(x>lim)x=-lim;w.position.set(x,.9+Math.abs(Math.sin(t/260+i))*1.1,z);w.rotation.z-=dt*sp*.6;w.rotation.x+=dt*2;if(lv>=3&&Math.random()<dt*8)puff(x,z,1,'#e6c88a',1,.4)})}
    many(8,30,170,3,(x,z)=>{addMerged([{geo:new THREE.CylinderGeometry(.5,.6,2.6,6),x,y:1.3,z,color:0xb8884a},{geo:ICO(.8,0),x,y:3,z,color:0xff5d3a}]);glow(x,3,z,0xff8c1a,.45)});
  }
  if(n=='jungle'){
    many(1,70,150,20,(x,z)=>pyramid(x,z,20,6,0x6b7a5a,0x5fff9a));
    many(16,30,170,3,(x,z)=>{const c=[0x5ff0ff,0xff7aff,0x9fff6a][(Math.random()*3)|0];addMerged([{geo:new THREE.CylinderGeometry(.25,.35,1.6,6),x,y:.8,z,color:0xe8e0c8},{geo:ICO(1,0),x,y:1.8,z,sx:1.3,sy:.6,sz:1.3,color:c}]);glow(x,2.5,z,c,.3);addCol(x,0,z,.7,1.6,.7)});
    many(22,20,175,3,(x,z)=>{const P=[];for(let k=0;k<4;k++){const a=k*1.57+Math.random();P.push({geo:ICO(1,0),x:x+Math.cos(a)*1.3,y:.9,z:z+Math.sin(a)*1.3,sx:1.8,sy:.12,sz:.9,ry:-a,rz:.35,color:k%2?0x2f8a3a:0x3aa84a})}addMerged(P)});
    if(lv>=1)for(let i=0;i<[0,5,8,12][lv];i++){const a=Math.random()*6.28,d=15+Math.random()*130,m=Mt(new THREE.ConeGeometry(6,40,10,1,true),new THREE.MeshBasicMaterial({color:0xffffa0,transparent:true,opacity:.08,side:THREE.DoubleSide,depthWrite:false}),Math.cos(a)*d,20,Math.sin(a)*d);ANIM.push((dt,t)=>{m.material.opacity=.07+Math.sin(t/1800+i)*.04;m.rotation.z=Math.sin(t/3000+i)*.04})}
  }
  if(n=='snow'){
    many(1,15,70,12,(x,z)=>{const P=[{geo:BOX(1.2,2,1.2),x,y:1,z,color:0x7a4a22}];[[6,5,0x2f8a4a],[5,5,0x3a9a55],[4,5,0x46aa60],[3,4,0x52ba6a]].forEach(([r,h,c],i)=>P.push({geo:new THREE.ConeGeometry(r,h,8),x,y:3.5+i*3.2,z,color:c}));P.push({geo:ICO(.7,0),x,y:17,z,color:0xffd23f});addMerged(P);addCol(x,0,z,1.4,2.2,1.4);glow(x,17,z,0xffe27a,.9);
      const o=[];for(let i=0;i<26;i++){const a=i*2.4,h=2.5+i*.5,r=Math.max(1.6,6.2-i*.22),m=Mt(ICO(.25,0),new THREE.MeshBasicMaterial({color:[0xff4d4d,0x3d8bff,0xffd23f,0xff5db1][i%4],transparent:true}),x+Math.cos(a)*r,h,z+Math.sin(a)*r);o.push(m)}ANIM.push((dt,t)=>{o.forEach((m,i)=>m.material.opacity=.45+.55*Math.abs(Math.sin(t/300+i)))})});
    many(10,20,150,3,(x,z)=>{addMerged([{geo:BOX(.25,4,.25),x,y:2,z,color:0x333344},{geo:BOX(.9,.9,.9),x,y:4.4,z,color:0xffe9a0}]);glow(x,4.4,z,0xffe9a0,.55)});
    if(lv>=2)ANIM.push((dt)=>{if(Math.random()<dt*7)puff(pl.x+(Math.random()-.5)*50,pl.z+(Math.random()-.5)*50,1,'#ffffff',.6,.3+Math.random()*3)});
    many(10,30,170,4,(x,z)=>{addMerged([{geo:new THREE.SphereGeometry(1.2,8,6),x,y:1.1,z,color:0xffffff},{geo:new THREE.SphereGeometry(.9,8,6),x,y:2.8,z,color:0xffffff},{geo:new THREE.SphereGeometry(.65,8,6),x,y:4,z,color:0xffffff},{geo:new THREE.ConeGeometry(.12,.8,4),x,y:4,z:z+.7,rx:1.5708,color:0xff8c1a},{geo:BOX(.12,.12,.1),x:x-.25,y:4.2,z:z+.6,color:0x111111},{geo:BOX(.12,.12,.1),x:x+.25,y:4.2,z:z+.6,color:0x111111},{geo:new THREE.CylinderGeometry(.5,.5,.7,8),x,y:4.9,z,color:0x222233},{geo:new THREE.CylinderGeometry(.75,.75,.08,8),x,y:4.55,z,color:0x222233}]);addCol(x,0,z,2.4,5,2.4)});
    many(12,45,180,4,(x,z)=>{const s=1+Math.random();addMerged([{geo:new THREE.OctahedronGeometry(1),x,y:s*1.4,z,sx:.8*s,sy:1.6*s,sz:.8*s,color:0x9fe8ff},{geo:new THREE.OctahedronGeometry(1),x:x+1.2,y:.8,z:z+.5,sx:.5,sy:1,sz:.5,color:0xcff4ff}]);glow(x,s*1.4,z,0xcff4ff,.35);addCol(x,0,z,1.8,s*3,1.8)});
    many(6,40,170,16,(x,z)=>hill(x,z,8+Math.random()*7,2+Math.random()*2.5,0xdcecff,0xffffff));
    for(let i=0;i<(lv>=2?2:1);i++){const a=i*2.1,m=Mt(new THREE.PlaneGeometry(520,80),new THREE.MeshBasicMaterial({color:0x66ffcc,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false,fog:false}),Math.cos(a)*270,105,Math.sin(a)*270);m.lookAt(0,105,0);ANIM.push((dt,t)=>{m.material.color.setHSL(.42+Math.sin(t/3000+i)*.15,.9,.6);m.material.opacity=.16+Math.sin(t/1400+i*2)*.08;m.scale.y=1+Math.sin(t/1700+i)*.2})}
  }
}

function build(n){
  sc.remove(world);world=new THREE.Group();sc.add(world);
  cols=[];plats=[];MOV.length=0;PKC.length=0;LAS.length=0;SPC.length=0;PKCP=[];pkPush.t=0;pkZone=null;hillGrass=[];CROWD=null;SPIN.length=0;ANIM.length=0;MON.list.length=0;MON.on=false;MON.pops.length=0;JDR.length=0;BOARDS.length=0;
  jbs.forEach(j=>sc.remove(j.m));jbs=[];
  boostBubbles.forEach(b=>sc.remove(b.m));boostBubbles=[];
  swings=[];rings=[];WINDMILLS=[];FLAGPOLES=[];ANIMALS=[];FOUNTAINS=[];WATERFALLS=[];BALLOONS=[];WATERWHEELS=[];BELLS=[];LANTERNS=[];BEACONS.length=0;clearJellogers();
  JSPARK.forEach(s=>sc.remove(s.m));JSPARK.length=0;
  removeSky();clearAmb();
  curMap=n;
  LIM=(n=='parkour')?240:n=='speedrace'?160:200;
  const[sk,gr]=MAPS[n];
  const L=LAYOUTS[n];
  const skyCols=L?L.sky:(n=='speedrace'?(THEMES[rtrack]||THEMES.drag).sky:[0x87c8ff,0xfff4c2]);
  makeSky(skyCols[0],skyCols[1]);
  sc.background=new THREE.Color(sk);sc.children[0].color.set(n=='snow'?0xdfeeff:0xffffff);
  sc.fog=new THREE.Fog(sk,cfg.rd,cfg.rd*1.6);setRD();
  {const RT=n=='speedrace'?THEMES[rtrack]:null;if(RT&&RT.scene){const fc=new THREE.Color(RT.sky[0]).lerp(new THREE.Color(RT.sky[1]),.5);sc.background=fc;sc.fog.color.copy(fc);if(skyDome)skyDome.material.fog=false;if(sunMesh){sunMesh.material.fog=false;sunMesh.material.color.set(RT.sun||0xfff4c2);sunMesh.scale.setScalar(RT.sunS||1)}}}
  const disc=(r,c,y,x=0,z=0)=>{const m=Mt(new THREE.CircleGeometry(r,32).rotateX(-1.5708),(r<300?LM(0xffffff,{map:tex(TXS(),TXS(),(q,w,h)=>noise(q,w,h,'#'+c.toString(16).padStart(6,'0'),w*h/6,.3),r/12,r/12)}):LM(c)),x||0,y,z||0);if(R.shadowMap.enabled)m.receiveShadow=true;return m};

  pool('clouds',new THREE.SphereGeometry(6,7,5),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85}),16);
  pool('birds',new THREE.SphereGeometry(.5,5,4),new THREE.MeshBasicMaterial({color:0x1a1a1a}),10);
  pool('butterflies',BOX(.6,.1,.7),new THREE.MeshBasicMaterial({color:0xffe27a}),25);
  pool('snow',BOX(.25,.25,.25),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9}),n=='snow'?170:80);
  pool('leaves',BOX(.5,.06,.5),new THREE.MeshBasicMaterial({color:0x4fa040}),30);
  pool('petals',BOX(.4,.05,.4),new THREE.MeshBasicMaterial({color:0xffb0d0}),25);
  pool('smokes',new THREE.SphereGeometry(.5,6,5),new THREE.MeshBasicMaterial({color:0xcccccc,transparent:true,opacity:.5}),30);
  pool('stars',new THREE.SphereGeometry(.15,4,3),new THREE.MeshBasicMaterial({color:0xffffff}),80);
  pool('orbs',new THREE.SphereGeometry(.5,6,5),new THREE.MeshBasicMaterial({color:0x7fd0ff,transparent:true,opacity:.7}),20);
  pool('fireflies',new THREE.SphereGeometry(.18,4,3),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true}),30);
  pool('bubbles',new THREE.SphereGeometry(.15,5,4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6}),20);
  pool('dust',new THREE.SphereGeometry(.08,3,3),new THREE.MeshBasicMaterial({color:0xffeeaa,transparent:true,opacity:.7}),25);
  pool('wind',BOX(.6,.02,.02),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35}),30);

  if(n=='parkour'){
    const ptex=tex(32,32,(x,w,h)=>{noise(x,w,h,'#ffffff',w*h/4,.18);x.strokeStyle='rgba(0,0,0,.22)';x.lineWidth=2;x.strokeRect(0,0,w,h)},1,1);
    const pkSpecial=(p,n0,ptex)=>{const[x,y,z,w,d,t]=p,g=new THREE.Group();g.position.set(x,y,z);world.add(g);
      const slab=(col,sh)=>{Mt(BOX(w+.2,1.2,d+.2),LM(0x050510),0,-.25,0,g);return Mt(BOX(w,1,d),LM(col,{shininess:sh||20,map:ptex}),0,.5,0,g)},
        cone=()=>Mt(new THREE.ConeGeometry(Math.min(w,d)*.5,2.2,6).rotateX(Math.PI),LM(0x16224a),0,-1.6,0,g),
        bas=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{})),
        c={x,y,z,w,h:1,d,g,enabled:true,slip:0,bounce:0,kind:t,nocp:1},o={k:t,c,g};
      if(t==11){slab(0x2a3342);cone();const ar=new THREE.Group();ar.rotation.y=Math.atan2(p[6],p[7]);ar.position.y=1.04;g.add(ar);o.ch=[];for(let k=0;k<4;k++){const m=Mt(new THREE.ConeGeometry(.7,.9,3).rotateX(Math.PI/2),bas(0xffd23f),0,0,0,ar);m.scale.y=.12;o.ch.push(m)}o.len=Math.abs(p[6])>.5?w:d;o.dx=p[6];o.dz=p[7];Mt(BOX(w+.05,.08,.08),bas(0xffd23f),0,1.02,-d/2-.1,g);Mt(BOX(w+.05,.08,.08),bas(0xffd23f),0,1.02,d/2+.1,g)}
      else if(t==12){slab(0x1f6b3a);cone();Mt(new THREE.TorusGeometry(w*.38,.12,6,18).rotateX(1.5708),bas(0x66ff99),0,1.08,0,g);o.ar=Mt(new THREE.ConeGeometry(.9,1.4,4),bas(0xccffdd),0,2,0,g);o.cd=0}
      else if(t==13){slab(0xc08050,5);cone();for(let k=0;k<3;k++){const m=Mt(BOX(.08,.04,w*.6),bas(0x3a2010),(k-1)*w*.2,1.03,0,g);m.rotation.y=(k-1)*.5}o.s=0;o.t=0}
      else if(t==14||t==15){const col=t==14?0x2fd9ff:0xff9a2f,sd=new THREE.Group();g.add(sd);Mt(BOX(w+.2,1.2,d+.2),LM(0x050510),0,-.25,0,sd);Mt(BOX(w,1,d),LM(col,{shininess:40,map:ptex}),0,.5,0,sd);Mt(new THREE.ConeGeometry(Math.min(w,d)*.5,2.2,6).rotateX(Math.PI),LM(0x16224a),0,-1.6,0,sd);Mt(BOX(w*.6,.05,d*.6),bas(0xffffff,{transparent:true,opacity:.5}),0,1.03,0,sd);
        const gh=new THREE.LineSegments(new THREE.EdgesGeometry(BOX(w,1,d)),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.6}));gh.position.y=.5;g.add(gh);o.solid=sd;o.ghost=gh;o.A=t==14}
      else if(t==16){slab(0x5a3a1a,2);cone();Mt(BOX(w*.9,.05,d*.9),bas(0x7a8a2a,{transparent:true,opacity:.75}),0,1.03,0,g);o.bb=[0,1,2].map(k=>Mt(new THREE.SphereGeometry(.28,6,4),bas(0xa6c23a),(k-1)*w*.25,1.2,(k%2?1:-1)*d*.2,g))}
      else if(t==17){Mt(new THREE.CylinderGeometry(w*.55,w*.6,1.4,16),LM(0x050510),0,-.35,0,g);Mt(new THREE.CylinderGeometry(w*.5,w*.5,1,16),LM(0x6a3aa0,{shininess:60,map:ptex}),0,.5,0,g);cone();o.r1=Mt(new THREE.TorusGeometry(w*.4,.1,6,20).rotateX(1.5708),bas(0xd08aff),0,1.1,0,g);o.r2=Mt(new THREE.TorusGeometry(w*.25,.1,6,20).rotateX(1.5708),bas(0xffffff),0,1.5,0,g);Mt(new THREE.CylinderGeometry(w*.3,w*.3,5,12,1,true),bas(0xc070ff,{transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}),0,3.5,0,g);o.dest=p[10]}
      else if(t==18){Mt(new THREE.CylinderGeometry(w*.5+.1,w*.5+.1,1.4,20),LM(0x050510),0,-.35,0,g);const rot=new THREE.Group();g.add(rot);Mt(new THREE.CylinderGeometry(w*.5,w*.5,1,20),LM(0xff8c1a,{map:ptex}),0,.5,0,rot);for(let k=0;k<4;k++){const m=Mt(BOX(w*.9,.06,.35),bas(0xffffff),0,1.03,0,rot);m.rotation.y=k*Math.PI/4}cone();o.rot=rot;o.w=p[6];c.w=c.d=w*.7}
      else if(t==19){slab(0x333344);cone();o.top=Mt(BOX(w*.86,.05,d*.86),bas(0x3fff9a),0,1.03,0,g);o.ph=p[6]}
      else if(t==20){slab(0x7a8696,60);cone();for(let k=0;k<4;k++)Mt(BOX(.6,.05,d*.9),bas(k%2?0x111111:0xffd23f),-w/2+.8+k*(w-1.6)/3,1.03,0,g);Mt(BOX(.8,10,.8),bas(0x445566,{transparent:true,opacity:.5}),x,y-4,z);o.by=y;o.h=0}
      else if(t==21){slab(0x4a3a5a);cone();for(const sx of[-1,1])Mt(BOX(.5,8,.5),LM(0x555566),sx*(w/2-.3),5,0,g);Mt(BOX(w,.5,.5),LM(0x555566),0,9,0,g);const pv=new THREE.Group();pv.position.set(0,8.7,0);g.add(pv);const R=6.6;Mt(new THREE.CylinderGeometry(.06,.06,R,4),LM(0x888899),0,-R/2,0,pv);Mt(new THREE.SphereGeometry(1,8,6),LM(0xcc2a3a),0,-R,0,pv);o.pv=pv;o.sp=p[6];o.ph=p[8];o.R=R;o.amp=1}
      cols.push(c);plats.push(c);SPC.push(o);PKC.push({z,v:true,parts:world.children.slice(n0)})};
    for(let i=0;i<PARKOUR.length;i++){
      const n0=world.children.length,p=PARKOUR[i],type=p[5];
      const x=p[0],y=p[1],z=p[2],w=p[3],d=p[4];
      if(type>=11){pkSpecial(p,n0,ptex);continue}
      let col=0x5cb85c;
      if(type===1)col=0x8fdcff;else if(type===2)col=0xffd23f;else if(type===3)col=0x7fd0ff;else if(type===4)col=0xff5db1;else if(type===5)col=0xb8a878;
      else col=(ZC[p[9]||0]||ZC[0])[i%3];
      if(type===10)col=0x4a1830;
      let mesh,ch;
      if(type===5){Mt(new THREE.CylinderGeometry(w+0.6,w+0.6,1.4,14),LM(0x050510),x,y-0.35,z);mesh=Mt(new THREE.CylinderGeometry(w,w,1,14),LM(col,{shininess:5,map:ptex}),x,y+0.5,z);ch={x,y,z,w:w*1.7,h:1,d:w*1.7};Mt(new THREE.TorusGeometry(w*0.9,0.1,4,20).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xffffff}),x,y+1.06,z)}
      else if(type===1){Mt(new THREE.CylinderGeometry(w*0.75,w*0.75,1.4,8),LM(0x050510),x,y-0.35,z);mesh=Mt(new THREE.CylinderGeometry(w*0.7,w*0.7,1,8),LM(col,{shininess:80,map:ptex}),x,y+0.5,z);ch={x,y,z,w:w*1.5,h:1,d:w*1.5};Mt(new THREE.ConeGeometry(.3,1.2,4),new THREE.MeshBasicMaterial({color:0xcceaff,transparent:true,opacity:.85}),x+w*.4,y+1.2,z);Mt(new THREE.ConeGeometry(.25,1,4),new THREE.MeshBasicMaterial({color:0xcceaff,transparent:true,opacity:.85}),x-w*.3,y+1.1,z+w*.2)}
      else if(type===3){Mt(new THREE.CylinderGeometry(w*0.8,w*0.8,1.4,6),LM(0x050510),x,y-0.35,z);mesh=Mt(new THREE.CylinderGeometry(w*0.7,w*0.7,1,6),LM(col,{shininess:60,map:ptex}),x,y+0.5,z);ch={x,y,z,w:w*1.6,h:1,d:w*1.6};Mt(new THREE.TorusGeometry(w*.85,.15,4,24).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0x7fd0ff}),x,y+1.05,z);Mt(new THREE.TorusGeometry(w*.65,.1,4,24).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xffffff}),x,y+1.5,z)}
      else if(type===4){Mt(new THREE.CylinderGeometry(w*0.8,w*0.8,1.4,12),LM(0x050510),x,y-0.35,z);mesh=Mt(new THREE.CylinderGeometry(w*0.7,w*0.7,1,12),LM(col,{shininess:60,map:ptex}),x,y+0.5,z);ch={x,y,z,w:w*1.6,h:1,d:w*1.6};Mt(new THREE.TorusGeometry(w*.7,.2,4,20).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xff5db1}),x,y+1.05,z);Mt(new THREE.ConeGeometry(.5,1,4),new THREE.MeshBasicMaterial({color:0xffffff}),x,y+1.6,z)}
      else if(type>=6&&type<=9){const mc=[0,0,0,0,0,0,0xff8c1a,0xb06aff,0x2fd9b0,0xff5d9a][type],g=new THREE.Group();g.position.set(x,y,z);world.add(g);Mt(BOX(w+.2,1.2,d+.2),LM(0x050510),0,-.25,0,g);mesh=Mt(BOX(w,1,d),LM(mc,{shininess:40,map:ptex}),0,.5,0,g);const bm=new THREE.MeshBasicMaterial({color:0xffffff});Mt(BOX(w+.05,.08,.08),bm,0,1.02,-d/2-.1,g);Mt(BOX(w+.05,.08,.08),bm,0,1.02,d/2+.1,g);Mt(BOX(.08,.08,d+.05),bm,-w/2-.1,1.02,0,g);Mt(BOX(.08,.08,d+.05),bm,w/2+.1,1.02,0,g);Mt(new THREE.ConeGeometry(.5,1,4),new THREE.MeshBasicMaterial({color:mc}),0,1.6,0,g);Mt(new THREE.ConeGeometry(Math.min(w,d)*.5,2.2,6).rotateX(Math.PI),LM(0x16224a),0,-1.6,0,g);ch={x,y,z,w,h:1,d,g}}
      else {Mt(BOX(w+.2,1.2,d+.2),LM(0x050510),x,y-0.25,z);mesh=Mt(BOX(w,1,d),LM(col,{shininess:5,map:ptex}),x,y+0.5,z);ch={x,y,z,w,h:1,d};Mt(new THREE.ConeGeometry(Math.min(w,d)*.5,2.4,6).rotateX(Math.PI),LM(0x16224a),x,y-1.7,z);Mt(BOX(w*.62,.04,d*.62),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.4}),x,y+1.03,z);if(w>=3.5)for(const[sx,sz2]of[[-1,-1],[1,-1],[-1,1],[1,1]])Mt(BOX(.3,.3,.3),new THREE.MeshBasicMaterial({color:col}),x+sx*(w/2-.1),y+1.12,z+sz2*(d/2-.1))}
      if(type===2)Mt(new THREE.TorusGeometry(w*.85,.1,4,12).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xff8c1a}),x,y+1.06,z);
      if(type===0||type===2){const cc=type===2?0xff8c1a:0xffffff;Mt(BOX(w+.05,.08,.08),new THREE.MeshBasicMaterial({color:cc}),x,y+1.02,z-d/2-0.1);Mt(BOX(w+.05,.08,.08),new THREE.MeshBasicMaterial({color:cc}),x,y+1.02,z+d/2+0.1);Mt(BOX(.08,.08,d+.05),new THREE.MeshBasicMaterial({color:cc}),x-w/2-0.1,y+1.02,z);Mt(BOX(.08,.08,d+.05),new THREE.MeshBasicMaterial({color:cc}),x+w/2+0.1,y+1.02,z)}
      const c=Object.assign(ch,{enabled:true,slip:type===1?1:0,mesh,vanish:type===2,bounce:type===4?1:0});
      if(type===2){c.phase=Math.random()*4;c.period=3.2}
      cols.push(c);plats.push(c);
      if(type>=6&&type<=9)MOV.push({c,g:c.g,bx:x,by:y,bz:z,t:type,amp:p[6],sp:p[7],ph:p[8]});
      if(type===10){c.nocp=1;const hot=new THREE.MeshBasicMaterial({color:0xff2a4a}),halo=new THREE.MeshBasicMaterial({color:0xff5a7a,transparent:true,opacity:.28,depthWrite:false}),L=Math.max(w,d)*.62,arms=p[7]?2:1,yb=y+1.6,g=new THREE.Group();g.position.set(x,yb,z);world.add(g);
        Mt(new THREE.CylinderGeometry(.45,.6,1.4,8),LM(0x2a2a3a),0,-.7,0,g);
        for(let a=0;a<arms;a++){const b=new THREE.Group();b.rotation.y=a*Math.PI/2;Mt(BOX(L*2,.22,.22),hot,0,0,0,b);Mt(BOX(L*2,.7,.7),halo,0,0,0,b);Mt(new THREE.SphereGeometry(.4,6,4),hot,L,0,0,b);Mt(new THREE.SphereGeometry(.4,6,4),hot,-L,0,0,b);g.add(b)}
        const rt=new THREE.MeshBasicMaterial({color:0xff2a4a});Mt(BOX(w+.05,.08,.08),rt,x,y+1.02,z-d/2-.1);Mt(BOX(w+.05,.08,.08),rt,x,y+1.02,z+d/2+.1);Mt(BOX(.08,.08,d+.05),rt,x-w/2-.1,y+1.02,z);Mt(BOX(.08,.08,d+.05),rt,x+w/2+.1,y+1.02,z);
        LAS.push({g,x,z,bz:z,y:yb,L,arms,sp:p[6],amp:p[8],ph:p[10]||0})}
      PKC.push({z,v:true,parts:world.children.slice(n0).filter(o=>o!==(type===2?mesh:null))});
    }
    const ZE=PARKOUR[PARKOUR.length-1][2];PKCP=plats.filter(q=>q.w>=9&&!q.nocp);
    Mt(new THREE.PlaneGeometry(900,ZE+900).rotateX(-1.5708),new THREE.MeshBasicMaterial({map:tex(64,64,(x,w,h)=>{x.fillStyle='#0a1030';x.fillRect(0,0,w,h);x.strokeStyle='#2a6aff';x.lineWidth=2;x.strokeRect(0,0,w,h)},90,(ZE+900)/10)}),0,-45,ZE/2);
    const gate=[],cry=[[],[]];
    for(const p of PARKOUR)if(p[5]==0&&p[3]>=9){const[x,y,z,w]=p;gate.push({geo:BOX(.6,7,.6),x:x-w/2+.6,y:y+4.5,z,color:0x7fd0ff},{geo:BOX(.6,7,.6),x:x+w/2-.6,y:y+4.5,z,color:0x7fd0ff},{geo:BOX(w,.8,.8),x,y:y+8,z,color:0xffd23f})}
    addMerged(gate);
    for(let i=0;i<[10,24,40,60][FXL()]*Math.ceil(ZE/850);i++)cry[i%2].push({x:(Math.random()<.5?-1:1)*(40+Math.random()*90),y:-45,z:Math.random()*ZE,sx:2+Math.random()*3,sy:10+Math.random()*30,sz:2+Math.random()*3,r:Math.random()*6});
    [0x5a8aff,0xff5db1].forEach((c,i)=>instance(mergeParts([{geo:new THREE.OctahedronGeometry(1),y:1,color:c}]),cry[i]));
    if(FXL()>=2)for(let i=3;i<PARKOUR.length;i+=3){const p=PARKOUR[i];SPIN.push(Mt(new THREE.TorusGeometry(3.2,.12,4,20),new THREE.MeshBasicMaterial({color:[0x7fd0ff,0xff5db1,0xffd23f][i%3]}),p[0],p[1]+4,p[2]))}
    for(let i=0;i<80;i++)spawnAmb('stars',{x:(Math.random()-.5)*400,y:20+Math.random()*40,z:Math.random()*500});
    for(let i=0;i<30;i++)spawnAmb('orbs',{x:(Math.random()-.5)*200,y:3+Math.random()*25,z:Math.random()*500,ph:Math.random()*6.28});
    feedbackBoard(-4.6,-4,Math.atan2(4.6,4),1,'parkour'); // pojok belakang platform start (bukan tepi/tengah)
    spawnJBs();return;
  }

  if(n=='boxing'){buildBoxing();feedbackBoard(14.5,-25,Math.atan2(-14.5,25),0,'boxing'); return}
  if(n=='speedrace'){(rtrack=='drag'?buildRace:buildCurved)();spawnJBs();return}

  if(n=='island'){disc(320,0x2a7fd0,0);disc(210,gr,.02)}else if(n=='desert'){disc(210,0xc99a5b,0);disc(185,gr,.05)}else disc(210,gr,0);
  const gg=new THREE.CylinderGeometry(215,225,12,48,1,true),pp=gg.attributes.position;
  for(let i=0;i<pp.count;i++){const x=pp.getX(i),z=pp.getZ(i),a=Math.atan2(z,x),k=1+Math.sin(a*9)*.03;pp.setX(i,x*k);pp.setZ(i,z*k);if(pp.getY(i)>0)pp.setY(i,6+Math.abs(Math.sin(a*6))*3)}
  gg.computeVertexNormals();
  const cliff=Mt(gg,LM({desert:0xc99a5b,jungle:0x1f4d2a,snow:0xcfeaff,island:0x3a8d3a}[n]||0x3a8d3a,{side:THREE.DoubleSide}),0,5.8,0);
  if(R.shadowMap.enabled){cliff.castShadow=true;cliff.receiveShadow=true}

  climateStructure(n);
  const buildingZones=[];
  for(const lm of L.landmarks){
    const t=lm[0];
    if(t=='hut'||t=='shrine'||t=='watchtower'||t=='well'||t=='igloo'||t=='lighthouse'||t=='obelisk'||t=='gazebo'||t=='statue'||t=='fountain')buildingZones.push({x:lm[1],z:lm[2],r:14});
  }
  buildingZones.push({x:0,z:0,r:L.plaza});
  if(L.battleRing)buildingZones.push({x:L.battleRing[0],z:L.battleRing[1],r:L.battleRing[2]+3});
  if(L.swings)for(const[x,z]of L.swings)buildingZones.push({x,z,r:6});
  if(L.structures)for(const st of L.structures){
    const t=st[0];
    if(t=='windmill'||t=='watertower'||t=='flagpole'||t=='pond'||t=='rockformation'||t=='flowerbed'||t=='crates'||t=='barn'||t=='haystack'||t=='cart'||t=='barrels'||t=='signpost'||t=='totem'||t=='marketstall'||t=='archway'||t=='belltower'||t=='picnictable'||t=='stonecircle'||t=='statuegarden'||t=='waterwheel'||t=='giantmushroom'||t=='stumplog'||t=='scarecrow'||t=='beehive'||t=='logpile'||t=='ruinpillar'||t=='beachhut'||t=='boat'||t=='beachumbrella'||t=='potshelf'||t=='lanternpost'||t=='flowerarch'||t=='wishingwell'||t=='garden'||t=='statuejello'||t=='torch')buildingZones.push({x:st[1],z:st[2],r:t=='watertower'||t=='windmill'||t=='barn'||t=='belltower'?12:t=='stonecircle'?14:t=='pond'?st[3]+3:t=='garden'?(st[3]||6)+2:7});
    if(t=='fence')buildingZones.push({x:(st[1]+st[3])/2,z:(st[2]+st[4])/2,r:Math.hypot(st[3]-st[1],st[4]-st[2])/2+2});
    if(t=='stonewall')buildingZones.push({x:(st[1]+st[3])/2,z:(st[2]+st[4])/2,r:Math.hypot(st[3]-st[1],st[4]-st[2])/2+2});
    if(t=='woodenbridge')buildingZones.push({x:st[1],z:st[2],r:8});
  }
  if(L.extras)for(const ex of L.extras)buildingZones.push({x:ex[1],z:ex[2],r:8});
  if(L.animals)for(const a of L.animals)buildingZones.push({x:a[1],z:a[2],r:a[3]+2});
  if(JELLOGER_DEFS[n])for(const jd of JELLOGER_DEFS[n])buildingZones.push({x:jd.x,z:jd.z,r:5,j:1});

  const hillData=L.hills||[];
  const hitsHill=(x,z,margin=0)=>{for(const h of hillData){if(Math.hypot(x-h.x,z-h.z)<h.r+margin)return true}return false};

  if(L.hills)for(const h of L.hills)hill(h.x,h.z,h.r,h.h,L.edge,gr);

  const GFX_MULT = cfg.gfx==='highest'?3.0 : cfg.gfx==='high'?1.8 : 1.0;
  const AMB_MULT_GFX = cfg.gfx==='highest'?2.5 : cfg.gfx==='high'?1.6 : 1.0;

  const roadData=[];
  for(const r of L.roads){const safePts=r.pts.filter(([px,pz])=>!hitsHill(px,pz,-4));if(safePts.length<2)continue;roadData.push(road(safePts,r.w,L.roadFill,L.roadTrim))}
  plaza(L.plaza,L.roadFill,L.roadTrim);


  if(L.oasis)oasis(L.oasis.x,L.oasis.z,L.oasis.r);
  if(L.lake)frozenLake(L.lake.x,L.lake.z,L.lake.r);

  const distToRoad=(x,z)=>{let m=Infinity;for(const rd of roadData){const w2=rd.width*0.5+3.0;for(let i=0;i<rd.points.length-1;i++){const p1=rd.points[i],p2=rd.points[i+1];const dx=p2.x-p1.x,dz=p2.z-p1.z;const l2=dx*dx+dz*dz;if(l2<1e-6)continue;let t=((x-p1.x)*dx+(z-p1.z)*dz)/l2;t=Math.max(0,Math.min(1,t));const px=p1.x+dx*t,pz=p1.z+dz*t;const d=Math.hypot(x-px,z-pz)-w2;if(d<m)m=d}}const dP=Math.hypot(x,z)-L.plaza-3.0;if(dP<m)m=dP;return m};
  const tooClose=(x,z,r)=>{for(const b of buildingZones){if(Math.hypot(x-b.x,z-b.z)<b.r+r)return true}return false};

  // ── Papan masukan untuk map hangout: cari spot LEGA otomatis ──
  // Sapu titik di sekitar plaza, ambil yang paling jauh dari jalan, bangunan/landmark, bukit,
  // collider & tepi map. Deterministik (bukan acak) supaya posisinya konsisten tiap masuk map.
  {
    const clearance=(x,z)=>{
      let m=Math.min(distToRoad(x,z)+3,LIM-8-Math.hypot(x,z));         // distToRoad sudah termasuk margin 3
      for(const b of buildingZones)m=Math.min(m,Math.hypot(x-b.x,z-b.z)-b.r);
      for(const h of hillData)m=Math.min(m,Math.hypot(x-h.x,z-h.z)-h.r);
      for(const c of cols){if(c.type==='dome'){m=Math.min(m,Math.hypot(x-c.x,z-c.z)-c.radius);continue}
        const dx=Math.max(Math.abs(x-c.x)-c.w/2,0),dz=Math.max(Math.abs(z-c.z)-c.d/2,0);m=Math.min(m,Math.hypot(dx,dz))}
      return m};
    let best=null;
    for(let r=L.plaza+8;r<=L.plaza+60;r+=3)for(let d=0;d<360;d+=6){
      const a=d*Math.PI/180,x=Math.cos(a)*r,z=Math.sin(a)*r,c=Math.min(clearance(x,z),9);
      const sc2=c-r*.06;                                             // sedikit condong ke dekat plaza/spawn
      if(!best||sc2>best.s)best={s:sc2,x,z}}
    const bx=best?best.x:0,bz=best?best.z:-(L.plaza+14);
    feedbackBoard(bx,bz,Math.atan2(-bx,-bz),0,n);
    buildingZones.push({x:bx,z:bz,r:9});                             // pohon/dekor acak jangan menutupi papan
  }

  const trees={};
  const addTree=(type,x,z,s)=>{if(!trees[type])trees[type]=[];trees[type].push({x,y:0,z,s:s||1,r:Math.random()*6.28})};
  for(const tz of L.treeZones){
    const tCount=Math.round(tz.count*GFX_MULT);
    for(let i=0;i<tCount;i++){
      const sectorAngle=(i/tCount)*6.28;let ok=false,tries=0;
      while(!ok&&tries<8){tries++;
        const a=sectorAngle+(Math.random()-.5)*(6.28/tCount)*0.7;
        const d=tz.r*0.3+Math.random()*tz.r*0.55;
        const x=tz.cx+Math.cos(a)*d,z=tz.cz+Math.sin(a)*d;
        if(Math.hypot(x,z)>LIM-8)continue;if(Math.hypot(x,z)<L.plaza+5)continue;if(tooClose(x,z,4))continue;if(distToRoad(x,z)<1.5)continue;if(hitsHill(x,z,-3))continue;
        addTree(tz.type,x,z,.85+Math.random()*.4);ok=true;
      }
    }
  }

  const grasses=[],flowers=[],rocks=[];
  const grassType=n=='desert'?'grassDry':n=='snow'?'snowMound':'grassTuft';
  const spreadGrass=(arr,count)=>{
    for(let i=0;i<count;i++){
      let x,z;const mode=Math.random();
      if(mode<0.55){const a=Math.random()*6.28,d=L.plaza+3+Math.random()*22;x=Math.cos(a)*d;z=Math.sin(a)*d}
      else if(mode<0.9&&roadData.length){const rd=roadData[(Math.random()*roadData.length)|0];const idx=Math.floor(Math.random()*(rd.points.length-1));const p1=rd.points[idx],p2=rd.points[idx+1];const t=Math.random();const px=p1.x+(p2.x-p1.x)*t,pz=p1.z+(p2.z-p1.z)*t;const dx=p2.x-p1.x,dz=p2.z-p1.z,l=Math.hypot(dx,dz)||1;const side=Math.random()<.5?-1:1;const off=rd.width*0.5+1+Math.random()*4;x=px+(dz/l)*off*side;z=pz-(dx/l)*off*side}
      else{const a=Math.random()*6.28,d=40+Math.random()*(LIM-50);x=Math.cos(a)*d;z=Math.sin(a)*d}
      if(Math.hypot(x,z)<L.plaza+1)continue;if(tooClose(x,z,3))continue;if(distToRoad(x,z)<-1)continue;
      arr.push({x,y:0,z,s:.8+Math.random()*.5,r:Math.random()*6.28});
    }
  };
  spreadGrass(grasses,Math.round(L.grassCount*GFX_MULT));spreadGrass(flowers,Math.round(L.flowerCount*GFX_MULT));
  for(const hg of hillGrass)grasses.push(hg);
  for(let i=0;i<Math.round(L.rockCount*GFX_MULT);i++){
    const a=Math.random()*6.28,d=70+Math.random()*(LIM-80);const x=Math.cos(a)*d,z=Math.sin(a)*d;
    if(tooClose(x,z,4))continue;if(distToRoad(x,z)<3)continue;if(hitsHill(x,z,-5))continue;
    rocks.push({x,y:0,z,s:.7+Math.random()*.7,r:Math.random()*6.28});
  }

  for(const lm of L.landmarks){
    const t=lm[0];
    if(t=='lighthouse')lighthouse(lm[1],lm[2]);
    else if(t=='hut')hut(lm[1],lm[2],lm[3],lm[4],lm[5]);
    else if(t=='shrine')shrine(lm[1],lm[2],lm[3]);
    else if(t=='watchtower')watchtower(lm[1],lm[2]);
    else if(t=='obelisk')obelisk(lm[1],lm[2],lm[3]);
    else if(t=='igloo')igloo(lm[1],lm[2]);
    else if(t=='well')well(lm[1],lm[2]);
    else if(t=='camp')camp(lm[1],lm[2]);
    else if(t=='bench')bench(lm[1],lm[2],lm[3]||0);
    else if(t=='fountain')fountain(lm[1],lm[2],lm[3]||3);
    else if(t=='gazebo')gazebo(lm[1],lm[2]);
    else if(t=='statue')statue(lm[1],lm[2]);
  }
  if(n=='island')dock(0,-180,20,8);
  if(L.lamps)for(const[x,z]of L.lamps)lamp(x,z);
  if(L.swings)for(const[x,z,r]of L.swings)addSwing(x,z,r||0);
  if(L.battleRing)addRing(L.battleRing[0],L.battleRing[1],L.battleRing[2]);

  if(L.structures)for(const st of L.structures){
    const t=st[0];
    if(t=='windmill')windmill(st[1],st[2]);
    else if(t=='watertower')watertower(st[1],st[2]);
    else if(t=='flagpole')flagpole(st[1],st[2]);
    else if(t=='pond')pond(st[1],st[2],st[3]);
    else if(t=='rockformation')rockFormation(st[1],st[2]);
    else if(t=='flowerbed')flowerbed(st[1],st[2],st[3]);
    else if(t=='fence')fence(st[1],st[2],st[3],st[4]);
    else if(t=='crates')crates(st[1],st[2]);
    else if(t=='barn')barn(st[1],st[2]);
    else if(t=='haystack')haystack(st[1],st[2]);
    else if(t=='cart')cart(st[1],st[2],Math.random()*6.28);
    else if(t=='barrels')barrels(st[1],st[2]);
    else if(t=='signpost')signpost(st[1],st[2]);
    else if(t=='totem')totem(st[1],st[2]);
    else if(t=='marketstall')marketStall(st[1],st[2],st[3]||0);
    else if(t=='archway')archway(st[1],st[2],st[3]||0);
    else if(t=='stonewall')stonewall(st[1],st[2],st[3],st[4]);
    else if(t=='waterwheel')waterwheel(st[1],st[2]);
    else if(t=='woodenbridge')woodenBridge(st[1],st[2],st[3]||0);
    else if(t=='ruinpillar')ruinPillar(st[1],st[2]);
    else if(t=='belltower')bellTower(st[1],st[2]);
    else if(t=='picnictable')picnicTable(st[1],st[2],Math.random()*6.28);
    else if(t=='boat')boat(st[1],st[2],st[3]||0);
    else if(t=='beachhut')beachHut(st[1],st[2],st[3]||0);
    else if(t=='beachumbrella')beachUmbrella(st[1],st[2]);
    else if(t=='logpile')logPile(st[1],st[2]);
    else if(t=='statuegarden')statueGarden(st[1],st[2]);
    else if(t=='potshelf')potShelf(st[1],st[2],Math.random()*6.28);
    else if(t=='lanternpost')lanternPost(st[1],st[2]);
    else if(t=='stonecircle')stoneCircle(st[1],st[2]);
    else if(t=='giantmushroom')giantMushroom(st[1],st[2],st[3]||1);
    else if(t=='stumplog')stumpLog(st[1],st[2]);
    else if(t=='scarecrow')scarecrow(st[1],st[2]);
    else if(t=='beehive')beehive(st[1],st[2]);
    else if(t=='flowerarch')flowerArch(st[1],st[2],st[3]||0);
    else if(t=='wishingwell')wishingWell(st[1],st[2]);
    else if(t=='garden')garden(st[1],st[2],st[3]||6);
    else if(t=='statuejello')statueJello(st[1],st[2]);
    else if(t=='torch')torch(st[1],st[2]);
  }
  if(L.extras)for(const ex of L.extras){
    const t=ex[0];
    if(t==='hotairballoon')hotAirBalloon(ex[1],ex[2]);
    else if(t==='campfire')campfire(ex[1],ex[2]);
  }
  if(L.waterfalls)for(const wf of L.waterfalls)waterfall(wf[1],wf[2],wf[3],wf[4]);
  if(L.animals)for(const a of L.animals)spawnAnimal(a[0],a[1],a[2],a[3],a[4]);

  for(const type in trees)instance(treeGeo(type),trees[type]);
  if(rocks.length)instance(treeGeo('rock'),rocks);
  if(grasses.length)instance(treeGeo(grassType),grasses);
  if(flowers.length)instance(treeGeo('flower'),flowers);

  for(const amb of L.ambient){
    if(amb==='butterflies')for(let i=0;i<Math.round(25*AMB_MULT_GFX);i++){const a=Math.random()*6.28,d=30+Math.random()*180;spawnAmb('butterflies',{x:Math.cos(a)*d,y:1.5+Math.random()*2,z:Math.sin(a)*d,ph:Math.random()*6.28,cx:Math.cos(a)*d,cz:Math.sin(a)*d,r:2+Math.random()*4,spd:.6+Math.random()*.5,spark:0})}
    if(amb==='birds')for(let i=0;i<Math.round(10*AMB_MULT_GFX);i++)spawnAmb('birds',{x:(Math.random()-.5)*300,y:25+Math.random()*15,z:(Math.random()-.5)*300,a:Math.random()*6.28,r:60+Math.random()*60,spd:.3+Math.random()*.2,y0:25+Math.random()*15})
    if(amb==='clouds')for(let i=0;i<Math.round(14*AMB_MULT_GFX);i++)spawnAmb('clouds',{x:(Math.random()-.5)*400,y:40+Math.random()*20,z:(Math.random()-.5)*400,spd:.5+Math.random()*1,sx:1+Math.random()*1.2,sy:1+Math.random()*.4,sz:.8+Math.random()*.8})
    if(amb==='leaves')for(let i=0;i<Math.round(20*AMB_MULT_GFX);i++)spawnAmb('leaves',{x:(Math.random()-.5)*200,y:8+Math.random()*10,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*2,vz:(Math.random()-.5)*2,ph:Math.random()*6.28})
    if(amb==='petals')for(let i=0;i<Math.round(25*AMB_MULT_GFX);i++)spawnAmb('petals',{x:(Math.random()-.5)*200,y:8+Math.random()*8,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*1.5,vz:(Math.random()-.5)*1.5,ph:Math.random()*6.28})
    if(amb==='snow')for(let i=0;i<Math.round(170*AMB_MULT_GFX);i++)spawnAmb('snow',{x:(Math.random()-.5)*200,y:Math.random()*30+5,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*.8,vy:-1.5-Math.random()*2,vz:(Math.random()-.5)*.8})
    if(amb==='fireflies')for(let i=0;i<Math.round(30*AMB_MULT_GFX);i++){const a=Math.random()*6.28,d=20+Math.random()*150;spawnAmb('fireflies',{x:Math.cos(a)*d,y:.5+Math.random()*3,z:Math.sin(a)*d,cx:Math.cos(a)*d,cz:Math.sin(a)*d,r:1+Math.random()*2,ph:Math.random()*6.28,spd:.3+Math.random()*.4})}
    if(amb==='bubbles')for(let i=0;i<Math.round(18*AMB_MULT_GFX);i++){const a=Math.random()*6.28,d=20+Math.random()*100;spawnAmb('bubbles',{x:Math.cos(a)*d,y:Math.random()*2,z:Math.sin(a)*d,vy:.6+Math.random()*.8})}
    if(amb==='dust')for(let i=0;i<Math.round(25*AMB_MULT_GFX);i++){const a=Math.random()*6.28,d=15+Math.random()*120;spawnAmb('dust',{x:Math.cos(a)*d,y:1+Math.random()*8,z:Math.sin(a)*d,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.3,vz:(Math.random()-.5)*.4})}
    if(amb==='wind')for(let i=0;i<Math.round(30*AMB_MULT_GFX);i++){const a=Math.random()*6.28,d=15+Math.random()*150;spawnAmb('wind',{x:Math.cos(a)*d,y:1+Math.random()*15,z:Math.sin(a)*d,vx:(Math.random()-.5)*3,vz:(Math.random()-.5)*3,ph:Math.random()*6.28})}
  }

  enrich(n,tooClose,distToRoad,hitsHill,buildingZones);
  spawnJBs();
  const jd=JDR.length?JDR:JELLOGER_DEFS[n];
  if(jd){for(const d of jd) spawnJelloger(d)}
}

const jbGeo=new THREE.SphereGeometry(.45,8,6);
function spawnJBs(){
  jbs.forEach(j=>sc.remove(j.m));jbs=[];
  const N=curMap=='parkour'?260:curMap=='speedrace'?150:150,R=curMap=='parkour'?40:curMap=='speedrace'?6:190;
  for(let i=0;i<N;i++){
    let x,y=1.2+Math.random()*2,z;
    if(curMap=='parkour'&&plats.length){const p=plats[Math.floor(Math.random()*plats.length)];x=p.x+(Math.random()-.5)*Math.min(2.5,p.w*.7);z=p.z+(Math.random()-.5)*Math.min(2.5,p.d*.7);y=p.y+1.8+Math.random()}
    else if(curMap=='speedrace'){const q=trkAt(10+Math.random()*(TRK.len-30),(Math.random()-.5)*14);x=q.x;z=q.z;y=1+Math.random()*1.5}
    else {const a=Math.random()*6.28,d=Math.sqrt(Math.random())*R;x=Math.cos(a)*d;z=Math.sin(a)*d}
    const m=Mt(jbGeo,new THREE.MeshBasicMaterial({color:0x7fd0ff,transparent:true,opacity:.9}),x,y,z);
    jbs.push({m,x,y,z,ph:Math.random()*6.28});
  }
}
const jbPops=[];
function jbPop(x,y,z){
  const c=document.createElement('canvas');c.width=64;c.height=32;const cx=c.getContext('2d');
  cx.font='bold 22px monospace';cx.textAlign='center';cx.textBaseline='middle';
  cx.lineWidth=4;cx.strokeStyle='#0e1a3a';cx.strokeText('+1',32,16);cx.fillStyle='#7fd0ff';cx.fillText('+1',32,16);
  const tex=new THREE.CanvasTexture(c);tex.magFilter=tex.minFilter=THREE.NearestFilter;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  sp.position.set(x,y,z);sp.scale.set(2,.9,1);sp.renderOrder=11;
  sc.add(sp);jbPops.push({sp,l:1});
}

const spr=(w,h,f,sx,sy)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(sx,sy,1);s.renderOrder=9;return s};
const nameS=(n,c,f)=>spr(128,24,x=>{x.font=`bold 16px ${f}`;x.textAlign='center';x.lineWidth=4;x.strokeStyle='#0e1a3a';x.strokeText(n,64,17);x.fillStyle=c;x.fillText(n,64,17)},3.2,.6);
const jbLvlOf=v=>v>=500?4:v>=100?3:v>=50?2:v>=10?1:0;
const jbLvl=()=>jbLvlOf(cfg.jb);
function chatS(t,lvl){
  const FS=19,LH=24,MAXW=340,PAD=14;
  const tmp=document.createElement('canvas').getContext('2d');
  tmp.font=`bold ${FS}px monospace`;
  const words=String(t).split(' ');
  const lines=[];let cur='';
  for(const w of words){
    const test=cur?cur+' '+w:w;
    if(tmp.measureText(test).width<=MAXW-PAD*2)cur=test;
    else{if(cur)lines.push(cur);cur=w}
  }
  if(cur)lines.push(cur);
  if(!lines.length)lines.push('...');
  let W=PAD*2;for(const l of lines){W=Math.max(W,tmp.measureText(l).width+PAD*2)}
  W=Math.min(MAXW,Math.ceil(W));
  const H=Math.max(38, lines.length*LH+PAD);
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const x=c.getContext('2d');
  const p=3,w=W-p*2,h=H-p*2;
  if(lvl<=0){x.fillStyle='#fff';x.fillRect(p,p,w,h);x.strokeStyle='#0e1a3a';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
  else if(lvl==1){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#e0f2ff');g.addColorStop(1,'#a8d5ff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#3d8bff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
  else if(lvl==2){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#4ea8ff');g.addColorStop(1,'#8f5dff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
  else if(lvl==3){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ff5db1');g.addColorStop(.5,'#8f5dff');g.addColorStop(1,'#4ea8ff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2);x.fillStyle='#fff';for(let i=0;i<Math.floor(W/28);i++){x.fillRect(12+i*28,7,3,3);x.fillRect(22+i*26,H-11,3,3)}}
  else{const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'#ff5d5d');g.addColorStop(.25,'#ffd23f');g.addColorStop(.5,'#3fbf5f');g.addColorStop(.75,'#3d8bff');g.addColorStop(1,'#b05dff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2);x.fillStyle='#fff';for(let i=0;i<Math.floor(W/24);i++){x.fillRect(8+i*23,5,3,3);x.fillRect(14+i*22,H-10,3,3)}}
  x.font=`bold ${FS}px monospace`;x.textAlign='center';x.textBaseline='middle';
  x.fillStyle=lvl<=0?'#000':lvl==1?'#0e1a3a':'#fff';if(lvl>=2){x.shadowColor='#000';x.shadowBlur=5}
  const startY=H/2-(lines.length-1)*LH/2;
  for(let i=0;i<lines.length;i++)x.fillText(lines[i],W/2,startY+i*LH+1);
  x.shadowBlur=0;
  const tex=new THREE.CanvasTexture(c);tex.magFilter=tex.minFilter=THREE.NearestFilter;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  const spriteH=1.0;
  const spriteW=spriteH*(W/H);
  s.scale.set(spriteW,spriteH,1);s.renderOrder=9;return s;
}
const IC=['..PPP... .PPYPP.. ..PPP... ...G.... .G.G.... .GGG.... ...G.... ...G....','..PPP... .PPPPP.. .WWWWW.. .WWWWW.. ..CCC... ..CCC... ...C.... ...C....','.RR..RR. RRRRRRRR RRRRRRRR RRRRRRRR .RRRRRR. ..RRRR.. ...RR... ........','...OO... ..OOOO.. .OOOOOO. .OOOOOO. ..OOOO.. ...OO... .SSSSSS. ........','R......R .R....R. ..R..R.. ...RR... ...RR... ..R..R.. .R....R. R......R','..YYYY.. .YYYYYY. YKYYYYKY YYYYYYYY YKKKKKKY .YKRRKY. ..YYYY.. ........','..YYYY.. .YYYYYY. YYKYYKYY YYSYYSYY YYSYYSYY YYYKKYYY .YKYYKY. ..YYYY..','..YYYY.. .YYYYYY. YRRYYRRY YRRYYRRY YYYYYYYY YKYYYYKY .YKKKKY. ..YYYY..',
'O..OO..O .Y.YY.Y. YYYYYYYY YYYYYYYY .YYYYYY. ..YYYY.. ...YY... ........',
'..SSSS.. .S....S. S..SS..S S.S..S.S S.S..S.. S..SSS.. .S...... ..SSSS..',
'..GGGG.. .G....G. G......G G....G.G G...GGG. .G...G.. ..GGGG.. ........',
'.RRRRRR. RRRRRRRR RKRRRRKR RRKRRKRR RRRRRRRR RRKKKKRR RRKRRKRR .RRRRRR.',
'BBBB.... ...B.... ..B..... .BBBB... ....BBBB .....B.. ....B... ...BBBB.',
'...RR... ...RR... ...RR... ...RR... ...RR... ........ ...RR... ...RR...',
'..MMMM.. ..M..M.. ..M..M.. ..M.MM.. MMM..... MMMM.... MMM..... ........',
'..YY.... .YYYY... ..YY.... ..YYYYY. ...YYYYY ..YY..YY .YY...YY ........',
'...YY... ...YY... YYYYYYYY .YYYYYY. ..YYYY.. ..YYYY.. .YY..YY. YY....YY',
'..YYYY.. .YKYYKY. YYYYYYYY SYKKKKYS SYKRRKYS .YKKKKY. ..YYYY.. ........',
'..CCCC.. .CCCCCC. GGGGGGGG KKKKKKKK RRRRRRRR CCCCCCCC .CCCCCC. ........',
'S..SS..S .S.SS.S. ..SSSS.. SSSSSSSS SSSSSSSS ..SSSS.. .S.SS.S. S..SS..S',
'S......S SS....SS SSS..SSS SSSYYSSS .SSYYSS. ..SYYS.. ...YY... ........',
'....YY.. ...YY... ..YY.... .YYYYY.. ...YY... ..YY.... .YY..... YY......',
'...R.... ..RR.R.. ..RRRR.. .RROORR. .ROOOOR. .ROYYOR. ..OYYO.. ...OO...',
'YYYYYYYY Y.YYYY.Y Y.YYYY.Y .YYYYYY. ..YYYY.. ...YY... ..CCCC.. .CCCCCC.'],
PAL={P:'#ff9ec4',Y:'#ffd23f',G:'#3fbf5f',W:'#ffffff',C:'#f6b26b',R:'#ff4d6d',O:'#ff8c1a',S:'#5db5ff',K:'#0e1a3a',B:'#3d8bff',L:'#b05dff',M:'#ff5db1',D:'#8a8a82'};
const icoC=i=>{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');IC[i].split(' ').forEach((r,j)=>[...r].forEach((v,k)=>{if(v!='.'){x.fillStyle=PAL[v];x.fillRect(k,j,1,1)}}));return c};
const icoS=i=>{const t=new THREE.CanvasTexture(icoC(i));t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(1.3,1.3,1);s.renderOrder=9;return s};

const TOPY=[.9,1,1.3,1.7,1.1,1.4,1.9,2,1.8,1.8,.9,1.4,1.8,.9];
const HATS=['Tanpa','Mahkota','Topi Pesta','Topi Bisbol','Antena','Halo','Tanduk','Kuping Kelinci','Kuping Kucing','Tunas','Topi Penyihir','Topi Koki'];
function hatMesh(i){const C=(r,h,n)=>new THREE.CylinderGeometry(r,r,h,n||10),K=(r,h,n)=>new THREE.ConeGeometry(r,h,n||8),S=[-1,1];let P=[];
  if(i==1){P=[{geo:C(.55,.3,8),y:.15,color:0xffd23f}];for(let k=0;k<5;k++){const a=k/5*6.283;P.push({geo:K(.12,.4,4),x:Math.cos(a)*.5,y:.5,z:Math.sin(a)*.5,color:0xffd23f})}}
  else if(i==2)P=[{geo:K(.45,.95),y:.48,color:0xff5db1},{geo:ICO(.14,0),y:1,color:0xffd23f}];
  else if(i==3)P=[{geo:C(.55,.32),y:.16,color:0xff4d4d},{geo:BOX(.6,.08,.55),y:.05,z:.6,color:0xcc2f2f}];
  else if(i==4)P=[{geo:C(.04,.7,5),y:.35,color:0x333333},{geo:ICO(.16,0),y:.78,color:0xff4d4d}];
  else if(i==5)P=[{geo:new THREE.TorusGeometry(.5,.07,5,14).rotateX(1.5708),y:.55,color:0xfff3a0}];
  else if(i==6)P=S.map(s=>({geo:K(.15,.55,5),x:s*.5,y:.25,rz:-s*.35,color:0xff4040}));
  else if(i==7)P=S.map(s=>({geo:BOX(.2,.95,.1),x:s*.28,y:.5,rz:-s*.12,color:0xffd6e8}));
  else if(i==8)P=S.map(s=>({geo:K(.24,.45,3),x:s*.5,y:.2,rz:-s*.25,color:0x555566}));
  else if(i==9)P=[{geo:C(.04,.5,5),y:.25,color:0x3a8a3a}].concat(S.map(s=>({geo:ICO(.22,0).scale(1.6,.5,1),x:s*.22,y:.55,rz:s*.4,color:0x5fd05f})));
  else if(i==10)P=[{geo:C(.9,.07,12),y:.03,color:0x5a2fa0},{geo:K(.55,1.3),y:.7,color:0x7a45d0},{geo:ICO(.13,0),y:1.4,color:0xffd23f}];
  else if(i==11)P=[{geo:C(.55,.25),y:.12,color:0xffffff},{geo:ICO(.55,0).scale(1,.8,1),y:.55,color:0xffffff}];
  const g=new THREE.Group();g.add(new THREE.Mesh(mergeParts(P),new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:20})));return g}

function mkP(o){
  const sh=o.sh|0,root=new THREE.Group(),m=new THREE.Group();
  const geo=[new THREE.SphereGeometry(.9,8,5,0,6.2832,0,1.5708),new THREE.BoxGeometry(1.5,1,1.5).translate(0,.5,0),new THREE.ConeGeometry(1,1.3,3).translate(0,.65,0),new THREE.SphereGeometry(.85,8,6).translate(0,.85,0),new THREE.CylinderGeometry(.8,.9,1.1,8).translate(0,.55,0),new THREE.ConeGeometry(1,1.4,4).translate(0,.7,0),new THREE.OctahedronGeometry(.95).translate(0,.95,0),new THREE.SphereGeometry(.8,10,8).scale(1,1.25,1).translate(0,1,0),new THREE.DodecahedronGeometry(.9).translate(0,.9,0),new THREE.IcosahedronGeometry(.9).translate(0,.9,0),new THREE.CylinderGeometry(1.15,1.15,.9,10).translate(0,.45,0),new THREE.CylinderGeometry(.85,.85,1.4,6).translate(0,.7,0),new THREE.CylinderGeometry(.7,.8,1.8,10).translate(0,.9,0),new THREE.BoxGeometry(1.9,.9,1.5).translate(0,.45,0)][sh];
  const a=new THREE.Color(o.c1),b=new THREE.Color(o.c2),p=geo.attributes.position,cl=[];
  for(let i=0;i<p.count;i++){const c=a.clone().lerp(b,Math.min(1,Math.max(0,p.getY(i)/1.1)));cl.push(c.r,c.g,c.b)}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));
  const bodyMesh=new THREE.Mesh(geo,new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:10}));
  if(R.shadowMap.enabled)bodyMesh.castShadow=true;
  m.add(bodyMesh);let hat=null;if((o.hat|0)>0){hat=hatMesh(o.hat|0);hat.position.y=TOPY[sh]-.05;m.add(hat)}
  const ez=[.78,.7,.5,.8,.84,.45,.45,.72,.78,.78,1,.78,.76,.76][sh],eyes=new THREE.Group(),hearts=new THREE.Group(),tears=new THREE.Group();
  [-.3,.3].forEach(x=>{
    const e=new THREE.Mesh(new THREE.BoxGeometry(.16,.24,.1),new THREE.MeshBasicMaterial({color:0x111111}));e.position.set(x,.5,ez);e.userData.baseX=x;eyes.add(e);
    const h=icoS(2);h.scale.set(.4,.4,1);h.position.set(x,.5,ez);hearts.add(h);
    const t=new THREE.Mesh(new THREE.BoxGeometry(.08,.14,.08),new THREE.MeshBasicMaterial({color:0x44aaff}));t.position.set(x,.3,ez+.05);tears.add(t);
  });
  hearts.visible=tears.visible=false;m.add(eyes,hearts,tears);m.rotation.order='YXZ';root.add(m);
  const sh_blob=new THREE.Mesh(new THREE.CircleGeometry(.85,16).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28}));
  sh_blob.position.y=.02;root.add(sh_blob);
  if(!o.noName){const nm=nameS(o.n||o.name||'?',o.nc||'#fff',o.nf||'monospace');nm.position.y=2.1;root.add(nm)}
  const icos={};[0,1,2,4].forEach(k=>{const s=icoS(k);s.position.y=3.4;s.visible=false;root.add(s);icos[k]=s});
  sc.add(root);
  return{root,m,hat,shadow:sh_blob,eyes,hearts,tears,icos,x:0,z:0,y:0,vx:0,vz:0,vy:0,py:0,pvy:0,air:0,js:1,jx:1,sv:0,lean:0,flip:0,spd:0,jc:0,jh:0,ty:0,r:0,tx:0,tz:0,tr:0,e:-1,et:0,lEt:-1,lCt:-1,init:0,lx:0,lz:0,tt:0,c1:o.c1,chat:null,ce:0,jbLvl:jbLvlOf(o.jb||0),
    boostMul:1,boostTime:0,boostCooldown:0,sitting:null,nearSwing:-1,_prevJump:false,hp:10,maxHp:10,inRing:false,invuln:0,koTimer:0,
    balloon:null,nearBalloon:-1,dustT:0,sparkleT:Math.random()*2,carType:o.car||'f1'};
}
function setE(p,e){p.e=e;p.et=performance.now()}
function say(p,t){if(p.chat)p.root.remove(p.chat);p.chat=chatS(t,p.jbLvl||jbLvl());p.chat.position.y=3.0+(p.king?2.2:0);p.root.add(p.chat);p.ce=performance.now()+6500}
const A_={y:0,sx:1,sy:1,rx:0,ry:0,rz:0,eye:1},EFC={11:'#ff4d4d',14:'#ff90b8',16:'#ffd23f',17:'#ffe27a',19:'#cfeaff',21:'#7fd0ff',22:'#ff8c1a',23:'#ffd23f'};
function actAnim(p,e,d){const o=A_,s=Math.sin;o.y=o.rx=o.ry=o.rz=0;o.sx=o.sy=o.eye=1;
  switch(e){
  case 8:{const k=Math.abs(s(d*10));o.y=k*.2;o.sy=1-.15*k;o.sx=1+.1*k;break}
  case 9:o.ry=d*9;o.y=.1+Math.abs(s(d*3))*.2;break;
  case 10:{const u=(d%1.4)/1.4;if(u<.7){o.rx=-u/.7*6.283;o.y=s(u/.7*Math.PI)*1.6}break}
  case 11:o.rz=s(d*40)*.12;o.sx=1.1;o.sy=.92;break;
  case 12:o.sy=.62+s(d*1.6)*.05;o.sx=1.15;o.eye=.08;break;
  case 13:{const u=Math.min(1,d*3);o.y=s(u*Math.PI)*.8;o.sy=1.15;o.sx=.9;break}
  case 14:o.rz=s(d*7)*.25;o.y=Math.abs(s(d*7))*.5;o.sy=1+Math.cos(d*14)*.08;break;
  case 15:o.rx=(d%3<1.6?Math.min(1,(d%3)*3):0)*.8;break;
  case 16:o.ry=d*5;o.y=.4+s(d*3)*.2;break;
  case 17:o.y=Math.abs(s(d*16))*.18;o.sy=1+s(d*32)*.05;o.eye=.35;break;
  case 18:o.rz=s(d*5)*.15;o.sy=1+s(d*10)*.08;break;
  case 19:o.rz=s(d*60)*.05;o.sx=.95;break;
  case 20:o.y=1.2+s(d*3)*.3;o.rz=s(d*2)*.08;break;
  case 21:{const k=(d*8%1<.5)?1.12:.92;o.sx=k;o.sy=k;break}
  case 22:o.sy=1+s(d*12)*.1;o.sx=1-s(d*12)*.05;break;
  case 23:{const u=Math.min(1,d*2);o.y=u<1?s(u*Math.PI)*1.2:0;o.sy=1.1;break}
  }
  if(EFC[e]&&FXL()>=1&&Math.random()<(FXL()>=2?.12:.05))puff(p.x+(Math.random()-.5)*1.4,p.z+(Math.random()-.5)*1.4,1,EFC[e],2,p.y+.8+Math.random());
  return o}
function animE(p,t){
  const d=(t-p.et)/1000,e=d<4?p.e:-1;let y=0,sx=1,sy=1;
  if(e==3){y=.9*Math.sin(d*4.5)**2;sy=1+.12*Math.cos(d*9)}
  if(e==4){sy=.75;sx=1.2}
  if(e==5&&d%2<1)y=Math.abs(Math.sin(d*14))*.5;
  if(e==6){sy=.7;sx=1.2}
  const A=e>=8?actAnim(p,e,d):null;if(A){y+=A.y;sx*=A.sx;sy*=A.sy}
  if(!p.air&&p.spd<.6){const br=1+Math.sin(t/700+p.js*10)*.03;sy*=br;sx*=1/Math.sqrt(br)}
  p.eyes.scale.y=(A&&A.eye<1)?A.eye:(t%2400<120)?.08:(p.air?1.35:1);
  const drift=Math.sin(t/1300)*.06;p.eyes.children.forEach(ch=>{ch.position.x=ch.userData.baseX+drift});
  p.hearts.visible=e==7;p.eyes.visible=e!=7;p.tears.visible=e==6;
  p.tears.children.forEach((c,i)=>c.position.y=.4-((d*1.5+i*.5)%1)*.4);
  if(e>=8&&!p.icos[e]){const q=icoS(e);q.position.y=3.4;q.visible=false;p.root.add(q);p.icos[e]=q}
  for(const k in p.icos){p.icos[k].visible=+k==e;p.icos[k].position.y=3.4+(p.king?1.9:0)+Math.sin(t/200)*.1}
  p.m.position.y=y+(p.air?0:Math.abs(Math.sin(t/110))*.1*Math.min(1,p.spd/4));
  p.m.rotation.z=p.air?0:Math.sin(t/110)*.06*Math.min(1,p.spd/4);
  p.m.rotation.x=p.lean+p.flip+(A?A.rx:0);if(A){p.m.rotation.y+=A.ry;p.m.rotation.z+=A.rz}
  const boostWobble=p.boostTime>0?1.05:1;
  p.m.scale.set(sx*p.jx*boostWobble,sy*p.js,sx*p.jx*boostWobble);
  if(p.shadow){const sc=Math.max(.4,1-p.y*.06);p.shadow.scale.set(sc,sc,sc);if(R.shadowMap.enabled)p.shadow.material.opacity=.1*(1-Math.min(.7,p.y*.08));else p.shadow.material.opacity=.28*(1-Math.min(.7,p.y*.08))}
  if(p.hat)p.hat.rotation.z=FXL()>=2?Math.sin(t/250+p.js*9)*(.06+Math.min(.2,p.spd*.02)):0;
  if(p.chat&&t>p.ce){p.root.remove(p.chat);p.chat=null}
}
function jelly(p,dt){
  const vy=(p.y-p.py)/Math.max(dt,.001);p.py=p.y;const air=p.y>gOff(p.x,p.z)+.08;
  if(air&&!p.air){p.js=.65;puff(p.x,p.z,9,p.c1);ring(p.x,p.z,'#ffffff',.12,3)}
  if(!air&&p.air){const impact=Math.min(1,Math.abs(p.pvy)/14);p.js=Math.max(.5,.9-impact*.45);p.sv=0;puff(p.x,p.z,14+Math.floor(impact*10),p.c1,2+impact*2);trail(p.x,p.z,p.c1);if(impact>.4)ring(p.x,p.z,p.c1);if(impact>.5){for(let k=0;k<10;k++){const a=k/10*6.28;trail(p.x+Math.cos(a)*.8,p.z+Math.sin(a)*.8,p.c1)}}}
  if(air&&p.air&&vy-p.pvy>6&&vy>3){p.flip=.01;puff(p.x,p.z,10,'#ffe27a',5)}
  p.air=air;p.pvy=vy;const ty=air?1+Math.max(-.2,Math.min(.4,vy*.05)):1;
  p.sv+=((ty-p.js)*240-p.sv*11)*dt;p.js=Math.max(.45,Math.min(1.6,p.js+p.sv*dt));p.jx=1/Math.sqrt(p.js);
  if(p.flip>0){p.flip+=dt*13;if(p.flip>6.283)p.flip=0}
  p.lean+=((air?0:Math.min(.3,p.spd*.035))-p.lean)*Math.min(1,dt*10);
}
const PT=[],pG=BOX(.25,.25,.25);
function puff(x,z,n,c,up,y){for(let i=0;i<n;i++){let q=PT.find(o=>o.l<=0);if(!q){if(PT.length>=[80,140,260,420][FXL()])return;const m=Mt(pG,new THREE.MeshBasicMaterial({transparent:true}),0,0,0,sc);q={m,l:0,vx:0,vy:0,vz:0};PT.push(q)}const a=Math.random()*6.283,v=1.5+Math.random()*2;q.l=.7;q.vx=Math.cos(a)*v;q.vz=Math.sin(a)*v;q.vy=1.5+Math.random()*(up||2.5);q.m.material.color.set(i%3?c:'#ffffff');q.m.position.set(x,y!==undefined?y:.15+gOff(x,z),z);q.m.visible=true}}

const TR=[],trG=new THREE.CircleGeometry(1.2,10).rotateX(-1.5708);
function trail(x,z,c){
  let t=TR.find(q=>q.l<=0);
  if(!t){if(TR.length>=100)return;const m=Mt(trG,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide}),0,0,0,sc);t={m,l:0};TR.push(t)}
  t.l=3.5;t.m.material.color.set(c);t.m.material.opacity=.9;t.m.position.set(x,.09+gOff(x,z),z);t.m.visible=true;
}

const AURA=[];
