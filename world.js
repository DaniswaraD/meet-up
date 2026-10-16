const $=i=>document.getElementById(i);
const cfg=Object.assign({name:'',c1:'#3a8dff',c2:'#7fd0ff',sh:0,hat:0,nc:'#ffffff',nf:'monospace',rd:180,jb:0,gfx:'low',car:'f1',cars:['f1'],vc:[],hats:[0]},JSON.parse(localStorage.mu||'{}'));
if(!Array.isArray(cfg.cars)||!cfg.cars.length)cfg.cars=['f1'];
if(!Array.isArray(cfg.vc))cfg.vc=[];
if(!Array.isArray(cfg.hats))cfg.hats=[0];
if(!cfg.hats.includes(0))cfg.hats.unshift(0);
const DISCORD_WEBHOOK='https://discord.com/api/webhooks/1560506376868987086/ybIdSB7ewJNqWJPsN5bajeklfek9gCs_40CRT0nRLVun4yOt_i4eeZ_Lm9jKn6LIbzA8';
const HAT_PRICES=[0,1000,150,75,200,350,250,100,100,25,500,400];
const C_PALETTE=['#ff5d5d','#ff8c1a','#ffd23f','#3fdc6a','#3d8bff','#7fd0ff','#b05dff','#ff5db1','#ff90b8','#8b5a2b','#f0e6d0','#ffffff','#c0c0c0','#808080','#404040','#17306b','#0e1a3a','#000000'];
const C_LIGHT=new Set(['#ffffff','#f0e6d0','#ffd23f','#7fd0ff','#c0c0c0','#ffe27a']);
const CARS=[
  {id:'f1',    n:'F1 Ferrari',      price:0,    top:48.6, boost:76.4,  acc:1,    col:0xd8342a, col2:0xffe27a, seatY:.55, seatScale:.62},
  {id:'yaris', n:'Toyota Yaris GR', price:750,  top:52.8, boost:90.3,  acc:1.75, col:0xe8e8e8, col2:0xd8342a, seatY:1.05, seatScale:.55},
  {id:'vette', n:'Corvette ZR1',    price:1500, top:63.9, boost:104.2, acc:2.25, col:0xffd23f, col2:0x1a1a1a, seatY:.95,  seatScale:.6},
  {id:'chiron',n:'Bugatti Chiron',  price:3000, top:73.6, boost:118.1, acc:2.75, col:0x2a3a8a, col2:0x7fa8ff, seatY:1.0,  seatScale:.58},
  {id:'jesko', n:'Jesko Absolut',   price:4000, top:131.9, boost:148.6, acc:3,    col:0xf0f2f5, col2:0xff7a1a, seatY:1.05, seatScale:.52},
  {id:'vbb3',  n:'Venturi VBB-3',   price:5000, top:176.4, boost:194.4, acc:4,    col:0x1f4fd8, col2:0xffffff, seatY:1.2,  seatScale:.46},
  {id:'ssc',   n:'Thrust SSC',      price:10000,top:305.6, boost:347.2, acc:6,    col:0xdfe3e8, col2:0xd8342a, seatY:1.45, seatScale:.46},
  {id:'xars',  n:'Xarsdada',        price:15000,top:486.1, boost:555.6, acc:10,   col:0x6a2bd8, col2:0x39e6ff, seatY:1.2,  seatScale:.5}
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
const MAPS={island:[0x87c8ff,0x5cb85c],parkour:[0x0e1a3a,0x1a1a3a],speedrace:[0x87ceeb,0x4a4a5a],boxing:[0x14082e,0x1a1232],builds:[0x87c8ff,0x5cb85c]};
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
function stonewall(x1,z1,x2,z2){const P=[];const dx=x2-x1,dz=z2-z1;const len=Math.hypot(dx,dz);const n=Math.max(2,Math.floor(len/1.2));const rot=Math.atan2(dx,dz);for(let i=0;i<=n;i++){const t=i/n;const px=x1+dx*t,pz=z1+dz*t;P.push({geo:BOX(.8,.55,.8),x:px,y:.3,z:pz,color:i%2?0x7a7a72:0x8a8a82,ry:rot});P.push({geo:BOX(.85,.5,.85),x:px,y:.85,z:pz,color:i%2?0x8a8a82:0x7a7a72,ry:rot});P.push({geo:BOX(.75,.45,.75),x:px+(i%2?.15:-.15),y:1.35,z:pz,color:i%3?0x6a6a62:0x8a8a82,ry:rot})}addMerged(P);for(let i=0;i<=n;i+=2){const t=i/n;addCol(x1+dx*t,0,z1+dz*t,1.2,2,1.2)}}
function waterwheel(x,z){addMerged([{geo:BOX(.6,3,.6),x:x-2,y:1.5,z,color:0x5a3a1a},{geo:BOX(.6,3,.6),x:x+2,y:1.5,z,color:0x5a3a1a},{geo:BOX(4.5,.5,.5),x,y:3,z,color:0x5a3a1a}]);const g=new THREE.Group();g.position.set(x,2,z);const ring1=new THREE.Mesh(new THREE.TorusGeometry(1.8,.25,6,16),LM(0x8b5a2b));if(R.shadowMap.enabled)ring1.castShadow=true;g.add(ring1);for(let i=0;i<8;i++){const a=i/8*6.28;const spoke=new THREE.Mesh(BOX(.15,3.4,.15),LM(0x6b4a2b));spoke.rotation.z=a;if(R.shadowMap.enabled)spoke.castShadow=true;g.add(spoke)}for(let i=0;i<8;i++){const a=i/8*6.28;const p=new THREE.Mesh(BOX(.4,.6,.6),LM(0x7a4a1b));p.position.set(Math.cos(a)*1.8,Math.sin(a)*1.8,0);if(R.shadowMap.enabled)p.castShadow=true;g.add(p)}g.rotation.y=Math.PI/2;world.add(g);WATERWHEELS.push({g,t:Math.random()*6.28});addCol(x-2,0,z,.8,3,.8);addCol(x+2,0,z,.8,3,.8)}
function woodenBridge(x,z,rot){rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];const P=[];const len=14,wid=5;for(let i=0;i<14;i++){const t=i/13;const py=Math.sin(t*Math.PI)*.8;const p=T(0,-len/2+t*len);P.push({geo:BOX(wid,.2,len/14+.05),x:p[0],y:.6+py,z:p[1],color:0x8b5a2b,ry:rot})}[-wid/2,wid/2].forEach(xr=>{for(let i=0;i<=6;i++){const t=i/6;const py=Math.sin(t*Math.PI)*.8;const p=T(xr,-len/2+t*len);P.push({geo:BOX(.3,2.5,.3),x:p[0],y:1.5+py,z:p[1],color:0x5a3a1a})}for(let i=0;i<=12;i++){const t=i/12;const py=Math.sin(t*Math.PI)*.8;const p=T(xr,-len/2+t*len);P.push({geo:BOX(.15,.15,len/12+.1),x:p[0],y:2.2+py,z:p[1],color:0x6b4a2b,ry:rot})}});addMerged(P);addCol(x,0,z,wid,.5,len)}
function ruinPillar(x,z){const P=[];P.push({geo:new THREE.CylinderGeometry(1.4,1.6,.5,8),x,y:.25,z,color:0x9a9a8a});P.push({geo:new THREE.CylinderGeometry(1,1.1,4+Math.random()*2,8),x,y:2.5,z,color:0x9a9a8a});if(Math.random()<.6)P.push({geo:new THREE.CylinderGeometry(1.2,1,.4,8),x,y:5.2,z,color:0x9a9a8a});P.push({geo:BOX(.3,.3,.1),x:x+.9,y:3,z:z+.6,color:0x6a6a5a});P.push({geo:BOX(.2,.4,.1),x:x-.8,y:2,z:z-.5,color:0x6a6a5a});addMerged(P);addCol(x,0,z,3,5,3)}
function bellTower(x,z){addMerged([{geo:BOX(4,1,4),x,y:.5,z,color:0x8a8a82},{geo:BOX(3,1,3),x,y:1.5,z,color:0x9a9a92},{geo:BOX(2.5,8,2.5),x,y:6,z,color:0xa8a8a0},{geo:BOX(3.5,.4,3.5),x,y:10.2,z,color:0x8a8a82},{geo:new THREE.ConeGeometry(3,2.5,4),x,y:11.7,z,color:0xa04030,ry:Math.PI/4},{geo:BOX(.4,.4,2.5),x,y:10,z,color:0x5a3a1a}]);const g=new THREE.Group();g.position.set(x,10,z);const bell=new THREE.Mesh(new THREE.ConeGeometry(.9,1.4,10),LM(0xffd23f,{shininess:60}));if(R.shadowMap.enabled)bell.castShadow=true;bell.position.y=-.9;g.add(bell);const clapper=new THREE.Mesh(ICO(.2,0),LM(0x8b5a2b));clapper.position.y=-1.6;g.add(clapper);world.add(g);BELLS.push({g,t:Math.random()*6.28});addCol(x,0,z,4,10,4)}
function picnicTable(x,z,rot){rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];const P=[];const p1=T(0,0);P.push({geo:BOX(4,.2,1.6),x:p1[0],y:1.2,z:p1[1],color:0x8b5a2b,ry:rot});[[-2.2,0],[2.2,0]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(2,.15,1),x:p[0],y:.7,z:p[1],color:0x8b5a2b,ry:rot})});[[-1.5,-.6],[1.5,-.6],[-1.5,.6],[1.5,.6]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(.2,1.3,.2),x:p[0],y:.65,z:p[1],color:0x6b4a2b,ry:rot})});[[-2.2,-.4],[2.2,-.4],[-2.2,.4],[2.2,.4]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(.15,.8,.15),x:p[0],y:.4,z:p[1],color:0x6b4a2b,ry:rot})});addMerged(P);addCol(x,0,z,4.5,1.5,2)}
function boat(x,z,rot){rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];const P=[];P.push({geo:BOX(2,.6,4),x,y:.4,z,color:0x8b5a2b,ry:rot});P.push({geo:BOX(2.2,.3,4.2),x,y:.1,z,color:0x5a3a1a,ry:rot});const bow1=T(0,-2);const bow2=T(0,2);P.push({geo:new THREE.ConeGeometry(.8,1,4),x:bow1[0],y:.5,z:bow1[1],color:0x8b5a2b,ry:rot+Math.PI/4});P.push({geo:new THREE.ConeGeometry(.8,1,4),x:bow2[0],y:.5,z:bow2[1],color:0x8b5a2b,ry:rot-Math.PI/4});[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(1.8,.15,.4),x:p[0],y:.75,z:p[1],color:0xa07040,ry:rot})});const mastP=T(0,0);P.push({geo:new THREE.CylinderGeometry(.08,.1,3,6),x:mastP[0],y:2.2,z:mastP[1],color:0x5a3a1a});const oarP=T(1.2,0);P.push({geo:new THREE.CylinderGeometry(.1,.1,3,5),x:oarP[0],y:.5,z:oarP[1],color:0x6b4a2b,rx:Math.PI/2,ry:rot});addMerged(P);const g=new THREE.Group();g.position.set(mastP[0],2.5,mastP[1]);g.rotation.y=rot;const sail=new THREE.Mesh(new THREE.PlaneGeometry(1.8,2),new THREE.MeshBasicMaterial({color:0xf0e6d0,side:THREE.DoubleSide}));if(R.shadowMap.enabled)sail.castShadow=true;sail.position.x=.9;g.add(sail);world.add(g);addCol(x,0,z,2.5,1,4.5)}
function beachHut(x,z,rot){rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];const P=[];[[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(.2,3,.2),x:p[0],y:1.5,z:p[1],color:0x8b5a2b,ry:rot})});P.push({geo:BOX(3.5,.2,3.5),x,y:.15,z,color:0xa07040,ry:rot});P.push({geo:new THREE.ConeGeometry(3,2,4),x,y:4,z,color:0xd4a848,ry:rot+Math.PI/4});P.push({geo:new THREE.ConeGeometry(3.2,.4,8),x,y:4.9,z,color:0xc09840,ry:rot});P.push({geo:BOX(3.6,.4,3.6),x,y:3,z,color:0xc09840,ry:rot});addMerged(P);addCol(x,0,z,3.5,3,3.5)}
function beachUmbrella(x,z){addMerged([{geo:new THREE.CylinderGeometry(.08,.1,3,6),x,y:1.5,z,color:0x5a3a1a},{geo:new THREE.ConeGeometry(2.5,1,8),x,y:3.2,z,color:0xff5d5d},{geo:new THREE.ConeGeometry(2.5,1,8,0,6.28,0),x,y:3.3,z,color:0xffffff,ry:Math.PI/8}]);Mt(BOX(1.8,.05,1),LM(0x3d8bff),x+.9,.12,z)}
function logPile(x,z){const P=[];for(let row=0;row<3;row++){for(let i=0;i<5-row;i++){P.push({geo:new THREE.CylinderGeometry(.35,.35,3,8),x:x+(i-(4-row)/2)*.75,y:.35+row*.7,z,color:[0x8b5a2b,0x7a4a1b][row%2],rz:Math.PI/2})}}addMerged(P);addCol(x,0,z,4,2.5,1.5)}
function statueGarden(x,z){const P=[];P.push({geo:new THREE.CylinderGeometry(4,4,.3,20),x,y:.15,z,color:0xa8a8a0});P.push({geo:new THREE.TorusGeometry(4,.3,4,20).rotateX(1.5708),x,y:.35,z,color:0x8a8a82});addMerged(P);for(let i=0;i<3;i++){const a=i/3*6.28;const sx=x+Math.cos(a)*2.4,sz=z+Math.sin(a)*2.4;addMerged([{geo:BOX(1,.4,1),x:sx,y:.5,z:sz,color:0x8a8a8a},{geo:new THREE.SphereGeometry(.35,8,6),x:sx,y:1.1,z:sz,color:0xc0c0b8},{geo:BOX(.6,.8,.4),x:sx,y:1.6,z:sz,color:0xc0c0b8}])}addCol(x,0,z,7,1,7)}
function potShelf(x,z,rot){rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];const P=[];[[-1,-.3],[1,-.3],[-1,.3],[1,.3]].forEach(([lx,lz])=>{const p=T(lx,lz);P.push({geo:BOX(.1,2,.1),x:p[0],y:1,z:p[1],color:0x5a3a1a})});for(let y=0.5;y<=1.8;y+=0.65){P.push({geo:BOX(2.3,.1,.7),x,y,z,color:0x8b5a2b,ry:rot})}addMerged(P);for(let i=0;i<5;i++){const sx=Math.random()*2-1;const sz=(Math.random()-.5)*.4;const sy=[0.7,1.35,2][i%3];const p=T(sx,sz);Mt(new THREE.CylinderGeometry(.15,.2,.3,8),LM([0xa07040,0xd05040,0xa8a8a0,0x8b5a2b][i%4]),p[0],sy,p[1])}addCol(x,0,z,2.5,2,.8)}
function lanternPost(x,z){addMerged([{geo:new THREE.CylinderGeometry(.15,.2,4.5,6),x,y:2.25,z,color:0x3a2a1a}]);const g=new THREE.Group();g.position.set(x,4.2,z);const box=new THREE.Mesh(BOX(.7,1,.7),LM(0x5a3a1a));g.add(box);const glass=new THREE.Mesh(BOX(.6,.8,.62),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.7}));g.add(glass);const top=new THREE.Mesh(new THREE.ConeGeometry(.55,.3,4),LM(0x3a2a1a));top.position.y=.65;top.rotation.y=Math.PI/4;g.add(top);world.add(g);LANTERNS.push({g,t:Math.random()*6.28});addCol(x,0,z,.5,4.5,.5)}
function stoneCircle(x,z){const P=[];const r=7;const n=10;for(let i=0;i<n;i++){const a=i/n*6.28;const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;const h=2.5+Math.random()*1.5;P.push({geo:BOX(.7,h,.7),x:px,y:h/2,z:pz,color:i%3?0x8a8a82:0x7a7a72,ry:Math.random()*.4});P.push({geo:BOX(.75,.3,.75),x:px,y:h+.1,z:pz,color:0x9a9a92,ry:Math.random()*.4});addCol(px,0,pz,1.2,h,1.2)}P.push({geo:BOX(2.5,.5,2.5),x,y:.25,z,color:0x8a8a82});P.push({geo:BOX(1.8,.8,1.8),x,y:.9,z,color:0x9a9a92});P.push({geo:ICO(.6,1),x,y:1.8,z,color:0x7fd0ff});addMerged(P);Mt(ICO(.6,1),new THREE.MeshBasicMaterial({color:0x7fd0ff,transparent:true,opacity:.7}),x,1.8,z);addCol(x,0,z,2.8,1,2.8)}
function giantMushroom(x,z,r){r=r||1;addMerged([{geo:new THREE.CylinderGeometry(.5*r,.6*r,3*r,8),x,y:1.5*r,z,color:0xf0e6d0},{geo:new THREE.SphereGeometry(2*r,12,8,0,6.28,0,1.57),x,y:3*r,z,color:0xff5d5d},{geo:new THREE.SphereGeometry(.3*r,6,5),x:x+.8*r,y:3.6*r,z:z+.5*r,color:0xffffff},{geo:new THREE.SphereGeometry(.25*r,6,5),x:x-1.1*r,y:3.4*r,z:z-.3*r,color:0xffffff}]);addCol(x,0,z,1.4*r,3.5*r,1.4*r)}
function stumpLog(x,z){addMerged([{geo:new THREE.CylinderGeometry(.9,1.1,1.4,10),x,y:.7,z,color:0x5a3a1a},{geo:new THREE.CylinderGeometry(.9,.9,.15,10),x,y:1.5,z,color:0xa07040}]);const g=new THREE.Group();g.position.set(x,1.6,z);g.rotation.y=Math.random()*6.28;const handle=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.2,5),LM(0x8b5a2b));handle.rotation.z=Math.PI/2.2;handle.position.x=.5;g.add(handle);const blade=new THREE.Mesh(BOX(.5,.35,.1),LM(0xc0c0b8));blade.position.x=1.05;g.add(blade);world.add(g);addCol(x,0,z,2,1.5,2)}
function scarecrow(x,z){addMerged([{geo:new THREE.CylinderGeometry(.1,.1,3.5,6),x,y:1.75,z,color:0x8b5a2b},{geo:BOX(3,.15,.15),x,y:2.8,z,color:0x8b5a2b},{geo:BOX(1.6,1.4,.3),x,y:2.2,z,color:0xff8c1a},{geo:BOX(1.6,1.5,.3),x,y:2.2,z:z+.25,color:0xffd23f},{geo:new THREE.SphereGeometry(.5,10,8),x,y:3.4,z,color:0xd4a848},{geo:new THREE.ConeGeometry(.8,.8,6),x,y:4,z,color:0xa04030}]);Mt(ICO(.08,0),new THREE.MeshBasicMaterial({color:0x0e1a3a}),x-.15,3.4,z+.45);Mt(ICO(.08,0),new THREE.MeshBasicMaterial({color:0x0e1a3a}),x+.15,3.4,z+.45);addCol(x,0,z,2,4,2)}
function beehive(x,z){addMerged([{geo:new THREE.CylinderGeometry(.1,.1,2,6),x,y:1,z,color:0x5a3a1a},{geo:BOX(1.2,.15,1.2),x,y:.1,z,color:0x5a3a1a},{geo:new THREE.CylinderGeometry(.5,.5,.7,10),x,y:2.4,z,color:0xffd23f},{geo:new THREE.CylinderGeometry(.55,.55,.65,10),x,y:2.9,z,color:0xffc020},{geo:new THREE.CylinderGeometry(.45,.45,.55,10),x,y:3.35,z,color:0xffd23f}]);for(let i=0;i<3;i++){const a=i/3*6.28;Mt(BOX(.15,.1,.1),new THREE.MeshBasicMaterial({color:0xffd23f}),x+Math.cos(a)*1.2,3.5,z+Math.sin(a)*1.2)}addCol(x,0,z,1,3,1)}
function flowerArch(x,z,rot){rot=rot||0;const c=Math.cos(rot),s=Math.sin(rot);const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];const P=[];const p1=T(-3,0),p2=T(3,0);P.push({geo:BOX(.8,7,.8),x:p1[0],y:3.5,z:p1[1],color:0xe8e0d0});P.push({geo:BOX(.8,7,.8),x:p2[0],y:3.5,z:p2[1],color:0xe8e0d0});P.push({geo:new THREE.TorusGeometry(3.2,.5,8,20,Math.PI),x,y:7,z,color:0x3aa84a,ry:rot});addMerged(P);const cols=[0xff6688,0xffee55,0xffffff,0xb05dff,0xff8c1a];for(let i=0;i<20;i++){const a=Math.PI*(i/19);const lx=Math.cos(Math.PI-a)*3.2;const ly=Math.sin(a)*3.2;const p=T(lx,0);Mt(ICO(.25,0),LM(cols[i%cols.length],{shininess:30}),p[0],7+ly,p[1])}addCol(x-3,0,z,.8,7,.8);addCol(x+3,0,z,.8,7,.8)}
function wishingWell(x,z){addMerged([{geo:new THREE.CylinderGeometry(2,2.2,1.5,10),x,y:.75,z,color:0x8a8a82},{geo:new THREE.CylinderGeometry(1.7,1.7,.6,10),x,y:.5,z,color:0x2a6a9a},{geo:BOX(.3,4,.3),x:x-1.6,y:2,z:z-1.6,color:0x8b5a2b},{geo:BOX(.3,4,.3),x:x+1.6,y:2,z:z-1.6,color:0x8b5a2b},{geo:BOX(.3,4,.3),x:x-1.6,y:2,z:z+1.6,color:0x8b5a2b},{geo:BOX(.3,4,.3),x:x+1.6,y:2,z:z+1.6,color:0x8b5a2b},{geo:new THREE.ConeGeometry(3,1.8,4),x,y:5,z,color:0xa04030,ry:Math.PI/4}]);Mt(ICO(.4,0),new THREE.MeshBasicMaterial({color:0xffd23f}),x,.8,z);addCol(x,0,z,4.5,2.5,4.5)}
function garden(x,z,r){r=r||6;addMerged([{geo:new THREE.CylinderGeometry(r,r,.3,20),x,y:.15,z,color:0xc8b088}]);for(let i=0;i<16;i++){const a=i/16*6.28;const px=x+Math.cos(a)*(r*.7), pz=z+Math.sin(a)*(r*.7);const cols=[0xff6688,0xffee55,0xffffff,0xb05dff,0xff8c1a];Mt(new THREE.CylinderGeometry(.06,.06,.6,4),LM(0x3a7a2f),px,.6,pz);Mt(ICO(.22,0),LM(cols[i%5],{shininess:30}),px,.95,pz)}addCol(x,0,z,r*2,.4,r*2)}
function statueJello(x,z){addMerged([{geo:BOX(2.5,.6,2.5),x,y:.3,z,color:0x8a8a8a},{geo:BOX(1.8,.8,1.8),x,y:1,z,color:0x9a9a9a},{geo:new THREE.SphereGeometry(1,10,8),x,y:2.4,z,color:0xffd23f},{geo:new THREE.SphereGeometry(.7,8,6),x,y:3.5,z,color:0xff5d5d}]);addCol(x,0,z,3,3,3)}
function torch(x,z){addMerged([{geo:new THREE.CylinderGeometry(.15,.2,4,6),x,y:2,z,color:0x5a3a1a}]);const fl=new THREE.Mesh(ICO(.4,0),new THREE.MeshBasicMaterial({color:0xff8c1a,transparent:true,opacity:.9}));fl.position.set(x,4.3,z); world.add(fl);const fl2=new THREE.Mesh(ICO(.25,0),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.95}));fl2.position.set(x,4.6,z); world.add(fl2);FOUNTAINS.push({parts:[{m:fl,baseAng:0,t:0,isFlame:true},{m:fl2,baseAng:1,t:.5,isFlame:true}],x,z,topY:4.3});addCol(x,0,z,.5,4,.5)}

const BOARDS=[];
const BOARD_PAL={
  island :{bg:'#f6e7b8',hd:'#2f8fb8',hf:'#fff3b0',tx:'#17506b',ac:'#d2661e',ring:0xffd23f},
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
    add(new THREE.TorusGeometry(.5,.17,6,12),-2.55,1.3,.4,0xe03a3a);
    [[.5,0],[-.5,0],[0,.5],[0,-.5]].forEach(([a,b])=>add(BOX(.26,.26,.38),-2.55+a,1.3+b,.4,0xffffff));
    add(new THREE.CylinderGeometry(.05,.05,1.3,4),2.55,5.35,0,0x6a4a2a);
    add(new THREE.ConeGeometry(.34,1.5,3).rotateZ(-Math.PI/2),3.3,5.7,0,0xff6a3a);
    add(ICO(.24,0),1.3,.28,1.3,0xff9ec4,{sy:.6});add(ICO(.2,0),-1.1,.26,1.7,0xffd27a,{sy:.55});add(ICO(.18,0),2.2,.25,1.0,0xf6f0e0,{sy:.6});
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
    [-1,1].forEach(k=>{
      add(ICO(.42,0),k*.65,PY+1.75,0,0xd02a2a,{sx:1,sy:.9,sz:1.1});
      add(ICO(.2,0),k*.65+k*.38,PY+1.65,.18,0xd02a2a);
      add(new THREE.CylinderGeometry(.26,.26,.3,7),k*.65,PY+1.42,0,0xf2f2f2);
    });
    break}
  }
  [-2.55,-1.3,0,1.3,2.55].forEach(post);
  addMerged(P);

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

  const ix=x+s*2.7,iz=z+c*2.7,mk=(a,b,col,op)=>Mt(new THREE.RingGeometry(a,b,32).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}),ix,y+op,iz);
  const ring=mk(.8,1.15,K.ring,.14),ring2=mk(.5,.85,0xffffff,.16),ring3=mk(.35,.55,0xff8c1a,.18);

  BOARDS.push({x,z,y,rot,ix,iz,top:PY+PH/2+2.4,ring,ring2,ring3,anim:ANIM,t:Math.random()*6.28,active:false,style});
  return{x,z};
}

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

const _actV=new THREE.Vector3();
function placeActBubble(){
  const ab=$('act');
  if(!ab||!actTarget||!ab.classList.contains('show'))return;
  cam.updateMatrixWorld();
  _actV.set(actTarget.x,actTarget.y,actTarget.z).project(cam);
  const W=innerWidth,H=innerHeight;
  let x=W/2,y=H*.36;
  if(_actV.z>-1&&_actV.z<1){x=(_actV.x*.5+.5)*W;y=(-_actV.y*.5+.5)*H}
  x=Math.max(90,Math.min(W-195,x));
  y=Math.max(175,Math.min(H-175,y));
  ab.style.left=x+'px';ab.style.top=y+'px';
}

function talkTo(j){
  const line=j.lines[j.lineIdx%j.lines.length];
  j.lineIdx++;
  j.talkT=4;j.tr=Math.atan2(pl.x-j.x,pl.z-j.z);
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
  if(!DISCORD_WEBHOOK){toast('Webhook Discord belum diatur');return}
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
  builds: {
    sky:[0x87c8ff,0xfff4c2],edge:0x3a8d3a,roadFill:0x5cb85c,roadTrim:0x4a9a4a,plaza:10,
    hills:[],roads:[],treeZones:[],grassCount:0,flowerCount:0,rockCount:0,
    landmarks:[],structures:[],extras:[],animals:[],waterfalls:[],swings:[],battleRing:null,lamps:[],
    ambient:['clouds','birds']
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
  builds:[]
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
  for(let i=0;i<8;i++){const a=i/8*6.283+.2,x=Math.cos(a)*150,z=Math.sin(a)*150,t=a+Math.PI/2,dx=Math.cos(t)*4,dz=Math.sin(t)*4;
    pil(x+dx,z+dz,2.4,9,0x8a8f96);pil(x-dx,z-dz,2.4,9,0x8a8f96);P.push({geo:BOX(10,1.6,2.4),x,y:9.8,z,ry:-t,color:0x9aa0a8})}
  addMerged(P)}
const ANIM=[];
function pyramid(x,z,base,tiers,col,gc){const P=[],h=2;for(let k=0;k<tiers;k++){const w=base*(1-k/tiers*.85);P.push({geo:BOX(w,h,w),x,y:k*h+h/2,z,color:k%2?col:col+0x101008});addCol(x,k*h,z,w,h,w)}addMerged(P);ANIM.push(glowAt(x,tiers*h+1.2,z,gc,1.1))}
function glowAt(x,y,z,c,r){const m=Mt(ICO(r,1),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.8}),x,y,z);return(dt,t)=>{const k=Math.sin(t/300+x);m.material.opacity=.6+k*.3;m.scale.setScalar(1+k*.12)}}
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
  const p=big(28);
  if(p){const[x,z]=p,P=[];
    P.push({geo:new THREE.CylinderGeometry(3.6,5,26,8),x,y:13,z,color:0x7a4a22});addCol(x,0,z,8,26,8);
    for(let i=0;i<5;i++){const a=i*1.26;P.push({geo:ICO(1.8,0),x:x+Math.cos(a)*5.5,y:.4,z:z+Math.sin(a)*5.5,sx:1.8,sy:.4,ry:-a,color:0x6a3a1a})}
    for(let i=0;i<14;i++){const a=i*.72,px=x+Math.cos(a)*7.2,pz=z+Math.sin(a)*7.2,py=1.6+i*1.75;P.push({geo:BOX(5.4,.6,5.4),x:px,y:py,z:pz,color:i%2?0x8b5a2b:0x9a6a3a});addCol(px,py-.3,pz,5.4,.6,5.4);if(i%3==2)glow(px,py+1.6,pz,0xffe27a,.3)}
    P.push({geo:BOX(14,.8,14),x,y:23.7,z,color:0x9a6a3a});addCol(x,23.3,z,14,.8,14);
    for(const[a,b,w,d]of[[-6.5,0,.4,10],[6.5,0,.4,10],[0,6.5,10,.4]])P.push({geo:BOX(w,3,d),x:x+a,y:25.6,z:z+b,color:0xc8a878});
    P.push({geo:new THREE.ConeGeometry(7,3,4),x,y:28.6,z,ry:.785,color:0xc84a2a},{geo:BOX(.15,5,.15),x:x-5,y:27,z:z-5,color:0xdddddd},{geo:BOX(1.4,.8,.05),x:x-4.3,y:28.8,z:z-5,color:0xff5db1});
    for(const[a,b,r,h]of[[0,0,11,31],[9,3,7,28],[-8,-4,7,28],[2,-9,6,27],[-3,9,6,29]])P.push({geo:ICO(r,1),x:x+a,y:h,z:z+b,sx:1.2,sy:.8,sz:1.2,color:0x2f8a3a});
    addMerged(P);chest(x+3,z-3,24.1,60);glow(x,27,z,0xffe27a,.4);
    monAt('raja_kepiting',x+10,z-10);monAt('kepiting',x-10,z-9)}
  const TH={island:{w:0x8b5a2b,r:0xc84a2a}}[n];
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
  const MS=[['kepiting',7,60,185],['tengkorak',4,95,185]];
  for(const[t,c,r0,r1]of MS)for(let i=0;i<c;i++){const p=spot(r0,r1,6);if(p)monAt(t,p[0],p[1])}
  for(let k=0;k<3;k++){const m=Mt(new THREE.RingGeometry(226+k*5,228.5+k*5,72).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}),0,.12,0);ANIM.push((dt,t)=>{const u=(t/2400+k*.33)%1;m.scale.setScalar(1+u*.05);m.material.opacity=.55*(1-u)})}
  const dp=[{geo:ICO(1,1),sx:2.2,sy:.8,sz:.8,color:0x7aa0c0},{geo:new THREE.ConeGeometry(.5,1.4,4),x:-2.4,rz:1.5708,color:0x7aa0c0},{geo:new THREE.ConeGeometry(.3,.8,3),x:.2,y:.8,color:0x5a80a0},{geo:ICO(.7,0),sx:1.6,sy:.5,sz:.6,x:1.8,y:-.15,color:0xe8f0f8}];
  for(let i=0;i<[2,3,4,5][lv];i++){const d=mesh(dp),R=255+i*14,dir=i%2?1:-1;let last=0;ANIM.push((dt,t)=>{const a=t/9000*dir+i*2,u=(t/2600+i*.31)%1,x=Math.cos(a)*R,z=Math.sin(a)*R;d.position.set(x,Math.sin(u*Math.PI)*7-1.5,z);d.rotation.y=Math.atan2(-dir*Math.cos(a),-dir*Math.sin(a));d.rotation.z=.9*Math.cos(u*Math.PI);if(u<last){ring(x,z,'#ffffff',.12,2);puff(x,z,8,'#cfeaff',3,.2)}last=u})}
  if(lv>=2)for(let i=0;i<[0,0,4,7][lv];i++){const kk=mesh([{geo:BOX(1.4,1.4,.05),rz:.785,color:[0xff5db1,0xffd23f,0x3fbf5f,0x3d8bff][i%4]},{geo:BOX(.12,.12,.12),y:-1.4,color:0xffffff},{geo:BOX(.12,.12,.12),y:-2,color:0xff5d5d}]),R=50+i*14;ANIM.push((dt,t)=>{const a=t/7000+i*1.3;kk.position.set(Math.cos(a)*R,34+Math.sin(t/900+i)*4,Math.sin(a)*R);kk.rotation.y=-a;kk.rotation.z=Math.sin(t/500+i)*.2})}
  many(6,170,205,5,(x,z)=>beachUmbrella(x,z));many(3,40,100,6,(x,z)=>flowerArch(x,z,Math.random()*6));
  many(12,25,160,3,(x,z)=>{Mt(new THREE.CylinderGeometry(.12,.15,3.2,5),LM(0x3a8a3a),x,1.6,z);const g=new THREE.Group();g.position.set(x,3.3,z);Mt(new THREE.CylinderGeometry(.9,.9,.2,12).rotateX(1.5708),LM(0xffd23f),0,0,0,g);Mt(new THREE.CylinderGeometry(.45,.45,.25,10).rotateX(1.5708),LM(0x5a3a1a),0,0,.05,g);world.add(g);ANIM.push((dt,t)=>{g.rotation.y=Math.sin(t/2000+x)*.5;g.rotation.x=Math.sin(t/1500+z)*.08})});
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
  LIM=(n=='parkour')?240:n=='speedrace'?160:n=='builds'?500:200;
  const[sk,gr]=MAPS[n];
  const L=LAYOUTS[n];
  const skyCols=L?L.sky:(n=='speedrace'?(THEMES[rtrack]||THEMES.drag).sky:[0x87c8ff,0xfff4c2]);
  makeSky(skyCols[0],skyCols[1]);
  sc.background=new THREE.Color(sk);sc.children[0].color.set(0xffffff);
  sc.fog=new THREE.Fog(sk,cfg.rd,cfg.rd*1.6);setRD();
  {const RT=n=='speedrace'?THEMES[rtrack]:null;if(RT&&RT.scene){const fc=new THREE.Color(RT.sky[0]).lerp(new THREE.Color(RT.sky[1]),.5);sc.background=fc;sc.fog.color.copy(fc);if(skyDome)skyDome.material.fog=false;if(sunMesh){sunMesh.material.fog=false;sunMesh.material.color.set(RT.sun||0xfff4c2);sunMesh.scale.setScalar(RT.sunS||1)}}}
  const disc=(r,c,y,x=0,z=0)=>{const m=Mt(new THREE.CircleGeometry(r,32).rotateX(-1.5708),(r<300?LM(0xffffff,{map:tex(TXS(),TXS(),(q,w,h)=>noise(q,w,h,'#'+c.toString(16).padStart(6,'0'),w*h/6,.3),r/12,r/12)}):LM(c)),x||0,y,z||0);if(R.shadowMap.enabled)m.receiveShadow=true;return m};

  pool('clouds',new THREE.SphereGeometry(6,7,5),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85}),16);
  pool('birds',new THREE.SphereGeometry(.5,5,4),new THREE.MeshBasicMaterial({color:0x1a1a1a}),10);
  pool('butterflies',BOX(.6,.1,.7),new THREE.MeshBasicMaterial({color:0xffe27a}),25);
  pool('snow',BOX(.25,.25,.25),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9}),80);
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
    feedbackBoard(-4.6,-4,Math.atan2(4.6,4),1,'parkour');
    spawnJBs();return;
  }

  if(n=='boxing'){buildBoxing();feedbackBoard(14.5,-25,Math.atan2(-14.5,25),0,'boxing'); return}
  if(n=='speedrace'){(rtrack=='drag'?buildRace:buildCurved)();spawnJBs();return}

  if(n=='builds'){disc(500,0x5cb85c,0);spawnJBs();return}

  disc(320,0x2a7fd0,0);disc(210,gr,.02);
  const gg=new THREE.CylinderGeometry(215,225,12,48,1,true),pp=gg.attributes.position;
  for(let i=0;i<pp.count;i++){const x=pp.getX(i),z=pp.getZ(i),a=Math.atan2(z,x),k=1+Math.sin(a*9)*.03;pp.setX(i,x*k);pp.setZ(i,z*k);if(pp.getY(i)>0)pp.setY(i,6+Math.abs(Math.sin(a*6))*3)}
  gg.computeVertexNormals();
  const cliff=Mt(gg,LM(0x3a8d3a,{side:THREE.DoubleSide}),0,5.8,0);
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

  {
    const clearance=(x,z)=>{
      let m=Math.min(distToRoad(x,z)+3,LIM-8-Math.hypot(x,z));
      for(const b of buildingZones)m=Math.min(m,Math.hypot(x-b.x,z-b.z)-b.r);
      for(const h of hillData)m=Math.min(m,Math.hypot(x-h.x,z-h.z)-h.r);
      for(const c of cols){if(c.type==='dome'){m=Math.min(m,Math.hypot(x-c.x,z-c.z)-c.radius);continue}
        const dx=Math.max(Math.abs(x-c.x)-c.w/2,0),dz=Math.max(Math.abs(z-c.z)-c.d/2,0);m=Math.min(m,Math.hypot(dx,dz))}
      return m};
    let best=null;
    for(let r=L.plaza+8;r<=L.plaza+60;r+=3)for(let d=0;d<360;d+=6){
      const a=d*Math.PI/180,x=Math.cos(a)*r,z=Math.sin(a)*r,c=Math.min(clearance(x,z),9);
      const sc2=c-r*.06;
      if(!best||sc2>best.s)best={s:sc2,x,z}}
    const bx=best?best.x:0,bz=best?best.z:-(L.plaza+14);
    feedbackBoard(bx,bz,Math.atan2(-bx,-bz),0,n);
    buildingZones.push({x:bx,z:bz,r:9});
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
  const grassType='grassTuft';
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
  dock(0,-180,20,8);
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
  const N=curMap=='parkour'?260:curMap=='speedrace'?150:curMap=='builds'?100:150,R=curMap=='parkour'?40:curMap=='speedrace'?6:curMap=='builds'?200:190;
  for(let i=0;i<N;i++){
    let x,y=1.2+Math.random()*2,z;
    if(curMap=='parkour'&&plats.length){const p=plats[Math.floor(Math.random()*plats.length)];x=p.x+(Math.random()-.5)*Math.min(2.5,p.w*.7);z=p.z+(Math.random()-.5)*Math.min(2.5,p.d*.7);y=p.y+1.8+Math.random()}
    else if(curMap=='speedrace'){const q=trkAt(10+Math.random()*(TRK.len-30),(Math.random()-.5)*14);x=q.x;z=q.z;y=1+Math.random()*1.5}
    else if(curMap=='builds'){x=(Math.random()-.5)*1000;z=(Math.random()-.5)*1000;y=1.2+Math.random()*2}
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

function setSelf(){const keep=(pl&&typeof pl.x==='number')?{x:pl.x,z:pl.z,y:pl.y,r:pl.r,vx:pl.vx,vz:pl.vz,vy:pl.vy,jc:pl.jc,air:pl.air,py:pl.py,pvy:pl.pvy,js:pl.js,jx:pl.jx,sv:pl.sv,lean:pl.lean,flip:pl.flip,spd:pl.spd,ty:pl.ty,tx:pl.tx,tz:pl.tz,tr:pl.tr,e:pl.e,et:pl.et,lEt:pl.lEt,lCt:pl.lCt,init:pl.init,lx:pl.lx,lz:pl.lz,tt:pl.tt}:null;if(pl&&pl.root&&pl.root.parent)pl.root.parent.remove(pl.root);pl=mkP({...cfg,n:cfg.name});if(keep)Object.assign(pl,keep);pl.carType=cfg.car||'f1';(playing?sc:menuG).add(pl.root);const jbn=$('jbn');if(jbn)jbn.textContent=cfg.jb+' JB'}
function menuMode(){playing=false;document.body.classList.remove('racing');document.body.classList.remove('pkr');document.body.classList.remove('bxm');document.body.classList.remove('lowhp');cam.fov=60;cam.updateProjectionMatrix();world.visible=false;menuG.visible=true;makeSky(0x0e1a3a,0x3a5a9a);sc.fog=null;pl.x=pl.z=pl.y=0;pl.vx=pl.vz=pl.vy=0;pl.r=0;menuG.add(pl.root);zd=5}
build('island');setSelf();menuMode();
document.querySelectorAll('.bk').forEach(b=>b.onclick=()=>show('menu'));
$('ppbk').onclick=()=>show('menu');
const SHAPES=['Setengah','Kotak','Segitiga','Bola','Silinder','Piramida','Permata','Telur','Dodeka','Ikosa','Cakram','Prisma','Menara','Bantal'];
const shGrid=$('shapes');
SHAPES.forEach((n,i)=>{const b=document.createElement('button');b.textContent=n;b.className=cfg.sh==i?'on':'';b.onclick=()=>{cfg.sh=i;sv();setSelf();[...shGrid.children].forEach((x,j)=>x.classList.toggle('on',j==i))};shGrid.append(b)});

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

function drawCarPreview(cv,C){
  const x=cv.getContext('2d'),W=cv.width,H=cv.height;
  x.imageSmoothingEnabled=false;
  const g=x.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#1a2a5a');g.addColorStop(1,'#0a1a3a');
  x.fillStyle=g;x.fillRect(0,0,W,H);
  x.fillStyle='#2a2a3a';x.fillRect(0,H-7,W,7);
  x.fillStyle='#3a3a4a';x.fillRect(0,H-6,W,1);
  x.fillStyle='#ffd23f';for(let i=0;i<W;i+=12)x.fillRect(i,H-4,6,1);
  const cx=W/2,cy=H-11;
  const c1='#'+C.col.toString(16).padStart(6,'0');
  const c2='#'+C.col2.toString(16).padStart(6,'0');
  const r=(x0,y0,w,h,c)=>{x.fillStyle=c;x.fillRect(x0,y0,w,h)};
  if(C.id==='f1'){
    r(cx-24,cy-6,36,3,c1);
    r(cx+12,cy-5,12,2,c1);
    r(cx+22,cy-6,4,2,c1);
    r(cx-26,cy-9,12,7,c1);
    r(cx-4,cy-12,8,3,c2);
    r(cx-28,cy-17,16,2,c2);
    r(cx-22,cy-15,1,6,'#333');
    r(cx-24,cy-8,4,4,'#111');
    r(cx-25,cy-4,8,8,'#1a1a1f');r(cx-23,cy-2,4,4,'#cfd6e0');
    r(cx+12,cy-4,8,8,'#1a1a1f');r(cx+14,cy-2,4,4,'#888');
  }else if(C.id==='yaris'){
    r(cx-22,cy-8,44,8,c1);
    r(cx-14,cy-18,28,10,c1);
    r(cx-12,cy-17,24,7,'#223344');
    r(cx-12,cy-17,1,7,'#0a1520');r(cx+9,cy-17,1,7,'#0a1520');
    r(cx-16,cy-4,8,7,'#1a1a1f');r(cx-14,cy-2,4,5,'#c0c8d0');
    r(cx+8,cy-4,8,7,'#1a1a1f');r(cx+10,cy-2,4,5,'#c0c8d0');
    r(cx+21,cy-6,2,2,'#fff3a0');
    r(cx-23,cy-6,2,2,'#ff2d2d');
  }else if(C.id==='vette'){
    r(cx-26,cy-7,52,6,c1);
    r(cx+8,cy-9,18,3,c1);
    r(cx-12,cy-14,20,7,c1);
    r(cx-10,cy-13,16,5,'#223344');
    r(cx-28,cy-16,14,2,c2);
    r(cx-18,cy-3,8,7,'#1a1a1f');r(cx-16,cy-2,5,5,'#b0b8c0');
    r(cx+10,cy-3,8,7,'#1a1a1f');r(cx+12,cy-2,5,5,'#b0b8c0');
    r(cx+24,cy-6,2,2,'#fff3a0');
    r(cx-26,cy-6,2,2,'#ff2d2d');
  }else if(C.id==='jesko'){
    r(cx-27,cy-7,54,6,c1);
    r(cx-10,cy-13,20,6,c1);r(cx-8,cy-12,14,4,'#223344');
    r(cx-24,cy-16,16,2,c2);r(cx-22,cy-14,2,7,c2);
    r(cx-21,cy-4,9,8,'#1a1a1f');r(cx-19,cy-2,5,5,'#d8d8d8');
    r(cx+11,cy-4,9,8,'#1a1a1f');r(cx+13,cy-2,5,5,'#d8d8d8');
    r(cx+27,cy-6,2,2,'#fff3a0');r(cx-29,cy-6,2,2,'#ff2d2d');
  }else if(C.id==='vbb3'){
    r(cx-34,cy-8,68,6,c1);
    r(cx+30,cy-7,6,4,c1);r(cx+35,cy-6,3,2,c1);
    r(cx-37,cy-9,6,5,c1);
    r(cx-4,cy-13,13,5,'#112233');r(cx-5,cy-14,15,1,c1);
    r(cx-31,cy-16,3,8,c2);r(cx-29,cy-6,56,1,c2);
    r(cx-26,cy-4,7,7,'#1a1a1f');r(cx-24,cy-2,3,3,'#cfd6e0');
    r(cx+18,cy-4,7,7,'#1a1a1f');r(cx+20,cy-2,3,3,'#cfd6e0');
    r(cx-38,cy-7,2,2,'#ff2d2d');
  }else if(C.id==='ssc'){
    r(cx-34,cy-11,68,8,c1);
    r(cx+30,cy-10,4,6,'#111111');r(cx+34,cy-9,4,4,c1);
    r(cx-32,cy-8,64,1,c2);
    r(cx-34,cy-21,5,10,c2);r(cx-38,cy-22,10,2,c1);
    r(cx+14,cy-14,10,3,'#112233');
    r(cx-38,cy-9,4,5,'#ff8c1a');
    r(cx-27,cy-4,8,8,'#1a1a1f');r(cx-25,cy-2,4,4,'#aaaaaa');
    r(cx+16,cy-4,8,8,'#1a1a1f');r(cx+18,cy-2,4,4,'#aaaaaa');
  }else if(C.id==='xars'){
    r(cx-26,cy-6,52,5,c1);
    r(cx+8,cy-8,18,3,c1);
    r(cx-12,cy-13,22,7,c1);r(cx-8,cy-12,14,5,'#0c1a30');
    r(cx-2,cy-7,12,2,c2);
    r(cx-31,cy-17,18,2,c2);r(cx-28,cy-15,1,9,'#222222');r(cx-18,cy-15,1,9,'#222222');
    r(cx-30,cy-6,4,3,c2);
    r(cx-20,cy-4,9,8,'#1a1a1f');r(cx-18,cy-2,5,5,c2);
    r(cx+10,cy-4,9,8,'#1a1a1f');r(cx+12,cy-2,5,5,c2);
    r(cx+25,cy-6,3,2,c2);
  }else{
    r(cx-28,cy-7,56,6,c1);
    r(cx+4,cy-9,22,3,c1);
    r(cx-14,cy-14,22,8,c1);
    r(cx-12,cy-13,18,6,'#112233');
    r(cx-16,cy-10,2,4,c2);r(cx+11,cy-10,2,4,c2);
    r(cx-30,cy-18,16,2,'#1a1a1a');
    r(cx-22,cy-4,9,8,'#1a1a1f');r(cx-20,cy-2,6,5,'#c8d0e0');
    r(cx+10,cy-4,9,8,'#1a1a1f');r(cx+12,cy-2,6,5,'#c8d0e0');
    r(cx+27,cy-6,3,2,'#f0f4ff');
    r(cx-30,cy-6,3,2,'#ff2d2d');
  }
}
function refreshCarUI(){
  const g=$('cars');if(!g)return;
  [...g.children].forEach(b=>{
    const C=carOf(b.dataset.car);
    b.classList.toggle('on',cfg.car===C.id);
    const pr=b.querySelector('.cp');
    const owned=(cfg.cars||['f1']).includes(C.id);
    if(C.price===0){pr.textContent='GRATIS';pr.className='cp owned'}
    else if(owned){pr.textContent='DIMILIKI';pr.className='cp owned'}
    else{pr.textContent=C.price+' JB';pr.className='cp lock'}
  });
}
function selectCar(C){
  const owned=(cfg.cars||['f1']).includes(C.id);
  if(!owned&&C.price>0){
    if(cfg.jb<C.price){toast('Kurang '+(C.price-cfg.jb)+' JB untuk '+C.n);return}
    cfg.jb-=C.price;
    cfg.cars=(cfg.cars||['f1']).slice();
    cfg.cars.push(C.id);
    sv();
    const jbn=$('jbn');if(jbn)jbn.textContent=cfg.jb+' JB';
    me&&me.update({jb:cfg.jb});
    toast('Membeli '+C.n+'! -'+C.price+' JB');
    for(let i=0;i<40;i++){const a=Math.random()*6.28,rr=Math.random()*2;puff(pl.x+Math.cos(a)*rr,pl.z+Math.sin(a)*rr,1,['#ffd23f','#fff3a0'][i%2],5,pl.y+.5+Math.random()*2)}
    if(window.refreshChip)refreshChip();
  }
  cfg.car=C.id;sv();
  if(pl){pl.carType=C.id;if(pl.car){pl.root.remove(pl.car.g);pl.car=null}}
  me&&me.update({car:C.id});
  refreshCarUI();
  toast('Kendaraan: '+C.n);
}
(function initCarUI(){
  const g=$('cars');if(!g)return;
  g.innerHTML='';
  CARS.forEach(C=>{
    const b=document.createElement('button');
    b.className='car';b.dataset.car=C.id;
    const cv=document.createElement('canvas');
    cv.width=96;cv.height=54;
    b.append(cv);
    const nm=document.createElement('span');nm.className='cn';nm.textContent=C.n;b.append(nm);
    const pr=document.createElement('small');pr.className='cp';b.append(pr);
    drawCarPreview(cv,C);
    b.onclick=()=>selectCar(C);
    g.append(b);
  });
  refreshCarUI();
})();

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
parkour:'<rect x="0" y="9" width="4" height="2" fill="#5cb85c"/><rect x="4" y="6" width="4" height="2" fill="#3d8bff"/><rect x="8" y="3" width="4" height="2" fill="#ff8c1a"/><rect x="1" y="7" width="2" height="2" fill="#7fd0ff"/>',
boxing:'<rect x="3" y="1" width="6" height="1" fill="#17306b"/><rect x="2" y="2" width="8" height="5" fill="#ff5d5d"/><rect x="3" y="2" width="3" height="1" fill="#ff9a9a"/><rect x="1" y="3" width="1" height="3" fill="#17306b"/><rect x="10" y="3" width="1" height="3" fill="#17306b"/><rect x="2" y="7" width="8" height="1" fill="#b32b30"/><rect x="3" y="8" width="6" height="3" fill="#ffffff"/><rect x="3" y="11" width="6" height="1" fill="#17306b"/>',
speedrace:'<rect x="1" y="6" width="10" height="3" fill="#ff5d5d"/><rect x="3" y="4" width="6" height="2" fill="#7fd0ff"/><rect x="2" y="8" width="3" height="3" fill="#17306b"/><rect x="7" y="8" width="3" height="3" fill="#17306b"/><rect x="5" y="2" width="2" height="2" fill="#ffd23f"/>',
builds:'<rect x="1" y="1" width="4" height="4" fill="#5cb85c"/><rect x="7" y="1" width="4" height="4" fill="#3d8bff"/><rect x="1" y="7" width="4" height="4" fill="#ffd23f"/><rect x="7" y="7" width="4" height="4" fill="#ff5d5d"/>'};
const micon=k=>'<svg class="mi" viewBox="0 0 12 12">'+(MICON[k]||'')+'</svg>';
const MU_HANGOUT=[['island','Pulau']];
const MU_FUN=[['parkour','Parkour'],['speedrace','Balapan'],['boxing','Boxing'],['builds','Builds']];
const MU=[...MU_HANGOUT,...MU_FUN];

const mGridHangout=$('mapsHangout');
const mGridFun=$('mapsFun');
const mGrid=mGridHangout;
const mkMapBtn=(k,l,host)=>{const b=document.createElement('button');b.innerHTML=micon(k)+'<span>'+l+'</span>';b.className=selMap==k?'on':'';b.dataset.map=k;
  b.onclick=()=>{selMap=k;[...mGridHangout.children,...mGridFun.children].forEach(x=>x.classList.toggle('on',x.dataset.map===k))};return b};
MU_HANGOUT.forEach(([k,l])=>mGridHangout.append(mkMapBtn(k,l)));
MU_FUN.forEach(([k,l])=>mGridFun.append(mkMapBtn(k,l)));

let rtrack='drag';
const TRACKS=[['drag','Drag','Lurus, 4 zona cuaca','#5ab05a',1],['rally','Rally','Berkelok lewat hutan','#c89a5a',4],['neon','Neon City','Kota neon malam hari','#ff2bd6',3],['beach','Pantai Sunset','Pesisir pasir dan senja','#ff9a5a',2],['canyon','Canyon Gurun','Tikungan tajam di tebing','#d0602a',5],['jelly','Jelly Land','Dunia jelly dan bubble','#ff8ad8',3]],TRACK_KEYS=TRACKS.map(t=>t[0]);
function trkPreview(k,c){const x=c.getContext('2d'),S=48;x.fillStyle='#17306b';x.fillRect(0,0,S,S);setTrack(k);const b=TRK.bb,kz=(S-8)/Math.max(b.h,1),kx=kz*Math.min(8,(S-12)/Math.max(1,b.w*kz)),ox=S/2-(b.w/2)*kx,X=p=>ox+(p.x-b.x0)*kx,Y=p=>S-4-(p.z-b.z0)*kz;x.strokeStyle='#7fd0ff';x.lineWidth=2;x.beginPath();TRK.pts.forEach((p,i)=>i?x.lineTo(X(p),Y(p)):x.moveTo(X(p),Y(p)));x.stroke();const a=TRK.pts[0],e=TRK.pts[TRK.pts.length-1];x.fillStyle='#3fbf5f';x.fillRect(X(a)-3,Y(a)-3,6,5);x.fillStyle='#ffd23f';x.fillRect(X(e)-3,Y(e)-1,6,5)}
function pickTrack(){return new Promise(res=>{const d=document.createElement('div');d.className='ui';d.innerHTML='<div class="card tkc" style="pointer-events:auto"><div class="lbl">Pilih Trek</div><div class="grid tkg"></div><button class="s">Kembali</button></div>';const g=d.querySelector('.grid');TRACKS.forEach(([k,n,t,col,df])=>{const b=document.createElement('button');b.className='tk';b.style.setProperty('--c',col);b.innerHTML='<canvas width="48" height="48"></canvas><span class="tt"><b>'+n+'</b><small>'+t+'</small><em class="dif">'+[1,2,3,4,5].map(i=>'<i'+(i<=df?' class="on"':'')+'></i>').join('')+'</em></span>';trkPreview(k,b.firstChild);b.onclick=()=>{d.remove();res(k)};g.append(b)});d.querySelector('.s').onclick=()=>{d.remove();res(null)};document.body.append(d)})}

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
  b.innerHTML=micon(k)+'<span>'+l+'</span><small data-cnt>'+(k=='speedrace'?'solo':(k=='builds'?'solo':'· · ·'))+'</small>';
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
async function join2(id,map,h){rid=id;host=h;roomMap=map;base=db.ref('rooms/'+id);me=base.child('players/'+uid);me.onDisconnect().remove();await me.set({n:cfg.name,c1:cfg.c1,c2:cfg.c2,sh:cfg.sh,hat:cfg.hat|0,nc:cfg.nc,nf:cfg.nf,car:cfg.car,x:0,z:0,y:0,r:0,e:-1,et:0,ct:0,ch:' ',jb:cfg.jb,hp:10,kl:0,klt:0,dc:0,kb:'',pc:0,pk:0,ab:0,ko:0,lastSeen:TS});try{const o=await db.ref('.info/serverTimeOffset').once('value');srvOff=o.val()||0}catch(e){}pl.x=pl.z=pl.y=0;joined=true;base.child('players').on('value',onPl);if(pl._hb)clearInterval(pl._hb);pl._hb=setInterval(()=>{if(me)me.update({lastSeen:TS}).catch(()=>{})},20000);if(id[0]!='g'){base.child('meta').on('value',s=>{const m=s.val();if(m&&m.started){if(m.startAt&&m.map=='speedrace')raceEnd=m.startAt+CDMS;if(!playing){rtrack=TRACK_KEYS.includes(m.track)?m.track:'drag';start(m.map)}}})}return 1}
function onPl(s){const v=s.val()||{};lastRoom=v;if(joined&&!v[uid]){leave();alert('Kamu keluar dari room');return}$('ll').innerHTML='';for(const id in v){const r=document.createElement('div');r.className='row';r.innerHTML=`<i style="background:${v[id].c1}"></i><b></b>`;r.lastChild.textContent=v[id].n+(id==uid?' (kamu)':'');if(host&&id!=uid){const x=document.createElement('button');x.className='kick';x.textContent=KX;x.onclick=()=>base.child('players/'+id).remove();r.append(x)}$('ll').append(r)}for(const id in v){if(id==uid)continue;const d=v[id];let p=P[id];if(!p){p=P[id]=mkP(d);p.x=d.x;p.z=d.z;p.y=d.y||0;p.carType=d.car||'f1';if((d.jb||0)>=500)toast(''+d.n+' punya '+d.jb+' JB!')}else if(p.carType!==(d.car||'f1')){p.carType=d.car||'f1';if(p.car){p.root.remove(p.car.g);p.car=null}}p.tx=d.x;p.tz=d.z;p.tr=d.r;p.ty=d.y||0;p.nm=d.n;p.pg=d.pg||0;p.ft=d.ft||0;p.jbLvl=jbLvlOf(d.jb||0);bxNet(p,d,id);if(d.et!==p.lEt){if(p.init&&d.e>=0)setE(p,d.e);p.lEt=d.et}if(d.ct!==p.lCt){if(p.init&&d.ch.trim())say(p,d.ch);p.lCt=d.ct}p.init=1}for(const id in P)if(!v[id]){sc.remove(P[id].root);delete P[id]}bxSyncRoom(v)}
function start(map,solo){
  soloRace=!!solo;if(solo)raceEnd=0;if(map=='speedrace')setTrack(rtrack);racePrg=0;build(map);clearBots();
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
  if(map=='speedrace'){const ids=Object.keys(lastRoom).sort(),ln=solo?0:[-5,0,5][Math.max(0,ids.indexOf(uid))%3],q=trkAt(-6,ln);pl.x=q.x;pl.z=q.z;pl.y=0;pl.r=q.h;cy=Math.PI+q.h;pitch=.4;zd=9;TRK.ci=TRK.loop?Math.floor((TRK.len-6)/4):0;lastS=TRK.loop?TRK.len-6:-6;raceDist=-6;myFt=0;raceCd=raceEnd?Math.max(.01,(raceEnd-srvNow())/1000):3.99;car.sp=0;car.st=0;hideWin();toast(matchMedia('(pointer:coarse)').matches?'Trek 5000J! Kiri: panah atas/bawah = gas/rem · Kanan: panah kiri/kanan = belok':'Trek 5000J! Panah atas/bawah = gas/rem, kiri/kanan = belok (W/A/S/D juga bisa)')}else{cam.fov=60;cam.updateProjectionMatrix();if(map=='parkour'){cy=Math.PI;pitch=.5}if(map=='boxing'){cy=Math.PI;pitch=.45;bxStart()}}
}
async function leave(){bxReset();padReset();hideWin();clearBots();raceEnd=0;joined=false;playing=false;if(pl&&pl._hb){clearInterval(pl._hb);pl._hb=null}if(pl&&pl.balloon){pl.balloon.rider=null;pl.balloon=null}if(base){base.child('players').off();base.child('meta').off();try{if(host&&rid[0]!='g')await base.remove();else await me.remove()}catch(e){}}for(const id in P)sc.remove(P[id].root);P={};base=me=null;$('hud').classList.add('hide');$('pause').classList.add('hide');$('hpbar').classList.add('hide');if(dlgBtnEl)dlgBtnEl.classList.remove('show');currentDlgTarget=null;menuMode();show('menu');document.getElementById('build-ui').classList.add('hide');if(window.buildCleanup)buildCleanup()}
const code=()=>Math.random().toString(36).slice(2,7).toUpperCase();
$('rc').onclick=async()=>{const er=await ready;if(er&&er!='timeout'&&er!='net'&&er!=''){return toast(ERR[er])}const m=selMap,c=code();let tk=null;if(m=='speedrace'){tk=await pickTrack();if(!tk)return;rtrack=tk}try{await db.ref('rooms/'+c+'/meta').set({host:uid,map:m,track:tk||'drag',started:false})}catch(e){return toast('Gagal buat room: '+e.code)}if(await join(c,m,true)){$('lc').textContent=c;$('lg').classList.remove('hide');show('lobby')}};
$('rj').onclick=async()=>{const er=await ready;if(er&&er!='timeout'&&er!='net'&&er!=''){return toast(ERR[er])}const c=$('ri').value.trim().toUpperCase();let r;try{r=await db.ref('rooms/'+c+'/meta').once('value')}catch(e){return toast('Gagal: '+e.code)}if(!r.exists())return toast('Room tidak ditemukan');const m=r.val().map;if(r.val().started&&m=='speedrace')return toast('Balapan sudah dimulai');rtrack=TRACK_KEYS.includes(r.val().track)?r.val().track:'drag';let pc;try{pc=await db.ref('rooms/'+c+'/players').once('value')}catch(e){pc=null}if(m=='speedrace'&&pc&&pc.numChildren()>=3)return toast('Room balapan penuh (maks 3 pemain)');if(await join(c,m,false)){$('lc').textContent=c;$('lg').classList.add('hide');show('lobby')}};
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
function mkCar(c,type){type=type||'f1';const CFG=carOf(type);const body=CFG.col,trim=CFG.col2;
  const g=new THREE.Group(),w=[],P=[],put=(geo,col,x,y,z,o)=>P.push(Object.assign({geo,color:col,x,y,z},o||{}));
  const addWheel=(x,z,r,wd,rimC)=>{const wg=new THREE.Group();wg.position.set(x,r+.05,z);
    const tire=new THREE.Mesh(new THREE.CylinderGeometry(r,r,wd,10).rotateZ(1.5708),LM(0x1a1a1f));
    const rim=new THREE.Mesh(BOX(r*1.35,.15,wd*1.1),LM(rimC||0xcfd6e0));
    if(R.shadowMap.enabled){tire.castShadow=true;rim.castShadow=true}
    wg.add(tire,rim);g.add(wg);w.push(wg)};
  if(type==='f1'){
    put(BOX(.9,.4,3.6),body,0,.55,0);
    put(BOX(.55,.3,1.2),body,0,.45,1.6);
    put(new THREE.ConeGeometry(.28,.5,4).rotateX(-1.5708),body,0,.45,2.35);
    put(BOX(.4,.22,1.4),body,-1.0,.55,-.5);
    put(BOX(.4,.22,1.4),body,1.0,.55,-.5);
    put(BOX(.7,.35,.7),0x111111,0,.85,-.2);
    put(new THREE.TorusGeometry(.4,.05,4,10).rotateX(1.5708),0x222222,0,1.1,-.2);
    put(BOX(.5,.35,.5),body,0,1.05,-1.15);
    put(BOX(2.3,.1,.65),body,0,.4,2.05);
    put(BOX(2.1,.08,.15),trim,0,.36,2.35);
    put(BOX(.12,.5,.6),0x111111,-1.05,.6,2.05);
    put(BOX(.12,.5,.6),0x111111,1.05,.6,2.05);
    put(BOX(1.7,.1,.55),body,0,1.55,-2.05);
    put(BOX(1.5,.08,.12),trim,0,1.6,-1.75);
    put(BOX(.1,.9,.1),0x111111,-.7,1.1,-2.05);
    put(BOX(.1,.9,.1),0x111111,.7,1.1,-2.05);
    put(BOX(1.1,.08,.7),body,0,.4,-2.05);
    addWheel(-1.05,1.4,.36,.5,0xcfd6e0);addWheel(1.05,1.4,.36,.5,0xcfd6e0);
    addWheel(-1.15,-1.5,.5,.55,0x888888);addWheel(1.15,-1.5,.5,.55,0x888888);
  } else if(type==='yaris'){
    put(BOX(1.9,.7,3.9),body,0,.75,0);
    put(BOX(1.82,.55,1.6),body,0,1.35,-.1);
    put(BOX(1.72,.4,1.3),0x1a1a1a,0,1.8,-.15);
    put(BOX(1.78,.38,1.45),0x223344,0,1.55,-.15);
    put(BOX(1.82,.45,.06),0x223344,0,1.5,.72);
    put(BOX(1.82,.45,.06),0x223344,0,1.5,-1.02);
    put(BOX(1.72,.1,.5),trim,0,1.12,1.4);
    put(BOX(1.6,.32,.08),0x111111,0,.72,1.97);
    put(BOX(.4,.15,.08),0xfff3a0,-.65,1.0,1.98);
    put(BOX(.4,.15,.08),0xfff3a0,.65,1.0,1.98);
    put(BOX(.55,.18,.08),0xff2d2d,-.6,1.0,-1.97);
    put(BOX(.55,.18,.08),0xff2d2d,.6,1.0,-1.97);
    put(BOX(1.7,.08,.35),trim,0,1.75,-1.95);
    put(BOX(.08,.28,.08),0x1a1a1a,-.7,1.6,-1.95);
    put(BOX(.08,.28,.08),0x1a1a1a,.7,1.6,-1.95);
    put(BOX(.25,.2,1.0),0x1a1a1a,-1.0,.9,1.3);
    put(BOX(.25,.2,1.0),0x1a1a1a,1.0,.9,1.3);
    put(BOX(.25,.2,1.0),0x1a1a1a,-1.0,.9,-1.3);
    put(BOX(.25,.2,1.0),0x1a1a1a,1.0,.9,-1.3);
    addWheel(-.95,1.25,.5,.45,0xc0c8d0);addWheel(.95,1.25,.5,.45,0xc0c8d0);
    addWheel(-.95,-1.3,.5,.45,0xc0c8d0);addWheel(.95,-1.3,.5,.45,0xc0c8d0);
  } else if(type==='vette'){
    put(BOX(2.05,.5,4.6),body,0,.7,0);
    put(BOX(1.95,.35,2.2),body,0,1.05,-.4);
    put(BOX(1.75,.35,1.2),0x111111,0,1.35,-.7);
    put(BOX(1.82,.35,.06),0x223344,0,1.22,.55);
    put(BOX(1.82,.35,.06),0x223344,0,1.22,-1.32);
    put(BOX(.05,.35,1.05),0x223344,-.9,1.22,-.65);
    put(BOX(.05,.35,1.05),0x223344,.9,1.22,-.65);
    put(BOX(.85,.1,.85),0x1a1a1a,0,1.02,1.3);
    put(BOX(2.0,.08,.3),0x1a1a1a,0,.52,2.35);
    put(BOX(.08,.22,1.0),0x1a1a1a,-1.03,.95,-.3);
    put(BOX(.08,.22,1.0),0x1a1a1a,1.03,.95,-.3);
    put(BOX(.5,.15,.1),0xfff3a0,-.7,.9,2.28);
    put(BOX(.5,.15,.1),0xfff3a0,.7,.9,2.28);
    put(BOX(.6,.18,.1),0xff2d2d,-.65,.95,-2.28);
    put(BOX(.6,.18,.1),0xff2d2d,.65,.95,-2.28);
    put(new THREE.CylinderGeometry(.08,.08,.25,6).rotateX(1.5708),0x888888,-.4,.55,-2.35);
    put(new THREE.CylinderGeometry(.08,.08,.25,6).rotateX(1.5708),0x888888,.4,.55,-2.35);
    put(BOX(1.9,.08,.5),0x1a1a1a,0,1.7,-2.15);
    put(BOX(.1,.6,.3),0x1a1a1a,-.85,1.4,-2.15);
    put(BOX(.1,.6,.3),0x1a1a1a,.85,1.4,-2.15);
    addWheel(-1.0,1.4,.42,.5,0xb0b8c0);addWheel(1.0,1.4,.42,.5,0xb0b8c0);
    addWheel(-1.0,-1.5,.45,.5,0xb0b8c0);addWheel(1.0,-1.5,.45,.5,0xb0b8c0);
  } else if(type==='jesko'){
    put(BOX(2.0,.45,5.2),body,0,.62,0);
    put(BOX(1.7,.3,1.0),body,0,.5,2.5);
    put(BOX(1.9,.1,.5),trim,0,.36,2.85);
    put(BOX(1.6,.38,1.8),body,0,1.0,-.3);
    put(BOX(1.5,.3,1.1),0x223344,0,1.15,-.05);
    put(BOX(1.5,.3,1.5),body,0,.95,-1.7);
    put(BOX(.08,.75,2.0),trim,0,1.5,-1.9);
    put(BOX(.25,.5,1.3),trim,-1.05,.7,-1.5);
    put(BOX(.25,.5,1.3),trim,1.05,.7,-1.5);
    put(BOX(1.8,.1,.5),0x111111,0,.45,-2.65);
    put(BOX(1.6,.08,.08),0xff2d2d,0,.85,-2.63);
    put(BOX(.45,.1,.1),0xf0f4ff,-.7,.72,2.62);
    put(BOX(.45,.1,.1),0xf0f4ff,.7,.72,2.62);
    put(new THREE.CylinderGeometry(.08,.08,.3,6).rotateX(1.5708),0x888888,-.4,.55,-2.7);
    put(new THREE.CylinderGeometry(.08,.08,.3,6).rotateX(1.5708),0x888888,.4,.55,-2.7);
    addWheel(-1.0,1.55,.45,.5,0xd8d8d8);addWheel(1.0,1.55,.45,.5,0xd8d8d8);
    addWheel(-1.05,-1.55,.5,.55,0xd8d8d8);addWheel(1.05,-1.55,.5,.55,0xd8d8d8);
  } else if(type==='vbb3'){
    put(BOX(1.5,.7,7.0),body,0,.75,0);
    put(BOX(1.0,.45,1.6),body,0,.58,4.0);
    put(BOX(.5,.3,.8),body,0,.5,4.9);
    put(BOX(1.1,.55,1.4),body,0,.82,-4.0);
    put(BOX(.6,.4,1.0),body,0,.8,-4.8);
    put(BOX(.8,.4,1.8),0x112233,0,1.2,.6);
    put(BOX(.9,.1,1.9),body,0,1.45,.6);
    put(BOX(.08,.9,1.6),trim,0,1.55,-3.5);
    put(BOX(.05,.2,5.0),trim,-.78,.88,-.3);
    put(BOX(.05,.2,5.0),trim,.78,.88,-.3);
    put(BOX(.4,.1,.08),0xff2d2d,0,.9,-5.3);
    put(BOX(.3,.3,1.0),body,-.95,.5,2.6);put(BOX(.3,.3,1.0),body,.95,.5,2.6);
    put(BOX(.3,.3,1.0),body,-.95,.5,-2.6);put(BOX(.3,.3,1.0),body,.95,.5,-2.6);
    addWheel(-.95,2.6,.38,.35,0xcfd6e0);addWheel(.95,2.6,.38,.35,0xcfd6e0);
    addWheel(-.95,-2.6,.38,.35,0xcfd6e0);addWheel(.95,-2.6,.38,.35,0xcfd6e0);
  } else if(type==='ssc'){
    for(const sx of[-1,1]){
      put(new THREE.CylinderGeometry(.62,.62,8.4,8).rotateX(1.5708),body,sx*1.05,1.0,-.2);
      put(new THREE.CylinderGeometry(.5,.5,.3,8).rotateX(1.5708),0x111111,sx*1.05,1.0,4.1);
      put(BOX(.3,.08,8.0),trim,sx*1.05,1.62,-.2);
      put(new THREE.ConeGeometry(.45,.9,8).rotateX(-1.5708),0xff8c1a,sx*1.05,1.0,-4.85);
      put(BOX(1.4,.12,.3),trim,sx*1.5,.85,-2.2);
    }
    put(BOX(.9,.55,5.0),body,0,1.0,2.4);
    put(new THREE.ConeGeometry(.45,1.6,6).rotateX(1.5708),body,0,1.0,5.7);
    put(BOX(.6,.3,1.2),0x112233,0,1.4,2.8);
    put(BOX(.1,1.5,1.6),trim,0,2.0,-3.6);
    put(BOX(2.4,.1,.8),body,0,2.7,-3.8);
    addWheel(-.7,3.0,.45,.4,0xaaaaaa);addWheel(.7,3.0,.45,.4,0xaaaaaa);
    addWheel(-2.0,-2.2,.45,.4,0xaaaaaa);addWheel(2.0,-2.2,.45,.4,0xaaaaaa);
  } else if(type==='xars'){
    put(BOX(2.2,.4,5.4),body,0,.6,0);
    put(BOX(1.8,.3,3.6),body,0,.95,-.3);
    put(BOX(1.6,.2,1.2),body,0,.45,3.0);
    put(BOX(.8,.15,.8),trim,0,.4,3.7);
    put(BOX(1.2,.3,1.6),0x0c1a30,0,1.2,.2);
    put(BOX(.3,.35,1.4),trim,-1.25,.8,-.5);put(BOX(.3,.35,1.4),trim,1.25,.8,-.5);
    put(BOX(2.6,.08,.7),body,0,1.75,-2.6);
    put(BOX(.1,.7,.7),trim,-1.3,1.45,-2.6);put(BOX(.1,.7,.7),trim,1.3,1.45,-2.6);
    put(BOX(.1,.8,.1),0x222222,-.6,1.3,-2.5);put(BOX(.1,.8,.1),0x222222,.6,1.3,-2.5);
    for(const sx of[-1,1]){
      put(new THREE.CylinderGeometry(.35,.4,.9,8).rotateX(1.5708),0x222222,sx*.55,.8,-3.0);
      put(new THREE.ConeGeometry(.35,1.0,8).rotateX(-1.5708),trim,sx*.55,.8,-3.8);
    }
    put(BOX(.9,.06,.1),trim,0,.55,3.62);
    addWheel(-1.15,1.7,.45,.5,0x39e6ff);addWheel(1.15,1.7,.45,.5,0x39e6ff);
    addWheel(-1.2,-1.8,.5,.55,0x39e6ff);addWheel(1.2,-1.8,.5,.55,0x39e6ff);
  } else {
    put(BOX(2.3,.5,4.8),body,0,.75,0);
    put(BOX(2.15,.32,2.4),body,0,1.06,-.5);
    put(BOX(1.9,.38,1.3),0x111111,0,1.38,-.9);
    put(BOX(2.02,.42,.06),0x112233,0,1.28,.4);
    put(BOX(2.02,.38,.06),0x112233,0,1.28,-1.55);
    put(BOX(.05,.38,1.15),0x112233,-.98,1.28,-.85);
    put(BOX(.05,.38,1.15),0x112233,.98,1.28,-.85);
    put(BOX(.1,.42,1.6),trim,-1.05,.95,-.4);
    put(BOX(.1,.42,1.6),trim,1.05,.95,-.4);
    put(BOX(.5,.08,.85),0x1a1a1a,-.6,1.04,1.3);
    put(BOX(.5,.08,.85),0x1a1a1a,.6,1.04,1.3);
    put(BOX(2.3,.08,.35),0x0a0a2a,0,.54,2.4);
    put(BOX(.32,.14,.1),0xf0f4ff,-.85,.95,2.35);
    put(BOX(.32,.14,.1),0xf0f4ff,-.55,.95,2.35);
    put(BOX(.32,.14,.1),0xf0f4ff,.55,.95,2.35);
    put(BOX(.32,.14,.1),0xf0f4ff,.85,.95,2.35);
    put(BOX(1.9,.1,.1),0xff2d2d,0,1.02,-2.42);
    put(new THREE.CylinderGeometry(.09,.09,.3,6).rotateX(1.5708),0x888888,-.5,.6,-2.45);
    put(new THREE.CylinderGeometry(.09,.09,.3,6).rotateX(1.5708),0x888888,.5,.6,-2.45);
    put(BOX(2.1,.08,.5),0x1a1a1a,0,1.72,-2.25);
    put(BOX(.1,.65,.3),0x1a1a1a,-.9,1.42,-2.25);
    put(BOX(.1,.65,.3),0x1a1a1a,.9,1.42,-2.25);
    addWheel(-1.15,1.45,.5,.55,0xc8d0e0);addWheel(1.15,1.45,.5,.55,0xc8d0e0);
    addWheel(-1.2,-1.55,.52,.6,0xc8d0e0);addWheel(1.2,-1.55,.52,.6,0xc8d0e0);
  }
  const bm=new THREE.Mesh(mergeParts(P),new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:70}));
  if(R.shadowMap.enabled){bm.castShadow=true;bm.receiveShadow=true}
  g.add(bm);
  if(FXL()>=2){const gl=new THREE.Mesh(new THREE.PlaneGeometry(2.8,5.2).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:body,transparent:true,opacity:.3,depthWrite:false}));gl.position.y=.06;g.add(gl)}
  return{g,w,seatY:CFG.seatY||.55,seatScale:CFG.seatScale||.62}}
function carStep(dt){const n=Math.min(12,Math.max(1,Math.ceil(Math.abs(car.sp)*dt/4)));for(let i=0;i<n;i++)carStep1(dt/n)}
function carStep1(dt){
  const go=raceCd<=0&&!raceFinished,fl=FXL();
  const CFG=carOf(cfg.car);
  const acc=go?Math.max(-1,Math.min(1,iy+(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)+PAD.U-PAD.D)):0,st=go?Math.max(-1,Math.min(1,ix+(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+PAD.R-PAD.L)):0;
  if(pl.boostTime>0&&(pl.boostTime-=dt)<=0)pl.boostMul=1;
  const top=CFG.top*(pl.boostMul||1);
  const ar=0.9*CFG.acc;
  if(acc>0)car.sp+=(top-car.sp)*Math.min(1,dt*(pl.boostTime>0?ar*2.67:ar))*acc;
  else if(acc<0)car.sp=Math.max(-12,car.sp+acc*45*dt);
  else car.sp*=Math.pow(raceFinished?.25:.65,dt);
  car.st+=(st-car.st)*Math.min(1,dt*8);
  pl.r-=car.st*dt*2.1*Math.min(1,Math.abs(car.sp)/14)*Math.min(1,150/Math.max(1,Math.abs(car.sp)))*(car.sp<0?-1:1);
  pl.vx=Math.sin(pl.r)*car.sp;pl.vz=Math.cos(pl.r)*car.sp;pl.x+=pl.vx*dt;pl.z+=pl.vz*dt;pl.y=0;pl.vy=0;
  const nr=trkNear(pl.x,pl.z,TRK.ci),lim=RW/2+.4;TRK.ci=nr.i;{let dl=nr.s-lastS;if(TRK.loop){if(dl<-TRK.len/2)dl+=TRK.len;else if(dl>TRK.len/2)dl-=TRK.len;raceDist+=dl}else raceDist=nr.s;lastS=nr.s;racePrg=raceDist}if(Math.abs(nr.d)>lim){const q=TRK.pts[nr.i],sg=Math.sign(nr.d);pl.x=nr.px+q.nx*sg*lim;pl.z=nr.pz+q.nz*sg*lim;car.sp*=Math.pow(.2,dt);if(fl&&Math.abs(car.sp)>10&&Math.random()<dt*30)puff(pl.x,pl.z,2,'#ffd23f',3,.6)}
  if(!ds&&!Object.keys(cvT).length&&car.sp>2){let d=pl.r+Math.PI-cy;d=Math.atan2(Math.sin(d),Math.cos(d));cy+=d*Math.min(1,dt*3)}
  const fv=60+Math.min(28,Math.max(0,car.sp)*.32)+(pl.boostTime>0?10:0);if(Math.abs(fv-cam.fov)>.05){cam.fov+=(fv-cam.fov)*Math.min(1,dt*4);cam.updateProjectionMatrix()}
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
    if(rc&&!p.car){p.car=mkCar(p.c1,p.carType||'f1');p.root.add(p.car.g)}else if(!rc&&p.car){p.root.remove(p.car.g);p.car=null}
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
