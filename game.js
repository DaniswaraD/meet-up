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
        new Promise((_,rej)=>setTimeout(()=>rej(new Error('auth-timeout')),4000))
      ]);
    }catch(e){return'auth'}
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
  new Promise(r=>setTimeout(()=>r('timeout'),8000))
]);
const ERR={net:'Tidak ada internet',auth:'Firebase Auth gagal',db:'Database tidak terhubung',timeout:'Koneksi timeout'};
const G={M:'10001 11011 10101 10001 10001 10001 10001',e:'00000 00000 01110 10001 11111 10000 01110',t:'00100 00100 01110 00100 00100 00100 00011','-':'00000 00000 00000 01110 00000 00000 00000',U:'000000100 000001110 000011111 001000100 001000100 001000100 000111000',P:'11110 10001 10001 11110 10000 10000 10000'};
document.querySelectorAll('.ttl').forEach(c=>{c.width=50;c.height=10;const x=c.getContext('2d');let ox=2;for(const ch of'Meet-UP'){const rw=G[ch].split(' ');[[1,1,'#17306b'],[0,0,ch=='U'?'#ffd23f':'#fff']].forEach(([dx,dy,col])=>{x.fillStyle=col;rw.forEach((r,j)=>[...r].forEach((v,i)=>v=='1'&&x.fillRect(ox+i+dx,1+j+dy,1,1)))});ox+=rw[0].length+1}});

// ============================== THREE ==============================
const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:true});
const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,1,.1,900);
const hemiLight=new THREE.HemisphereLight(0xffffff,0x667788,.95);sc.add(hemiLight);
const dl=new THREE.DirectionalLight(0xffffff,.6);dl.position.set(.5,1,.3);sc.add(dl);
function rs(){const h=240,w=Math.round(h*innerWidth/innerHeight);R.setPixelRatio(1);R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}addEventListener('resize',rs);rs();
function setRD(){const r=cfg.rd;const rl=$('rl');if(rl)rl.textContent='Render distance: '+r+'J';if(sc.fog){sc.fog.near=r;sc.fog.far=r*1.6}cam.far=r*1.7+10;cam.updateProjectionMatrix()}
const MAPS={island:[0x8fd0ff,0x5cb85c],desert:[0xf2d49b,0xe0c070],jungle:[0x4a7f5a,0x2f6b3a],snow:[0xdcecff,0xf4f8ff],parkour:[0x141433,0x1a1a3a]};
let world=new THREE.Group(),cols=[],plats=[],jbs=[],curMap='island',LIM=200;

// === Day/Night ===
let timeOfDay=0.15; // 0=noon, 0.25=sunset, 0.5=midnight, 0.75=sunrise
const DAY_LENGTH=240; // seconds for full cycle
const baseSky=new THREE.Color(0x8fd0ff);
const sunsetSky=new THREE.Color(0xff9a5a);
const nightSky=new THREE.Color(0x0a0a2a);

// === JB Types ===
const JBT={
  common:{col:0x7fd0ff,size:.45,val:1,weight:75,label:'+1'},
  rare:{col:0xb05dff,size:.58,val:5,weight:20,label:'+5'},
  legendary:{col:0xffd23f,size:.72,val:20,weight:5,label:'+20'}
};
function pickJBType(){const r=Math.random()*100;let a=0;for(const k in JBT){a+=JBT[k].weight;if(r<a)return k}return'common'}

const LM=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,flatShading:true,shininess:5},o||{}));
const Mt=(g,mat,x,y,z,par)=>{const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);(par||world).add(m);return m};
const BOX=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
const addCol=(x,y,z,w,h,d,opt)=>cols.push(Object.assign({x,y,z,w,h,d,enabled:true,slip:0,sittable:false},opt||{}));
// Function cek tabrakan spawn pad — dipertahankan namanya walau spawner dihapus (tidak dipakai lagi)
function hitPad(){return false}

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
  Mt(BOX(4,.9,1.4),soft,-3.5,.55,-3.6,g);addCol(hx-3.5,.1,hz-3.6,4,.9,1.4,{sittable:true,facing:Math.PI});
  Mt(BOX(4,.9,.4),soft,-3.5,1,-4.2,g);addCol(hx-3.5,.1,hz-4.2,4,.9,.4);
  Mt(BOX(1.6,.2,1.2),cushion,-4.3,1.05,-3.6,g);Mt(BOX(1.6,.2,1.2),cushion,-2.5,1.05,-3.6,g);
  Mt(BOX(2,.85,2),interior,0,.55,0,g);addCol(hx,.1,hz,2,.85,2);
  Mt(BOX(2.2,.15,2.2),LM(0x5a3a1a),0,1.05,0,g);
  Mt(new THREE.SphereGeometry(.15,6,4),LM(0xd0d0d0),0,1.25,0,g);
  Mt(BOX(2.2,.6,3.5),LM(0x4a6aaa),4,.4,-2.5,g);addCol(hx+4,.1,hz-2.5,2.2,.6,3.5,{sittable:true,facing:-Math.PI/2});
  Mt(BOX(1.8,.25,.7),LM(0xffffff),4,.85,-3.8,g);
  Mt(BOX(2.2,3.5,.7),LM(0x5a3a1a),-5,1.85,-5.4,g);addCol(hx-5,.1,hz-5.4,2.2,3.5,.7);
  for(let i=0;i<3;i++)Mt(BOX(1.9,.35,.5),LM([0xd04a4a,0x4ad04a,0x4a4ad0][i]),-5,.9+i*1.1,-5.4,g);
  Mt(new THREE.CircleGeometry(2,16).rotateX(-1.5708),LM(0x4a7a8a),1,.13,2.5,g);
  const lg=new THREE.Group();lg.position.set(5.5,0,4);g.add(lg);
  Mt(new THREE.CylinderGeometry(.15,.15,4,5),LM(0x2a2a2a),0,2,0,lg);
  const bulb=Mt(new THREE.SphereGeometry(.4,6,4),new THREE.MeshBasicMaterial({color:0xffe27a}),0,4.2,0,lg);
  bulb.userData.isLampGlow=true;
  const halo=Mt(new THREE.SphereGeometry(1.4,8,6),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:0}),0,4.2,0,lg);
  halo.userData.isLampHalo=true;
  world.add(g);
}
function village(cx,cz,houses,opt){
  opt=opt||{};
  for(const[xo,zo,wood,roof]of houses)house(cx+xo,cz+zo,wood,roof);
  if(opt.well!==false)well(cx+(opt.wellX||0),cz+(opt.wellZ||20));
  if(opt.pathTo){
    const dx=opt.pathTo[0]-cx,dz=opt.pathTo[1]-cz;
    const len=Math.hypot(dx,dz),steps=Math.floor(len/3.2);
    for(let i=1;i<steps;i++){
      const t=i/steps,px=cx+dx*t,pz=cz+dz*t;
      Mt(BOX(2.6,.08,2.6),LM(0x8a8a80),px,.05,pz);
    }
  }
}
function camp(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);
  for(let i=0;i<8;i++){const a=i/8*6.28;Mt(new THREE.DodecahedronGeometry(.8),LM(0x8a8a8a),Math.cos(a)*3.2,.4,Math.sin(a)*3.2,g)}
  for(let i=0;i<3;i++){const m=Mt(new THREE.CylinderGeometry(.5,.5,4,5),LM(0x6b4a2b),0,.5,0,g);m.rotation.set(Math.PI/2,0,i*2.09)}
  const fire=Mt(new THREE.SphereGeometry(.6,6,4),new THREE.MeshBasicMaterial({color:0xff8c1a}),0,.5,0,g);
  fire.userData.isFire=true;
  const core=Mt(new THREE.SphereGeometry(.35,6,4),new THREE.MeshBasicMaterial({color:0xffd23f}),0,.8,0,g);
  core.userData.isFire=true;
  addCol(x,0,z,2,1.2,2);
  [[4.5,3.5],[-4.5,3.5],[4.5,-3.5]].forEach(([lx,lz])=>{
    const m=Mt(new THREE.CylinderGeometry(.6,.6,2.4,6),LM(0x6b4a2b),lx,.6,lz,g);m.rotation.z=Math.PI/2;
    addCol(x+lx,.3,z+lz,2.4,.7,1.2,{sittable:true,facing:Math.atan2(-lx,-lz)});
  });
  const t1=Mt(new THREE.ConeGeometry(3.5,4,4),LM(0xd05040),7,2,0,g);t1.rotation.y=Math.PI/4;
  addCol(x+7,0,z,6,4,6);
  const t2=Mt(new THREE.ConeGeometry(3,3.5,4),LM(0x4a7bd0),-7,1.75,2,g);t2.rotation.y=Math.PI/4;
  addCol(x-7,0,z+2,5,3.5,5);
  world.add(g);
}
function bench(x,z){
  const g=new THREE.Group();g.position.set(x,.9,z);
  const wood=LM(0x8b5a2b),legs=LM(0x5a3a1a);
  Mt(BOX(4.4,.35,1.4),wood,0,0,0,g);
  Mt(BOX(4.4,1.1,.3),wood,0,.7,-.55,g);
  Mt(BOX(.3,.9,.3),legs,-1.8,-.5,0,g);Mt(BOX(.3,.9,.3),legs,1.8,-.5,0,g);
  world.add(g);
  addCol(x,.5,z,4.4,.4,1.4,{sittable:true,facing:0});
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
  const bulb=Mt(new THREE.SphereGeometry(.7,6,4),new THREE.MeshBasicMaterial({color:0xffe27a}),0,10,0,g);
  bulb.userData.isLampGlow=true;
  const halo=Mt(new THREE.SphereGeometry(2,8,6),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:0}),0,10,0,g);
  halo.userData.isLampHalo=true;
  world.add(g);addCol(x,0,z,.8,10,.8);
}
function igloo(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);
  Mt(new THREE.SphereGeometry(5.5,10,6,0,6.28,0,1.57),LM(0xf0f8ff),0,0,0,g);
  Mt(BOX(1.8,2.6,.7),LM(0x5a7a9a),0,1.3,5.4,g);
  Mt(new THREE.SphereGeometry(5.6,10,6,0,6.28,0,.5),LM(0xffffff),0,.1,0,g);
  Mt(BOX(3,.6,1.6),LM(0xdfeaff),0,.3,0,g);
  addCol(x,.1,z,3,.6,1.6,{sittable:true,facing:Math.PI});
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
  [5,5,23,5,5,1],[-3,6,24,5,5,0],[-10,7,21,5,5,0],[-15,8,15,5,5,2],[-17,9,8,5,5,0],
  [-17,10,0,5,5,0],[-14,11,-8,5,5,0],[-8,12,-15,5,5,1],[0,13,-19,5,5,0],[8,14,-19,5,5,2],
  [15,15,-14,5,5,0],[19,16,-6,5,5,0],[20,17,3,5,5,0],[18,18,11,5,5,1],[12,19,17,5,5,0],[4,20,21,7,7,3]
];

// ============================== FIREFLIES + STARS ==============================
const FF=[];let stars;
function spawnFireflies(){
  FF.forEach(f=>sc.remove(f.mesh));FF.length=0;
  if(curMap=='parkour')return;
  const N=50;
  for(let i=0;i<N;i++){
    const a=Math.random()*6.28,d=Math.sqrt(Math.random())*LIM*.9;
    const x=Math.cos(a)*d,z=Math.sin(a)*d,y=1+Math.random()*3;
    const m=new THREE.Mesh(new THREE.SphereGeometry(0.15,4,3),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:0}));
    m.position.set(x,y,z);sc.add(m);
    FF.push({mesh:m,bx:x,by:y,bz:z,phase:Math.random()*6.28,radius:.8+Math.random()*2,speed:.3+Math.random()*.7});
  }
}
function initStars(){
  if(stars)sc.remove(stars);
  const geo=new THREE.BufferGeometry();
  const pos=[];
  for(let i=0;i<500;i++){
    const phi=Math.acos(Math.random());
    const theta=Math.random()*Math.PI*2;
    const r=250;
    pos.push(r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi)+10,r*Math.sin(phi)*Math.sin(theta));
  }
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  stars=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffffff,size:1.5,transparent:true,opacity:0,depthWrite:false}));
  sc.add(stars);
}

// ============================== JB SYSTEM ==============================
function spawnJBs(){
  jbs.forEach(j=>sc.remove(j.m));jbs=[];
  const N=curMap=='parkour'?50:150,R=curMap=='parkour'?40:190;
  for(let i=0;i<N;i++){
    const type=pickJBType(),def=JBT[type];
    let x,y=1.2+Math.random()*2,z;
    if(curMap=='parkour'&&plats.length){
      const p=plats[Math.floor(Math.random()*plats.length)];
      x=p.x+(Math.random()-.5)*2.5;z=p.z+(Math.random()-.5)*2.5;y=p.y+1.8+Math.random();
    } else {
      const a=Math.random()*6.28,d=Math.sqrt(Math.random())*R;
      x=Math.cos(a)*d;z=Math.sin(a)*d;
    }
    const m=Mt(new THREE.SphereGeometry(def.size,8,6),new THREE.MeshBasicMaterial({color:def.col,transparent:true,opacity:.95}),x,y,z);
    if(type!=='common'){
      const halo=Mt(new THREE.SphereGeometry(def.size*2,8,6),new THREE.MeshBasicMaterial({color:def.col,transparent:true,opacity:.2}),x,y,z);
      halo.userData.isJBHalo=true;m.userData.halo=halo;
    }
    jbs.push({m,x,y,z,ph:Math.random()*6.28,type,def});
  }
}
const jbPops=[];
function jbPop(x,y,z,txt,col){
  const c=document.createElement('canvas');c.width=96;c.height=32;const cx=c.getContext('2d');
  cx.font='bold 22px monospace';cx.textAlign='center';cx.textBaseline='middle';
  cx.lineWidth=4;cx.strokeStyle='#17306b';cx.strokeText(txt,48,16);
  cx.fillStyle=col;cx.fillText(txt,48,16);
  const tex=new THREE.CanvasTexture(c);tex.magFilter=tex.minFilter=THREE.NearestFilter;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
  sp.position.set(x,y,z);sp.scale.set(2.4,.9,1);sp.renderOrder=11;
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
  else if(lvl==2){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#4ea8ff');g.addColorStop(1,'#8
