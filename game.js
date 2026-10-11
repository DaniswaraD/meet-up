const $=i=>document.getElementById(i);
const cfg=Object.assign({name:'',c1:'#3a8dff',c2:'#7fd0ff',sh:0,nc:'#ffffff',nf:'monospace',rd:180,jb:0},JSON.parse(localStorage.mu||'{}'));
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
      if(e.code==='auth/operation-not-allowed'){toast('⚠ Anonymous Auth belum ON di Firebase');return'auth'}
      if(e.code==='auth/unauthorized-domain'){toast('⚠ Domain belum didaftarkan di Firebase');return'auth'}
      if(e.message==='auth-timeout'){toast('⚠ Login timeout 10s');return'auth'}
      toast('⚠ Auth gagal: '+(e.code||e.message));
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
const ERR={net:'Tidak ada internet',auth:'Firebase Auth gagal — cek Console (F12)',db:'Database tidak terhubung',timeout:'Koneksi timeout'};
const G={M:'10001 11011 10101 10001 10001 10001 10001',e:'00000 00000 01110 10001 11111 10000 01110',t:'00100 00100 01110 00100 00100 00100 00011','-':'00000 00000 00000 01110 00000 00000 00000',U:'000000100 000001110 000011111 001000100 001000100 001000100 000111000',P:'11110 10001 10001 11110 10000 10000 10000'};
document.querySelectorAll('.ttl').forEach(c=>{c.width=50;c.height=10;const x=c.getContext('2d');let ox=2;for(const ch of'Meet-UP'){const rw=G[ch].split(' ');[[1,1,'#17306b'],[0,0,ch=='U'?'#ffd23f':'#fff']].forEach(([dx,dy,col])=>{x.fillStyle=col;rw.forEach((r,j)=>[...r].forEach((v,i)=>v=='1'&&x.fillRect(ox+i+dx,1+j+dy,1,1)))});ox+=rw[0].length+1}});

// ============================== THREE ==============================
const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'low-power'}),sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,1,.1,900);
sc.add(new THREE.HemisphereLight(0xffffff,0x667788,.95));
const dl=new THREE.DirectionalLight(0xffffff,.5);dl.position.set(.5,1,.3);sc.add(dl);
function rs(){const h=240,w=Math.round(h*innerWidth/innerHeight);R.setPixelRatio(1);R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}addEventListener('resize',rs);rs();
function setRD(){const r=cfg.rd;const rl=$('rl');if(rl)rl.textContent='Render distance: '+r+'J';if(sc.fog){sc.fog.near=r;sc.fog.far=r*1.6}cam.far=r*1.7+10;cam.updateProjectionMatrix()}
const MAPS={island:[0x8fd0ff,0x5cb85c],desert:[0xf2d49b,0xe0c070],jungle:[0x4a7f5a,0x2f6b3a],snow:[0xdcecff,0xf4f8ff],parkour:[0x141433,0x1a1a3a],speedrace:[0x87ceeb,0x4a4a5a]};
let world=new THREE.Group(),cols=[],plats=[],jbs=[],curMap='island',LIM=200;

const LM=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,flatShading:true,shininess:5},o||{}));
const Mt=(g,mat,x,y,z,par)=>{const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);(par||world).add(m);return m};
const BOX=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const addCol=(x,y,z,w,h,d,opt)=>cols.push(Object.assign({x,y,z,w,h,d,enabled:true,slip:0},opt||{}));

// ============================== AMBIENT POOLS ==============================
const AMB={butterflies:[],birds:[],clouds:[],snow:[],leaves:[],fires:[],smokes:[],stars:[],orbs:[]};
function clearAmb(){for(const k in AMB){for(const m of AMB[k])sc.remove(m.m);AMB[k]=[]}}
function pool(kind,geo,mat,n){
  for(let i=0;i<n;i++){
    const m=new THREE.Mesh(geo,mat.clone());
    m.visible=false;sc.add(m);
    AMB[kind].push({m,act:false,t:0});
  }
}
function get(kind){for(const q of AMB[kind])if(!q.act)return q;return null}
function spawnAmb(kind,data){
  const q=get(kind);if(!q)return;
  q.act=true;q.t=0;Object.assign(q,data);
  q.m.visible=true;q.m.position.set(q.x,q.y,q.z);
}

// ============================== STRUCTURES ==============================
function house(hx,hz,wood,roof,opt){
  opt=opt||{};
  const w=14,h=10,d=12,t=0.5,doorW=3.5,porch=opt.porch!==false;
  const g=new THREE.Group();g.position.set(hx,0,hz);
  const wm=LM(wood),floorMat=LM(0x8b6a4b),interior=LM(0x6b4a2b),soft=LM(0x8b3a3a),cushion=LM(0xd4a0a0);
  Mt(BOX(w+.6,.5,d+.6),LM(0x3a2410),0,-.25,0,g);
  Mt(BOX(w-t*2,0.12,d-t*2),floorMat,0,.06,0,g);
  Mt(BOX(w,h,t),wm,0,h/2,-d/2,g);addCol(hx,0,hz-d/2,w,h,t);
  Mt(BOX(t,h,d),wm,-w/2,h/2,0,g);addCol(hx-w/2,0,hz,t,h,d);
  Mt(BOX(t,h,d),wm,w/2,h/2,0,g);addCol(hx+w/2,0,hz,t,h,d);
  const segW=(w-doorW)/2,segOff=doorW/2+segW/2;
  Mt(BOX(segW,h,t),wm,-segOff,h/2,d/2,g);addCol(hx-segOff,0,hz+d/2,segW,h,t);
  Mt(BOX(segW,h,t),wm,segOff,h/2,d/2,g);addCol(hx+segOff,0,hz+d/2,segW,h,t);
  Mt(BOX(doorW,h-6,t),wm,0,6+(h-6)/2,d/2,g);addCol(hx,6,hz+d/2,doorW,h-6,t);
  const wm2=LM(0x8fd0ff,{shininess:60});
  [1,-1].forEach(s=>Mt(BOX(2.4,2.8,t+.1),wm2,s*4.2,6.5,d/2+.05,g));
  if(porch){
    Mt(BOX(doorW+1,.15,3),LM(0x8b6a4b),0,.1,d/2+1.5,g);
    addCol(hx,0,hz+d/2+1.5,doorW+1,.15,3);
    Mt(BOX(.3,3,.3),LM(0x5a3a1a),-doorW/2-.5,1.5,d/2+3,g);
    Mt(BOX(.3,3,.3),LM(0x5a3a1a),doorW/2+.5,1.5,d/2+3,g);
    Mt(BOX(doorW+2,.2,3),LM(roof),0,3,d/2+1.5,g);
  }
  Mt(BOX(1.2,3,1.2),LM(0x6a5a4a),w/2-2,h+4,-d/2+2.5,g);
  const r=Mt(new THREE.ConeGeometry(w*.9,6,4),LM(roof),0,h+3,0,g);r.rotation.y=Math.PI/4;
  Mt(BOX(4,.9,1.4),soft,-3.5,.55,-3.6,g);addCol(hx-3.5,.1,hz-3.6,4,.9,1.4);
  Mt(BOX(4,.9,.4),soft,-3.5,1,-4.2,g);addCol(hx-3.5,.1,hz-4.2,4,.9,.4);
  Mt(BOX(1.6,.2,1.2),cushion,-4.3,1.05,-3.6,g);Mt(BOX(1.6,.2,1.2),cushion,-2.5,1.05,-3.6,g);
  Mt(BOX(2,.85,2),interior,0,.55,0,g);addCol(hx,.1,hz,2,.85,2);
  Mt(BOX(2.2,.15,2.2),LM(0x5a3a1a),0,1.05,0,g);
  Mt(new THREE.SphereGeometry(.15,6,4),LM(0xd0d0d0),0,1.25,0,g);
  Mt(BOX(2.2,.6,3.5),LM(0x4a6aaa),4,.4,-2.5,g);addCol(hx+4,.1,hz-2.5,2.2,.6,3.5);
  Mt(BOX(1.8,.25,.7),LM(0xffffff),4,.85,-3.8,g);
  Mt(BOX(2.2,3.5,.7),LM(0x5a3a1a),-5,1.85,-5.4,g);addCol(hx-5,.1,hz-5.4,2.2,3.5,.7);
  for(let i=0;i<3;i++)Mt(BOX(1.9,.35,.5),LM([0xd04a4a,0x4ad04a,0x4a4ad0][i]),-5,.9+i*1.1,-5.4,g);
  Mt(new THREE.CircleGeometry(2,16).rotateX(-1.5708),LM(0x4a7a8a),1,.13,2.5,g);
  Mt(new THREE.CylinderGeometry(.15,.15,4,5),LM(0x2a2a2a),5.5,2,4,g);
  Mt(new THREE.SphereGeometry(.4,6,4),new THREE.MeshBasicMaterial({color:0xffe27a}),5.5,4.2,4,g);
  world.add(g);
  return {chimX:hx+w/2-2,chimY:h+7,chimZ:hz-d/2+2.5};
}
function village(cx,cz,houses,opt){
  opt=opt||{};
  const chimneys=[];
  for(const[xo,zo,wood,roof]of houses){const ch=house(cx+xo,cz+zo,wood,roof);if(ch)chimneys.push(ch)}
  if(opt.well!==false)well(cx+(opt.wellX||0),cz+(opt.wellZ||20));
  if(opt.pathTo){
    const dx=opt.pathTo[0]-cx,dz=opt.pathTo[1]-cz;
    const len=Math.hypot(dx,dz),steps=Math.floor(len/3.2);
    for(let i=1;i<steps;i++){
      const t=i/steps,px=cx+dx*t,pz=cz+dz*t;
      Mt(BOX(2.6,.08,2.6),LM(0x8a8a80),px,.05,pz);
    }
  }
  return chimneys;
}
const CHIMNEYS=[];
function camp(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);
  for(let i=0;i<8;i++){const a=i/8*6.28;Mt(new THREE.DodecahedronGeometry(.8),LM(0x8a8a8a),Math.cos(a)*3.2,.4,Math.sin(a)*3.2,g)}
  for(let i=0;i<3;i++){const m=Mt(new THREE.CylinderGeometry(.5,.5,4,5),LM(0x6b4a2b),0,.5,0,g);m.rotation.set(Math.PI/2,0,i*2.09)}
  Mt(new THREE.SphereGeometry(.6,6,4),new THREE.MeshBasicMaterial({color:0xff8c1a}),0,.5,0,g);
  Mt(new THREE.SphereGeometry(.35,6,4),new THREE.MeshBasicMaterial({color:0xffd23f}),0,.8,0,g);
  addCol(x,0,z,2,1.2,2);
  [[4.5,3.5],[-4.5,3.5],[4.5,-3.5]].forEach(([lx,lz])=>{
    const m=Mt(new THREE.CylinderGeometry(.6,.6,2.4,6),LM(0x6b4a2b),lx,.6,lz,g);m.rotation.z=Math.PI/2;
    addCol(x+lx,.3,z+lz,2.4,.7,1.2);
  });
  const t1=Mt(new THREE.ConeGeometry(3.5,4,4),LM(0xd05040),7,2,0,g);t1.rotation.y=Math.PI/4;
  addCol(x+7,0,z,6,4,6);
  const t2=Mt(new THREE.ConeGeometry(3,3.5,4),LM(0x4a7bd0),-7,1.75,2,g);t2.rotation.y=Math.PI/4;
  addCol(x-7,0,z+2,5,3.5,5);
  world.add(g);
  return {x,z};
}
const CAMPS=[];
function bench(x,z){
  const g=new THREE.Group();g.position.set(x,.9,z);
  const wood=LM(0x8b5a2b),legs=LM(0x5a3a1a);
  Mt(BOX(4.4,.35,1.4),wood,0,0,0,g);
  Mt(BOX(4.4,1.1,.3),wood,0,.7,-.55,g);
  Mt(BOX(.3,.9,.3),legs,-1.8,-.5,0,g);Mt(BOX(.3,.9,.3),legs,1.8,-.5,0,g);
  world.add(g);
  addCol(x,.5,z,4.4,.4,1.4);
  addCol(x,1.1,z-.55,4.4,.9,.3);
}
function well(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);
  Mt(new THREE.CylinderGeometry(2.2,2.4,2,8),LM(0x8a8a8a),0,1,0,g);
  Mt(new THREE.CircleGeometry(1.7,20).rotateX(-1.5708),new THREE.MeshPhongMaterial({color:0x2a6a9a,shininess:90,transparent:true,opacity:.9}),0,1.9,0,g);
  [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]].forEach(p=>Mt(BOX(.35,4.5,.35),LM(0x8b5a2b),p[0],2.5,p[1],g));
  const r=Mt(new THREE.ConeGeometry(3.5,2,4),LM(0xa04030),0,5.8,0,g);r.rotation.y=Math.PI/4;
  Mt(new THREE.CylinderGeometry(.08,.08,3,4),LM(0x6b4a2b),0,3.5,0,g);
  Mt(new THREE.CylinderGeometry(.45,.55,.8,8),LM(0x8b5a2b),0,1.9,0,g);
  world.add(g);addCol(x,0,z,4.8,3,4.8);
}
function lamp(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);
  Mt(new THREE.CylinderGeometry(.25,.35,10,6),LM(0x2a2a2a),0,5,0,g);
  Mt(BOX(1.8,.4,1.8),LM(0x2a2a2a),0,10.2,0,g);
  Mt(new THREE.SphereGeometry(.7,6,4),new THREE.MeshBasicMaterial({color:0xffe27a}),0,10,0,g);
  const halo=new THREE.Mesh(new THREE.SphereGeometry(1.6,8,6),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.15}));
  halo.position.y=10;g.add(halo);
  world.add(g);addCol(x,0,z,.8,10,.8);
}
function igloo(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);
  Mt(new THREE.SphereGeometry(5.5,10,6,0,6.28,0,1.57),LM(0xf0f8ff),0,0,0,g);
  Mt(BOX(1.8,2.6,.7),LM(0x5a7a9a),0,1.3,5.4,g);
  Mt(new THREE.SphereGeometry(5.6,10,6,0,6.28,0,.5),LM(0xffffff),0,.1,0,g);
  Mt(BOX(3,.6,1.6),LM(0xdfeaff),0,.3,0,g);
  addCol(x,.1,z,3,.6,1.6);
  world.add(g);addCol(x,0,z,10,5,10);
}
function bigTree(x,z,c){
  const k=.85+Math.random()*.5,tr=1.1*k;
  Mt(new THREE.CylinderGeometry(1.1*k,1.5*k,6*k,7),LM(0x5a3a1a),x,3*k,z);
  Mt(new THREE.CylinderGeometry(.75*k,1*k,4*k,7),LM(0x6b4a2b),x,6*k+2*k,z);
  Mt(new THREE.ConeGeometry(4.5*k,6*k,8),LM(c),x,6*k+5*k,z);
  Mt(new THREE.ConeGeometry(3.4*k,5*k,8),LM(c),x,6*k+8*k,z);
  Mt(new THREE.ConeGeometry(2.2*k,3.5*k,8),LM(c),x,6*k+10.5*k,z);
  addCol(x,0,z,tr*2,5*k,tr*2);
}
function roundTree(x,z,c){
  const k=.9+Math.random()*.4;
  Mt(new THREE.CylinderGeometry(1*k,1.4*k,5*k,6),LM(0x5a3a1a),x,2.5*k,z);
  const fm=LM(c,{flatShading:false,shininess:15});
  Mt(new THREE.IcosahedronGeometry(3.5*k,0),fm,x,5*k+2.5*k,z);
  Mt(new THREE.IcosahedronGeometry(2.7*k,0),fm,x+1.6*k,5*k+4*k,z);
  Mt(new THREE.IcosahedronGeometry(2.5*k,0),fm,x-1.6*k,5*k+4.5*k,z);
  Mt(new THREE.IcosahedronGeometry(2.3*k,0),fm,x,5*k+5.5*k,z);
  addCol(x,0,z,2*k,4*k,2*k);
}
function pineTree(x,z){
  const k=.85+Math.random()*.5,tr=.9*k;
  Mt(new THREE.CylinderGeometry(.9*k,1.2*k,5*k,6),LM(0x4a2a1a),x,2.5*k,z);
  Mt(new THREE.ConeGeometry(4*k,7*k,7),LM(0x1a5a2a),x,5*k+3.5*k,z);
  Mt(new THREE.ConeGeometry(3*k,5*k,7),LM(0x2a6a3a),x,5*k+7.5*k,z);
  Mt(new THREE.ConeGeometry(2*k,3.5*k,7),LM(0x1a5a2a),x,5*k+10*k,z);
  addCol(x,0,z,tr*2,4*k,tr*2);
}
function rock(x,z,col){
  const s=1.5+Math.random()*1.8;
  Mt(new THREE.DodecahedronGeometry(s),LM(col||(curMap=='snow'?0xcfd8e0:0x8a8a8a)),x,s*.55,z);
  addCol(x,0,z,s*1.4,s*1.2,s*1.4);
}
function cactus(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);
  const c=LM(0x3c8f4a);
  Mt(new THREE.CylinderGeometry(.8,.9,7,7),c,0,3.5,0,g);
  Mt(new THREE.CylinderGeometry(.6,.6,3.5,6),c,1.5,4.5,0,g);
  Mt(new THREE.SphereGeometry(.7,6,4),c,1.5,6.3,0,g);
  Mt(new THREE.CylinderGeometry(.55,.55,3,6),c,-1.4,3.8,0,g);
  Mt(new THREE.SphereGeometry(.65,6,4),c,-1.4,5.3,0,g);
  world.add(g);addCol(x,0,z,1.6,7,1.6);
}
function temple(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);
  const stone=LM(0x8a8a7a),moss=LM(0x4a6a3a);
  Mt(BOX(18,3,18),stone,0,1.5,0,g);addCol(x,0,z,18,3,18);
  Mt(BOX(15,2,15),stone,0,4,0,g);addCol(x,3,z,15,2,15);
  [[-6,-6],[6,-6],[-6,6],[6,6]].forEach(p=>{Mt(BOX(1.5,10,1.5),stone,p[0],9,p[1],g);Mt(BOX(1.5,1,1.5),moss,p[0],14.5,p[1],g);addCol(x+p[0],5,z+p[1],1.5,10,1.5)});
  const r=Mt(new THREE.ConeGeometry(12,7,4),stone,0,17.5,0,g);r.rotation.y=Math.PI/4;
  for(let i=0;i<4;i++)Mt(BOX(3-i*.5,.6,2),stone,0,i*.6,9.5,g);
  Mt(BOX(2.5,1.5,2.5),LM(0x6a5a4a),0,5.5,0,g);addCol(x,3.5,z,2.5,1.5,2.5);
  Mt(new THREE.IcosahedronGeometry(.5,0),new THREE.MeshBasicMaterial({color:0xffd23f}),0,6.5,0,g);
  world.add(g);
}
function bridge(x,z,lenZ,widX){
  const g=new THREE.Group();g.position.set(x,0,z);
  const wood=LM(0x8b5a2b),dark=LM(0x5a3a1a);
  const n=Math.floor(lenZ/2);
  for(let i=0;i<n;i++)Mt(BOX(widX,.4,2),wood,0,.4,-lenZ/2+i*2+1,g);
  [-widX/2,widX/2].forEach(xr=>{
    for(let i=0;i<=n;i+=3)Mt(BOX(.4,3,.4),dark,xr,1.5,-lenZ/2+i*2,g);
    Mt(BOX(.4,.3,lenZ),dark,xr,3,0,g);
    Mt(BOX(.4,.3,lenZ),dark,xr,2,0,g);
  });
  for(let i=1;i<n;i+=4)Mt(BOX(widX*.8,3,1.5),LM(0x4a3020),0,-1.2,-lenZ/2+i*2,g);
  world.add(g);
  addCol(x,0,z,widX,.6,lenZ);
  addCol(x-widX/2,1.2,z,.4,2,lenZ);
  addCol(x+widX/2,1.2,z,.4,2,lenZ);
}
function dock(x,z,len,wid){
  const g=new THREE.Group();g.position.set(x,0,z);
  const wood=LM(0x8b5a2b);
  Mt(BOX(wid,.4,len),wood,0,.5,len/2,g);
  for(let i=0;i<len;i+=3){
    Mt(BOX(.4,3,.4),wood,wid/2-.4,.5,i,g);
    Mt(BOX(.4,3,.4),wood,-wid/2+.4,.5,i,g);
  }
  Mt(BOX(wid,.3,.4),wood,0,2.5,len,g);
  Mt(BOX(.3,1.8,.3),wood,-wid/2+.4,1.6,len,g);
  Mt(BOX(.3,1.8,.3),wood,wid/2-.4,1.6,len,g);
  world.add(g);addCol(x,.3,z+len/2,wid,.5,len);
}
function river(z,wid){
  const wm=new THREE.MeshPhongMaterial({color:0x3aa0d0,transparent:true,opacity:.85,shininess:80});
  Mt(new THREE.PlaneGeometry(500,wid).rotateX(-1.5708),wm,0,.08,z);
  const bm=LM(0xe8d8a0);
  Mt(BOX(500,.15,1.5),bm,0,.04,z-wid/2-.8);
  Mt(BOX(500,.15,1.5),bm,0,.04,z+wid/2+.8);
  for(let i=0;i<40;i++){
    const rx=-240+Math.random()*480;
    const side=Math.random()<.5?-1:1;
    const rz=z+side*(wid/2+1.5+Math.random()*2);
    Mt(new THREE.DodecahedronGeometry(.5+Math.random()*.5),LM(0x8a8a8a),rx,.3,rz);
  }
}
function frozenLake(x,z,r){
  const wm=new THREE.MeshPhongMaterial({color:0xaee0ff,transparent:true,opacity:.85,shininess:90});
  Mt(new THREE.CircleGeometry(r,32).rotateX(-1.5708),wm,x,.08,z);
  for(let i=0;i<10;i++){
    const a=Math.random()*6.28,rr=Math.random()*r*.85;
    const cx2=x+Math.cos(a)*rr,cz2=z+Math.sin(a)*rr;
    Mt(BOX(.3,.03,4+Math.random()*4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6}),cx2,.1,cz2).rotation.y=Math.random()*6.28;
  }
}

// ============================== PARKOUR ==============================
const PARKOUR=[
  [0,0,0,14,14,3],[10,1,0,5,5,0],[14,2,6,5,5,0],[15,3,13,5,5,0],[12,4,19,5,5,0],
  [5,5,23,5,5,4],[-3,6,24,5,5,0],[-10,7,21,5,5,0],[-15,8,15,5,5,2],[-17,9,8,5,5,0],
  [-17,10,0,5,5,0],[-14,11,-8,5,5,0],[-8,12,-15,5,5,4],[0,13,-19,5,5,0],[8,14,-19,5,5,2],
  [15,15,-14,5,5,0],[19,16,-6,5,5,0],[20,17,3,5,5,0],[18,18,11,5,5,1],[12,19,17,5,5,0],[4,20,21,7,7,3]
];

// ============================== BUILD ==============================
function build(n){
  sc.remove(world);world=new THREE.Group();sc.add(world);cols=[];plats=[];
  jbs.forEach(j=>sc.remove(j.m));jbs=[];
  CHIMNEYS.length=0;CAMPS.length=0;
  clearAmb();
  curMap=n;
  LIM=(n=='parkour')?60:n=='speedrace'?1080:200;
  const[sk,gr]=MAPS[n];sc.background=new THREE.Color(sk);
  sc.fog=new THREE.Fog(sk,cfg.rd,cfg.rd*1.6);setRD();
  let s=n.length*7919;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
  const disc=(r,c,y,x=0,z=0)=>Mt(new THREE.CircleGeometry(r,32).rotateX(-1.5708),LM(c),x||0,y,z||0);

  pool('clouds',new THREE.SphereGeometry(6,7,5),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85}),18);
  pool('birds',new THREE.SphereGeometry(.5,5,4),new THREE.MeshBasicMaterial({color:0x1a1a1a}),10);
  pool('butterflies',BOX(.6,.1,.7),new THREE.MeshBasicMaterial({color:0xffe27a}),25);
  pool('snow',BOX(.25,.25,.25),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9}),80);
  pool('leaves',BOX(.5,.06,.5),new THREE.MeshBasicMaterial({color:0x4fa040}),30);
  pool('smokes',new THREE.SphereGeometry(.5,6,5),new THREE.MeshBasicMaterial({color:0xcccccc,transparent:true,opacity:.5}),30);
  pool('stars',new THREE.SphereGeometry(.15,4,3),new THREE.MeshBasicMaterial({color:0xffffff}),80);
  pool('orbs',new THREE.SphereGeometry(.5,6,5),new THREE.MeshBasicMaterial({color:0x7fd0ff,transparent:true,opacity:.7}),20);

  if(n=='parkour'){
    for(let i=0;i<PARKOUR.length;i++){
      const p=PARKOUR[i],type=p[5];
      const col=type===3?0x7fd0ff:type===4?0xff5db1:type===2?0xffd23f:type===1?0x8fdcff:[0x5cb85c,0x3d8bff,0xff8c1a][i%3];
      Mt(BOX(p[3]+.2,1.2,p[4]+.2),LM(0x050510),p[0],p[1]-.25,p[2]);
      const mesh=Mt(BOX(p[3],1,p[4]),LM(col,{shininess:type===1?80:5}),p[0],p[1]+.5,p[2]);
      if(type===3)Mt(new THREE.TorusGeometry(p[3]*.55,.15,4,20).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0x7fd0ff}),p[0],p[1]+1.05,p[2]);
      if(type===4){Mt(new THREE.TorusGeometry(p[3]*.55,.2,4,20).rotateX(1.5708),new THREE.MeshBasicMaterial({color:0xff5db1}),p[0],p[1]+1.05,p[2]);Mt(new THREE.ConeGeometry(.5,1,4),new THREE.MeshBasicMaterial({color:0xffffff}),p[0],p[1]+1.6,p[2])}
      const c={x:p[0],y:p[1],z:p[2],w:p[3],h:1,d:p[4],enabled:true,slip:type===1?1:0,mesh,vanish:type===2,bounce:type===4?1:0};
      if(type===2){c.phase=rnd()*4;c.period=3.2}
      cols.push(c);plats.push(c);
    }
    for(let i=0;i<80;i++)spawnAmb('stars',{x:(Math.random()-.5)*300,y:20+Math.random()*40,z:(Math.random()-.5)*300});
    for(let i=0;i<12;i++)spawnAmb('orbs',{x:(Math.random()-.5)*80,y:3+Math.random()*15,z:(Math.random()-.5)*80,ph:Math.random()*6.28});
  } else if(n=='speedrace'){
    disc(1100,0x8fd0ff,0);
    disc(1050,0x4a7f5a,-.05);
    const trackLen=1020,trackW=12,startZ=0;
    Mt(BOX(trackW,.2,trackLen),LM(0x8b6a4b),0,.05,startZ+trackLen/2);
    [-trackW/2-.1,trackW/2+.1].forEach(xx=>Mt(BOX(.3,.25,trackLen),LM(0xffffff),xx,.15,startZ+trackLen/2));
    for(let z=5;z<trackLen;z+=12)Mt(BOX(.4,.22,6),new THREE.MeshBasicMaterial({color:0xffffff}),0,.16,startZ+z);
    for(let i=-6;i<6;i++){const c=((i+6)%2)?0xffffff:0x000000;Mt(BOX(1,.25,2),new THREE.MeshBasicMaterial({color:c}),i+.5,.18,startZ+2)}
    for(let i=-6;i<6;i++){const c=((i+6)%2)?0xffffff:0x000000;Mt(BOX(1,.25,2),new THREE.MeshBasicMaterial({color:c}),i+.5,.18,startZ+1000)}
    Mt(BOX(1.2,10,1.2),LM(0xffd23f),-trackW/2-1,5,startZ+1);
    Mt(BOX(1.2,10,1.2),LM(0xffd23f),trackW/2+1,5,startZ+1);
    Mt(BOX(trackW+2.4,1.2,1.2),LM(0xffd23f),0,10,startZ+1);
    Mt(BOX(1.5,14,1.5),LM(0xffd23f),-trackW/2-1,7,startZ+1000);
    Mt(BOX(1.5,14,1.5),LM(0xffd23f),trackW/2+1,7,startZ+1000);
    Mt(BOX(trackW+3,1.5,1.5),LM(0xffd23f),0,14,startZ+1000);
    const c2=document.createElement('canvas');c2.width=256;c2.height=64;const cx2=c2.getContext('2d');
    for(let i=0;i<256;i+=16)for(let j=0;j<64;j+=16){const cc=((i/16+j/16)%2)?'#fff':'#000';cx2.fillStyle=cc;cx2.fillRect(i,j,16,16)}
    cx2.fillStyle='#ff3d3d';cx2.font='bold 28px monospace';cx2.textAlign='center';cx2.textBaseline='middle';
    cx2.fillText('FINISH',128,32);
    const tex2=new THREE.CanvasTexture(c2);tex2.magFilter=tex2.minFilter=THREE.NearestFilter;
    const sp2=new THREE.Sprite(new THREE.SpriteMaterial({map:tex2}));
    sp2.position.set(0,8,startZ+1000.9);sp2.scale.set(8,2,1);world.add(sp2);
    for(let z=40;z<1000;z+=40){
      Mt(BOX(trackW,.3,.3),LM(0xd0d0d0),0,.7,startZ+z);
      Mt(BOX(.3,1.2,.3),LM(0xd0d0d0),-trackW/2+.3,.6,startZ+z);
      Mt(BOX(.3,1.2,.3),LM(0xd0d0d0),trackW/2-.3,.6,startZ+z);
      addCol(0,.4,startZ+z,trackW,.7,.3);
    }
    for(let i=0;i<50;i++){
      const z=Math.random()*1000,side=Math.random()<.5?-1:1;
      const x=side*(14+Math.random()*30);
      if(Math.random()<.5)pineTree(x,z);else roundTree(x,z,0x3aa84a);
    }
    for(let z=30;z<1000;z+=60)lamp(10,z);
  } else {
    if(n=='island'){disc(320,0x2a7fd0,0);disc(210,gr,.02)}
    else disc(210,gr,0);
    const gg=new THREE.CylinderGeometry(215,225,12,48,1,true),pp=gg.attributes.position;
    for(let i=0;i<pp.count;i++){const x=pp.getX(i),z=pp.getZ(i),a=Math.atan2(z,x),k=1+Math.sin(a*9)*.03;pp.setX(i,x*k);pp.setZ(i,z*k);if(pp.getY(i)>0)pp.setY(i,6+Math.abs(Math.sin(a*6))*3)}
    gg.computeVertexNormals();
    Mt(gg,LM({desert:0xc99a5b,jungle:0x1f4d2a,snow:0xcfeaff,island:0x3a8d3a}[n]||0x3a8d3a,{side:THREE.DoubleSide}),0,5.8,0);

    if(n=='island'){
      river(90,22);bridge(0,90,60,14);
      for(let i=0;i<70;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*195,x=Math.cos(a)*d,z=Math.sin(a)*d;
        if(Math.hypot(x,z)<25||Math.abs(z-90)<16)continue;
        if(Math.hypot(x-72,z-50)<40)continue;
        if(Math.hypot(x+72,z+40)<30)continue;
        if(Math.random()<.5)bigTree(x,z,0x2e8b3a);else roundTree(x,z,0x3aa84a)}
      for(let i=0;i<40;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*190,x=Math.cos(a)*d,z=Math.sin(a)*d;
        if(Math.hypot(x,z)<25||Math.abs(z-90)<16)continue;rock(x,z)}
      for(let i=0;i<250;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;
        if(Math.hypot(x,z)<15||Math.abs(z-90)<16)continue;
        Mt(new THREE.SphereGeometry(.25,4,3),new THREE.MeshBasicMaterial({color:[0xff6688,0xffee55,0xffffff][rnd()*3|0]}),x,.2,z)}
      const v1=village(72,50,[[-18,0,0x8b5a2b,0xa04030],[18,0,0xa07850,0x8b3030],[0,25,0x9b6a3b,0x6a2a2a]],{pathTo:[0,0],wellX:0,wellZ:12});
      const v2=village(-72,-40,[[-15,0,0xa07850,0x8b3030],[15,0,0x8b5a2b,0x704020]],{pathTo:[0,0],wellX:0,wellZ:15});
      CHIMNEYS.push(...v1,...v2);
      CAMPS.push(camp(20,-70),camp(-90,-60),camp(120,-60),camp(-30,-130));
      for(let i=0;i<8;i++){const a=i/8*6.28;bench(Math.cos(a)*40,Math.sin(a)*40)}
      lamp(0,-40);lamp(40,0);lamp(-40,0);lamp(0,40);
      lamp(150,40);lamp(-150,40);lamp(60,180);lamp(-60,180);
      dock(0,200,30,10);
      for(let i=0;i<20;i++){const a=rnd()*6.28,d=30+rnd()*180;
        spawnAmb('butterflies',{x:Math.cos(a)*d,y:1.5+Math.random()*2,z:Math.sin(a)*d,ph:Math.random()*6.28,cx:Math.cos(a)*d,cz:Math.sin(a)*d,r:2+Math.random()*4,spd:.6+Math.random()*.5})}
      for(let i=0;i<8;i++)spawnAmb('birds',{x:(Math.random()-.5)*300,y:25+Math.random()*15,z:(Math.random()-.5)*300,a:Math.random()*6.28,r:60+Math.random()*60,spd:.3+Math.random()*.2,y0:25+Math.random()*15});
      for(let i=0;i<14;i++)spawnAmb('clouds',{x:(Math.random()-.5)*400,y:40+Math.random()*20,z:(Math.random()-.5)*400,spd:.5+Math.random()*1,sx:1+Math.random()*1.2,sy:1+Math.random()*.4,sz:.8+Math.random()*.8});
    }
    if(n=='desert'){
      for(let i=0;i<50;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*195,x=Math.cos(a)*d,z=Math.sin(a)*d;
        if(Math.hypot(x,z)<25)continue;
        if(Math.hypot(x-72,z-50)<40)continue;
        if(Math.hypot(x+72,z+40)<30)continue;cactus(x,z)}
      for(let i=0;i<35;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*195,x=Math.cos(a)*d,z=Math.sin(a)*d;
        if(Math.hypot(x,z)<25)continue;rock(x,z,0xb8a888)}
      for(let i=0;i<15;i++){const a=rnd()*6.28,d=50+rnd()*150,x=Math.cos(a)*d,z=Math.sin(a)*d;
        const m=Mt(new THREE.SphereGeometry(8,8,5),LM(0xe6c880),x,-2,z);m.scale.y=.35}
      const v1=village(72,50,[[-18,0,0xc9a060,0x8b5030],[18,0,0xd8b070,0xa05040],[0,25,0xc9a060,0x6a3030]],{pathTo:[0,0],wellX:0,wellZ:12});
      const v2=village(-72,-40,[[-15,0,0xd8b070,0x8b5030],[15,0,0xc9a060,0xa05040]],{pathTo:[0,0],wellX:0,wellZ:15});
      CHIMNEYS.push(...v1,...v2);
      CAMPS.push(camp(-40,40),camp(80,-60),camp(30,-130));
      for(let i=0;i<8;i++){const a=i/8*6.28;bench(Math.cos(a)*40,Math.sin(a)*40)}
      lamp(0,-40);lamp(40,0);lamp(-40,0);lamp(0,40);
      lamp(140,100);lamp(-140,100);
      for(let i=0;i<6;i++)spawnAmb('birds',{x:(Math.random()-.5)*300,y:30+Math.random()*20,z:(Math.random()-.5)*300,a:Math.random()*6.28,r:70+Math.random()*70,spd:.35+Math.random()*.2,y0:30+Math.random()*20});
      for(let i=0;i<12;i++)spawnAmb('clouds',{x:(Math.random()-.5)*400,y:45+Math.random()*20,z:(Math.random()-.5)*400,spd:.6+Math.random()*.8,sx:1.2+Math.random()*1.5,sy:1+Math.random()*.4,sz:.9+Math.random()*.7});
    }
    if(n=='jungle'){
      for(let i=0;i<170;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*195,x=Math.cos(a)*d,z=Math.sin(a)*d;
        if(Math.hypot(x,z)<20)continue;
        if(Math.hypot(x-72,z-50)<40)continue;
        if(Math.hypot(x+72,z+40)<30)continue;pineTree(x,z)}
      for(let i=0;i<60;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;
        if(Math.hypot(x,z)<15)continue;Mt(new THREE.SphereGeometry(1.8+rnd()*1.2,5,4),LM(0x4f8f3f),x,.8,z)}
      for(let i=0;i<40;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*195,x=Math.cos(a)*d,z=Math.sin(a)*d;
        if(Math.hypot(x,z)<25)continue;Mt(new THREE.CylinderGeometry(.4,.5,14+rnd()*6,6),LM(0x5a3a1a),x,7,z)}
      for(let i=0;i<20;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*190,x=Math.cos(a)*d,z=Math.sin(a)*d;
        if(Math.hypot(x,z)<30)continue;rock(x,z,0x5a6a4a)}
      temple(0,-100);
      const v1=village(72,50,[[-18,0,0x6b4a2b,0x2f5a2a],[18,0,0x8b5a2b,0x8b3030],[0,25,0x6b4a2b,0x6a2a2a]],{pathTo:[0,0],wellX:0,wellZ:12});
      const v2=village(-72,-40,[[-15,0,0x8b5a2b,0x8b3030],[15,0,0x6b4a2b,0x2f5a2a]],{pathTo:[0,0],wellX:0,wellZ:15});
      CHIMNEYS.push(...v1,...v2);
      CAMPS.push(camp(15,90),camp(-60,-90),camp(120,10),camp(-120,-30));
      for(let i=0;i<8;i++){const a=i/8*6.28;bench(Math.cos(a)*40,Math.sin(a)*40)}
      lamp(0,-40);lamp(40,0);lamp(-40,0);lamp(0,40);
      lamp(50,50);lamp(-50,-50);
      for(let i=0;i<25;i++){const a=rnd()*6.28,d=30+rnd()*180;
        spawnAmb('butterflies',{x:Math.cos(a)*d,y:1.5+Math.random()*2.5,z:Math.sin(a)*d,ph:Math.random()*6.28,cx:Math.cos(a)*d,cz:Math.sin(a)*d,r:2+Math.random()*5,spd:.5+Math.random()*.6})}
      for(let i=0;i<15;i++)spawnAmb('leaves',{x:(Math.random()-.5)*200,y:8+Math.random()*10,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*2,vz:(Math.random()-.5)*2,ph:Math.random()*6.28});
    }
    if(n=='snow'){
      frozenLake(0,-100,45);
      for(let i=0;i<80;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*195,x=Math.cos(a)*d,z=Math.sin(a)*d;
        if(Math.hypot(x,z)<25||Math.hypot(x,z+100)<50)continue;
        if(Math.hypot(x-72,z-50)<40)continue;
        if(Math.hypot(x+72,z+40)<30)continue;
        pineTree(x,z)}
      for(let i=0;i<30;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*195,x=Math.cos(a)*d,z=Math.sin(a)*d;
        if(Math.hypot(x,z)<25||Math.hypot(x,z+100)<50)continue;rock(x,z,0xcfd8e0)}
      igloo(60,50);igloo(-70,60);igloo(90,90);igloo(-40,110);igloo(120,-60);
      const v1=village(-72,-40,[[-15,0,0x6b4a2b,0x5a3050],[15,0,0x8b5a2b,0x503020]],{pathTo:[0,0],wellX:0,wellZ:15});
      const v2=village(72,50,[[-18,0,0x8b5a2b,0x503020],[18,0,0x6b4a2b,0x5a3050],[0,25,0x8b5a2b,0x503020]],{pathTo:[0,0],wellX:0,wellZ:12});
      CHIMNEYS.push(...v1,...v2);
      CAMPS.push(camp(30,-160),camp(-100,30),camp(120,120));
      for(let i=0;i<8;i++){const a=i/8*6.28;bench(Math.cos(a)*40,Math.sin(a)*40)}
      well(0,-180);well(110,110);lamp(0,40);lamp(40,0);lamp(-40,0);lamp(0,-40);
      lamp(-140,-140);lamp(140,140);
      for(let i=0;i<12;i++){const a=rnd()*6.28,d=90+rnd()*130,x=Math.cos(a)*d,z=Math.sin(a)*d;
        Mt(new THREE.ConeGeometry(1.2,5,4),new THREE.MeshPhongMaterial({color:0xaee0ff,flatShading:true,transparent:true,opacity:.8}),x,2.5,z)}
      for(let i=0;i<70;i++)spawnAmb('snow',{x:(Math.random()-.5)*200,y:Math.random()*30+5,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*.8,vy:-1.5-Math.random()*2,vz:(Math.random()-.5)*.8});
      for(let i=0;i<12;i++)spawnAmb('clouds',{x:(Math.random()-.5)*400,y:40+Math.random()*20,z:(Math.random()-.5)*400,spd:.5+Math.random()*.7,sx:1.1+Math.random()*1.3,sy:1+Math.random()*.4,sz:.8+Math.random()*.7});
    }
  }
  spawnJBs();
}

// ============================== JB ==============================
const jbGeo=new THREE.SphereGeometry(.45,8,6);
function spawnJBs(){
  jbs.forEach(j=>sc.remove(j.m));jbs=[];
  const N=curMap=='parkour'?50:curMap=='speedrace'?40:150,R=curMap=='parkour'?40:curMap=='speedrace'?6:190;
  for(let i=0;i<N;i++){
    let x,y=1.2+Math.random()*2,z;
    if(curMap=='parkour'&&plats.length){
      const p=plats[Math.floor(Math.random()*plats.length)];
      x=p.x+(Math.random()-.5)*2.5;z=p.z+(Math.random()-.5)*2.5;y=p.y+1.8+Math.random();
    } else if(curMap=='speedrace'){
      x=(Math.random()-.5)*10;z=20+Math.random()*960;y=1+Math.random()*1.5;
    } else {
      const a=Math.random()*6.28,d=Math.sqrt(Math.random())*R;
      x=Math.cos(a)*d;z=Math.sin(a)*d;
    }
    const m=Mt(jbGeo,new THREE.MeshBasicMaterial({color:0x7fd0ff,transparent:true,opacity:.9}),x,y,z);
    jbs.push({m,x,y,z,ph:Math.random()*6.28});
  }
}
const jbPops=[];
function jbPop(x,y,z){
  const c=document.createElement('canvas');c.width=64;c.height=32;const cx=c.getContext('2d');
  cx.font='bold 22px monospace';cx.textAlign='center';cx.textBaseline='middle';
  cx.lineWidth=4;cx.strokeStyle='#17306b';cx.strokeText('+1',32,16);
  cx.fillStyle='#7fd0ff';cx.fillText('+1',32,16);
  const tex=new THREE.CanvasTexture(c);tex.magFilter=tex.minFilter=THREE.NearestFilter;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  sp.position.set(x,y,z);sp.scale.set(2,.9,1);sp.renderOrder=11;
  sc.add(sp);jbPops.push({sp,l:1});
}

// ============================== SPRITES ==============================
const spr=(w,h,f,sx,sy)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(sx,sy,1);s.renderOrder=9;return s};
const nameS=(n,c,f)=>spr(128,24,x=>{x.font=`bold 16px ${f}`;x.textAlign='center';x.lineWidth=4;x.strokeStyle='#000';x.strokeText(n,64,17);x.fillStyle=c;x.fillText(n,64,17)},3.2,.6);
const jbLvlOf=v=>v>=500?4:v>=100?3:v>=50?2:v>=10?1:0;
const jbLvl=()=>jbLvlOf(cfg.jb);
function chatS(t,lvl){
  const W=300,H=40,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const p=3,w=W-p*2,h=H-p*2;
  if(lvl<=0){x.fillStyle='#fff';x.fillRect(p,p,w,h);x.strokeStyle='#17306b';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
  else if(lvl==1){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#e0f2ff');g.addColorStop(1,'#a8d5ff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#3d8bff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
  else if(lvl==2){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#4ea8ff');g.addColorStop(1,'#8f5dff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
  else if(lvl==3){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ff5db1');g.addColorStop(.5,'#8f5dff');g.addColorStop(1,'#4ea8ff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2);x.fillStyle='#fff';for(let i=0;i<11;i++){x.fillRect(12+i*28,7,3,3);x.fillRect(22+i*26,H-11,3,3)}}
  else{const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'#ff5d5d');g.addColorStop(.25,'#ffd23f');g.addColorStop(.5,'#3fbf5f');g.addColorStop(.75,'#3d8bff');g.addColorStop(1,'#b05dff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2);x.fillStyle='#fff';for(let i=0;i<13;i++){x.fillRect(8+i*23,5,3,3);x.fillRect(14+i*22,H-10,3,3)}}
  x.font='bold 19px monospace';x.textAlign='center';x.textBaseline='middle';
  x.fillStyle=lvl<=0?'#000':lvl==1?'#17306b':'#fff';
  if(lvl>=2){x.shadowColor='#000';x.shadowBlur=5}
  x.fillText(t.slice(0,32),W/2,H/2+1);x.shadowBlur=0;
  const tex=new THREE.CanvasTexture(c);tex.magFilter=tex.minFilter=THREE.NearestFilter;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  s.scale.set(7.5,1,1);s.renderOrder=9;return s;
}

const IC=['..PPP... .PPYPP.. ..PPP... ...G.... .G.G.... .GGG.... ...G.... ...G....','..PPP... .PPPPP.. .WWWWW.. .WWWWW.. ..CCC... ..CCC... ...C.... ...C....','.RR..RR. RRRRRRRR RRRRRRRR RRRRRRRR .RRRRRR. ..RRRR.. ...RR... ........','...OO... ..OOOO.. .OOOOOO. .OOOOOO. ..OOOO.. ...OO... .SSSSSS. ........','R......R .R....R. ..R..R.. ...RR... ...RR... ..R..R.. .R....R. R......R','..YYYY.. .YYYYYY. YKYYYYKY YYYYYYYY YKKKKKKY .YKRRKY. ..YYYY.. ........','..YYYY.. .YYYYYY. YYKYYKYY YYSYYSYY YYSYYSYY YYYKKYYY .YKYYKY. ..YYYY..','..YYYY.. .YYYYYY. YRRYYRRY YRRYYRRY YYYYYYYY YKYYYYKY .YKKKKY. ..YYYY..'],
PAL={P:'#ff9ec4',Y:'#ffd23f',G:'#3fbf5f',W:'#ffffff',C:'#f6b26b',R:'#ff4d6d',O:'#ff8c1a',S:'#5db5ff',K:'#17306b'};
const icoC=i=>{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');IC[i].split(' ').forEach((r,j)=>[...r].forEach((v,k)=>{if(v!='.'){x.fillStyle=PAL[v];x.fillRect(k,j,1,1)}}));return c};
const icoS=i=>{const t=new THREE.CanvasTexture(icoC(i));t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(1.3,1.3,1);s.renderOrder=9;return s};

// ============================== CHARACTER ==============================
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
  const nm=nameS(o.n||o.name||'?',o.nc||'#fff',o.nf||'monospace');nm.position.y=2.1;root.add(nm);
  const icos={};[0,1,2,4].forEach(k=>{const s=icoS(k);s.position.y=3.4;s.visible=false;root.add(s);icos[k]=s});
  sc.add(root);
  return{root,m,eyes,hearts,tears,icos,x:0,z:0,y:0,vx:0,vz:0,vy:0,py:0,pvy:0,air:0,js:1,jx:1,sv:0,lean:0,flip:0,spd:0,jc:0,jh:0,ty:0,r:0,tx:0,tz:0,tr:0,e:-1,et:0,lEt:-1,lCt:-1,init:0,lx:0,lz:0,tt:0,c1:o.c1,chat:null,ce:0,jbLvl:jbLvlOf(o.jb||0)};
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
  const drift=Math.sin(t/1300)*.06;
  p.eyes.children.forEach(ch=>{ch.position.x=ch.userData.baseX+drift});
  p.hearts.visible=e==7;p.eyes.visible=e!=7;p.tears.visible=e==6;
  p.tears.children.forEach((c,i)=>c.position.y=.4-((d*1.5+i*.5)%1)*.4);
  for(const k in p.icos){p.icos[k].visible=+k==e;p.icos[k].position.y=3.4+Math.sin(t/200)*.1}
  p.m.position.y=y+(p.air?0:Math.abs(Math.sin(t/110))*.1*Math.min(1,p.spd/4));
  p.m.rotation.z=p.air?0:Math.sin(t/110)*.06*Math.min(1,p.spd/4);
  p.m.rotation.x=p.lean+p.flip;
  p.m.scale.set(sx*p.jx,sy*p.js,sx*p.jx);
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

// ============================== STATE ==============================
let me,base,rid,host=false,playing=false,joined=false,pl=null,P={},cy=0,zd=10,pitch=.6,keys={},ix=0,iy=0,run=false,jmp=false,last=performance.now(),selMap='island',roomMap='island';
let raceTimer=0,raceRunning=false,raceFinished=false,raceArmed=false;
const show=id=>SCREENS.forEach(s=>$(s).classList.toggle('hide',s!=id));
const menuG=new THREE.Group();
menuG.add(Mt(new THREE.CylinderGeometry(3.2,3.2,.5,24),LM(0xffffff,{shininess:30}),0,-.25,0),
         Mt(new THREE.CylinderGeometry(3.5,3.7,.4,24),LM(0xb8d8ff,{shininess:60}),0,-.6,0));
sc.add(menuG);

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
  sc.background=new THREE.Color(0x8fd0ff);sc.fog=null;
  pl.x=pl.z=pl.y=0;pl.vx=pl.vz=pl.vy=0;pl.r=0;
  menuG.add(pl.root);zd=5;
}
build('island');setSelf();menuMode();
document.querySelectorAll('.bk').forEach(b=>b.onclick=()=>show('menu'));
$('ppbk').onclick=()=>show('menu');

// ---------- UI ----------
const SHAPES=['Setengah','Kotak','Segitiga','Bola','Silinder','Piramida','Permata'];
const shGrid=$('shapes');
SHAPES.forEach((n,i)=>{const b=document.createElement('button');b.textContent=n;b.className=cfg.sh==i?'on':'';b.onclick=()=>{cfg.sh=i;sv();setSelf();[...shGrid.children].forEach((x,j)=>x.classList.toggle('on',j==i))};shGrid.append(b)});
const FONTS=['monospace','sans-serif','serif','cursive','Impact','Georgia','Verdana','Trebuchet MS','Courier New'];
const fGrid=$('fonts');
FONTS.forEach(n=>{const b=document.createElement('button');b.textContent=n;b.style.fontFamily=n;b.className=cfg.nf==n?'on':'';b.onclick=()=>{cfg.nf=n;sv();setSelf();[...fGrid.children].forEach(x=>x.classList.toggle('on',x.textContent==n))};fGrid.append(b)});
const MU=[['island','Pulau'],['desert','Gurun'],['jungle','Jungle'],['snow','Salju'],['parkour','Parkour'],['speedrace','Balapan Lari']];
const mGrid=$('maps');
MU.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.className=selMap==k?'on':'';b.onclick=()=>{selMap=k;[...mGrid.children].forEach((x,j)=>x.classList.toggle('on',MU[j][0]==k))};mGrid.append(b)});
const ppGrid=$('playMaps');
MU.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.onclick=async()=>{selMap=k;$('mp').disabled=true;await join('g_'+k,k,false);$('mp').disabled=false;start(k)};ppGrid.append(b)});
for(const k of['c1','c2','nc']){const el=$(k);el.value=cfg[k];el.oninput=()=>{cfg[k]=el.value;sv();setSelf()}}
$('rd').value=cfg.rd;$('rd').oninput=e=>{cfg.rd=+e.target.value;sv();setRD()};
$('sb').onclick=()=>{$('set').classList.add('hide');playing?$('pause').classList.remove('hide'):show('menu')};
$('ms').onclick=()=>show('skin');$('mr').onclick=()=>show('croom');$('mt').onclick=()=>show('set');
$('mp').onclick=()=>show('playpick');
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e});$('md').onclick=()=>dp?dp.prompt():alert('Menu browser > "Tambahkan ke layar utama"');
$('ng').onclick=()=>{const v=$('nm').value.trim().slice(0,14);if(!v)return;cfg.name=v;sv();setSelf();show('menu')};

// ---------- NET ----------
async function join(id,map,h){const er=await ready;if(er&&er!='timeout'&&er!='net'&&er!=''){toast(ERR[er]);return 0}
  try{return await join2(id,map,h)}catch(e){toast('Gagal masuk: '+(e.code||e.message));return 0}}
async function join2(id,map,h){
  rid=id;host=h;roomMap=map;base=db.ref('rooms/'+id);me=base.child('players/'+uid);me.onDisconnect().remove();
  await me.set({n:cfg.name,c1:cfg.c1,c2:cfg.c2,sh:cfg.sh,nc:cfg.nc,nf:cfg.nf,x:0,z:0,y:0,r:0,e:-1,et:0,ct:0,ch:' ',jb:cfg.jb});
  pl.x=pl.z=pl.y=0;joined=true;base.child('players').on('value',onPl);
  if(id[0]!='g'){base.child('meta').on('value',s=>{const m=s.val();if(m&&m.started&&!playing)start(m.map)})}
  return 1
}
function onPl(s){
  const v=s.val()||{};if(joined&&!v[uid]){leave();alert('Kamu keluar dari room');return}
  $('ll').innerHTML='';
  for(const id in v){
    const r=document.createElement('div');r.className='row';
    r.innerHTML=`<i style="background:${v[id].c1}"></i><b></b>`;
    r.lastChild.textContent=v[id].n+(id==uid?' (kamu)':'');
    if(host&&id!=uid){const x=document.createElement('button');x.className='kick';x.textContent=KX;x.onclick=()=>base.child('players/'+id).remove();r.append(x)}
    $('ll').append(r);
  }
  for(const id in v){
    if(id==uid)continue;
    const d=v[id];let p=P[id];
    if(!p){p=P[id]=mkP(d);p.x=d.x;p.z=d.z;p.y=d.y||0;
      if((d.jb||0)>=500)toast('🎉 '+d.n+' Memiliki '+d.jb+' JB Memainkan gamenya!!!')}
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
  if(map=='speedrace'){pl.x=0;pl.z=-3;pl.y=0}
  else if(map=='parkour'){pl.x=0;pl.z=0;pl.y=1}
  else {pl.x=0;pl.z=0;pl.y=0}
  pl.vx=pl.vz=pl.vy=0;pl.r=0;
  raceTimer=0;raceRunning=false;raceFinished=false;raceArmed=true;
  ['menu','playpick','lobby'].forEach(i=>$(i).classList.add('hide'));
  $('hud').classList.remove('hide');zd=12;
}
async function leave(){
  joined=false;playing=false;
  if(base){base.child('players').off();base.child('meta').off();
    try{if(host&&rid[0]!='g')await base.remove();else await me.remove()}catch(e){}}
  for(const id in P)sc.remove(P[id].root);P={};base=me=null;
  $('hud').classList.add('hide');$('pause').classList.add('hide');
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

// ---------- HOTBAR ----------
IC.forEach((ic,i)=>{const b=document.createElement('button');b.append(icoC(i));b.insertAdjacentHTML('beforeend','<small>'+(i+1)+'</small>');b.onclick=()=>emo(i);$('bar').append(b)});
function emo(i){if(!playing||!pl)return;const n=pl.e==i?-1:i;setE(pl,n);me&&me.update({e:n,et:TS});[...$('bar').children].forEach((b,j)=>b.classList.toggle('on',j==n));setTimeout(()=>[...$('bar').children].forEach(b=>b.classList.remove('on')),700)}
function send(){if(!pl)return;const t=$('ci').value.trim();if(t){say(pl,t);me&&me.update({ch:t,ct:TS})}$('ci').value='';$('chat').classList.add('hide')}
$('cb').onclick=()=>{$('chat').classList.toggle('hide');$('ci').focus()};
$('cs').onclick=send;$('ci').onkeydown=e=>{if(e.key=='Enter')send()};

// ---------- INPUT ----------
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;keys[e.code]=1;if(e.key>='1'&&e.key<='8')emo(+e.key-1);
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
const jm=e=>{const t=e.targetTouches[0],r=joy.getBoundingClientRect(),dx=t.clientX-r.left-60,dy=t.clientY-r.top-60,l=Math.min(1,Math.hypot(dx,dy)/50),a=Math.atan2(dy,dx);
  ix=Math.cos(a)*l;iy=-Math.sin(a)*l;kn.style.left=40+Math.cos(a)*l*40+'px';kn.style.top=40+Math.sin(a)*l*40+'px'};
joy.ontouchstart=joy.ontouchmove=e=>{e.stopPropagation();jm(e)};
joy.ontouchend=()=>{ix=iy=0;kn.style.left=kn.style.top='40px'};
$('jb').ontouchstart=()=>jmp=true;
$('rb').ontouchstart=()=>{run=!run;$('rb').classList.toggle('s',!run)};

// ============================== PHYSICS ==============================
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

// ============================== LOOP ==============================
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

    let a=ix+(keys.KeyD?1:0)-(keys.KeyA?1:0),b=iy+(keys.KeyW?1:0)-(keys.KeyS?1:0);
    const l=Math.hypot(a,b);if(l>1)a/=l,b/=l;
    const mx=Math.cos(cy)*a-Math.sin(cy)*b,mz=-Math.sin(cy)*a-Math.cos(cy)*b;
    const sp=(run||keys.ShiftLeft)?9:5;
    const{GY,GSLIP,GBOUNCE}=groundY();
    const fric=GSLIP?2.5:24;
    pl.vx+=(mx*sp-pl.vx)*Math.min(1,dt*fric);
    pl.vz+=(mz*sp-pl.vz)*Math.min(1,dt*fric);
    pl.x+=pl.vx*dt;pl.z+=pl.vz*dt;
    resolveH();
    if(a||b){const t=Math.atan2(mx,mz);let d=t-pl.r;d=Math.atan2(Math.sin(d),Math.cos(d));pl.r+=d*Math.min(1,dt*12)}
    const jn=jmp||keys.Space;
    if(pl.y<=GY+.01)pl.jc=0;
    if(jn&&(pl.y<=GY+.01?1:!pl.jh)&&pl.jc<2){pl.vy=pl.jc?9:8;pl.jc++}
    pl.jh=!!jn;jmp=false;
    pl.vy-=22*dt;pl.y+=pl.vy*dt;
    if(pl.y<=GY){
      if(GBOUNCE&&pl.pvy<-1){
        pl.vy=16;pl.jc=0;
        puff(pl.x,pl.z,12,'#ff5db1',4);
        for(let k=0;k<8;k++){const ang=k/8*6.28;trail(pl.x+Math.cos(ang)*.8,pl.z+Math.sin(ang)*.8,'#ff5db1')}
      } else {pl.y=GY;if(pl.vy<0)pl.vy=0}
    }
    if(curMap=='parkour'&&pl.y<-30){pl.x=pl.z=0;pl.y=3;pl.vx=pl.vz=pl.vy=0}
    const rr=Math.hypot(pl.x,pl.z);
    if(rr>LIM){pl.x*=LIM/rr;pl.z*=LIM/rr}

    for(let i=jbs.length-1;i>=0;i--){
      const j=jbs[i];
      const dx=pl.x-j.x,dz=pl.z-j.z,dy=pl.y+1-j.m.position.y;
      const d2=dx*dx+dz*dz+dy*dy;
      if(d2<9&&d2>2.4){
        const dd=Math.sqrt(d2)||.01;
        const pull=Math.min(1,dt*6/dd);
        j.x+=dx*pull;j.z+=dz*pull;j.y+=dy*pull*.6;
        j.m.position.x=j.x;j.m.position.z=j.z;
      }
      j.m.position.y=j.y+Math.sin(now/500+j.ph)*.3;
      j.m.rotation.y=now/1000+j.ph;
      const pulse=0.9+Math.sin(now/220+j.ph)*0.18;
      j.m.scale.setScalar(pulse);
      if(d2<2.4){
        const oldLvl=jbLvl();
        cfg.jb++;sv();$('jbn').textContent=cfg.jb+' JB';
        jbPop(j.x,j.y+.5,j.z);
        for(let k=0;k<10;k++){const ang=k/10*6.28;puff(j.x+Math.cos(ang)*.6,j.z+Math.sin(ang)*.6,1,'#7fd0ff',1.5,j.m.position.y)}
        sc.remove(j.m);jbs.splice(i,1);
        pl.jbLvl=jbLvlOf(cfg.jb);me&&me.update({jb:cfg.jb});
        if(jbLvl()>oldLvl)toast('🎉 Chat bubble baru terbuka! ('+cfg.jb+' JB)');
      }
    }

    if(curMap=='speedrace'){
      if(raceArmed&&!raceFinished){
        if(pl.spd>0.5||pl.z>1){raceArmed=false;raceRunning=true;raceTimer=0}
      }
      if(raceRunning&&!raceFinished){
        raceTimer+=dt;
        $('raceTimer').classList.remove('hide');
        $('raceTimer').textContent=raceTimer.toFixed(2)+'s';
        if(pl.z>=1000){
          raceFinished=true;raceRunning=false;
          let reward=10,label='Selesai';
          if(raceTimer<80){reward=100;label='🏆 LUAR BIASA!'}
          else if(raceTimer<110){reward=50;label='🥇 Bagus!'}
          else if(raceTimer<150){reward=20;label='👍 OK!'}
          cfg.jb+=reward;sv();$('jbn').textContent=cfg.jb+' JB';
          me&&me.update({jb:cfg.jb});
          toast(label+' Waktu: '+raceTimer.toFixed(2)+'s — +'+reward+' JB!');
          raceTimer=0;
        }
      } else if(raceFinished){
        $('raceTimer').classList.remove('hide');
        $('raceTimer').textContent='✓ '+raceTimer.toFixed(2)+'s';
      }
    } else $('raceTimer').classList.add('hide');

    for(const q of AMB.butterflies){
      if(!q.act)continue;q.t+=dt;
      const a=q.t*q.spd+q.ph;
      q.m.position.set(q.cx+Math.cos(a)*q.r,q.y+Math.sin(q.t*3)*.4,q.cz+Math.sin(a)*q.r);
      q.m.rotation.y=-a;q.m.rotation.z=Math.sin(q.t*8)*.4;
    }
    for(const q of AMB.birds){
      if(!q.act)continue;q.t+=dt;
      const a=q.t*q.spd+q.ph;
      q.m.position.set(Math.cos(a)*q.r,q.y0+Math.sin(q.t*2)*1.5,Math.sin(a)*q.r);
      q.m.rotation.y=-a+Math.PI/2;
    }
    for(const q of AMB.clouds){
      if(!q.act)continue;q.t+=dt;
      q.m.position.x+=q.spd*dt;
      if(q.m.position.x>250)q.m.position.x=-250;
      q.m.scale.set(q.sx,q.sy,q.sz);
    }
    for(const q of AMB.snow){
      if(!q.act)continue;q.t+=dt;
      q.m.position.x+=q.vx*dt;q.m.position.y+=q.vy*dt;q.m.position.z+=q.vz*dt;
      q.m.rotation.x+=dt*2;q.m.rotation.y+=dt*1.5;
      if(q.m.position.y<0)spawnAmb('snow',{x:(Math.random()-.5)*200,y:28+Math.random()*4,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*.8,vy:-1.5-Math.random()*2,vz:(Math.random()-.5)*.8});
    }
    for(const q of AMB.leaves){
      if(!q.act)continue;q.t+=dt;
      q.m.position.x+=(q.vx+Math.sin(q.t*2+q.ph)*1.2)*dt;
      q.m.position.y+=(-1.5-Math.sin(q.t)*.5)*dt;
      q.m.position.z+=q.vz*dt;
      q.m.rotation.x+=dt*3;q.m.rotation.z+=dt*2;
      if(q.m.position.y<0)spawnAmb('leaves',{x:(Math.random()-.5)*200,y:12+Math.random()*8,z:(Math.random()-.5)*200,vx:(Math.random()-.5)*2,vz:(Math.random()-.5)*2,ph:Math.random()*6.28});
    }
    for(const c of CAMPS){
      if(Math.random()<dt*8){
        const q=PT.find(o=>o.l<=0);
        if(q){q.l=.6+Math.random()*.4;q.vx=(Math.random()-.5)*.6;q.vz=(Math.random()-.5)*.6;q.vy=2.5+Math.random()*2;
          q.m.material.color.set(Math.random()<.5?'#ff8c1a':'#ffd23f');
          q.m.position.set(c.x+(Math.random()-.5)*.6,.8,c.z+(Math.random()-.5)*.6);q.m.visible=true}
        const s=AMB.smokes.find(o=>!o.act);
        if(s&&Math.random()<.5){s.act=true;s.t=0;s.x=c.x;s.y=1.5;s.z=c.z;s.vx=(Math.random()-.5)*.4;s.vy=1.5+Math.random();s.vz=(Math.random()-.5)*.4;s.m.visible=true;s.m.position.set(s.x,s.y,s.z)}
      }
    }
    for(const s of AMB.smokes){
      if(!s.act)continue;s.t+=dt;
      s.m.position.x+=s.vx*dt;s.m.position.y+=s.vy*dt;s.m.position.z+=s.vz*dt;
      const k=Math.max(0,1-s.t/3);
      s.m.material.opacity=k*.5;s.m.scale.setScalar(1+(1-k)*2);
      if(s.t>3){s.act=false;s.m.visible=false}
    }
    for(const ch of CHIMNEYS){
      if(Math.random()<dt*4){
        const s=AMB.smokes.find(o=>!o.act);
        if(s){s.act=true;s.t=0;s.vx=(Math.random()-.5)*.3;s.vy=.8+Math.random()*.4;s.vz=(Math.random()-.5)*.3;
          s.m.visible=true;s.m.position.set(ch.chimX,ch.chimY,ch.chimZ)}
      }
    }
    for(const q of AMB.stars){if(!q.act)continue;q.m.material.opacity=.6+Math.sin(now/500+q.m.position.x)*.4}
    for(const q of AMB.orbs){
      if(!q.act)continue;q.t+=dt;
      q.m.position.y+=Math.sin(q.t*1.5+q.ph)*dt*1.5;
      q.m.position.x+=Math.cos(q.t*.7+q.ph)*dt;
      q.m.position.z+=Math.sin(q.t*.7+q.ph)*dt;
    }
  } else {pl.r=0;pl.vx=pl.vz=0}

  const all=[pl,...Object.values(P)];
  for(const p of all){
    if(p!==pl)p.root.visible=playing;
    if(p!==pl){
      p.x+=(p.tx-p.x)*Math.min(1,dt*10);p.z+=(p.tz-p.z)*Math.min(1,dt*10);p.y+=((p.ty||0)-p.y)*Math.min(1,dt*14);
      let d=p.tr-p.r;d=Math.atan2(Math.sin(d),Math.cos(d));p.r+=d*Math.min(1,dt*10);
    }
    if(Math.hypot(p.x-p.lx,p.z-p.lz)>.02&&p.y<.1&&(p.tt-=dt)<=0){trail(p.x,p.z,p.c1);p.tt=.12}
    p.spd=Math.hypot(p.x-p.lx,p.z-p.lz)/Math.max(dt,.001);
    p.lx=p.x;p.lz=p.z;jelly(p,dt);
    p.root.position.set(p.x,p.y,p.z);p.m.rotation.y=p.r;animE(p,now);
  }
  PT.forEach(q=>{if(q.l>0){q.l-=dt;q.vy-=14*dt;q.m.position.x+=q.vx*dt;q.m.position.y+=q.vy*dt;q.m.position.z+=q.vz*dt;
    q.m.material.opacity=Math.min(1,q.l*3);q.m.scale.setScalar(Math.max(.2,q.l*1.5));if(q.l<=0)q.m.visible=false}});
  TR.forEach(t=>{if(t.l>0){t.l-=dt;t.m.material.opacity=Math.max(0,t.l/2.5)*.7;t.m.scale.setScalar(.6+.4*t.l/2.5);if(t.l<=0)t.m.visible=false}});
  for(let i=jbPops.length-1;i>=0;i--){const p=jbPops[i];p.l-=dt;p.sp.position.y+=dt*2.2;p.sp.material.opacity=Math.max(0,p.l);if(p.l<=0){sc.remove(p.sp);jbPops.splice(i,1)}}
  if(playing){
    const cp=Math.cos(pitch);
    cam.position.set(pl.x+Math.sin(cy)*cp*zd,pl.y+1+Math.sin(pitch)*zd,pl.z+Math.cos(cy)*cp*zd);
    cam.lookAt(pl.x,pl.y+.8,pl.z);
  } else {
    menuG.rotation.y+=dt*.55;
    const t=now/1000;
    cam.position.set(Math.sin(t*.3)*.4,2.1,5.2);cam.lookAt(0,.85,0);
  }
  R.render(sc,cam);
  if(playing){
    const x=$('mm').getContext('2d'),f=v=>(v/LIM+1)*48;
    x.fillStyle='#'+(MAPS[curMap]?MAPS[curMap][1]:0x2f6b3a).toString(16).padStart(6,'0');
    x.fillRect(0,0,96,96);
    x.fillStyle='#7fd0ff';
    for(const j of jbs){if(j.x*j.x+j.z*j.z<LIM*LIM)x.fillRect(f(j.x)-1,f(j.z)-1,2,2)}
    for(const id in P){x.fillStyle='#e22';x.fillRect(f(P[id].x)-2,f(P[id].z)-2,4,4)}
    x.fillStyle='#ff0';x.fillRect(f(pl.x)-2,f(pl.z)-2,4,4);
    x.strokeStyle='#000';x.strokeRect(f(pl.x)-3,f(pl.z)-3,6,6);
  }
}
requestAnimationFrame(frame);
setInterval(()=>{
  if(playing&&me&&pl&&(Math.abs(pl.x-(pl.sx||0))>.05||Math.abs(pl.z-(pl.sz||0))>.05||Math.abs(pl.r-(pl.sr||0))>.05||Math.abs(pl.y-(pl.sy2||0))>.05)){
    pl.sx=pl.x;pl.sz=pl.z;pl.sr=pl.r;pl.sy2=pl.y;
    me.update({x:+pl.x.toFixed(2),z:+pl.z.toFixed(2),y:+pl.y.toFixed(2),r:+pl.r.toFixed(2)});
  }
},120);

(async()=>{
  try{
    setLoad('Memeriksa koneksi...',0.15);
    await new Promise(r=>setTimeout(r,200));
    setLoad('Login & database...',0.5);
    const er=await ready;
    if(er&&er!=''&&er!='net'){
      setLoad('⚠ '+(ERR[er]||er)+' — lanjut offline (solo)',0.8);
      await new Promise(r=>setTimeout(r,1800))
    }
    else {setLoad('Login berhasil!',0.9);await new Promise(r=>setTimeout(r,250))}
    setLoad('Siap!',1);finishBoot(300);
  }catch(e){console.error('Bootstrap:',e);setLoad('⚠ Error — lanjut offline',0.8);finishBoot(500)}
})();

}catch(e){
  console.error('Init error:',e);
  setLoad('⚠ '+e.message,1);
  finishBoot(500);
}

if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
