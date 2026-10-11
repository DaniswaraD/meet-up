const $=i=>document.getElementById(i);
const cfg=Object.assign({name:'',c1:'#3a8dff',c2:'#7fd0ff',sh:0,nc:'#ffffff',nf:'monospace',rd:180,jb:0,gfx:'low'},JSON.parse(localStorage.mu||'{}'));
const sv=()=>localStorage.mu=JSON.stringify(cfg);

const loadMsg=$('loadMsg'),loadBar=$('loadBar');
function setLoad(m,p){if(loadMsg)loadMsg.textContent=m;if(loadBar)loadBar.style.width=(p*100)+'%'}
let booted=false;
const SCREENS=['name','menu','playpick','skin','croom','lobby','set'];
function finishBoot(delay){
  if(booted)return;booted=true;
  setTimeout(()=>{
    const l=$('load');if(l)l.classList.add('hide');
    const n=$('nm');if(n)n.value=cfg.name;
    SCREENS.forEach(s=>{const e=$(s);if(e)e.classList.toggle('hide',s!=(cfg.name?'menu':'name'))});
  },delay||400);
}
setTimeout(()=>{if(!booted){setLoad('⚠ Memuat paksa...',1);finishBoot(0)}},7000);

try{

if(typeof firebase!='undefined')firebase.initializeApp({apiKey:"AIzaSyBrcEg6Ddw8PLmKJxi8rf9-N7eGsy4AUFs",authDomain:"meet-up-e1be8.firebaseapp.com",databaseURL:"https://meet-up-e1be8-default-rtdb.firebaseio.com",projectId:"meet-up-e1be8",storageBucket:"meet-up-e1be8.firebasestorage.app",messagingSenderId:"47326775225",appId:"1:47326775225:web:290a6644c0559ee2979868"});
const TS=typeof firebase!='undefined'?firebase.database.ServerValue.TIMESTAMP:0,KX='X';let db,uid,tT;
const toast=t=>{const e=$('toast');e.textContent=t;e.classList.remove('hide');clearTimeout(tT);tT=setTimeout(()=>e.classList.add('hide'),5000)};
const URLS=['https://meet-up-e1be8-default-rtdb.asia-southeast1.firebasedatabase.app','https://meet-up-e1be8-default-rtdb.firebaseio.com'];
const ready=Promise.race([
  (async()=>{
    if(typeof firebase=='undefined')return'net';
    try{
      uid=await Promise.race([
        firebase.auth().signInAnonymously().then(r=>r.user.uid),
        new Promise((_,rej)=>setTimeout(()=>rej(new Error('auth-timeout')),10000))
      ]);
    }catch(e){
      console.error('[Meet-UP] Auth error:',e.code||e.message,e);
      if(e.code==='auth/operation-not-allowed'){toast('⚠ Anonymous Auth belum ON');return'auth'}
      if(e.code==='auth/unauthorized-domain'){toast('⚠ Domain belum didaftarkan');return'auth'}
      if(e.message==='auth-timeout'){toast('⚠ Login timeout 10s');return'auth'}
      toast('⚠ Auth: '+(e.code||e.message));
      return'auth';
    }
    for(const u of URLS){
      const d=firebase.app().database(u);
      const ok=await Promise.race([
        new Promise(r=>{const ref=d.ref('.info/connected'),f=x=>{if(x.val()){ref.off('value',f);r(1)}};ref.on('value',f)}),
        new Promise(r=>setTimeout(()=>r(0),2000))
      ]);
      if(ok){db=d;return''}
      d.goOffline();
    }
    return'db';
  })(),
  new Promise(r=>setTimeout(()=>r('timeout'),12000))
]);
const ERR={net:'Tidak ada internet',auth:'Auth gagal — cek Console',db:'Database tidak terhubung',timeout:'Koneksi timeout'};
const G={M:'10001 11011 10101 10001 10001 10001 10001',e:'00000 00000 01110 10001 11111 10000 01110',t:'00100 00100 01110 00100 00100 00100 00011','-':'00000 00000 00000 01110 00000 00000 00000',U:'000000100 000001110 000011111 001000100 001000100 001000100 000111000',P:'11110 10001 10001 11110 10000 10000 10000'};
document.querySelectorAll('.ttl').forEach(c=>{c.width=50;c.height=10;const x=c.getContext('2d');let ox=2;for(const ch of'Meet-UP'){const rw=G[ch].split(' ');[[2,2,'#0e1a3a'],[1,1,'#17306b'],[0,0,ch=='U'?'#ffd23f':'#fff']].forEach(([dx,dy,col])=>{x.fillStyle=col;rw.forEach((r,j)=>[...r].forEach((v,i)=>v=='1'&&x.fillRect(ox+i+dx,1+j+dy,1,1)))});ox+=rw[0].length+1}});

(function injectStyles(){
  const st=document.createElement('style');
  st.textContent=`
  .shop{padding:12px 14px;background:#fff5e0;box-shadow:var(--bd),inset 0 -3px 0 #e0c080,inset 0 3px 0 #fff;display:flex;flex-direction:column;gap:5px}
  .shop .shop-lbl{font-size:9px;color:#a05000;text-align:center;letter-spacing:2px;margin-bottom:4px;font-weight:bold}
  .shop-row{display:flex;justify-content:space-between;align-items:center;background:#fffbe8;padding:7px 10px;box-shadow:inset 0 2px 0 #fff,0 2px 0 #c9a060;cursor:pointer;transition:filter .1s}
  .shop-row:active{filter:brightness(.94);transform:translateY(2px)}
  .shop-row .amt{color:#c05000;font-size:10px;font-weight:bold;letter-spacing:1px}
  .shop-row .prc{display:flex;gap:8px;align-items:center;font-size:9px}
  .shop-row .prc s{opacity:.5;color:#888;text-decoration:line-through;font-size:8px}
  .shop-row .prc b{color:#3fbf5f;font-size:11px}
  .shop .shop-note{font-size:7px;color:#a05000;text-align:center;opacity:.75;margin-top:4px;letter-spacing:1px;line-height:1.5}
  #menu{flex-direction:row!important;align-items:center!important;justify-content:space-between!important;padding:max(20px,env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) max(20px,env(safe-area-inset-bottom)) max(24px,env(safe-area-inset-left))!important;gap:20px}
  #menu .ttl{width:min(48vw,420px)!important;flex-shrink:0;margin:0!important}
  #menu .menu-right{display:flex;flex-direction:column;gap:14px;width:min(42vw,320px);margin-left:auto;max-height:calc(100vh - 40px);overflow-y:auto;padding:4px}
  #menu .menu-right .mb{width:100%!important;margin:0!important}
  #menu .menu-right .shop{width:100%!important;margin:0!important}
  #menu .menu-right::-webkit-scrollbar{width:4px}
  #menu .menu-right::-webkit-scrollbar-thumb{background:#17306b;border-radius:0}
  .grid.map button small{display:block;font-size:7px;line-height:1;margin-top:4px;opacity:.8;font-weight:normal;letter-spacing:0}
  .grid.map button.on small{opacity:1}
  .grid.map button small.on-live{color:#3fbf5f}
  @media(max-height:430px){
    #menu{padding:14px 3vw!important;gap:12px}
    #menu .ttl{width:min(42vw,320px)!important}
    #menu .menu-right{width:min(46vw,300px);gap:10px}
    .shop{padding:9px 11px}
    .shop-row{padding:5px 8px}
    .shop-row .amt{font-size:9px}
    .shop-row .prc b{font-size:10px}
    .shop-row .prc s{font-size:7px}
  }
  #hpbar{position:fixed;top:64px;left:50%;transform:translateX(-50%);width:200px;height:24px;background:#17306b;box-shadow:0 0 0 3px #17306b,0 0 0 6px #7fd0ff,0 4px 0 #0005;z-index:9;display:flex;align-items:center;padding:2px;gap:0}
  #hpbar.hide{display:none}
  #hpbar .fill{position:absolute;left:2px;top:2px;bottom:2px;width:calc(100% - 4px);background:linear-gradient(#ff5d5d,#b32b30);transition:width .2s}
  #hpbar .txt{position:relative;z-index:1;width:100%;text-align:center;font-size:10px;color:#fff;font-weight:bold;text-shadow:1px 1px 0 #000}
  #prompt{background:rgba(23,48,107,.95);color:#fff;padding:10px 18px;font-size:11px;box-shadow:0 0 0 3px #ffd23f,0 4px 0 #0005;animation:pulse 1.2s infinite}
  @keyframes pulse{50%{transform:translateX(-50%) scale(1.06)}}
  `;
  document.head.appendChild(st);
})();
(function(){const h=document.createElement('div');h.id='hpbar';h.className='hide';h.innerHTML='<div class="fill"></div><div class="txt">10/10</div>';document.body.appendChild(h)})();

const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'low-power'}),sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,1,.1,900);
R.shadowMap.enabled=false;
sc.add(new THREE.HemisphereLight(0xffffff,0x667788,.95));
const dl=new THREE.DirectionalLight(0xffffff,.55);dl.position.set(60,100,40);
sc.add(dl);
const dlTarget=new THREE.Object3D();sc.add(dlTarget);dl.target=dlTarget;

let AMB_MULT=1;
function applyGfx(){
  const g=cfg.gfx||'low';
  const pr=g==='lowest'?0.6:g==='low'?1:g==='high'?1:1.3;
  R.setPixelRatio(pr);
  R.shadowMap.enabled=(g==='high'||g==='highest');
  R.shadowMap.type=g==='highest'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
  dl.castShadow=R.shadowMap.enabled;
  if(R.shadowMap.enabled){dl.shadow.mapSize.set(g==='highest'?2048:1024,g==='highest'?2048:1024);dl.shadow.camera.left=-100;dl.shadow.camera.right=100;dl.shadow.camera.top=100;dl.shadow.camera.bottom=-100;dl.shadow.camera.far=250;dl.shadow.bias=-0.001}
  AMB_MULT=g==='lowest'?0.4:g==='low'?1:g==='high'?1.5:2;
}
function rs(){const h=240,w=Math.round(h*innerWidth/innerHeight);R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}addEventListener('resize',rs);
function setRD(){const r=cfg.rd;const rl=$('rl');if(rl)rl.textContent='Render: '+r+'J';if(sc.fog){sc.fog.near=r;sc.fog.far=r*1.6}cam.far=r*1.7+10;cam.updateProjectionMatrix()}
const MAPS={island:[0x87c8ff,0x5cb85c],desert:[0xf5d99a,0xe0c070],jungle:[0x3a6a4a,0x2f6b3a],snow:[0xdcecff,0xf4f8ff],parkour:[0x0e1a3a,0x1a1a3a],speedrace:[0x87ceeb,0x4a4a5a]};
let world=new THREE.Group(),cols=[],plats=[],jbs=[],boostBubbles=[],swings=[],rings=[],curMap='island',LIM=200;

let skyDome,sunMesh;
function makeSky(sc1,sc2){
  const geo=new THREE.SphereGeometry(450,32,16);
  const col1=new THREE.Color(sc1),col2=new THREE.Color(sc2);
  const p=geo.attributes.position,cl=[];
  for(let i=0;i<p.count;i++){
    const y=p.getY(i)/450;const t=Math.max(0,Math.min(1,(y+1)/2));
    const c=col2.clone().lerp(col1,t);cl.push(c.r,c.g,c.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));
  skyDome=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,depthWrite:false}));
  sc.add(skyDome);
  sunMesh=new THREE.Mesh(new THREE.CircleGeometry(28,32),new THREE.MeshBasicMaterial({color:0xfff4c2,transparent:true,opacity:.9}));
  sunMesh.position.set(-150,140,-200);sunMesh.lookAt(0,50,0);sc.add(sunMesh);
}
function removeSky(){if(skyDome){sc.remove(skyDome);skyDome=null}if(sunMesh){sc.remove(sunMesh);sunMesh=null}}

const LM=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,flatShading:true,shininess:5},o||{}));
const LS=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,flatShading:false,shininess:8},o||{}));
const Mt=(g,mat,x,y,z,par)=>{const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);(par||world).add(m);return m};
const BOX=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const ICO=(r,d)=>new THREE.IcosahedronGeometry(r,d||0);
const addCol=(x,y,z,w,h,d,opt)=>cols.push(Object.assign({x,y,z,w,h,d,enabled:true,slip:0},opt||{}));

function mergeParts(parts){
  const geos=[];let total=0;
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
  const pos=new THREE.Vector3(),scl=new THREE.Vector3();
  for(const p of parts){
    let g=p.geo.index?p.geo.toNonIndexed():p.geo.clone();
    e.set(p.rx||0,p.ry||0,p.rz||0);q.setFromEuler(e);
    pos.set(p.x||0,p.y||0,p.z||0);
    const s=p.s||1;scl.set(p.sx||s,p.sy||s,p.sz||s);
    m4.compose(pos,q,scl);g.applyMatrix4(m4);
    if(!g.attributes.normal)g.computeVertexNormals();
    const c=new THREE.Color(p.color);
    const n=g.attributes.position.count;
    const cols=new Float32Array(n*3);
    for(let i=0;i<n;i++){cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b}
    g.setAttribute('color',new THREE.BufferAttribute(cols,3));
    total+=n;geos.push(g);
  }
  const P=new Float32Array(total*3),N=new Float32Array(total*3),C=new Float32Array(total*3);
  let off=0;
  for(const g of geos){P.set(g.attributes.position.array,off*3);N.set(g.attributes.normal.array,off*3);C.set(g.attributes.color.array,off*3);off+=g.attributes.position.count}
  const m=new THREE.BufferGeometry();
  m.setAttribute('position',new THREE.BufferAttribute(P,3));
  m.setAttribute('normal',new THREE.BufferAttribute(N,3));
  m.setAttribute('color',new THREE.BufferAttribute(C,3));
  return m;
}
function addMerged(parts){
  if(!parts.length)return;
  const mesh=new THREE.Mesh(mergeParts(parts),new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:8}));
  if(R.shadowMap.enabled){mesh.castShadow=true;mesh.receiveShadow=true}
  world.add(mesh);
}
function instance(geo,list,parent){
  if(!list||!list.length)return null;
  const mat=new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:4});
  const im=new THREE.InstancedMesh(geo,mat,list.length);
  im.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
  const pos=new THREE.Vector3(),scl=new THREE.Vector3();
  for(let i=0;i<list.length;i++){
    const t=list[i];pos.set(t.x,t.y||0,t.z);
    e.set(0,t.r||0,0);q.setFromEuler(e);
    const s=t.s||1;scl.set(t.sx||s,t.sy||s,t.sz||s);
    m4.compose(pos,q,scl);im.setMatrixAt(i,m4);
  }
  im.instanceMatrix.needsUpdate=true;
  if(R.shadowMap.enabled){im.castShadow=true;im.receiveShadow=true}
  (parent||world).add(im);
  return im;
}

const AMB={butterflies:[],birds:[],clouds:[],snow:[],leaves:[],petals:[],smokes:[],stars:[],orbs:[],fireflies:[]};
function clearAmb(){for(const k in AMB){for(const m of AMB[k])sc.remove(m.m);AMB[k]=[]}}
function pool(kind,geo,mat,n){n=Math.max(1,Math.round(n*AMB_MULT));for(let i=0;i<n;i++){const m=new THREE.Mesh(geo,mat.clone());m.visible=false;sc.add(m);AMB[kind].push({m,act:false,t:0})}}
function get(kind){for(const q of AMB[kind])if(!q.act)return q;return null}
function spawnAmb(kind,data){const q=get(kind);if(!q)return;q.act=true;q.t=0;Object.assign(q,data);q.m.visible=true;q.m.position.set(q.x,q.y,q.z)}

function road(pts,width,fill,trim){
  const V=[],C=[],I=[];
  const p3=pts.map(p=>new THREE.Vector3(p[0],0,p[1]));
  const curve=new THREE.CatmullRomCurve3(p3,false,'centripetal',0.5);
  const steps=Math.max(24,Math.ceil(curve.getLength()/1.6));
  const points=curve.getSpacedPoints(steps);
  const cF=new THREE.Color(fill),cT=new THREE.Color(trim);
  const iw=width*0.5, ow=width*0.5+0.7, Y=0.14;
  for(let i=0;i<points.length;i++){
    const p=points[i];
    const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
    let dx=b.x-a.x,dz=b.z-a.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
    const nx=dz,nz=-dx;
    V.push(p.x-nx*ow,Y,p.z-nz*ow); C.push(cT.r,cT.g,cT.b);
    V.push(p.x-nx*iw,Y+.01,p.z-nz*iw); C.push(cF.r,cF.g,cF.b);
    V.push(p.x+nx*iw,Y+.01,p.z+nz*iw); C.push(cF.r,cF.g,cF.b);
    V.push(p.x+nx*ow,Y,p.z+nz*ow); C.push(cT.r,cT.g,cT.b);
    if(i>0){const p0=(i-1)*4,p1=i*4;
      I.push(p0,p1,p0+1, p1,p1+1,p0+1);
      I.push(p0+1,p1+1,p0+2, p1+1,p1+2,p0+2);
      I.push(p0+2,p1+2,p0+3, p1+2,p1+3,p0+3);
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(V,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
  geo.setIndex(I);
  const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));
  mesh.renderOrder=1;world.add(mesh);
  return{points,width};
}
function plaza(r,fill,trim){
  Mt(new THREE.CircleGeometry(r,36).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:trim}),0,.12,0).renderOrder=1;
  Mt(new THREE.CircleGeometry(r-1.2,36).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:fill}),0,.13,0).renderOrder=2;
}

const _treeGeos={};
function treeGeo(type){
  if(_treeGeos[type])return _treeGeos[type];
  const P=[];
  if(type=='oak'){
    P.push({geo:new THREE.CylinderGeometry(.9,1.4,4.5,7),y:2.25,color:0x5a3a1a});
    P.push({geo:new THREE.CylinderGeometry(.7,1,2,6),y:6,color:0x6b4a2b});
    P.push({geo:ICO(3,0),y:7,color:0x3aa84a});
    P.push({geo:ICO(2.4,0),x:1.8,y:8.3,z:.4,color:0x2f8a3a});
    P.push({geo:ICO(2.2,0),x:-1.7,y:8.5,z:-.3,color:0x3aa84a});
    P.push({geo:ICO(2,0),x:.3,y:9.6,z:.9,color:0x4ac05a});
  } else if(type=='birch'){
    P.push({geo:new THREE.CylinderGeometry(.6,.8,7,6),y:3.5,color:0xf0e6d0});
    P.push({geo:BOX(.5,.3,.15),x:.4,y:2,color:0x2a2a2a});
    P.push({geo:BOX(.5,.3,.15),x:.4,y:4,color:0x2a2a2a});
    P.push({geo:ICO(2.4,0),y:9,color:0xc8d878});
    P.push({geo:ICO(1.8,0),x:1.2,y:10,color:0xc8d878});
    P.push({geo:ICO(1.6,0),x:-1,y:10.2,color:0xc8d878});
  } else if(type=='cherry'){
    P.push({geo:new THREE.CylinderGeometry(.8,1.2,4,6),y:2,color:0x5a3a1a});
    P.push({geo:new THREE.CylinderGeometry(.6,.9,2.5,6),y:4.5,color:0x6b4a2b});
    P.push({geo:ICO(2.8,0),y:7,color:0xffb0d0});
    P.push({geo:ICO(2.2,0),x:1.6,y:8,z:.3,color:0xff90b8});
    P.push({geo:ICO(2,0),x:-1.5,y:8.2,z:-.3,color:0xffb0d0});
    P.push({geo:ICO(1.8,0),x:.2,y:9,z:.8,color:0xff90b8});
  } else if(type=='pine'||type=='snowpine'){
    const snowy=type=='snowpine';
    P.push({geo:new THREE.CylinderGeometry(.8,1.1,4,6),y:2,color:0x4a2a1a});
    P.push({geo:new THREE.ConeGeometry(3.8,6,7),y:7,color:0x1a5a2a});
    if(snowy)P.push({geo:new THREE.ConeGeometry(3.4,1.5,7),y:7.7,color:0xffffff});
    P.push({geo:new THREE.ConeGeometry(2.8,4.5,7),y:10.5,color:0x2a6a3a});
    if(snowy)P.push({geo:new THREE.ConeGeometry(2.6,1.3,7),y:11.2,color:0xffffff});
    P.push({geo:new THREE.ConeGeometry(2,3,7),y:13,color:0x1a5a2a});
    if(snowy)P.push({geo:new THREE.ConeGeometry(1.8,1,7),y:13.8,color:0xffffff});
  } else if(type=='palm'){
    P.push({geo:new THREE.CylinderGeometry(.45,.65,5,6),y:2.5,color:0x8b5a2b});
    P.push({geo:new THREE.CylinderGeometry(.4,.55,5,6),y:7,x:.3,color:0x7a4a1b});
    const tx=.6,ty=9.5;
    for(let i=0;i<7;i++){const a=i/7*6.2832;P.push({geo:new THREE.ConeGeometry(2.4,.6,4),x:tx+Math.cos(a)*1.7,y:ty+Math.sin(i)*.15,z:Math.sin(a)*1.7,ry:-a,rz:Math.PI/2.3,color:i%2?0x2e8b3a:0x3aa04a})}
    P.push({geo:ICO(.4,0),x:tx+.5,y:ty-.4,color:0x4a2a1a});
    P.push({geo:ICO(.4,0),x:tx-.5,y:ty-.5,z:.3,color:0x4a2a1a});
  } else if(type=='cactus'){
    P.push({geo:new THREE.CylinderGeometry(.8,.9,7,7),y:3.5,color:0x3c8f4a});
    P.push({geo:new THREE.CylinderGeometry(.6,.6,3.5,6),x:1.5,y:4.5,color:0x3c8f4a});
    P.push({geo:ICO(.7,0),x:1.5,y:6.3,color:0x2a7a3a});
    P.push({geo:new THREE.CylinderGeometry(.55,.55,3,6),x:-1.4,y:3.8,color:0x3c8f4a});
    P.push({geo:ICO(.65,0),x:-1.4,y:5.3,color:0x2a7a3a});
    P.push({geo:ICO(.35,0),y:7.2,color:0xff5d5d});
  } else if(type=='dead'){
    P.push({geo:new THREE.CylinderGeometry(.5,.7,3,6),y:1.5,rz:.15,color:0x5a4a3a});
    P.push({geo:new THREE.CylinderGeometry(.35,.5,2.5,6),x:.3,y:4,rz:.4,color:0x5a4a3a});
    P.push({geo:new THREE.CylinderGeometry(.2,.3,1.8,5),x:.9,y:5.5,rz:1.2,color:0x5a4a3a});
    P.push({geo:new THREE.CylinderGeometry(.2,.3,1.6,5),x:-.4,y:5.2,rz:-1.1,color:0x5a4a3a});
  } else if(type=='bush'){
    P.push({geo:ICO(1.2,0),y:.9,color:0x4f8f3f});
    P.push({geo:ICO(.9,0),x:.8,y:.8,z:-.3,color:0x3a7a2f});
    P.push({geo:ICO(.85,0),x:-.7,y:.85,z:.4,color:0x4f8f3f});
    P.push({geo:ICO(.7,0),x:.2,y:1.5,z:.5,color:0x3a7a2f});
  } else if(type=='rock'){
    P.push({geo:new THREE.DodecahedronGeometry(.7,0),y:.4,color:0x7a7a72});
    P.push({geo:new THREE.DodecahedronGeometry(.45,0),x:.55,y:.28,z:.25,color:0x8a8a82});
    P.push({geo:new THREE.DodecahedronGeometry(.35,0),x:-.45,y:.22,z:-.25,color:0x6a6a62});
  } else if(type=='grassTuft'){
    P.push({geo:new THREE.ConeGeometry(.15,.7,3),y:.35,color:0x4fa040});
    P.push({geo:new THREE.ConeGeometry(.13,.6,3),x:.2,y:.3,z:.15,color:0x5fb050});
    P.push({geo:new THREE.ConeGeometry(.12,.55,3),x:-.15,y:.28,z:-.2,color:0x4fa040});
  } else if(type=='grassDry'){
    P.push({geo:new THREE.ConeGeometry(.15,.7,3),y:.35,color:0xa89868});
    P.push({geo:new THREE.ConeGeometry(.13,.6,3),x:.2,y:.3,z:.15,color:0xbfae78});
    P.push({geo:new THREE.ConeGeometry(.12,.55,3),x:-.15,y:.28,z:-.2,color:0xa89868});
  } else if(type=='flower'){
    P.push({geo:new THREE.CylinderGeometry(.05,.05,.4,4),y:.2,color:0x3a7a2f});
    P.push({geo:ICO(.18,0),y:.45,color:0xff6688});
  } else if(type=='snowMound'){
    P.push({geo:new THREE.SphereGeometry(1,10,6,0,6.2832,0,1.5708),y:0,sx:1,sy:1.2,sz:1,color:0xffffff});
    P.push({geo:new THREE.SphereGeometry(.6,8,5,0,6.2832,0,1.5708),x:.7,y:0,z:.4,sx:1,sy:1,sz:1,color:0xf0f6ff});
  }
  const g=mergeParts(P);_treeGeos[type]=g;return g;
}

const BEACONS=[];
function hut(x,z,rot,woodCol,roofCol){
  const P=[];const w=6,h=5,d=6,t=.4,doorW=1.8;
  const c=Math.cos(rot),s=Math.sin(rot);
  const add=(geo,lx,ly,lz,color,extra)=>{const wx=x+c*lx-s*lz,wz=z+s*lx+c*lz;P.push(Object.assign({geo,x:wx,y:ly,z:wz,color,ry:rot},extra||{}))};
  add(BOX(w+.4,.4,d+.4),0,-.2,0,0x5a3a1a);
  add(BOX(w,h,t),0,h/2,-d/2,woodCol);add(BOX(t,h,d),-w/2,h/2,0,woodCol);add(BOX(t,h,d),w/2,h/2,0,woodCol);
  const segW=(w-doorW)/2,segOff=doorW/2+segW/2;
  add(BOX(segW,h,t),-segOff,h/2,d/2,woodCol);add(BOX(segW,h,t),segOff,h/2,d/2,woodCol);
  add(BOX(doorW,h-4,t),0,4+(h-4)/2,d/2,woodCol);
  add(new THREE.ConeGeometry(w*.85,3.5,4),0,h+1.5,0,roofCol,{ry:rot+Math.PI/4});
  addMerged(P);
  addCol(x,0,z,w,h,d,{});addCol(x-w/2,0,z,t,h,d);addCol(x+w/2,0,z,t,h,d);
}
function lighthouse(x,z){
  addMerged([
    {geo:new THREE.CylinderGeometry(3.5,4.5,20,12),x,y:10,z,color:0xf4f4f4},
    {geo:new THREE.CylinderGeometry(4,4,1,12),x,y:4,z,color:0xff5d5d},
    {geo:new THREE.CylinderGeometry(4,4,1,12),x,y:8,z,color:0xff5d5d},
    {geo:new THREE.CylinderGeometry(4,4,1,12),x,y:12,z,color:0xff5d5d},
    {geo:new THREE.CylinderGeometry(4,4,1,12),x,y:16,z,color:0xff5d5d},
    {geo:new THREE.CylinderGeometry(4.5,4.5,1,12),x,y:20.5,z,color:0x2a2a2a},
    {geo:new THREE.CylinderGeometry(3,3,4,8),x,y:23,z,color:0x2a2a2a}
  ]);
  Mt(ICO(1.8,1),new THREE.MeshBasicMaterial({color:0xffe27a}),x,23,z);
  const beam=Mt(new THREE.ConeGeometry(15,30,4).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.15,side:THREE.DoubleSide}),x,23,z);
  BEACONS.push({beam,t:Math.random()*6.28});addCol(x,0,z,8,20,8);
}
function obelisk(x,z,col){
  addMerged([
    {geo:BOX(6,.8,6),x,y:.4,z,color:0x6a5a4a},{geo:BOX(3.5,.8,3.5),x,y:1.2,z,color:0x6a5a4a},
    {geo:new THREE.CylinderGeometry(1.5,2.5,16,4),x,y:9,z,color:col,ry:Math.PI/4},
    {geo:new THREE.ConeGeometry(2.5,3,4),x,y:18.5,z,color:0xffd23f,ry:Math.PI/4}
  ]);
  Mt(ICO(1,1),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.6}),x,18.5,z);
  addCol(x,0,z,5,18,5);
}
function shrine(x,z,col){
  const cc=col||0x8a8a7a;
  addMerged([
    {geo:BOX(12,1,12),x,y:.5,z,color:cc},{geo:BOX(9,1,9),x,y:1.5,z,color:cc},
    {geo:new THREE.CylinderGeometry(1,1.2,7,8),x:x-3,y:5.5,z:z-3,color:cc},
    {geo:new THREE.CylinderGeometry(1,1.2,7,8),x:x+3,y:5.5,z:z-3,color:cc},
    {geo:new THREE.CylinderGeometry(1,1.2,7,8),x,y:5.5,z:z+3,color:cc},
    {geo:BOX(10,1,8),x,y:9.5,z,color:cc},{geo:BOX(2.5,1.5,2.5),x,y:2.75,z,color:0x6a5a4a}
  ]);
  Mt(ICO(.6,1),new THREE.MeshBasicMaterial({color:0x7fd0ff}),x,3.7,z);
  addCol(x,0,z,12,2,12);addCol(x-3,2,z-3,2,7,2);addCol(x+3,2,z-3,2,7,2);addCol(x,2,z+3,2,7,2);
}
function watchtower(x,z){
  addMerged([
    {geo:new THREE.CylinderGeometry(.6,.8,16,6),x:x-3,y:8,z:z-3,color:0x8b5a2b},
    {geo:new THREE.CylinderGeometry(.6,.8,16,6),x:x+3,y:8,z:z-3,color:0x8b5a2b},
    {geo:new THREE.CylinderGeometry(.6,.8,16,6),x:x-3,y:8,z:z+3,color:0x8b5a2b},
    {geo:new THREE.CylinderGeometry(.6,.8,16,6),x:x+3,y:8,z:z+3,color:0x8b5a2b},
    {geo:BOX(7.5,.4,7.5),x,y:4,z,color:0x5a3a1a},{geo:BOX(7.5,.4,7.5),x,y:8,z,color:0x5a3a1a},{geo:BOX(7.5,.4,7.5),x,y:12,z,color:0x5a3a1a},
    {geo:BOX(8.5,.5,8.5),x,y:16,z,color:0x8b5a2b},
    {geo:BOX(9,.3,.4),x,y:17,z:z-4,color:0x8b5a2b},{geo:BOX(9,.3,.4),x,y:17,z:z+4,color:0x8b5a2b},
    {geo:BOX(.4,.3,9),x:x-4,y:17,z,color:0x8b5a2b},{geo:BOX(.4,.3,9),x:x+4,y:17,z,color:0x8b5a2b},
    {geo:new THREE.ConeGeometry(7,4,4),x,y:19,z,color:0xa04030,ry:Math.PI/4}
  ]);
  addCol(x-3,0,z-3,1.5,16,1.5);addCol(x+3,0,z-3,1.5,16,1.5);addCol(x-3,0,z+3,1.5,16,1.5);addCol(x+3,0,z+3,1.5,16,1.5);
}
function oasis(x,z,r){
  Mt(new THREE.CircleGeometry(r,24).rotateX(-1.5708),new THREE.MeshPhongMaterial({color:0x3aa0d0,shininess:90,transparent:true,opacity:.9}),x,.06,z);
  Mt(new THREE.TorusGeometry(r,.6,4,24).rotateX(1.5708),LM(0xb8a878),x,.3,z);
}
function well(x,z){
  addMerged([
    {geo:new THREE.CylinderGeometry(2.2,2.4,2,8),x,y:1,z,color:0x8a8a8a},
    {geo:BOX(.35,4.5,.35),x:x-1.6,y:2.5,z:z-1.6,color:0x8b5a2b},
    {geo:BOX(.35,4.5,.35),x:x+1.6,y:2.5,z:z-1.6,color:0x8b5a2b},
    {geo:BOX(.35,4.5,.35),x:x-1.6,y:2.5,z:z+1.6,color:0x8b5a2b},
    {geo:BOX(.35,4.5,.35),x:x+1.6,y:2.5,z:z+1.6,color:0x8b5a2b},
    {geo:new THREE.ConeGeometry(3.5,2,4),x,y:5.8,z,color:0xa04030,ry:Math.PI/4}
  ]);
  Mt(new THREE.CircleGeometry(1.7,20).rotateX(-1.5708),new THREE.MeshPhongMaterial({color:0x2a6a9a,shininess:90,transparent:true,opacity:.9}),x,1.9,z);
  addCol(x,0,z,4.8,3,4.8);
}
function bench(x,z,rot){
  rot=rot||0;
  const c=Math.cos(rot),s=Math.sin(rot);
  const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];
  const p1=T(0,0),p2=T(0,-.55),p3=T(-1.8,0),p4=T(1.8,0);
  addMerged([
    {geo:BOX(4.4,.35,1.4),x:p1[0],y:.9,z:p1[1],color:0x8b5a2b,ry:rot},
    {geo:BOX(4.4,1.1,.3),x:p2[0],y:1.6,z:p2[1],color:0x8b5a2b,ry:rot},
    {geo:BOX(.3,.9,.3),x:p3[0],y:.4,z:p3[1],color:0x5a3a1a,ry:rot},
    {geo:BOX(.3,.9,.3),x:p4[0],y:.4,z:p4[1],color:0x5a3a1a,ry:rot}
  ]);
  addCol(x,.5,z,4.4,.4,1.4,{ry:rot});
}
function camp(x,z){
  const P=[];
  for(let i=0;i<8;i++){const a=i/8*6.28;P.push({geo:new THREE.DodecahedronGeometry(.8),x:x+Math.cos(a)*3.2,y:.4,z:z+Math.sin(a)*3.2,color:0x8a8a8a})}
  for(let i=0;i<3;i++)P.push({geo:new THREE.CylinderGeometry(.5,.5,4,5),x,y:.5,z,color:0x6b4a2b,rx:Math.PI/2,rz:i*2.09});
  P.push({geo:new THREE.ConeGeometry(3.5,4,4),x:x+7,y:2,z,color:0xd05040,ry:Math.PI/4});
  P.push({geo:new THREE.ConeGeometry(3,3.5,4),x:x-7,y:1.75,z:z+2,color:0x4a7bd0,ry:Math.PI/4});
  addMerged(P);
  Mt(ICO(.6,0),new THREE.MeshBasicMaterial({color:0xff8c1a}),x,.5,z);
  Mt(ICO(.35,0),new THREE.MeshBasicMaterial({color:0xffd23f}),x,.8,z);
  addCol(x,0,z,2,1.2,2);addCol(x+7,0,z,6,4,6);addCol(x-7,0,z+2,5,3.5,5);
}
function igloo(x,z){
  addMerged([
    {geo:new THREE.SphereGeometry(5.5,12,8,0,6.28,0,1.57),x,y:0,z,color:0xf0f8ff},
    {geo:BOX(1.8,2.6,.7),x,y:1.3,z:z+5.4,color:0x5a7a9a}
  ]);
  addCol(x,0,z,10,5,10);
}
function frozenLake(x,z,r){
  Mt(new THREE.CircleGeometry(r,32).rotateX(-1.5708),new THREE.MeshPhongMaterial({color:0xaee0ff,transparent:true,opacity:.85,shininess:90}),x,.08,z);
  const P=[];
  for(let i=0;i<10;i++){const a=Math.random()*6.28,rr=Math.random()*r*.85;P.push({geo:BOX(.3,.03,3+Math.random()*4),x:x+Math.cos(a)*rr,y:.1,z:z+Math.sin(a)*rr,color:0xffffff,ry:Math.random()*6.28})}
  addMerged(P);
}
function dock(x,z,len,wid){
  const P=[];
  P.push({geo:BOX(wid,.4,len),x,y:.5,z:z+len/2,color:0x8b5a2b});
  for(let i=0;i<len;i+=3){P.push({geo:BOX(.4,3,.4),x:x+wid/2-.4,y:.5,z:z+i,color:0x8b5a2b});P.push({geo:BOX(.4,3,.4),x:x-wid/2+.4,y:.5,z:z+i,color:0x8b5a2b})}
  P.push({geo:BOX(.3,1.8,.3),x:x-wid/2+.4,y:1.6,z:z+len,color:0x8b5a2b});
  P.push({geo:BOX(.3,1.8,.3),x:x+wid/2-.4,y:1.6,z:z+len,color:0x8b5a2b});
  addMerged(P);addCol(x,.3,z+len/2,wid,.5,len);
}
function lamp(x,z){
  addMerged([
    {geo:new THREE.CylinderGeometry(.25,.35,10,6),x,y:5,z,color:0x2a2a2a},
    {geo:BOX(1.8,.4,1.8),x,y:10.2,z,color:0x2a2a2a}
  ]);
  Mt(ICO(.7,1),new THREE.MeshBasicMaterial({color:0xffe27a}),x,10,z);
  addCol(x,0,z,.8,10,.8);
}
function fountain(x,z,r){
  r=r||3;
  addMerged([
    {geo:new THREE.CylinderGeometry(r,r+.3,.8,16),x,y:.4,z,color:0xa8a8a0},
    {geo:new THREE.CylinderGeometry(r-.5,r-.5,.4,16),x,y:.8,z,color:0x5a7a9a},
    {geo:new THREE.CylinderGeometry(.6,.9,2,8),x,y:2,z,color:0xa8a8a0},
    {geo:new THREE.CylinderGeometry(1.3,1.3,.3,12),x,y:3,z,color:0xa8a8a0},
    {geo:ICO(.7,1),x,y:3.6,z,color:0x7fd0ff}
  ]);
  addCol(x,0,z,r*2,.9,r*2);
}
function gazebo(x,z){
  const P=[];
  for(let i=0;i<6;i++){const a=i/6*6.28;P.push({geo:new THREE.CylinderGeometry(.25,.3,4,6),x:x+Math.cos(a)*3,y:2,z:z+Math.sin(a)*3,color:0xf0e6d0})}
  P.push({geo:new THREE.ConeGeometry(4.5,2,6),x,y:5,z,color:0xa04030});
  P.push({geo:new THREE.CylinderGeometry(3.5,3.5,.3,6),x,y:.15,z,color:0xc8b088});
  addMerged(P);
  addCol(x,0,z,6.5,4,6.5);
}
function statue(x,z){
  addMerged([
    {geo:BOX(3,.6,3),x,y:.3,z,color:0x8a8a8a},
    {geo:BOX(2.4,1,2.4),x,y:1.1,z,color:0x9a9a9a},
    {geo:new THREE.SphereGeometry(.9,10,8),x,y:2.4,z,color:0xffd23f},
    {geo:new THREE.SphereGeometry(.7,8,6),x,y:3.3,z,color:0xffd23f}
  ]);
  addCol(x,0,z,3,3,3);
}
function addSwing(x,z,rot){
  rot=rot||0;
  const c=Math.cos(rot),s=Math.sin(rot);
  const T=(lx,lz)=>[x+c*lx-s*lz,z+s*lx+c*lz];
  const p1=T(-2.5,0),p2=T(2.5,0);
  addMerged([
    {geo:BOX(.4,8,.4),x:p1[0],y:4,z:p1[1],color:0x8b5a2b},
    {geo:BOX(.4,8,.4),x:p2[0],y:4,z:p2[1],color:0x8b5a2b},
    {geo:BOX(5.4,.4,.4),x,y:8,z,color:0x5a3a1a,ry:rot}
  ]);
  const pivot=new THREE.Group();
  pivot.position.set(x,7.8,z);
  pivot.rotation.y=rot;
  const c1=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,6,5),LM(0x2a2a2a));
  c1.position.set(-1.1,-3,0);
  const c2=c1.clone();c2.position.x=1.1;
  const seat=new THREE.Mesh(BOX(2.4,.2,1),LM(0x8b5a2b));
  seat.position.y=-6.1;
  const back=new THREE.Mesh(BOX(2.4,1.2,.15),LM(0x8b5a2b));
  back.position.set(0,-5.4,-.4);
  pivot.add(c1,c2,seat,back);
  world.add(pivot);
  swings.push({pivot,x,z,rot,angle:0,vel:0});
  addCol(x-2.5,0,z,.6,8,.6);addCol(x+2.5,0,z,.6,8,.6);
}
function addRing(x,z,r){
  r=r||10;
  const P=[];
  for(let i=0;i<12;i++){const a=i/12*6.28;P.push({geo:new THREE.CylinderGeometry(.3,.4,3,6),x:x+Math.cos(a)*r,y:1.5,z:z+Math.sin(a)*r,color:0x8a8a8a})}
  for(let i=0;i<4;i++){const a=i/4*6.28+0.39;P.push({geo:BOX(.6,5,.6),x:x+Math.cos(a)*r,y:2.5,z:z+Math.sin(a)*r,color:0xa04030})}
  addMerged(P);
  Mt(new THREE.CircleGeometry(r,32).rotateX(-1.5708),LM(0xc8b088),x,.08,z);
  Mt(new THREE.TorusGeometry(r,.3,4,40).rotateX(1.5708),LM(0xd05040),x,.15,z);
  Mt(new THREE.TorusGeometry(r,.15,4,40).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xd05040}),x,1.8,z);
  Mt(new THREE.TorusGeometry(r,.12,4,40).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xffffff}),x,3,z);
  rings.push({x,z,r});
}

const PARKOUR=[
  [0,0,0,14,14,3],[0,1,14,5,5,0],[4,2,24,5,5,0],[-2,3,34,5,5,0],[0,4,44,5,5,0],[0,4,54,9,9,0],
  [7,5,63,3,3,5],[12,7,72,3,3,5],[10,9,82,3,3,5],[4,11,90,3,3,5],[-2,13,94,4,4,5],[-2,13,104,8,8,0],
  [-10,13,110,4,4,1],[-16,14,118,4,4,1],[-12,15,126,4,4,1],[-4,16,130,5,5,1],[4,16,132,7,7,0],
  [12,16,136,4,4,2],[18,16,142,4,4,2],[22,16,150,4,4,2],[22,16,158,8,8,0],
  [24,17,168,4,4,4],[20,21,176,4,4,4],[14,25,182,4,4,4],
  [6,27,186,6,6,0],[0,27,192,4,4,3],[0,27,200,12,12,0]
];

const LAYOUTS={
  island:{
    sky:[0x5ba8ff,0xfff4c2],edge:0x2d7a3a,
    roadFill:0xe8d8b8,roadTrim:0x8b6a4b,plaza:20,
    hills:[{x:0,z:210,r:80,h:28},{x:160,z:150,r:65,h:22},{x:-160,z:150,r:65,h:22},{x:200,z:20,r:55,h:18},{x:-200,z:20,r:55,h:18},{x:160,z:-150,r:60,h:18},{x:-160,z:-150,r:60,h:18},{x:0,z:-210,r:70,h:20}],
    roads:[{w:7,pts:[[0,20],[6,60],[0,110],[0,160]]},{w:6,pts:[[20,0],[60,-8],[100,-5]]},{w:6,pts:[[-20,0],[-60,-8],[-100,-5]]},{w:6,pts:[[14,14],[45,50],[70,75]]},{w:5,pts:[[-14,14],[-45,50],[-70,75]]},{w:5,pts:[[0,-20],[-8,-55],[-15,-95]]},{w:5,pts:[[14,-14],[45,-45],[70,-75]]},{w:5,pts:[[-14,-14],[-45,-45],[-70,-75]]}],
    treeZones:[{type:'oak',cx:85,cz:-35,r:45,count:22},{type:'cherry',cx:-85,cz:-35,r:45,count:20},{type:'pine',cx:0,cz:135,r:60,count:34},{type:'birch',cx:120,cz:80,r:40,count:18},{type:'palm',cx:-50,cz:150,r:22,count:10},{type:'palm',cx:50,cz:150,r:22,count:10},{type:'palm',cx:0,cz:-165,r:28,count:12},{type:'pine',cx:135,cz:-110,r:42,count:20},{type:'oak',cx:100,cz:-140,r:38,count:16},{type:'pine',cx:-135,cz:-110,r:42,count:20},{type:'oak',cx:-100,cz:-140,r:38,count:16},{type:'oak',cx:-135,cz:80,r:38,count:16},{type:'birch',cx:-155,cz:40,r:30,count:12},{type:'oak',cx:150,cz:25,r:30,count:12},{type:'cherry',cx:0,cz:65,r:28,count:12},{type:'oak',cx:0,cz:-65,r:28,count:12},{type:'pine',cx:60,cz:170,r:28,count:12},{type:'pine',cx:-60,cz:170,r:28,count:12}],
    grassCount:110,flowerCount:80,rockCount:14,
    landmarks:[
      ['lighthouse',0,165],['hut',105,-5,-Math.PI/2,0x8b5a2b,0xa04030],['hut',-105,-5,Math.PI/2,0xa07850,0x8b3030],
      ['watchtower',75,80],['shrine',-75,80,0x8a8a7a],
      ['well',41,17],['well',-41,17],['well',-41,-17],['well',41,-17],
      ['fountain',0,0,3],['gazebo',60,35],['gazebo',-60,35],['statue',20,40],
      ['camp',75,-80],['camp',-75,-80],['camp',0,-105],
      ['bench',26,10,0],['bench',-26,10,0],['bench',10,26,Math.PI/2],['bench',-10,26,Math.PI/2],['bench',10,-26,-Math.PI/2],['bench',-10,-26,-Math.PI/2]
    ],
    swings:[[15,25,0],[-15,25,0]],
    battleRing:[-55,-55,12],
    lamps:[[0,55],[0,105],[-60,-8],[60,-8],[-40,48],[40,48],[0,-115],[42,-42],[-42,-42]],
    ambient:['butterflies','birds','clouds','petals']
  },
  desert:{
    sky:[0xf5d99a,0xfff4c2],edge:0xc99a5b,
    roadFill:0xe6d6b0,roadTrim:0xa88850,plaza:18,
    hills:[{x:0,z:200,r:70,h:14},{x:170,z:130,r:58,h:12},{x:-170,z:130,r:58,h:12},{x:200,z:-20,r:55,h:10},{x:-200,z:-20,r:55,h:10},{x:170,z:-150,r:55,h:11},{x:-170,z:-150,r:55,h:11},{x:0,z:-200,r:65,h:12}],
    roads:[{w:7,pts:[[0,18],[10,55],[20,90]]},{w:6,pts:[[18,0],[55,-5],[100,0]]},{w:6,pts:[[-18,0],[-55,-8],[-95,-5]]},{w:6,pts:[[12,12],[45,50],[75,80]]},{w:5,pts:[[-12,12],[-45,50],[-75,80]]},{w:5,pts:[[0,-18],[-5,-60],[-10,-100]]},{w:5,pts:[[12,-12],[45,-45],[75,-75]]},{w:5,pts:[[-12,-12],[-45,-45],[-75,-75]]}],
    oasis:{x:105,z:0,r:28},
    treeZones:[{type:'palm',cx:105,cz:0,r:22,count:10},{type:'cactus',cx:55,cz:55,r:40,count:16},{type:'cactus',cx:-55,cz:-55,r:40,count:16},{type:'dead',cx:110,cz:90,r:35,count:10},{type:'dead',cx:-110,cz:90,r:35,count:10},{type:'cactus',cx:145,cz:-40,r:32,count:11},{type:'dead',cx:-145,cz:-40,r:32,count:11},{type:'cactus',cx:0,cz:125,r:40,count:14},{type:'dead',cx:0,cz:-140,r:38,count:11},{type:'cactus',cx:75,cz:-100,r:35,count:12},{type:'cactus',cx:-75,cz:-100,r:35,count:12},{type:'dead',cx:80,cz:80,r:32,count:10},{type:'dead',cx:-80,cz:80,r:32,count:10}],
    grassCount:65,flowerCount:0,rockCount:16,
    landmarks:[
      ['obelisk',0,105,0xb8a878],['obelisk',-105,-5,0xa89868],['watchtower',-75,80],['shrine',-5,-105,0x8a8a7a],['obelisk',80,-80,0xa89868],
      ['fountain',0,0,3],['gazebo',60,35],['gazebo',-60,35],['statue',20,40],
      ['camp',80,80],['camp',-80,-80],
      ['well',37,15],['well',-37,15],['well',-37,-15],['well',37,-15],
      ['bench',20,8,0],['bench',-20,8,0],['bench',8,-20,Math.PI/2],['bench',-8,-20,Math.PI/2]
    ],
    swings:[[14,22,0],[-14,22,0]],
    battleRing:[-55,-55,12],
    lamps:[[0,55],[-60,-8],[60,-8],[40,45],[-40,45],[0,-115],[40,-40],[-40,-40]],
    ambient:['birds','clouds']
  },
  jungle:{
    sky:[0x3a6a4a,0x8fd0a0],edge:0x1f5a2a,
    roadFill:0xb09068,roadTrim:0x6a5040,plaza:16,
    hills:[{x:0,z:200,r:80,h:32},{x:170,z:130,r:70,h:28},{x:-170,z:130,r:70,h:28},{x:200,z:-20,r:65,h:24},{x:-200,z:-20,r:65,h:24},{x:170,z:-150,r:65,h:24},{x:-170,z:-150,r:65,h:24},{x:0,z:-210,r:75,h:26}],
    roads:[{w:6,pts:[[0,16],[8,55],[0,100]]},{w:6,pts:[[16,0],[55,10],[95,45]]},{w:6,pts:[[-16,0],[-55,15],[-90,60]]},{w:5,pts:[[10,10],[45,55],[60,80]]},{w:5,pts:[[-10,10],[-45,55],[-70,75]]},{w:5,pts:[[0,-16],[-15,-55],[-30,-95]]},{w:5,pts:[[10,-10],[45,-45],[70,-70]]},{w:5,pts:[[-10,-10],[-45,-45],[-70,-70]]}],
    treeZones:[{type:'pine',cx:55,cz:-55,r:38,count:18},{type:'pine',cx:-55,cz:-55,r:38,count:18},{type:'pine',cx:55,cz:55,r:38,count:16},{type:'pine',cx:-55,cz:55,r:38,count:16},{type:'birch',cx:100,cz:80,r:35,count:13},{type:'birch',cx:-100,cz:80,r:35,count:13},{type:'pine',cx:100,cz:-80,r:35,count:14},{type:'pine',cx:-100,cz:-80,r:35,count:14},{type:'pine',cx:0,cz:135,r:50,count:22},{type:'birch',cx:0,cz:-160,r:45,count:18},{type:'pine',cx:150,cz:0,r:35,count:12},{type:'pine',cx:-150,cz:0,r:35,count:12},{type:'pine',cx:0,cz:-55,r:26,count:10},{type:'birch',cx:60,cz:35,r:28,count:10},{type:'pine',cx:-60,cz:35,r:28,count:10}],
    grassCount:130,flowerCount:40,rockCount:16,
    landmarks:[
      ['shrine',0,105,0x8a8a7a],['shrine',-90,60,0x7a7a6a],['watchtower',60,80],['hut',-70,75,1.5,0x6b4a2b,0x2f5a2a],['hut',70,-70,2.2,0x8b5a2b,0x8b3030],
      ['fountain',0,0,3],['gazebo',55,32],['gazebo',-55,32],['statue',18,38],
      ['camp',-30,-100],['camp',95,45],['camp',-95,-45],
      ['well',35,15],['well',-35,15],['well',-35,-15],['well',35,-15],
      ['bench',18,8,0],['bench',-18,8,0],['bench',8,-18,Math.PI/2],['bench',-8,-18,Math.PI/2]
    ],
    swings:[[13,22,0],[-13,22,0]],
    battleRing:[-52,-52,11],
    lamps:[[0,45],[0,-105],[45,5],[-45,5],[40,40],[-40,40]],
    ambient:['butterflies','leaves','clouds','fireflies']
  },
  snow:{
    sky:[0xdcecff,0xf0f6ff],edge:0xcfe4ff,
    roadFill:0xdee6ee,roadTrim:0xa8b8c8,plaza:18,
    hills:[{x:0,z:200,r:75,h:30},{x:170,z:130,r:65,h:26},{x:-170,z:130,r:65,h:26},{x:200,z:-20,r:58,h:22},{x:-200,z:-20,r:58,h:22},{x:170,z:-150,r:62,h:24},{x:-170,z:-150,r:62,h:24}],
    roads:[{w:6,pts:[[0,18],[8,55],[0,95]]},{w:6,pts:[[18,0],[55,-5],[100,5]]},{w:6,pts:[[-18,0],[-55,-5],[-100,5]]},{w:6,pts:[[12,12],[45,50],[70,75]]},{w:5,pts:[[-12,12],[-45,50],[-70,75]]},{w:5,pts:[[0,-18],[-5,-55],[-10,-85]]},{w:5,pts:[[12,-12],[45,-45],[70,-75]]},{w:5,pts:[[-12,-12],[-45,-45],[-70,-75]]}],
    lake:{x:0,z:-115,r:38},
    treeZones:[{type:'snowpine',cx:60,cz:-60,r:38,count:18},{type:'snowpine',cx:-60,cz:-60,r:38,count:18},{type:'snowpine',cx:60,cz:60,r:38,count:18},{type:'snowpine',cx:-60,cz:60,r:38,count:18},{type:'snowpine',cx:0,cz:140,r:50,count:22},{type:'snowpine',cx:0,cz:-170,r:42,count:16},{type:'snowpine',cx:135,cz:-90,r:35,count:13},{type:'snowpine',cx:-135,cz:-90,r:35,count:13},{type:'snowpine',cx:135,cz:90,r:35,count:13},{type:'snowpine',cx:-135,cz:90,r:35,count:13},{type:'snowpine',cx:0,cz:60,r:28,count:10},{type:'snowpine',cx:60,cz:0,r:26,count:9},{type:'snowpine',cx:-60,cz:0,r:26,count:9}],
    grassCount:0,flowerCount:0,rockCount:16,
    landmarks:[
      ['igloo',50,55],['igloo',65,68],['igloo',80,50],['igloo',40,68],
      ['igloo',-50,55],['igloo',-65,68],['igloo',-80,50],
      ['hut',-100,0,1.2,0x6b4a2b,0x5a3050],['hut',100,0,-1.2,0x8b5a2b,0x503020],
      ['watchtower',75,80],['shrine',-75,80,0xc8d0dc],
      ['fountain',0,0,3],['gazebo',60,35],['gazebo',-60,35],['statue',20,40],
      ['camp',75,-80],['camp',-75,-80],
      ['well',37,15],['well',-37,15],['well',-37,-15],['well',37,-15],
      ['bench',18,8,0],['bench',-18,8,0],['bench',8,-18,Math.PI/2],['bench',-8,-18,Math.PI/2]
    ],
    swings:[[15,25,0],[-15,25,0]],
    battleRing:[-55,-55,12],
    lamps:[[0,55],[-55,-8],[55,-8],[40,48],[-40,48],[0,-115],[42,-42],[-42,-42]],
    ambient:['snow','clouds']
  }
};

function makeBoostBubble(x,y,z){
  const g=new THREE.Group();g.position.set(x,y,z);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.7,10,8),new THREE.MeshBasicMaterial({color:0xffb84a}));
  const outer=new THREE.Mesh(new THREE.SphereGeometry(1.1,10,8),new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.3,side:THREE.DoubleSide}));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.3,0.08,4,16),new THREE.MeshBasicMaterial({color:0xff5d5d}));
  ring.rotation.x=Math.PI/2;
  g.add(inner,outer,ring);world.add(g);
  return {m:g,inner,outer,ring,x,y,z,baseY:y,t:Math.random()*6.28,ph:Math.random()*6.28,act:true,respawn:0};
}

function build(n){
  sc.remove(world);world=new THREE.Group();sc.add(world);
  cols=[];plats=[];
  jbs.forEach(j=>sc.remove(j.m));jbs=[];
  boostBubbles.forEach(b=>sc.remove(b.m));boostBubbles=[];
  swings=[];rings=[];BEACONS.length=0;
  removeSky();clearAmb();
  curMap=n;
  LIM=(n=='parkour')?240:n=='speedrace'?160:200;
  const[sk,gr]=MAPS[n];
  const L=LAYOUTS[n];
  const skyCols=L?L.sky:[0x87c8ff,0xfff4c2];
  makeSky(skyCols[0],skyCols[1]);
  sc.background=new THREE.Color(sk);
  sc.fog=new THREE.Fog(sk,cfg.rd,cfg.rd*1.6);setRD();
  const disc=(r,c,y,x=0,z=0)=>Mt(new THREE.CircleGeometry(r,32).rotateX(-1.5708),LM(c),x||0,y,z||0);

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

  if(n=='parkour'){
    for(let i=0;i<PARKOUR.length;i++){
      const p=PARKOUR[i],type=p[5];
      const x=p[0],y=p[1],z=p[2],w=p[3],d=p[4];
      let col=0x5cb85c;
      if(type===1)col=0x8fdcff;else if(type===2)col=0xffd23f;else if(type===3)col=0x7fd0ff;else if(type===4)col=0xff5db1;else if(type===5)col=0xb8a878;
      else col=[0x5cb85c,0x3d8bff,0xff8c1a][i%3];
      let mesh,ch;
      if(type===5){
        Mt(new THREE.CylinderGeometry(w+0.6,w+0.6,1.4,14),LM(0x050510),x,y-0.35,z);
        mesh=Mt(new THREE.CylinderGeometry(w,w,1,14),LM(col,{shininess:type===1?80:5}),x,y+0.5,z);
        ch={x,y,z,w:w*1.7,h:1,d:w*1.7};
        Mt(new THREE.TorusGeometry(w*0.9,0.1,4,20).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xffffff}),x,y+1.06,z);
      } else if(type===1){
        Mt(new THREE.CylinderGeometry(w*0.75,w*0.75,1.4,8),LM(0x050510),x,y-0.35,z);
        mesh=Mt(new THREE.CylinderGeometry(w*0.7,w*0.7,1,8),LM(col,{shininess:80}),x,y+0.5,z);
        ch={x,y,z,w:w*1.5,h:1,d:w*1.5};
        Mt(new THREE.ConeGeometry(.3,1.2,4),new THREE.MeshBasicMaterial({color:0xcceaff,transparent:true,opacity:.85}),x+w*.4,y+1.2,z);
        Mt(new THREE.ConeGeometry(.25,1,4),new THREE.MeshBasicMaterial({color:0xcceaff,transparent:true,opacity:.85}),x-w*.3,y+1.1,z+w*.2);
      } else if(type===3){
        Mt(new THREE.CylinderGeometry(w*0.8,w*0.8,1.4,6),LM(0x050510),x,y-0.35,z);
        mesh=Mt(new THREE.CylinderGeometry(w*0.7,w*0.7,1,6),LM(col,{shininess:60}),x,y+0.5,z);
        ch={x,y,z,w:w*1.6,h:1,d:w*1.6};
        Mt(new THREE.TorusGeometry(w*.85,.15,4,24).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0x7fd0ff}),x,y+1.05,z);
        Mt(new THREE.TorusGeometry(w*.65,.1,4,24).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xffffff}),x,y+1.5,z);
      } else if(type===4){
        Mt(new THREE.CylinderGeometry(w*0.8,w*0.8,1.4,12),LM(0x050510),x,y-0.35,z);
        mesh=Mt(new THREE.CylinderGeometry(w*0.7,w*0.7,1,12),LM(col,{shininess:60}),x,y+0.5,z);
        ch={x,y,z,w:w*1.6,h:1,d:w*1.6};
        Mt(new THREE.TorusGeometry(w*.7,.2,4,20).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xff5db1}),x,y+1.05,z);
        Mt(new THREE.ConeGeometry(.5,1,4),new THREE.MeshBasicMaterial({color:0xffffff}),x,y+1.6,z);
      } else {
        Mt(BOX(w+.2,1.2,d+.2),LM(0x050510),x,y-0.25,z);
        mesh=Mt(BOX(w,1,d),LM(col,{shininess:5}),x,y+0.5,z);
        ch={x,y,z,w,h:1,d};
      }
      if(type===2)Mt(new THREE.TorusGeometry(w*.85,.1,4,12).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xff8c1a}),x,y+1.06,z);
      if(type===0||type===2){
        const cc=type===2?0xff8c1a:0xffffff;
        Mt(BOX(w+.05,.08,.08),new THREE.MeshBasicMaterial({color:cc}),x,y+1.02,z-d/2-0.1);
        Mt(BOX(w+.05,.08,.08),new THREE.MeshBasicMaterial({color:cc}),x,y+1.02,z+d/2+0.1);
        Mt(BOX(.08,.08,d+.05),new THREE.MeshBasicMaterial({color:cc}),x-w/2-0.1,y+1.02,z);
        Mt(BOX(.08,.08,d+.05),new THREE.MeshBasicMaterial({color:cc}),x+w/2+0.1,y+1.02,z);
      }
      const c=Object.assign(ch,{enabled:true,slip:type===1?1:0,mesh,vanish:type===2,bounce:type===4?1:0});
      if(type===2){c.phase=Math.random()*4;c.period=3.2}
      cols.push(c);plats.push(c);
    }
    for(let i=0;i<80;i++)spawnAmb('stars',{x:(Math.random()-.5)*400,y:20+Math.random()*40,z:(Math.random()-.5)*400});
    for(let i=0;i<15;i++)spawnAmb('orbs',{x:(Math.random()-.5)*200,y:3+Math.random()*25,z:(Math.random()-.5)*200,ph:Math.random()*6.28});
    spawnJBs();return;
  }

  if(n=='speedrace'){
    const trackLen=150,trackW=12;
    disc(400,0x8fd0ff,0);disc(350,0x4a7f5a,-.05);
    Mt(BOX(trackW,.2,trackLen),LM(0x8b6a4b),0,.05,trackLen/2);
    [-trackW/2-.1,trackW/2+.1].forEach(xx=>Mt(BOX(.3,.25,trackLen),LM(0xffffff),xx,.15,trackLen/2));
    for(let z=5;z<trackLen;z+=6)Mt(BOX(.4,.22,3),new THREE.MeshBasicMaterial({color:0xffffff}),0,.16,z);
    for(let i=-6;i<6;i++){const c=((i+6)%2)?0xffffff:0x000000;Mt(BOX(1,.25,2),new THREE.MeshBasicMaterial({color:c}),i+.5,.18,2)}
    for(let i=-6;i<6;i++){const c=((i+6)%2)?0xffffff:0x000000;Mt(BOX(1,.25,2),new THREE.MeshBasicMaterial({color:c}),i+.5,.18,trackLen-2)}
    Mt(BOX(trackW+2.4,1.2,1.2),LM(0xffd23f),0,6,1);
    Mt(BOX(1.2,6,1.2),LM(0xffd23f),-trackW/2-1,3,1);Mt(BOX(1.2,6,1.2),LM(0xffd23f),trackW/2+1,3,1);
    Mt(BOX(trackW+3,1.5,1.5),LM(0xffd23f),0,8,trackLen-2);
    Mt(BOX(1.5,8,1.5),LM(0xffd23f),-trackW/2-1.5,4,trackLen-2);Mt(BOX(1.5,8,1.5),LM(0xffd23f),trackW/2+1.5,4,trackLen-2);
    for(let z=8;z<trackLen-4;z+=8)addCol(0,.4,z,trackW,.7,.3);
    const ts={pine:[],oak:[]};
    for(let z=10;z<trackLen-10;z+=8){const s=22+Math.random()*10;ts[z%16?'pine':'oak'].push({x:-s,z,s:.8+Math.random()*.4,r:Math.random()*6.28});ts[z%16?'oak':'pine'].push({x:s,z,s:.8+Math.random()*.4,r:Math.random()*6.28})}
    for(const t in ts)if(ts[t].length)instance(treeGeo(t),ts[t]);
    for(let z=20;z<trackLen;z+=40)lamp(-trackW/2-4,z),lamp(trackW/2+4,z);
    const boostZ=[25,55,90,120];
    for(const bz of boostZ){const bx=(Math.random()-.5)*6;boostBubbles.push(makeBoostBubble(bx,2,bz))}
    spawnJBs();return;
  }

  if(n=='island'){disc(320,0x2a7fd0,0);disc(210,gr,.02)}else if(n=='desert'){disc(210,0xc99a5b,0);disc(185,gr,.05)}else disc(210,gr,0);
  const gg=new THREE.CylinderGeometry(215,225,12,48,1,true),pp=gg.attributes.position;
  for(let i=0;i<pp.count;i++){const x=pp.getX(i),z=pp.getZ(i),a=Math.atan2(z,x),k=1+Math.sin(a*9)*.03;pp.setX(i,x*k);pp.setZ(i,z*k);if(pp.getY(i)>0)pp.setY(i,6+Math.abs(Math.sin(a*6))*3)}
  gg.computeVertexNormals();
  Mt(gg,LM({desert:0xc99a5b,jungle:0x1f4d2a,snow:0xcfeaff,island:0x3a8d3a}[n]||0x3a8d3a,{side:THREE.DoubleSide}),0,5.8,0);

  const buildingZones=[];
  for(const lm of L.landmarks){
    const t=lm[0];
    if(t=='hut'||t=='shrine'||t=='watchtower'||t=='well'||t=='igloo'||t=='lighthouse'||t=='obelisk'||t=='gazebo'||t=='statue'||t=='fountain')buildingZones.push({x:lm[1],z:lm[2],r:14});
  }
  buildingZones.push({x:0,z:0,r:L.plaza});
  // Also protect ring/swing areas
  if(L.battleRing)buildingZones.push({x:L.battleRing[0],z:L.battleRing[1],r:L.battleRing[2]+2});

  const hillData=L.hills||[];
  const hitsHill=(x,z,margin=0)=>{for(const h of hillData){if(Math.hypot(x-h.x,z-h.z)<h.r+margin)return true}return false};

  if(L.hills&&L.hills.length){
    const hillParts=[];
    for(const h of L.hills){
      let conflict=false;
      for(const b of buildingZones){if(Math.hypot(h.x-b.x,h.z-b.z)<h.r+b.r-4){conflict=true;break}}
      if(conflict)continue;
      hillParts.push({geo:new THREE.SphereGeometry(1,20,12,0,6.2832,0,1.5708),x:h.x,y:0,z:h.z,sx:h.r,sy:h.h,sz:h.r,color:L.edge});
      for(let k=0;k<3;k++){const a=Math.random()*6.28,d=Math.random()*h.r*.4;const gx=h.x+Math.cos(a)*d,gz=h.z+Math.sin(a)*d;const gy=h.h*Math.sqrt(Math.max(0,1-(d/h.r)**2));hillParts.push({geo:ICO(1.4,0),x:gx,y:gy,z:gz,s:.9+Math.random()*.5,color:gr})}
    }
    if(hillParts.length)addMerged(hillParts);
  }

  const roadData=[];
  for(const r of L.roads){const safePts=r.pts.filter(([px,pz])=>!hitsHill(px,pz,-4));if(safePts.length<2)continue;roadData.push(road(safePts,r.w,L.roadFill,L.roadTrim))}
  plaza(L.plaza,L.roadFill,L.roadTrim);

  if(L.oasis)oasis(L.oasis.x,L.oasis.z,L.oasis.r);
  if(L.lake)frozenLake(L.lake.x,L.lake.z,L.lake.r);

  const distToRoad=(x,z)=>{
    let m=Infinity;
    for(const rd of roadData){const w2=rd.width*0.5+3.0;
      for(let i=0;i<rd.points.length-1;i++){const p1=rd.points[i],p2=rd.points[i+1];const dx=p2.x-p1.x,dz=p2.z-p1.z;const l2=dx*dx+dz*dz;if(l2<1e-6)continue;let t=((x-p1.x)*dx+(z-p1.z)*dz)/l2;t=Math.max(0,Math.min(1,t));const px=p1.x+dx*t,pz=p1.z+dz*t;const d=Math.hypot(x-px,z-pz)-w2;if(d<m)m=d}
    }
    const dP=Math.hypot(x,z)-L.plaza-3.0;if(dP<m)m=dP;
    return m;
  };
  const tooClose=(x,z,r)=>{for(const b of buildingZones){if(Math.hypot(x-b.x,z-b.z)<b.r+r)return true}return false};

  const trees={};
  const addTree=(type,x,z,s)=>{if(!trees[type])trees[type]=[];trees[type].push({x,y:0,z,s:s||1,r:Math.random()*6.28})};
  for(const tz of L.treeZones){
    for(let i=0;i<tz.count;i++){
      const sectorAngle=(i/tz.count)*6.28;let ok=false,tries=0;
      while(!ok&&tries<8){tries++;
        const a=sectorAngle+(Math.random()-.5)*(6.28/tz.count)*0.7;
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
      else if(mode<0.9&&roadData.length){
        const rd=roadData[(Math.random()*roadData.length)|0];const idx=Math.floor(Math.random()*(rd.points.length-1));
        const p1=rd.points[idx],p2=rd.points[idx+1];const t=Math.random();
        const px=p1.x+(p2.x-p1.x)*t,pz=p1.z+(p2.z-p1.z)*t;
        const dx=p2.x-p1.x,dz=p2.z-p1.z,l=Math.hypot(dx,dz)||1;const side=Math.random()<.5?-1:1;
        const off=rd.width*0.5+1+Math.random()*4;
        x=px+(dz/l)*off*side;z=pz-(dx/l)*off*side;
      } else {const a=Math.random()*6.28,d=40+Math.random()*(LIM-50);x=Math.cos(a)*d;z=Math.sin(a)*d}
      if(Math.hypot(x,z)<L.plaza+1)continue;if(tooClose(x,z,3))continue;if(distToRoad(x,z)<-1)continue;
      arr.push({x,y:0,z,s:.8+Math.random()*.5,r:Math.random()*6.28});
    }
  };
  spreadGrass(grasses,L.grassCount);spreadGrass(flowers,L.flowerCount);
  for(let i=0;i<L.rockCount;i++){
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

  for(const type in trees)instance(treeGeo(type),trees[type]);
  if(rocks.length)instance(treeGeo('rock'),rocks);
  if(grasses.length)instance(treeGeo(grassType),grasses);
  if(flowers.length)instance(treeGeo('flower'),flowers);

  for(const amb of L.ambient){
    if(amb==='butterflies')for(let i=0;i<18;i++){const a=Math.random()*6.28,d=30+Math.random()*180;spawnAmb('butterflies',{x:Math.cos(a)*d,y:1.5+Math.random()*2,z:Math.sin(a)*d,ph:Math.random()*6.28,cx:Math.cos(a)*d,cz:Math.sin(a)*d,r:2+Math.random()*4,spd:.6+Math.random()*.5})}
    if(amb==='birds')for(let i=0;i<8;i++)spawnAmb('birds',{x:(Math.random()-.5)*300,y:25+Math.random()*15,z:(Math.random()-.5)*300,a:Math.random()*6.28,r:60+Math.random()*60,spd:.3+Math.random()*.2,y0:25+Math.random()*15})
    if(amb==='clouds')for(let i=0;i<12;i++)spawnAmb('clouds',{x:(Math.random()-.5)*400,y:40+Math.random()*20,z:(Math.random()-.5)*400,spd:.5+Math.random()*1,sx:1+Math.random()*1.2,sy:1+Math.random()*.4,sz:.8+Math.random()*.8})
    if(amb==='leaves')for(let i=0;i<15;i++)spawnAmb('leaves',{x:(Math.random()-.5)*200,y:8+Math.random()*10,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*2,vz:(Math.random()-.5)*2,ph:Math.random()*6.28})
    if(amb==='petals')for(let i=0;i<18;i++)spawnAmb('petals',{x:(Math.random()-.5)*200,y:8+Math.random()*8,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*1.5,vz:(Math.random()-.5)*1.5,ph:Math.random()*6.28})
    if(amb==='snow')for(let i=0;i<70;i++)spawnAmb('snow',{x:(Math.random()-.5)*200,y:Math.random()*30+5,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*.8,vy:-1.5-Math.random()*2,vz:(Math.random()-.5)*.8})
    if(amb==='fireflies')for(let i=0;i<22;i++){const a=Math.random()*6.28,d=20+Math.random()*150;spawnAmb('fireflies',{x:Math.cos(a)*d,y:.5+Math.random()*3,z:Math.sin(a)*d,cx:Math.cos(a)*d,cz:Math.sin(a)*d,r:1+Math.random()*2,ph:Math.random()*6.28,spd:.3+Math.random()*.4})}
  }

  spawnJBs();
}

const jbGeo=new THREE.SphereGeometry(.45,8,6);
function spawnJBs(){
  jbs.forEach(j=>sc.remove(j.m));jbs=[];
  const N=curMap=='parkour'?60:curMap=='speedrace'?25:150,R=curMap=='parkour'?40:curMap=='speedrace'?6:190;
  for(let i=0;i<N;i++){
    let x,y=1.2+Math.random()*2,z;
    if(curMap=='parkour'&&plats.length){const p=plats[Math.floor(Math.random()*plats.length)];x=p.x+(Math.random()-.5)*Math.min(2.5,p.w*.7);z=p.z+(Math.random()-.5)*Math.min(2.5,p.d*.7);y=p.y+1.8+Math.random()}
    else if(curMap=='speedrace'){x=(Math.random()-.5)*9;z=10+Math.random()*130;y=1+Math.random()*1.5}
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
  const W=300,H=40,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const p=3,w=W-p*2,h=H-p*2;
  if(lvl<=0){x.fillStyle='#fff';x.fillRect(p,p,w,h);x.strokeStyle='#0e1a3a';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
  else if(lvl==1){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#e0f2ff');g.addColorStop(1,'#a8d5ff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#3d8bff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
  else if(lvl==2){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#4ea8ff');g.addColorStop(1,'#8f5dff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
  else if(lvl==3){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ff5db1');g.addColorStop(.5,'#8f5dff');g.addColorStop(1,'#4ea8ff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2);x.fillStyle='#fff';for(let i=0;i<11;i++){x.fillRect(12+i*28,7,3,3);x.fillRect(22+i*26,H-11,3,3)}}
  else{const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'#ff5d5d');g.addColorStop(.25,'#ffd23f');g.addColorStop(.5,'#3fbf5f');g.addColorStop(.75,'#3d8bff');g.addColorStop(1,'#b05dff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2);x.fillStyle='#fff';for(let i=0;i<13;i++){x.fillRect(8+i*23,5,3,3);x.fillRect(14+i*22,H-10,3,3)}}
  x.font='bold 19px monospace';x.textAlign='center';x.textBaseline='middle';
  x.fillStyle=lvl<=0?'#000':lvl==1?'#0e1a3a':'#fff';if(lvl>=2){x.shadowColor='#000';x.shadowBlur=5}
  x.fillText(t.slice(0,32),W/2,H/2+1);x.shadowBlur=0;
  const tex=new THREE.CanvasTexture(c);tex.magFilter=tex.minFilter=THREE.NearestFilter;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  s.scale.set(7.5,1,1);s.renderOrder=9;return s;
}
const IC=['..PPP... .PPYPP.. ..PPP... ...G.... .G.G.... .GGG.... ...G.... ...G....','..PPP... .PPPPP.. .WWWWW.. .WWWWW.. ..CCC... ..CCC... ...C.... ...C....','.RR..RR. RRRRRRRR RRRRRRRR RRRRRRRR .RRRRRR. ..RRRR.. ...RR... ........','...OO... ..OOOO.. .OOOOOO. .OOOOOO. ..OOOO.. ...OO... .SSSSSS. ........','R......R .R....R. ..R..R.. ...RR... ...RR... ..R..R.. .R....R. R......R','..YYYY.. .YYYYYY. YKYYYYKY YYYYYYYY YKKKKKKY .YKRRKY. ..YYYY.. ........','..YYYY.. .YYYYYY. YYKYYKYY YYSYYSYY YYSYYSYY YYYKKYYY .YKYYKY. ..YYYY..','..YYYY.. .YYYYYY. YRRYYRRY YRRYYRRY YYYYYYYY YKYYYYKY .YKKKKY. ..YYYY..'],
PAL={P:'#ff9ec4',Y:'#ffd23f',G:'#3fbf5f',W:'#ffffff',C:'#f6b26b',R:'#ff4d6d',O:'#ff8c1a',S:'#5db5ff',K:'#0e1a3a'};
const icoC=i=>{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');IC[i].split(' ').forEach((r,j)=>[...r].forEach((v,k)=>{if(v!='.'){x.fillStyle=PAL[v];x.fillRect(k,j,1,1)}}));return c};
const icoS=i=>{const t=new THREE.CanvasTexture(icoC(i));t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(1.3,1.3,1);s.renderOrder=9;return s};

function mkP(o){
  const sh=o.sh|0,root=new THREE.Group(),m=new THREE.Group();
  const geo=[new THREE.SphereGeometry(.9,8,5,0,6.2832,0,1.5708),new THREE.BoxGeometry(1.5,1,1.5).translate(0,.5,0),new THREE.ConeGeometry(1,1.3,3).translate(0,.65,0),new THREE.SphereGeometry(.85,8,6).translate(0,.85,0),new THREE.CylinderGeometry(.8,.9,1.1,8).translate(0,.55,0),new THREE.ConeGeometry(1,1.4,4).translate(0,.7,0),new THREE.OctahedronGeometry(.95).translate(0,.95,0)][sh];
  const a=new THREE.Color(o.c1),b=new THREE.Color(o.c2),p=geo.attributes.position,cl=[];
  for(let i=0;i<p.count;i++){const c=a.clone().lerp(b,Math.min(1,Math.max(0,p.getY(i)/1.1)));cl.push(c.r,c.g,c.b)}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));
  m.add(new THREE.Mesh(geo,new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:10})));
  const ez=[.78,.7,.5,.8,.84,.45,.45][sh],eyes=new THREE.Group(),hearts=new THREE.Group(),tears=new THREE.Group();
  [-.3,.3].forEach(x=>{
    const e=new THREE.Mesh(new THREE.BoxGeometry(.16,.24,.1),new THREE.MeshBasicMaterial({color:0x111111}));e.position.set(x,.5,ez);e.userData.baseX=x;eyes.add(e);
    const h=icoS(2);h.scale.set(.4,.4,1);h.position.set(x,.5,ez);hearts.add(h);
    const t=new THREE.Mesh(new THREE.BoxGeometry(.08,.14,.08),new THREE.MeshBasicMaterial({color:0x44aaff}));t.position.set(x,.3,ez+.05);tears.add(t);
  });
  hearts.visible=tears.visible=false;m.add(eyes,hearts,tears);m.rotation.order='YXZ';root.add(m);
  const sh_blob=new THREE.Mesh(new THREE.CircleGeometry(.85,16).rotateX(-1.5708),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28}));
  sh_blob.position.y=.02;root.add(sh_blob);
  const nm=nameS(o.n||o.name||'?',o.nc||'#fff',o.nf||'monospace');nm.position.y=2.1;root.add(nm);
  const icos={};[0,1,2,4].forEach(k=>{const s=icoS(k);s.position.y=3.4;s.visible=false;root.add(s);icos[k]=s});
  sc.add(root);
  return{root,m,shadow:sh_blob,eyes,hearts,tears,icos,x:0,z:0,y:0,vx:0,vz:0,vy:0,py:0,pvy:0,air:0,js:1,jx:1,sv:0,lean:0,flip:0,spd:0,jc:0,jh:0,ty:0,r:0,tx:0,tz:0,tr:0,e:-1,et:0,lEt:-1,lCt:-1,init:0,lx:0,lz:0,tt:0,c1:o.c1,chat:null,ce:0,jbLvl:jbLvlOf(o.jb||0),
    boostMul:1,boostTime:0,boostCooldown:0,
    sitting:null,nearSwing:-1,_prevJump:false,
    hp:10,maxHp:10,inRing:false,invuln:0,koTimer:0};
}
function setE(p,e){p.e=e;p.et=performance.now()}
function say(p,t){if(p.chat)p.root.remove(p.chat);p.chat=chatS(t,p.jbLvl||jbLvl());p.chat.position.y=3;p.root.add(p.chat);p.ce=performance.now()+6500}
function animE(p,t){
  const d=(t-p.et)/1000,e=d<4?p.e:-1;let y=0,sx=1,sy=1;
  if(e==3){y=.9*Math.sin(d*4.5)**2;sy=1+.12*Math.cos(d*9)}
  if(e==4){sy=.75;sx=1.2}
  if(e==5&&d%2<1)y=Math.abs(Math.sin(d*14))*.5;
  if(e==6){sy=.7;sx=1.2}
  if(!p.air&&p.spd<.6){const br=1+Math.sin(t/700+p.js*10)*.03;sy*=br;sx*=1/Math.sqrt(br)}
  p.eyes.scale.y=(t%2400<120)?.08:(p.air?1.35:1);
  const drift=Math.sin(t/1300)*.06;p.eyes.children.forEach(ch=>{ch.position.x=ch.userData.baseX+drift});
  p.hearts.visible=e==7;p.eyes.visible=e!=7;p.tears.visible=e==6;
  p.tears.children.forEach((c,i)=>c.position.y=.4-((d*1.5+i*.5)%1)*.4);
  for(const k in p.icos){p.icos[k].visible=+k==e;p.icos[k].position.y=3.4+Math.sin(t/200)*.1}
  p.m.position.y=y+(p.air?0:Math.abs(Math.sin(t/110))*.1*Math.min(1,p.spd/4));
  p.m.rotation.z=p.air?0:Math.sin(t/110)*.06*Math.min(1,p.spd/4);
  p.m.rotation.x=p.lean+p.flip;
  const boostWobble=p.boostTime>0?1.05:1;
  p.m.scale.set(sx*p.jx*boostWobble,sy*p.js,sx*p.jx*boostWobble);
  if(p.shadow){const sc=Math.max(.4,1-p.y*.06);p.shadow.scale.set(sc,sc,sc);p.shadow.material.opacity=.28*(1-Math.min(.7,p.y*.08))}
  if(p.chat&&t>p.ce){p.root.remove(p.chat);p.chat=null}
}
function jelly(p,dt){
  const vy=(p.y-p.py)/Math.max(dt,.001);p.py=p.y;const air=p.y>.08;
  if(air&&!p.air){p.js=.65;puff(p.x,p.z,7,p.c1)}
  if(!air&&p.air){
    const impact=Math.min(1,Math.abs(p.pvy)/14);
    p.js=Math.max(.5,.9-impact*.45);p.sv=0;
    puff(p.x,p.z,10+Math.floor(impact*8),p.c1,2+impact*2);
    trail(p.x,p.z,p.c1);
    if(impact>.5){for(let k=0;k<8;k++){const a=k/8*6.28;trail(p.x+Math.cos(a)*.6,p.z+Math.sin(a)*.6,p.c1)}}
  }
  if(air&&p.air&&vy-p.pvy>6&&vy>3){p.flip=.01;puff(p.x,p.z,8,'#ffe27a',5)}
  p.air=air;p.pvy=vy;const ty=air?1+Math.max(-.2,Math.min(.4,vy*.05)):1;
  p.sv+=((ty-p.js)*240-p.sv*11)*dt;p.js=Math.max(.45,Math.min(1.6,p.js+p.sv*dt));p.jx=1/Math.sqrt(p.js);
  if(p.flip>0){p.flip+=dt*13;if(p.flip>6.283)p.flip=0}
  p.lean+=((air?0:Math.min(.3,p.spd*.035))-p.lean)*Math.min(1,dt*10);
}
const PT=[],pG=BOX(.25,.25,.25);
function puff(x,z,n,c,up,y){
  for(let i=0;i<n;i++){
    let q=PT.find(o=>o.l<=0);
    if(!q){if(PT.length>=80)return;const m=Mt(pG,new THREE.MeshBasicMaterial({transparent:true}),0,0,0);q={m,l:0,vx:0,vy:0,vz:0};PT.push(q)}
    const a=Math.random()*6.283,v=1.5+Math.random()*2;
    q.l=.6;q.vx=Math.cos(a)*v;q.vz=Math.sin(a)*v;q.vy=1.5+Math.random()*(up||2.5);
    q.m.material.color.set(i%3?c:'#ffffff');q.m.position.set(x,y!==undefined?y:.15,z);q.m.visible=true;
  }
}
const TR=[],trG=new THREE.CircleGeometry(.6,7).rotateX(-1.5708);
function trail(x,z,c){
  let t=TR.find(q=>q.l<=0);
  if(!t){if(TR.length>=40)return;const m=Mt(trG,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}),0,0,0);t={m,l:0};TR.push(t)}
  t.l=2.5;t.m.material.color.set(c);t.m.position.set(x,.06,z);t.m.visible=true;
}

let me,base,rid,host=false,playing=false,joined=false,pl=null,P={},cy=0,zd=10,pitch=.6,keys={},ix=0,iy=0,run=false,jmp=false,last=performance.now(),selMap='island',roomMap='island';
let raceTimer=0,raceRunning=false,raceFinished=false,raceArmed=false;
const show=id=>SCREENS.forEach(s=>$(s).classList.toggle('hide',s!=id));
const menuG=new THREE.Group();
menuG.add(Mt(new THREE.CylinderGeometry(3.2,3.2,.5,24),LS(0xffffff,{shininess:30}),0,-.25,0),
         Mt(new THREE.CylinderGeometry(3.5,3.7,.4,24),LS(0xb8d8ff,{shininess:60}),0,-.6,0));
sc.add(menuG);

(function injectShopAndLayout(){
  const menu=$('menu');if(!menu)return;
  const mb=menu.querySelector('.mb');if(!mb)return;
  const rightCol=document.createElement('div');rightCol.className='menu-right';
  menu.insertBefore(rightCol,mb);rightCol.appendChild(mb);
  const shop=document.createElement('div');shop.className='shop';
  shop.innerHTML=`
    <div class="shop-lbl">🎁 HADIAH JB</div>
    <div class="shop-row" data-reward="650"><span class="amt">650 JB</span><span class="prc"><s>Rp 15.000</s><b>Rp 20.000</b></span></div>
    <div class="shop-row" data-reward="1000"><span class="amt">1.000 JB</span><span class="prc"><s>Rp 25.000</s><b>Rp 35.000</b></span></div>
    <div class="shop-row" data-reward="5000"><span class="amt">5.000 JB</span><span class="prc"><s>Rp 65.000</s><b>Rp 95.000</b></span></div>
    <div class="shop-note">Kirim rekaman dan screenshot untuk menerima</div>
  `;
  rightCol.appendChild(shop);
  shop.querySelectorAll('.shop-row').forEach(row=>{row.onclick=()=>{
    const need=parseInt(row.dataset.reward);const rp=row.querySelector('.prc b').textContent;
    if(cfg.jb>=need)toast('🎉 Kamu bisa klaim '+rp+'! Kirim rekaman & screenshot ke admin.');
    else toast('Kurang '+(need-cfg.jb)+' JB lagi untuk '+rp);
  }});
})();

(function injectGfxSettings(){
  const setScreen=$('set');if(!setScreen)return;
  const card=setScreen.querySelector('.card');if(!card)return;
  const sb=$('sb');if(!sb)return;
  const lbl=document.createElement('div');lbl.className='lbl';lbl.textContent='Kualitas Grafik';
  const wrap=document.createElement('div');wrap.className='grid';wrap.id='gfxGrid';
  [['lowest','Lowest'],['low','Low'],['high','High'],['highest','Highest']].forEach(([k,l])=>{
    const b=document.createElement('button');b.textContent=l;b.dataset.gfx=k;b.className=cfg.gfx===k?'on':'';
    b.onclick=()=>{cfg.gfx=k;sv();[...wrap.children].forEach(x=>x.classList.toggle('on',x.dataset.gfx===k));applyGfx();rs();if(playing)build(curMap);toast('🎨 Grafik: '+l)};
    wrap.appendChild(b);
  });
  card.insertBefore(lbl,sb);card.insertBefore(wrap,sb);
})();

function setSelf(){
  const keep=(pl&&typeof pl.x==='number')?{x:pl.x,z:pl.z,y:pl.y,r:pl.r,vx:pl.vx,vz:pl.vz,vy:pl.vy,jc:pl.jc,air:pl.air,py:pl.py,pvy:pl.pvy,js:pl.js,jx:pl.jx,sv:pl.sv,lean:pl.lean,flip:pl.flip,spd:pl.spd,ty:pl.ty,tx:pl.tx,tz:pl.tz,tr:pl.tr,e:pl.e,et:pl.et,lEt:pl.lEt,lCt:pl.lCt,init:pl.init,lx:pl.lx,lz:pl.lz,tt:pl.tt}:null;
  if(pl&&pl.root&&pl.root.parent)pl.root.parent.remove(pl.root);
  pl=mkP({...cfg,n:cfg.name});
  if(keep)Object.assign(pl,keep);
  (playing?sc:menuG).add(pl.root);
  const jbn=$('jbn');if(jbn)jbn.textContent=cfg.jb+' JB';
}
function menuMode(){
  playing=false;world.visible=false;menuG.visible=true;
  makeSky(0x0e1a3a,0x3a5a9a);sc.fog=null;
  pl.x=pl.z=pl.y=0;pl.vx=pl.vz=pl.vy=0;pl.r=0;
  menuG.add(pl.root);zd=5;
}
build('island');setSelf();menuMode();
document.querySelectorAll('.bk').forEach(b=>b.onclick=()=>show('menu'));
$('ppbk').onclick=()=>show('menu');

const SHAPES=['Setengah','Kotak','Segitiga','Bola','Silinder','Piramida','Permata'];
const shGrid=$('shapes');
SHAPES.forEach((n,i)=>{const b=document.createElement('button');b.textContent=n;b.className=cfg.sh==i?'on':'';b.onclick=()=>{cfg.sh=i;sv();setSelf();[...shGrid.children].forEach((x,j)=>x.classList.toggle('on',j==i))};shGrid.append(b)});
const FONTS=['monospace','sans-serif','serif','cursive','Impact','Georgia','Verdana','Trebuchet MS','Courier New'];
const fGrid=$('fonts');
FONTS.forEach(n=>{const b=document.createElement('button');b.textContent=n;b.style.fontFamily=n;b.className=cfg.nf==n?'on':'';b.onclick=()=>{cfg.nf=n;sv();setSelf();[...fGrid.children].forEach(x=>x.classList.toggle('on',x.textContent==n))};fGrid.append(b)});
const MU=[['island','Pulau'],['desert','Gurun'],['jungle','Jungle'],['snow','Salju'],['parkour','Parkour'],['speedrace','Balapan']];
const mGrid=$('maps');
MU.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.className=selMap==k?'on':'';b.onclick=()=>{selMap=k;[...mGrid.children].forEach((x,j)=>x.classList.toggle('on',MU[j][0]==k))};mGrid.append(b)});

const ppGrid=$('playMaps');
const countUnsubs={};
MU.forEach(([k,l])=>{
  const b=document.createElement('button');b.dataset.map=k;
  b.innerHTML=l+'<small data-cnt>· · ·</small>';
  b.onclick=async()=>{selMap=k;$('mp').disabled=true;await join('g_'+k,k,false);$('mp').disabled=false;start(k)};
  ppGrid.append(b);
});

async function setupGlobalCounts(){
  try{await ready}catch(e){}
  if(typeof db==='undefined'||!db)return;
  for(const [k,l] of MU){
    if(countUnsubs[k])continue;
    const ref=db.ref('rooms/g_'+k+'/players');
    const cb=s=>{
      const v=s.val()||{};const now=Date.now();let cnt=0;
      for(const id in v){const t=v[id].lastSeen||0;if(now-t<90000)cnt++}
      const btn=[...ppGrid.children].find(x=>x.dataset.map===k);if(!btn)return;
      const small=btn.querySelector('[data-cnt]');if(!small)return;
      if(cnt>0){small.textContent='👤 '+cnt+' online';small.className='on-live';small.style.color='#3fbf5f'}
      else{small.textContent='· kosong ·';small.className='';small.style.color=''}
    };
    ref.on('value',cb);countUnsubs[k]={ref,cb};
  }
}
setupGlobalCounts();

for(const k of['c1','c2','nc']){const el=$(k);el.value=cfg[k];el.oninput=()=>{cfg[k]=el.value;sv();setSelf()}}
$('rd').value=cfg.rd;$('rd').oninput=e=>{cfg.rd=+e.target.value;sv();setRD()};
$('sb').onclick=()=>{$('set').classList.add('hide');playing?$('pause').classList.remove('hide'):show('menu')};
$('ms').onclick=()=>show('skin');$('mr').onclick=()=>show('croom');$('mt').onclick=()=>show('set');
$('mp').onclick=()=>show('playpick');
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e});$('md').onclick=()=>dp?dp.prompt():alert('Menu browser > "Tambahkan ke layar utama"');
$('ng').onclick=()=>{const v=$('nm').value.trim().slice(0,14);if(!v)return;cfg.name=v;sv();setSelf();show('menu')};

async function join(id,map,h){const er=await ready;if(er&&er!='timeout'&&er!='net'&&er!=''){toast(ERR[er]);return 0}
  try{return await join2(id,map,h)}catch(e){toast('Gagal masuk: '+(e.code||e.message));return 0}}
async function join2(id,map,h){
  rid=id;host=h;roomMap=map;base=db.ref('rooms/'+id);me=base.child('players/'+uid);me.onDisconnect().remove();
  await me.set({n:cfg.name,c1:cfg.c1,c2:cfg.c2,sh:cfg.sh,nc:cfg.nc,nf:cfg.nf,x:0,z:0,y:0,r:0,e:-1,et:0,ct:0,ch:' ',jb:cfg.jb,lastSeen:TS});
  pl.x=pl.z=pl.y=0;joined=true;base.child('players').on('value',onPl);
  if(pl._hb)clearInterval(pl._hb);
  pl._hb=setInterval(()=>{if(me)me.update({lastSeen:TS}).catch(()=>{})},20000);
  if(id[0]!='g'){base.child('meta').on('value',s=>{const m=s.val();if(m&&m.started&&!playing)start(m.map)})}
  return 1
}
function onPl(s){
  const v=s.val()||{};if(joined&&!v[uid]){leave();alert('Kamu keluar dari room');return}
  $('ll').innerHTML='';
  for(const id in v){const r=document.createElement('div');r.className='row';
    r.innerHTML=`<i style="background:${v[id].c1}"></i><b></b>`;
    r.lastChild.textContent=v[id].n+(id==uid?' (kamu)':'');
    if(host&&id!=uid){const x=document.createElement('button');x.className='kick';x.textContent=KX;x.onclick=()=>base.child('players/'+id).remove();r.append(x)}
    $('ll').append(r);
  }
  for(const id in v){
    if(id==uid)continue;
    const d=v[id];let p=P[id];
    if(!p){p=P[id]=mkP(d);p.x=d.x;p.z=d.z;p.y=d.y||0;if((d.jb||0)>=500)toast('🎉 '+d.n+' punya '+d.jb+' JB!')}
    p.tx=d.x;p.tz=d.z;p.tr=d.r;p.ty=d.y||0;p.jbLvl=jbLvlOf(d.jb||0);
    if(d.et!==p.lEt){if(p.init&&d.e>=0)setE(p,d.e);p.lEt=d.et}
    if(d.ct!==p.lCt){if(p.init&&d.ch.trim())say(p,d.ch);p.lCt=d.ct}
    p.init=1;
  }
  for(const id in P)if(!v[id]){sc.remove(P[id].root);delete P[id]}
}
function start(map){
  build(map);world.visible=true;menuG.visible=false;sc.add(pl.root);
  playing=true;
  pl.boostMul=1;pl.boostTime=0;pl.boostCooldown=0;pl.sitting=null;pl.hp=pl.maxHp;pl.inRing=false;pl.koTimer=0;pl.invuln=0;pl._prevJump=false;
  if(map=='speedrace'){pl.x=0;pl.z=-5;pl.y=0}
  else if(map=='parkour'){pl.x=0;pl.z=0;pl.y=1}
  else {pl.x=0;pl.z=0;pl.y=0}
  pl.vx=pl.vz=pl.vy=0;pl.r=0;
  raceTimer=0;raceRunning=false;raceFinished=false;raceArmed=true;
  ['menu','playpick','lobby'].forEach(i=>$(i).classList.add('hide'));
  $('hud').classList.remove('hide');zd=12;
}
async function leave(){
  joined=false;playing=false;
  if(pl&&pl._hb){clearInterval(pl._hb);pl._hb=null}
  if(base){base.child('players').off();base.child('meta').off();
    try{if(host&&rid[0]!='g')await base.remove();else await me.remove()}catch(e){}}
  for(const id in P)sc.remove(P[id].root);P={};base=me=null;
  $('hud').classList.add('hide');$('pause').classList.add('hide');$('hpbar').classList.add('hide');
  menuMode();show('menu');
}
const code=()=>Math.random().toString(36).slice(2,7).toUpperCase();
$('rc').onclick=async()=>{const er=await ready;if(er&&er!='timeout'&&er!='net'&&er!=''){return toast(ERR[er])}
  const m=selMap,c=code();
  try{await db.ref('rooms/'+c+'/meta').set({host:uid,map:m,started:false})}catch(e){return toast('Gagal buat room: '+e.code)}
  if(await join(c,m,true)){$('lc').textContent=c;$('lg').classList.remove('hide');show('lobby')}};
$('rj').onclick=async()=>{const er=await ready;if(er&&er!='timeout'&&er!='net'&&er!=''){return toast(ERR[er])}
  const c=$('ri').value.trim().toUpperCase();let r;
  try{r=await db.ref('rooms/'+c+'/meta').once('value')}catch(e){return toast('Gagal: '+e.code)}
  if(!r.exists())return toast('Room tidak ditemukan');
  const m=r.val().map;if(await join(c,m,false)){$('lc').textContent=c;$('lg').classList.add('hide');show('lobby')}};
$('lg').onclick=async()=>{try{await base.child('meta/started').set(true)}catch(e){}start(roomMap)};
$('lx').onclick=leave;$('pe').onclick=leave;
$('pb').onclick=()=>$('pause').classList.remove('hide');$('pr').onclick=()=>$('pause').classList.add('hide');
$('ps').onclick=()=>{$('pause').classList.add('hide');$('set').classList.remove('hide')};

IC.forEach((ic,i)=>{const b=document.createElement('button');b.append(icoC(i));b.insertAdjacentHTML('beforeend','<small>'+(i+1)+'</small>');b.onclick=()=>emo(i);$('bar').append(b)});
function emo(i){if(!playing||!pl)return;const n=pl.e==i?-1:i;setE(pl,n);me&&me.update({e:n,et:TS});[...$('bar').children].forEach((b,j)=>b.classList.toggle('on',j==n));setTimeout(()=>[...$('bar').children].forEach(b=>b.classList.remove('on')),700)}
function send(){if(!pl)return;const t=$('ci').value.trim();if(t){say(pl,t);me&&me.update({ch:t,ct:TS})}$('ci').value='';$('chat').classList.add('hide')}
$('cb').onclick=()=>{$('chat').classList.toggle('hide');$('ci').focus()};
$('cs').onclick=send;$('ci').onkeydown=e=>{if(e.key=='Enter')send()};

$('prompt').onclick=()=>{if(pl&&pl.nearSwing>=0&&pl.sitting===null)jmp=true};
$('prompt').ontouchstart=e=>{e.preventDefault();if(pl&&pl.nearSwing>=0&&pl.sitting===null)jmp=true};

addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;keys[e.code]=1;
  if(e.key>='1'&&e.key<='8')emo(+e.key-1);
  if(e.key=='Enter'){$('chat').classList.remove('hide');$('ci').focus();e.preventDefault()}});
addEventListener('keyup',e=>keys[e.code]=0);
let ds=0,lx=0,ly=0,cvT={};
const look=(dx,dy)=>{cy-=dx*.008;pitch=Math.min(1.35,Math.max(.05,pitch+dy*.006))};
cv.onmousedown=e=>{ds=1;lx=e.clientX;ly=e.clientY};
addEventListener('mouseup',()=>ds=0);
addEventListener('mousemove',e=>{if(ds&&playing){look(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY}});
cv.onwheel=e=>zd=Math.min(22,Math.max(3,zd+e.deltaY*.01));
cv.ontouchstart=e=>{for(const t of e.changedTouches)cvT[t.identifier]={x:t.clientX,y:t.clientY}};
cv.ontouchmove=e=>{const ids=Object.keys(cvT);if(ids.length>=2){const a=cvT[ids[0]],b=cvT[ids[1]],d0=Math.hypot(a.x-b.x,a.y-b.y);
  for(const t of e.changedTouches)if(cvT[t.identifier])Object.assign(cvT[t.identifier],{x:t.clientX,y:t.clientY});
  zd=Math.min(22,Math.max(3,zd-(Math.hypot(a.x-b.x,a.y-b.y)-d0)*.03))}
  else for(const t of e.changedTouches){const o=cvT[t.identifier];if(o){if(playing)look(t.clientX-o.x,t.clientY-o.y);o.x=t.clientX;o.y=t.clientY}}};
cv.ontouchend=cv.ontouchcancel=e=>{for(const t of e.changedTouches)delete cvT[t.identifier]};
const lockL=()=>{try{if(matchMedia('(pointer:coarse)').matches)(document.documentElement.requestFullscreen?document.documentElement.requestFullscreen():Promise.resolve()).then(()=>screen.orientation.lock('landscape')).catch(()=>{})}catch(e){}};
addEventListener('pointerdown',lockL,{once:true});
if(matchMedia('(pointer:coarse)').matches)$('mob').classList.remove('hide');
const joy=$('joy'),kn=$('kn');
const jm=e=>{const t=e.targetTouches[0],r=joy.getBoundingClientRect(),dx=t.clientX-r.left-62,dy=t.clientY-r.top-62,l=Math.min(1,Math.hypot(dx,dy)/52),a=Math.atan2(dy,dx);
  ix=Math.cos(a)*l;iy=-Math.sin(a)*l;kn.style.left=42+Math.cos(a)*l*42+'px';kn.style.top=42+Math.sin(a)*l*42+'px'};
joy.ontouchstart=joy.ontouchmove=e=>{e.stopPropagation();jm(e)};
joy.ontouchend=()=>{ix=iy=0;kn.style.left=kn.style.top='42px'};
$('jb').ontouchstart=()=>{jmp=true};
$('rb').ontouchstart=()=>{run=!run;$('rb').classList.toggle('s',!run)};

const PR=0.5,PH=1.5,STEP=1.3;
function resolveH(){
  for(const c of cols){
    if(!c.enabled)continue;
    const top=c.y+c.h;
    if(pl.y>=top-0.1)continue;
    if(top-pl.y<=STEP)continue;
    if(pl.y+PH<=c.y)continue;
    const dx=pl.x-c.x,dz=pl.z-c.z;
    const ox=c.w/2+PR-Math.abs(dx);
    const oz=c.d/2+PR-Math.abs(dz);
    if(ox>0&&oz>0){
      if(ox<oz){pl.x=c.x+Math.sign(dx||1)*(c.w/2+PR);if(pl.vx*Math.sign(dx||1)<0)pl.vx=0}
      else{pl.z=c.z+Math.sign(dz||1)*(c.d/2+PR);if(pl.vz*Math.sign(dz||1)<0)pl.vz=0}
    }
  }
}
function groundY(){
  let GY=-999,GSLIP=0,GBOUNCE=0;const gr=0.42;
  for(const c of cols){
    if(!c.enabled)continue;
    const top=c.y+c.h;
    if(pl.y<top-0.55)continue;
    if(pl.x+gr>c.x-c.w/2&&pl.x-gr<c.x+c.w/2&&pl.z+gr>c.z-c.d/2&&pl.z-gr<c.z+c.d/2){
      if(top>GY){GY=top;GSLIP=c.slip||0;GBOUNCE=c.bounce||0}
    }
  }
  if(GY<-500)GY=(curMap=='parkour')?-50:0;
  return{GY,GSLIP,GBOUNCE};
}

function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(!pl){R.render(sc,cam);return}
  if(playing){
    if(curMap=='parkour'){
      for(const p of plats){if(p.vanish){const t=((now/1000)+p.phase)%p.period;p.enabled=t<p.period*.65;p.mesh.visible=p.enabled}}
    }
    if(keys.ArrowLeft)cy+=dt*2;if(keys.ArrowRight)cy-=dt*2;
    if(keys.ArrowUp)pitch=Math.max(.05,pitch-dt*1.5);if(keys.ArrowDown)pitch=Math.min(1.35,pitch+dt*1.5);

    // Unified jump input detection
    const jumpInput=jmp||keys.Space;
    const freshJump=jumpInput&&!pl._prevJump;
    pl._prevJump=jumpInput;
    jmp=false;

    // Swing logic
    if(pl.sitting!==null && swings[pl.sitting]){
      const s=swings[pl.sitting];
      const force=-iy*3.5-(keys.KeyW?1:0)*3.5+(keys.KeyS?1:0)*3.5;
      s.vel+=force*dt;s.vel-=Math.sin(s.angle)*7*dt;s.vel*=Math.pow(0.55,dt);
      s.angle+=s.vel*dt;s.angle=Math.max(-1.15,Math.min(1.15,s.angle));
      s.pivot.rotation.x=s.angle;
      const cosA=Math.cos(s.angle),sinA=Math.sin(s.angle);
      const lx_=0, ly_=-6.1*cosA, lz_=-6.1*sinA;
      const cs=Math.cos(s.rot),sn=Math.sin(s.rot);
      const wx=s.x+lx_*cs-lz_*sn;
      const wz=s.z+lx_*sn+lz_*cs;
      const wy=7.8+ly_;
      pl.x=wx;pl.z=wz;pl.y=wy+1;
      pl.vx=pl.vz=pl.vy=0;
      pl.r=s.rot+Math.PI;
      if(freshJump){pl.sitting=null;pl.vy=6}
      const prompt=$('prompt');
      prompt.textContent='Tekan JUMP / E untuk turun · Joystick = ayun';
      prompt.classList.remove('hide');
    } else {
      let nearest=-1,nd=4;
      for(let i=0;i<swings.length;i++){
        const s=swings[i];const d=Math.hypot(pl.x-s.x,pl.z-s.z);
        if(d<nd){nearest=i;nd=d}
      }
      pl.nearSwing=nearest;
      const prompt=$('prompt');
      if(nearest>=0){prompt.textContent='Tekan JUMP / E untuk duduk di ayunan';prompt.classList.remove('hide')}
      else prompt.classList.add('hide');

      if(freshJump){
        if(pl.nearSwing>=0 && pl.y<1.5){
          pl.sitting=pl.nearSwing;pl.vx=pl.vz=pl.vy=0;pl.r=0;
        } else if(pl.y<=groundYSafe()+0.01||pl.jc<2){
          if(pl.y<=groundYSafe()+0.01)pl.jc=0;
          if(pl.jc<2){pl.vy=pl.jc?9:8;pl.jc++}
        }
      }

      if(pl.boostTime>0){
        pl.boostTime-=dt;
        if(pl.boostTime<=0){pl.boostMul=1;pl.boostTime=0}
        if(Math.random()<dt*12){const a=Math.random()*6.28;puff(pl.x+Math.cos(a)*.6,pl.z+Math.sin(a)*.6,1,'#ff8c1a',1.5,pl.y+.5)}
      }
      if(pl.boostCooldown>0)pl.boostCooldown-=dt;

      let a=ix+(keys.KeyD?1:0)-(keys.KeyA?1:0),b=iy+(keys.KeyW?1:0)-(keys.KeyS?1:0);
      const l=Math.hypot(a,b);if(l>1)a/=l,b/=l;
      const mx=Math.cos(cy)*a-Math.sin(cy)*b,mz=-Math.sin(cy)*a-Math.cos(cy)*b;
      const sp=((run||keys.ShiftLeft)?9:5)*(pl.boostMul||1);
      const{GY,GSLIP,GBOUNCE}=groundY();
      const fric=GSLIP?2.5:24;
      pl.vx+=(mx*sp-pl.vx)*Math.min(1,dt*fric);
      pl.vz+=(mz*sp-pl.vz)*Math.min(1,dt*fric);
      pl.x+=pl.vx*dt;pl.z+=pl.vz*dt;
      resolveH();
      if(a||b){const t=Math.atan2(mx,mz);let d=t-pl.r;d=Math.atan2(Math.sin(d),Math.cos(d));pl.r+=d*Math.min(1,dt*12)}
      if(pl.y<=GY+.01)pl.jc=0;
      pl.vy-=22*dt;pl.y+=pl.vy*dt;
      if(pl.y<=GY){
        if(GBOUNCE&&pl.pvy<-1){
          pl.vy=16;pl.jc=0;
          puff(pl.x,pl.z,12,'#ff5db1',4);
          for(let k=0;k<8;k++){const ang=k/8*6.28;trail(pl.x+Math.cos(ang)*.8,pl.z+Math.sin(ang)*.8,'#ff5db1')}
        } else {pl.y=GY;if(pl.vy<0)pl.vy=0}
      }
    }
    if(curMap=='parkour'&&pl.y<-30){pl.x=pl.z=0;pl.y=3;pl.vx=pl.vz=pl.vy=0}
    const rr=Math.hypot(pl.x,pl.z);
    if(rr>LIM){pl.x*=LIM/rr;pl.z*=LIM/rr}

    // Battle ring detection
    let inAnyRing=false;
    for(const ring of rings){const dr=Math.hypot(pl.x-ring.x,pl.z-ring.z);if(dr<ring.r-0.5)inAnyRing=true}
    if(inAnyRing&&!pl.inRing){pl.hp=pl.maxHp;pl.invuln=1.5;toast('⚔️ Masuk ring! HP kamu 10/10')}
    pl.inRing=inAnyRing;
    if(pl.koTimer>0)pl.koTimer-=dt;
    if(pl.invuln>0)pl.invuln-=dt;

    // Stomp detection
    if(pl.inRing && pl.koTimer<=0 && pl.invuln<=0){
      for(const id in P){
        const e=P[id];
        const dh=Math.hypot(pl.x-e.x,pl.z-e.z);
        if(dh<1.5 && e.y > pl.y + 1.3 && e.y < pl.y + 3.5){
          pl.hp-=10;pl.invuln=1.0;
          puff(pl.x,pl.z,18,'#ff5d5d',3,pl.y+1);
          for(let k=0;k<8;k++){const ang=k/8*6.28;trail(pl.x+Math.cos(ang)*.9,pl.z+Math.sin(ang)*.9,'#ff5d5d')}
          if(pl.hp<=0){
            pl.hp=pl.maxHp;pl.koTimer=3;pl.inRing=false;
            const ring=rings[0];
            if(ring){const a=Math.atan2(pl.x-ring.x,pl.z-ring.z);pl.x=ring.x+Math.sin(a)*(ring.r+4);pl.z=ring.z+Math.cos(a)*(ring.r+4);pl.y=1}
            toast('💀 KO! Keluar dari ring, HP reset 10/10');
          }
          break;
        }
      }
    }

    const hpb=$('hpbar');
    if(pl.inRing){hpb.classList.remove('hide');hpb.querySelector('.fill').style.width=Math.max(0,(pl.hp/pl.maxHp)*100)+'%';hpb.querySelector('.txt').textContent=pl.hp+'/'+pl.maxHp+' HP'}
    else hpb.classList.add('hide');

    for(const bb of boostBubbles){
      if(!bb.act){if(bb.respawn>0){bb.respawn-=dt;if(bb.respawn<=0){bb.act=true;bb.m.visible=true}}continue}
      bb.t+=dt;
      bb.m.position.y=bb.baseY+Math.sin(bb.t*2+bb.ph)*0.35;
      bb.m.rotation.y+=dt*1.8;bb.ring.rotation.z+=dt*2.5;
      bb.outer.material.opacity=0.25+Math.sin(bb.t*3+bb.ph)*0.15;
      const dx=pl.x-bb.x,dz=pl.z-bb.z,dy=pl.y-bb.baseY;
      if(dx*dx+dz*dz<3.5&&Math.abs(dy)<2.2&&pl.boostCooldown<=0){
        pl.boostMul=2.2;pl.boostTime=3;pl.boostCooldown=0.8;
        for(let k=0;k<14;k++){const ang=k/14*6.28;puff(bb.x+Math.cos(ang)*.8,bb.z+Math.sin(ang)*.8,1,k%2?'#ff8c1a':'#ffd23f',2.5,bb.m.position.y)}
        bb.act=false;bb.m.visible=false;bb.respawn=9;toast('⚡ BOOST!');
      }
    }

    for(let i=jbs.length-1;i>=0;i--){
      const j=jbs[i];
      const dx=pl.x-j.x,dz=pl.z-j.z,dy=pl.y+1-j.m.position.y;
      const d2=dx*dx+dz*dz+dy*dy;
      if(d2<9&&d2>2.4){const dd=Math.sqrt(d2)||.01;const pull=Math.min(1,dt*6/dd);j.x+=dx*pull;j.z+=dz*pull;j.y+=dy*pull*.6;j.m.position.x=j.x;j.m.position.z=j.z}
      j.m.position.y=j.y+Math.sin(now/500+j.ph)*.3;
      j.m.rotation.y=now/1000+j.ph;
      j.m.scale.setScalar(0.9+Math.sin(now/220+j.ph)*0.18);
      if(d2<2.4){
        const oldLvl=jbLvl();
        cfg.jb++;sv();$('jbn').textContent=cfg.jb+' JB';
        jbPop(j.x,j.y+.5,j.z);
        for(let k=0;k<10;k++){const ang=k/10*6.28;puff(j.x+Math.cos(ang)*.6,j.z+Math.sin(ang)*.6,1,'#7fd0ff',1.5,j.m.position.y)}
        sc.remove(j.m);jbs.splice(i,1);
        if(pl.boostTime>0){pl.boostTime=0;pl.boostMul=1;for(let k=0;k<18;k++){const ang=k/18*6.28;puff(pl.x+Math.cos(ang)*.8,pl.z+Math.sin(ang)*.8,1,k%2?'#ffffff':'#ffb84a',2,pl.y+.8)}trail(pl.x,pl.z,'#ffffff');trail(pl.x,pl.z,'#ffb84a')}
        pl.jbLvl=jbLvlOf(cfg.jb);me&&me.update({jb:cfg.jb});
        if(jbLvl()>oldLvl)toast('🎉 Chat bubble baru! ('+cfg.jb+' JB)');
      }
    }

    if(curMap=='speedrace'){
      if(raceArmed&&!raceFinished){if(pl.z>2.5){raceArmed=false;raceRunning=true;raceTimer=0;toast('🏁 Timer mulai!')}}
      if(raceRunning&&!raceFinished){
        raceTimer+=dt;$('raceTimer').classList.remove('hide');$('raceTimer').textContent=raceTimer.toFixed(2)+'s';
        if(pl.z>=150){
          raceFinished=true;raceRunning=false;
          let reward=10,label='Selesai';
          if(raceTimer<10){reward=100;label='🏆 LUAR BIASA!'}
          else if(raceTimer<15){reward=50;label='🥇 Bagus!'}
          else if(raceTimer<22){reward=20;label='👍 OK!'}
          cfg.jb+=reward;sv();$('jbn').textContent=cfg.jb+' JB';me&&me.update({jb:cfg.jb});
          toast(label+' '+raceTimer.toFixed(2)+'s — +'+reward+' JB!');raceTimer=0;
        }
      } else if(raceFinished){$('raceTimer').classList.remove('hide');$('raceTimer').textContent='✓ '+raceTimer.toFixed(2)+'s'}
    } else $('raceTimer').classList.add('hide');

    for(const b of BEACONS){b.t+=dt;b.beam.rotation.y=b.t*.8}
    for(const q of AMB.butterflies){if(!q.act)continue;q.t+=dt;const a=q.t*q.spd+q.ph;q.m.position.set(q.cx+Math.cos(a)*q.r,q.y+Math.sin(q.t*3)*.4,q.cz+Math.sin(a)*q.r);q.m.rotation.y=-a;q.m.rotation.z=Math.sin(q.t*8)*.4}
    for(const q of AMB.fireflies){if(!q.act)continue;q.t+=dt;const a=q.t*q.spd+q.ph;q.m.position.set(q.cx+Math.cos(a)*q.r,q.y+Math.sin(q.t*2)*.5,q.cz+Math.sin(a)*q.r);q.m.material.opacity=.5+Math.sin(q.t*3+q.ph)*.5}
    for(const q of AMB.birds){if(!q.act)continue;q.t+=dt;const a=q.t*q.spd+q.ph;q.m.position.set(Math.cos(a)*q.r,q.y0+Math.sin(q.t*2)*1.5,Math.sin(a)*q.r);q.m.rotation.y=-a+Math.PI/2}
    for(const q of AMB.clouds){if(!q.act)continue;q.t+=dt;q.m.position.x+=q.spd*dt;if(q.m.position.x>250)q.m.position.x=-250;q.m.scale.set(q.sx,q.sy,q.sz)}
    for(const q of AMB.snow){if(!q.act)continue;q.t+=dt;q.m.position.x+=q.vx*dt;q.m.position.y+=q.vy*dt;q.m.position.z+=q.vz*dt;q.m.rotation.x+=dt*2;q.m.rotation.y+=dt*1.5;if(q.m.position.y<0)spawnAmb('snow',{x:(Math.random()-.5)*200,y:28+Math.random()*4,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*.8,vy:-1.5-Math.random()*2,vz:(Math.random()-.5)*.8})}
    for(const q of AMB.leaves){if(!q.act)continue;q.t+=dt;q.m.position.x+=(q.vx+Math.sin(q.t*2+q.ph)*1.2)*dt;q.m.position.y+=(-1.5-Math.sin(q.t)*.5)*dt;q.m.position.z+=q.vz*dt;q.m.rotation.x+=dt*3;q.m.rotation.z+=dt*2;if(q.m.position.y<0)spawnAmb('leaves',{x:(Math.random()-.5)*200,y:12+Math.random()*8,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*2,vz:(Math.random()-.5)*2,ph:Math.random()*6.28})}
    for(const q of AMB.petals){if(!q.act)continue;q.t+=dt;q.m.position.x+=(q.vx+Math.sin(q.t*2.5+q.ph)*1.4)*dt;q.m.position.y+=(-1-Math.sin(q.t*.8)*.4)*dt;q.m.position.z+=q.vz*dt;q.m.rotation.x+=dt*2;q.m.rotation.z+=dt*2.5;if(q.m.position.y<0)spawnAmb('petals',{x:(Math.random()-.5)*200,y:12+Math.random()*6,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*1.5,vz:(Math.random()-.5)*1.5,ph:Math.random()*6.28})}
    for(const s of AMB.smokes){if(!s.act)continue;s.t+=dt;s.m.position.x+=s.vx*dt;s.m.position.y+=s.vy*dt;s.m.position.z+=s.vz*dt;const k=Math.max(0,1-s.t/3);s.m.material.opacity=k*.5;s.m.scale.setScalar(1+(1-k)*2);if(s.t>3){s.act=false;s.m.visible=false}}
    for(const q of AMB.stars){if(!q.act)continue;q.m.material.opacity=.6+Math.sin(now/500+q.m.position.x)*.4}
    for(const q of AMB.orbs){if(!q.act)continue;q.t+=dt;q.m.position.y+=Math.sin(q.t*1.5+q.ph)*dt*1.5;q.m.position.x+=Math.cos(q.t*.7+q.ph)*dt;q.m.position.z+=Math.sin(q.t*.7+q.ph)*dt}
  } else {pl.r=0;pl.vx=pl.vz=0}

  const all=[pl,...Object.values(P)];
  for(const p of all){
    if(p!==pl)p.root.visible=playing;
    if(p!==pl){p.x+=(p.tx-p.x)*Math.min(1,dt*10);p.z+=(p.tz-p.z)*Math.min(1,dt*10);p.y+=((p.ty||0)-p.y)*Math.min(1,dt*14);let d=p.tr-p.r;d=Math.atan2(Math.sin(d),Math.cos(d));p.r+=d*Math.min(1,dt*10)}
    if(Math.hypot(p.x-p.lx,p.z-p.lz)>.02&&p.y<.1&&(p.tt-=dt)<=0){trail(p.x,p.z,p.c1);p.tt=.12}
    p.spd=Math.hypot(p.x-p.lx,p.z-p.lz)/Math.max(dt,.001);
    p.lx=p.x;p.lz=p.z;jelly(p,dt);
    p.root.position.set(p.x,p.y,p.z);p.m.rotation.y=p.r;animE(p,now);
  }
  PT.forEach(q=>{if(q.l>0){q.l-=dt;q.vy-=14*dt;q.m.position.x+=q.vx*dt;q.m.position.y+=q.vy*dt;q.m.position.z+=q.vz*dt;q.m.material.opacity=Math.min(1,q.l*3);q.m.scale.setScalar(Math.max(.2,q.l*1.5));if(q.l<=0)q.m.visible=false}});
  TR.forEach(t=>{if(t.l>0){t.l-=dt;t.m.material.opacity=Math.max(0,t.l/2.5)*.7;t.m.scale.setScalar(.6+.4*t.l/2.5);if(t.l<=0)t.m.visible=false}});
  for(let i=jbPops.length-1;i>=0;i--){const p=jbPops[i];p.l-=dt;p.sp.position.y+=dt*2.2;p.sp.material.opacity=Math.max(0,p.l);if(p.l<=0){sc.remove(p.sp);jbPops.splice(i,1)}}
  if(playing){
    const cp=Math.cos(pitch);
    cam.position.set(pl.x+Math.sin(cy)*cp*zd,pl.y+1+Math.sin(pitch)*zd,pl.z+Math.cos(cy)*cp*zd);
    cam.lookAt(pl.x,pl.y+.8,pl.z);
    if(skyDome){skyDome.position.set(pl.x,0,pl.z);sunMesh.position.set(pl.x-150,140,pl.z-200);sunMesh.lookAt(pl.x,50,pl.z);dl.position.set(pl.x+60,100,pl.z+40);dlTarget.position.set(pl.x,0,pl.z)}
  } else {
    menuG.rotation.y+=dt*.55;const t=now/1000;
    cam.position.set(Math.sin(t*.3)*.4,2.1,5.2);cam.lookAt(0,.85,0);
    if(skyDome){skyDome.position.set(0,0,0)}
  }
  R.render(sc,cam);
  if(playing){
    const x=$('mm').getContext('2d'),f=v=>(v/LIM+1)*48;
    x.fillStyle='#'+(MAPS[curMap]?MAPS[curMap][1]:0x2f6b3a).toString(16).padStart(6,'0');
    x.fillRect(0,0,96,96);
    x.fillStyle='rgba(0,0,0,.15)';
    for(let i=0;i<96;i+=8)x.fillRect(i,0,1,96);
    for(let i=0;i<96;i+=8)x.fillRect(0,i,96,1);
    for(const r of rings){x.strokeStyle='#d05040';x.lineWidth=2;x.beginPath();x.arc(f(r.x),f(r.z),r.r/LIM*48,0,6.28);x.stroke()}
    x.fillStyle='#7fd0ff';
    for(const j of jbs){if(j.x*j.x+j.z*j.z<LIM*LIM)x.fillRect(f(j.x)-1,f(j.z)-1,2,2)}
    for(const bb of boostBubbles){if(bb.act){x.fillStyle='#ff8c1a';x.fillRect(f(bb.x)-2,f(bb.z)-2,4,4)}}
    for(const id in P){x.fillStyle='#e22';x.fillRect(f(P[id].x)-2,f(P[id].z)-2,4,4)}
    x.fillStyle='#ffd23f';x.fillRect(f(pl.x)-2,f(pl.z)-2,4,4);
    x.strokeStyle='#0e1a3a';x.lineWidth=1;x.strokeRect(f(pl.x)-3.5,f(pl.z)-3.5,7,7);
  }
}
function groundYSafe(){
  let GY=-999;const gr=0.42;
  for(const c of cols){
    if(!c.enabled)continue;const top=c.y+c.h;
    if(pl.y<top-0.55)continue;
    if(pl.x+gr>c.x-c.w/2&&pl.x-gr<c.x+c.w/2&&pl.z+gr>c.z-c.d/2&&pl.z-gr<c.z+c.d/2){if(top>GY)GY=top}
  }
  if(GY<-500)GY=(curMap=='parkour')?-50:0;
  return GY;
}
applyGfx();rs();requestAnimationFrame(frame);
setInterval(()=>{
  if(playing&&me&&pl&&(Math.abs(pl.x-(pl.sx||0))>.05||Math.abs(pl.z-(pl.sz||0))>.05||Math.abs(pl.r-(pl.sr||0))>.05||Math.abs(pl.y-(pl.sy2||0))>.05)){
    pl.sx=pl.x;pl.sz=pl.z;pl.sr=pl.r;pl.sy2=pl.y;
    me.update({x:+pl.x.toFixed(2),z:+pl.z.toFixed(2),y:+pl.y.toFixed(2),r:+pl.r.toFixed(2)});
  }
},120);

(async()=>{
  try{
    setLoad('Memeriksa koneksi...',0.15);await new Promise(r=>setTimeout(r,200));
    setLoad('Login & database...',0.5);const er=await ready;
    if(er&&er!=''&&er!='net'){setLoad('⚠ '+(ERR[er]||er)+' — lanjut offline (solo)',0.8);await new Promise(r=>setTimeout(r,1800))}
    else {setLoad('Login berhasil!',0.9);await new Promise(r=>setTimeout(r,250))}
    setLoad('Siap!',1);finishBoot(300);
  }catch(e){console.error('Bootstrap:',e);setLoad('⚠ Error — lanjut offline',0.8);finishBoot(500)}
})();

}catch(e){
  console.error('Init error:',e);
  setLoad('⚠ '+e.message,1);finishBoot(500);
}

if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
