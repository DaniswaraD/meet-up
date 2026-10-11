const $=i=>document.getElementById(i),cfg=Object.assign({name:'',c1:'#3a8dff',c2:'#7fd0ff',sh:0,nc:'#ffffff',nf:'monospace',rd:180,jb:0},JSON.parse(localStorage.mu||'{}')),sv=()=>localStorage.mu=JSON.stringify(cfg);
if(typeof firebase!='undefined')firebase.initializeApp({apiKey:"AIzaSyBrcEg6Ddw8PLmKJxi8rf9-N7eGsy4AUFs",authDomain:"meet-up-e1be8.firebaseapp.com",databaseURL:"https://meet-up-e1be8-default-rtdb.firebaseio.com",projectId:"meet-up-e1be8",storageBucket:"meet-up-e1be8.firebasestorage.app",messagingSenderId:"47326775225",appId:"1:47326775225:web:290a6644c0559ee2979868"});
const TS=typeof firebase!='undefined'?firebase.database.ServerValue.TIMESTAMP:0,KX='X';let db,uid,tT;
const toast=t=>{const e=$('toast');e.textContent=t;e.classList.remove('hide');clearTimeout(tT);tT=setTimeout(()=>e.classList.add('hide'),5000)};
const URLS=['https://meet-up-e1be8-default-rtdb.asia-southeast1.firebasedatabase.app','https://meet-up-e1be8-default-rtdb.firebaseio.com'];
const ready=(async()=>{if(typeof firebase=='undefined')return'net';try{uid=(await firebase.auth().signInAnonymously()).user.uid}catch(e){return'auth'}
for(const u of URLS){const d=firebase.app().database(u),ok=await new Promise(r=>{const ref=d.ref('.info/connected'),f=x=>{if(x.val()){ref.off('value',f);r(1)}};ref.on('value',f);setTimeout(()=>{ref.off('value',f);r(0)},5000)});if(ok){db=d;return''}d.goOffline()}return'db'})();
const ERR={net:'Tidak ada internet',auth:'Aktifkan Anonymous di Firebase Authentication',db:'Database tidak terhubung - cek URL Realtime Database'};
const G={M:'10001 11011 10101 10001 10001 10001 10001',e:'00000 00000 01110 10001 11111 10000 01110',t:'00100 00100 01110 00100 00100 00100 00011','-':'00000 00000 00000 01110 00000 00000 00000',U:'000000100 000001110 000011111 001000100 001000100 001000100 000111000',P:'11110 10001 10001 11110 10000 10000 10000'};
document.querySelectorAll('.ttl').forEach(c=>{c.width=50;c.height=10;const x=c.getContext('2d');let ox=2;for(const ch of'Meet-UP'){const rw=G[ch].split(' ');[[1,1,'#17306b'],[0,0,ch=='U'?'#ffd23f':'#fff']].forEach(([dx,dy,col])=>{x.fillStyle=col;rw.forEach((r,j)=>[...r].forEach((v,i)=>v=='1'&&x.fillRect(ox+i+dx,1+j+dy,1,1)))});ox+=rw[0].length+1}});
const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'low-power'}),sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,1,.1,600);
sc.add(new THREE.HemisphereLight(0xffffff,0x667788,.95));const dl=new THREE.DirectionalLight(0xffffff,.5);dl.position.set(.5,1,.3);sc.add(dl);
function rs(){const h=240,w=Math.round(h*innerWidth/innerHeight);R.setPixelRatio(1);R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}addEventListener('resize',rs);rs();
function setRD(){const r=cfg.rd;$('rl').textContent='Render distance: '+r+'J';if(sc.fog){sc.fog.near=r;sc.fog.far=r*1.5}cam.far=r*1.6+10;cam.updateProjectionMatrix()}
const MAPS={island:[0x8fd0ff,0x5cb85c],desert:[0xf2d49b,0xe0c070],jungle:[0x4a7f5a,0x2f6b3a],snow:[0xdcecff,0xf4f8ff],parkour:[0x141433,0x1a1a3a]};
let world=new THREE.Group(),obs=[],plats=[],jbs=[],curMap='island',LIM=200;
const M=(g,c,x,y,z,par)=>{const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c,flatShading:true}));m.position.set(x,y,z);(par||world).add(m);return m};
const C=(a,b,h,k)=>new THREE.CylinderGeometry(a,b,h,k),K=(r,h,k)=>new THREE.ConeGeometry(r,h,k);
function house(x,z,rot,wood,roof){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;const w=6,h=3.5,d=5;
const wall=(dx,dz,ww,dd)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(ww,h,dd),new THREE.MeshLambertMaterial({color:wood,flatShading:true}));m.position.set(dx,h/2,dz);g.add(m)};
wall(0,-d/2,w,.4);wall(-w/2,0,.4,d);wall(w/2,0,.4,d);
const dm=new THREE.Mesh(new THREE.BoxGeometry(2,h,.4),new THREE.MeshLambertMaterial({color:0x3a2410}));dm.position.set(0,h/2,d/2);g.add(dm);
const r=new THREE.Mesh(new THREE.ConeGeometry(w*.85,2,4),new THREE.MeshLambertMaterial({color:roof,flatShading:true}));r.position.y=h+1;r.rotation.y=Math.PI/4;g.add(r);
world.add(g);obs.push({x,z,r:3.4})}
function camp(x,z){const g=new THREE.Group();g.position.set(x,0,z);
for(let i=0;i<8;i++){const a=i/8*6.28,m=new THREE.Mesh(new THREE.DodecahedronGeometry(.28),new THREE.MeshLambertMaterial({color:0x8a8a8a,flatShading:true}));m.position.set(Math.cos(a)*1.4,.15,Math.sin(a)*1.4);g.add(m)}
for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,1.4,5),new THREE.MeshLambertMaterial({color:0x6b4a2b,flatShading:true}));m.position.y=.2;m.rotation.set(Math.PI/2,0,i*2.09);g.add(m)}
const t=new THREE.Mesh(new THREE.ConeGeometry(2,2,4),new THREE.MeshLambertMaterial({color:0xd05040,flatShading:true}));t.position.set(3.5,1,0);t.rotation.y=Math.PI/4;g.add(t);
const t2=new THREE.Mesh(new THREE.ConeGeometry(1.6,1.8,4),new THREE.MeshLambertMaterial({color:0x4a7bd0,flatShading:true}));t2.position.set(-3.5,1,1);t2.rotation.y=Math.PI/4;g.add(t2);
world.add(g);obs.push({x,z,r:2})}
function bench(x,z,rot){const g=new THREE.Group();g.position.set(x,.3,z);g.rotation.y=rot;
M(new THREE.BoxGeometry(2.4,.2,.7),0x8b5a2b,0,0,0,g);M(new THREE.BoxGeometry(2.4,.5,.15),0x8b5a2b,0,.35,-.28,g);
M(new THREE.BoxGeometry(.2,.6,.2),0x5a3a1a,-1,.3,0,g);M(new THREE.BoxGeometry(.2,.6,.2),0x5a3a1a,1,.3,0,g);world.add(g)}
function well(x,z){const g=new THREE.Group();g.position.set(x,0,z);
M(new THREE.CylinderGeometry(1.2,1.2,.9,8),0x8a8a8a,0,.45,0,g);
M(new THREE.ConeGeometry(1.8,1.2,4),0xa04030,0,2.6,0,g).rotation.y=Math.PI/4;
[[-.9,-.9],[.9,-.9],[-.9,.9],[.9,.9]].forEach(p=>M(new THREE.BoxGeometry(.18,2.2,.18),0x8b5a2b,p[0],1.1,p[1],g));
world.add(g);obs.push({x,z,r:1.4})}
function lamp(x,z){const g=new THREE.Group();g.position.set(x,0,z);
M(new THREE.CylinderGeometry(.12,.12,3.2,5),0x333333,0,1.6,0,g);
M(new THREE.SphereGeometry(.35,6,4),0xffe27a,0,3.4,0,g);world.add(g)}
function igloo(x,z){const g=new THREE.Group();g.position.set(x,0,z);
M(new THREE.SphereGeometry(2.4,8,5,0,6.28,0,1.57),0xf0f8ff,0,0,0,g);
M(new THREE.BoxGeometry(.9,1.2,.5),0x5a7a9a,0,.6,2.2,g);world.add(g);obs.push({x,z,r:2.5})}
function tree(c,x,z,k,two){k=k||(1.7+Math.random()*.9);M(C(.2*k,.3*k,1.5*k,5),0x6b4a2b,x,.7*k,z);M(K(1.3*k,2.6*k,6),c,x,2.5*k,z);if(two)M(K(1*k,2*k,6),c,x,3.8*k,z)}
function rock(x,z){M(new THREE.DodecahedronGeometry(.7+Math.random()*.5),curMap=='snow'?0xcfd8e0:0x8a8a8a,x,.4,z)}
function build(n){sc.remove(world);world=new THREE.Group();sc.add(world);obs=[];plats=[];jbs.forEach(j=>sc.remove(j.m));jbs=[];curMap=n;LIM=200;
const[sk,gr]=MAPS[n];sc.background=new THREE.Color(sk);sc.fog=new THREE.Fog(sk,cfg.rd,cfg.rd*1.5);setRD();
let s=n.length*7919;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
const disc=(r,c,y,x=0,z=0)=>M(new THREE.CircleGeometry(r,32).rotateX(-1.5708),c,x||0,y,z||0);
if(n=='parkour'){
  sc.fog=new THREE.Fog(sk,cfg.rd,cfg.rd*1.6);setRD();
  const start=M(new THREE.BoxGeometry(10,1,10),0x3d8bff,0,-.5,0);plats.push({x:0,y:0,z:0,w:10,d:10,on:true,vanish:0,slip:0,mesh:start});
  let px=0,pz=0,py=0;
  for(let i=0;i<55;i++){const ang=rnd()*6.28,d=8+rnd()*7;px+=Math.cos(ang)*d;pz+=Math.sin(ang)*d;py+=(rnd()-.35)*3;
    const w=3+rnd()*3.5,dp=3+rnd()*3.5,vanish=rnd()<.28,slip=rnd()<.22;
    const col=vanish?0xffd23f:slip?0x8fdcff:[0x5cb85c,0x3d8bff,0xff8c1a][i%3];
    const mesh=M(new THREE.BoxGeometry(w,.7,dp),col,px,py+.35,pz);
    plats.push({x:px,y:py+.7,z:pz,w,d:dp,on:!vanish,vanish:vanish?1:0,slip:slip?1:0,mesh,phase:rnd()*4,period:3+rnd()*2})}
}else{
  disc(320,n=='island'?0x2a7fd0:gr,-.5);if(n=='island')disc(220,0xf0dc9a,-.15);disc(210,gr,0);
  if(n=='snow')disc(40,0xaee6ff,.03,60,-40);
  const g=new THREE.CylinderGeometry(215,225,12,48,1,true),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),k=1+Math.sin(a*9)*.03;p.setX(i,x*k);p.setZ(i,z*k);if(p.getY(i)>0)p.setY(i,6+Math.abs(Math.sin(a*6))*3)}
  g.computeVertexNormals();const t=M(g,{desert:0xc99a5b,jungle:0x1f4d2a,snow:0xcfeaff,island:0x3a8d3a}[n]||0x3a8d3a,0,5.8,0);t.material.side=THREE.DoubleSide;
  if(n=='island'){for(let i=0;i<80;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<25)continue;M(new THREE.IcosahedronGeometry(.7+rnd()*.4,0),0x3aa84a,x,.5,z)}
    for(let i=0;i<45;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<25)continue;tree(0x2e8b3a,x,z);obs.push({x,z,r:1.1})}
    for(let i=0;i<25;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*190,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<30)continue;rock(x,z);obs.push({x,z,r:.9})}
    for(let i=0;i<220;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<15)continue;M(new THREE.SphereGeometry(.14,4,3),[0xff6688,0xffee55,0xffffff][rnd()*3|0],x,.15,z)}
    house(60,60,0.3,0x8b5a2b,0xa04030);house(-70,-50,1.8,0xa07850,0x8b3030);camp(20,-70);camp(-90,80);house(90,-20,2.5,0x8b5a2b,0x704020);
    for(let i=0;i<8;i++){const a=i/8*6.28;bench(Math.cos(a)*35,Math.sin(a)*35,a+Math.PI)}
    well(-30,100);well(120,40);lamp(0,-40);lamp(40,0);lamp(-40,0);lamp(0,40)}
  if(n=='desert'){for(let i=0;i<45;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<25)continue;M(C(.3,.3,2.4,6),0x3c8f4a,x,1.2,z);M(new THREE.BoxGeometry(1,.25,.25),0x3c8f4a,x+.5,1.4,z);obs.push({x,z,r:.6})}
    for(let i=0;i<30;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<25)continue;rock(x,z);obs.push({x,z,r:.9})}
    for(let i=0;i<12;i++){const a=rnd()*6.28,d=40+rnd()*150,x=Math.cos(a)*d,z=Math.sin(a)*d;const m=M(new THREE.SphereGeometry(6,7,4),0xe6c880,x,-1,z);m.scale.y=.35}
    camp(-40,40);camp(80,-60);house(60,60,.4,0xc9a060,0x8b5030);well(-100,-40);lamp(30,30)}
  if(n=='jungle'){for(let i=0;i<170;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<20)continue;tree(0x1f5e2c,x,z,1.2+rnd()*.9,1);obs.push({x,z,r:1.2})}
    for(let i=0;i<70;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<20)continue;M(new THREE.CylinderGeometry(.3,.35,8+rnd()*4,5),0x5a3a1a,x,4,z)}
    for(let i=0;i<50;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<20)continue;M(new THREE.SphereGeometry(1.2+rnd()*1.5,4,3),0x4f8f3f,x,.05,z).scale.y=.15}
    for(let i=0;i<18;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*190,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<30)continue;rock(x,z);obs.push({x,z,r:.9})}
    house(50,-70,.5,0x6b4a2b,0x2f5a2a);house(-80,40,2,0x8b5a2b,0x8b3030);camp(15,90);camp(-60,-90);camp(120,10);
    for(let i=0;i<6;i++){const a=i/6*6.28;bench(Math.cos(a)*40,Math.sin(a)*40,a+Math.PI)}
    well(90,90);well(-100,-100);lamp(0,0);lamp(50,50);lamp(-50,-50);lamp(50,-50);lamp(-50,50)}
  if(n=='snow'){for(let i=0;i<70;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<25)continue;tree(0xe8f4ff,x,z,1.2+rnd()*.7,1);obs.push({x,z,r:1.1})}
    for(let i=0;i<25;i++){const a=rnd()*6.28,d=Math.sqrt(rnd())*200,x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<25)continue;rock(x,z);obs.push({x,z,r:.9})}
    igloo(60,50);igloo(-70,-60);igloo(90,-90);igloo(-40,110);
    house(-60,60,.3,0x6b4a2b,0x5a3050);house(80,-40,2,0x8b5a2b,0x503020);
    camp(30,-80);camp(-100,30);camp(120,60);
    for(let i=0;i<6;i++){const a=i/6*6.28;bench(Math.cos(a)*45,Math.sin(a)*45,a+Math.PI)}
    well(0,-120);well(110,110);lamp(0,-30);lamp(30,0);lamp(-30,0);lamp(0,30)}
}
spawnJBs()}
const jbGeo=new THREE.SphereGeometry(.4,8,6),jbMat=new THREE.MeshBasicMaterial({color:0x7fd0ff,transparent:true,opacity:.9});
function spawnJBs(){jbs.forEach(j=>sc.remove(j.m));jbs=[];const N=curMap=='parkour'?80:140,R=curMap=='parkour'?90:180;
for(let i=0;i<N;i++){const a=Math.random()*6.28,d=Math.sqrt(Math.random())*R;
let y=1+Math.random()*2,x=Math.cos(a)*d,z=Math.sin(a)*d;
if(curMap=='parkour'&&plats.length){const p=plats[Math.floor(Math.random()*plats.length)];x=p.x+(Math.random()-.5)*2;z=p.z+(Math.random()-.5)*2;y=p.y+1.5+Math.random()}
const m=new THREE.Mesh(jbGeo,jbMat.clone());m.position.set(x,y,z);sc.add(m);jbs.push({m,x,y,z,ph:Math.random()*6.28})}}
const spr=(w,h,f,sx,sy)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(sx,sy,1);s.renderOrder=9;return s},
nameS=(n,c,f)=>spr(128,24,x=>{x.font=`bold 16px ${f}`;x.textAlign='center';x.lineWidth=4;x.strokeStyle='#000';x.strokeText(n,64,17);x.fillStyle=c;x.fillText(n,64,17)},3.2,.6);
const jbLvl=()=>cfg.jb>=500?4:cfg.jb>=100?3:cfg.jb>=50?2:cfg.jb>=10?1:0;
function chatS(t,lvl){const W=280,H=36,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
const p=3,w=W-p*2,h=H-p*2;
if(lvl<=0){x.fillStyle='#fff';x.fillRect(p,p,w,h);x.strokeStyle='#17306b';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
else if(lvl==1){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#e0f2ff');g.addColorStop(1,'#a8d5ff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#3d8bff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
else if(lvl==2){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#4ea8ff');g.addColorStop(1,'#8f5dff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2)}
else if(lvl==3){const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ff5db1');g.addColorStop(.5,'#8f5dff');g.addColorStop(1,'#4ea8ff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2);x.fillStyle='#fff';for(let i=0;i<10;i++){x.fillRect(10+i*28,7,3,3);x.fillRect(20+i*26,H-11,3,3)}}
else{const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'#ff5d5d');g.addColorStop(.25,'#ffd23f');g.addColorStop(.5,'#3fbf5f');g.addColorStop(.75,'#3d8bff');g.addColorStop(1,'#b05dff');x.fillStyle=g;x.fillRect(p,p,w,h);x.strokeStyle='#fff';x.lineWidth=3;x.strokeRect(p+1,p+1,w-2,h-2);x.fillStyle='#fff';for(let i=0;i<12;i++){x.fillRect(8+i*23,5,3,3);x.fillRect(14+i*22,H-10,3,3)}}
x.font='bold 18px monospace';x.textAlign='center';x.textBaseline='middle';x.fillStyle=lvl<=0?'#000':lvl==1?'#17306b':'#fff';
if(lvl>=2){x.shadowColor='#000';x.shadowBlur=5}x.fillText(t.slice(0,32),W/2,H/2+1);x.shadowBlur=0;
const tex=new THREE.CanvasTexture(c);tex.magFilter=tex.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));s.scale.set(7,.9,1);s.renderOrder=9;return s}
const IC=['..PPP... .PPYPP.. ..PPP... ...G.... .G.G.... .GGG.... ...G.... ...G....','..PPP... .PPPPP.. .WWWWW.. .WWWWW.. ..CCC... ..CCC... ...C.... ...C....','.RR..RR. RRRRRRRR RRRRRRRR RRRRRRRR .RRRRRR. ..RRRR.. ...RR... ........','...OO... ..OOOO.. .OOOOOO. .OOOOOO. ..OOOO.. ...OO... .SSSSSS. ........','R......R .R....R. ..R..R.. ...RR... ...RR... ..R..R.. .R....R. R......R','..YYYY.. .YYYYYY. YKYYYYKY YYYYYYYY YKKKKKKY .YKRRKY. ..YYYY.. ........','..YYYY.. .YYYYYY. YYKYYKYY YYSYYSYY YYSYYSYY YYYKKYYY .YKYYKY. ..YYYY..','..YYYY.. .YYYYYY. YRRYYRRY YRRYYRRY YYYYYYYY YKYYYYKY .YKKKKY. ..YYYY..'],
PAL={P:'#ff9ec4',Y:'#ffd23f',G:'#3fbf5f',W:'#ffffff',C:'#f6b26b',R:'#ff4d6d',O:'#ff8c1a',S:'#5db5ff',K:'#17306b'};
const icoC=i=>{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');IC[i].split(' ').forEach((r,j)=>[...r].forEach((v,k)=>{if(v!='.'){x.fillStyle=PAL[v];x.fillRect(k,j,1,1)}}));return c},
icoS=i=>{const t=new THREE.CanvasTexture(icoC(i));t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(1.3,1.3,1);s.renderOrder=9;return s};
function mkP(o){const sh=o.sh|0,root=new THREE.Group(),m=new THREE.Group(),
geo=[new THREE.SphereGeometry(.9,8,5,0,6.2832,0,1.5708),new THREE.BoxGeometry(1.5,1,1.5).translate(0,.5,0),new THREE.ConeGeometry(1,1.3,3).translate(0,.65,0),new THREE.SphereGeometry(.85,8,6).translate(0,.85,0),new THREE.CylinderGeometry(.8,.9,1.1,8).translate(0,.55,0),new THREE.ConeGeometry(1,1.4,4).translate(0,.7,0),new THREE.OctahedronGeometry(.95).translate(0,.95,0)][sh],a=new THREE.Color(o.c1),b=new THREE.Color(o.c2),p=geo.attributes.position,cl=[];
for(let i=0;i<p.count;i++){const c=a.clone().lerp(b,Math.min(1,Math.max(0,p.getY(i)/1.1)));cl.push(c.r,c.g,c.b)}
geo.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));m.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true})));
const ez=[.78,.7,.5,.8,.84,.45,.45][sh],eyes=new THREE.Group(),hearts=new THREE.Group(),tears=new THREE.Group();
[-.3,.3].forEach(x=>{const e=new THREE.Mesh(new THREE.BoxGeometry(.16,.24,.1),new THREE.MeshBasicMaterial({color:0x111111}));e.position.set(x,.5,ez);eyes.add(e);const h=icoS(2);h.scale.set(.4,.4,1);h.position.set(x,.5,ez);hearts.add(h);const t=new THREE.Mesh(new THREE.BoxGeometry(.08,.14,.08),new THREE.MeshBasicMaterial({color:0x44aaff}));t.position.set(x,.3,ez+.05);tears.add(t)});
hearts.visible=tears.visible=false;m.add(eyes,hearts,tears);m.rotation.order='YXZ';root.add(m);const nm=nameS(o.n||o.name||'?',o.nc||'#fff',o.nf||'monospace');nm.position.y=2.1;root.add(nm);
const icos={};[0,1,2,4].forEach(k=>{const s=icoS(k);s.position.y=3.4;s.visible=false;root.add(s);icos[k]=s});
sc.add(root);return{root,m,eyes,hearts,tears,icos,x:0,z:0,y:0,vx:0,vz:0,vy:0,py:0,pvy:0,air:0,js:1,jx:1,sv:0,lean:0,flip:0,spd:0,jc:0,jh:0,ty:0,r:0,tx:0,tz:0,tr:0,e:-1,et:0,lEt:-1,lCt:-1,init:0,lx:0,lz:0,tt:0,c1:o.c1,chat:null,ce:0,jbLvl:(o.jb||0)>=500?4:(o.jb||0)>=100?3:(o.jb||0)>=50?2:(o.jb||0)>=10?1:0}}
function setE(p,e){p.e=e;p.et=performance.now()}
function say(p,t){if(p.chat)p.root.remove(p.chat);p.chat=chatS(t,p.jbLvl||jbLvl());p.chat.position.y=3;p.root.add(p.chat);p.ce=performance.now()+6000}
function animE(p,t){const d=(t-p.et)/1000,e=d<4?p.e:-1;let y=0,sx=1,sy=1;if(e==3){y=.9*Math.sin(d*4.5)**2;sy=1+.12*Math.cos(d*9)}if(e==4){sy=.75;sx=1.2}if(e==5&&d%2<1)y=Math.abs(Math.sin(d*14))*.5;if(e==6){sy=.7;sx=1.2}
p.eyes.scale.y=(t%3200<130)?.1:(p.air?1.35:1);p.hearts.visible=e==7;p.eyes.visible=e!=7;p.tears.visible=e==6;
p.tears.children.forEach((c,i)=>c.position.y=.4-((d*1.5+i*.5)%1)*.4);for(const k in p.icos){p.icos[k].visible=+k==e;p.icos[k].position.y=3.4+Math.sin(t/200)*.1}
p.m.position.y=y+(p.air?0:Math.abs(Math.sin(t/110))*.1*Math.min(1,p.spd/4));
p.m.rotation.z=p.air?0:Math.sin(t/110)*.06*Math.min(1,p.spd/4);p.m.rotation.x=p.lean+p.flip;
p.m.scale.set(sx*p.jx,sy*p.js,sx*p.jx);if(p.chat&&t>p.ce){p.root.remove(p.chat);p.chat=null}}
function jelly(p,dt){const vy=(p.y-p.py)/Math.max(dt,.001);p.py=p.y;const air=p.y>.08;
if(air&&!p.air){p.js=.65;puff(p.x,p.z,7,p.c1)}if(!air&&p.air){p.js=Math.max(.5,.9-Math.min(1,-p.pvy/14)*.45);p.sv=0;puff(p.x,p.z,14,p.c1);trail(p.x,p.z,p.c1)}
if(air&&p.air&&vy-p.pvy>6&&vy>3){p.flip=.01;puff(p.x,p.z,8,'#ffe27a',5)}
p.air=air;p.pvy=vy;const ty=air?1+Math.max(-.2,Math.min(.4,vy*.05)):1;
p.sv+=((ty-p.js)*240-p.sv*11)*dt;p.js=Math.max(.45,Math.min(1.6,p.js+p.sv*dt));p.jx=1/Math.sqrt(p.js);
if(p.flip>0){p.flip+=dt*13;if(p.flip>6.283)p.flip=0}
p.lean+=((air?0:Math.min(.3,p.spd*.035))-p.lean)*Math.min(1,dt*10)}
const PT=[],pG=new THREE.BoxGeometry(.2,.2,.2);
function puff(x,z,n,c,up){for(let i=0;i<n;i++){let q=PT.find(o=>o.l<=0);if(!q){if(PT.length>=60)return;const m=new THREE.Mesh(pG,new THREE.MeshBasicMaterial({transparent:true}));sc.add(m);q={m,l:0,vx:0,vy:0,vz:0};PT.push(q)}const a=Math.random()*6.283,v=1.5+Math.random()*2;q.l=.6;q.vx=Math.cos(a)*v;q.vz=Math.sin(a)*v;q.vy=1.5+Math.random()*(up||2.5);q.m.material.color.set(i%3?c:'#ffffff');q.m.position.set(x,.15,z);q.m.visible=true}}
const TR=[],trG=new THREE.CircleGeometry(.45,7).rotateX(-1.5708);
function trail(x,z,c){let t=TR.find(q=>q.l<=0);if(!t){if(TR.length>=40)return;const m=new THREE.Mesh(trG,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}));sc.add(m);t={m,l:0};TR.push(t)}t.l=2.5;t.m.material.color.set(c);t.m.position.set(x,.06,z);t.m.visible=true}
let me,base,rid,host=false,playing=false,joined=false,pl,P={},cy=0,zd=9,pitch=.6,keys={},ix=0,iy=0,run=false,jmp=false,last=performance.now(),selMap='island',roomMap='island';
const screens=['name','menu','skin','croom','lobby','set'],show=id=>screens.forEach(s=>$(s).classList.toggle('hide',s!=id));
function setSelf(){if(pl&&pl.root.parent)pl.root.parent.remove(pl.root);pl=mkP({...cfg,n:cfg.name});(playing?sc:menuG).add(pl.root);$('jbn').textContent=cfg.jb+' JB'}
const menuG=new THREE.Group();menuG.add(new THREE.Mesh(new THREE.CylinderGeometry(3,3,.4,16),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true})).translateY(-.2),new THREE.Mesh(new THREE.CylinderGeometry(3.3,3.5,.3,16),new THREE.MeshLambertMaterial({color:0xb8d8ff,flatShading:true})).translateY(-.5));sc.add(menuG);
function menuMode(){playing=false;world.visible=false;menuG.visible=true;sc.background=new THREE.Color(0x8fd0ff);sc.fog=null;pl.x=pl.z=pl.y=0;pl.vx=pl.vz=0;menuG.add(pl.root);zd=5}
build('island');setSelf();menuMode();
$('nm').value=cfg.name;show(cfg.name?'menu':'name');
$('ng').onclick=()=>{const v=$('nm').value.trim().slice(0,14);if(!v)return;cfg.name=v;sv();setSelf();show('menu')};
document.querySelectorAll('.bk').forEach(b=>b.onclick=()=>show('menu'));
const SHAPES=['Setengah','Kotak','Segitiga','Bola','Silinder','Piramida','Permata'];
const shGrid=$('shapes');SHAPES.forEach((n,i)=>{const b=document.createElement('button');b.textContent=n;b.className=cfg.sh==i?'on':'';b.onclick=()=>{cfg.sh=i;sv();setSelf();[...shGrid.children].forEach((x,j)=>x.classList.toggle('on',j==i))};shGrid.append(b)});
const FONTS=['monospace','sans-serif','serif','cursive','Impact','Georgia','Verdana','Trebuchet MS','Courier New'];
const fGrid=$('fonts');FONTS.forEach((n,i)=>{const b=document.createElement('button');b.textContent=n;b.style.fontFamily=n;b.className=cfg.nf==n?'on':'';b.onclick=()=>{cfg.nf=n;sv();setSelf();[...fGrid.children].forEach(x=>x.classList.toggle('on',x.textContent==n))};fGrid.append(b)});
const MU=[['island','Pulau'],['desert','Gurun'],['jungle','Jungle'],['snow','Salju'],['parkour','Parkour']];
const mGrid=$('maps');MU.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.className=selMap==k?'on':'';b.onclick=()=>{selMap=k;[...mGrid.children].forEach((x,j)=>x.classList.toggle('on',MU[j][0]==k))};mGrid.append(b)});
for(const k of['c1','c2','nc']){const el=$(k);el.value=cfg[k];el.oninput=()=>{cfg[k]=el.value;sv();setSelf()}}
$('rd').value=cfg.rd;$('rd').oninput=e=>{cfg.rd=+e.target.value;sv();setRD()};
$('sb').onclick=()=>{$('set').classList.add('hide');playing?$('pause').classList.remove('hide'):show('menu')};
$('ms').onclick=()=>show('skin');$('mr').onclick=()=>show('croom');$('mt').onclick=()=>show('set');
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e});$('md').onclick=()=>dp?dp.prompt():alert('Menu browser > "Tambahkan ke layar utama"');
async function join(id,map,h){const er=await ready;if(er){toast(ERR[er]);return 0}try{return await join2(id,map,h)}catch(e){toast('Gagal masuk: '+(e.code||e.message));return 0}}
async function join2(id,map,h){rid=id;host=h;roomMap=map;base=db.ref('rooms/'+id);me=base.child('players/'+uid);me.onDisconnect().remove();const sx=(Math.random()-.5)*8,sz=(Math.random()-.5)*8;
const sy=map=='parkour'?2:0;
await me.set({n:cfg.name,c1:cfg.c1,c2:cfg.c2,sh:cfg.sh,nc:cfg.nc,nf:cfg.nf,x:sx,z:sz,y:sy,r:0,e:-1,et:0,ct:0,ch:' ',jb:cfg.jb});pl.x=sx;pl.z=sz;pl.y=sy;joined=true;base.child('players').on('value',onPl);
if(id[0]!='g'){base.child('meta').on('value',s=>{const m=s.val();if(m&&m.started&&!playing)start(m.map)})}return 1}
function onPl(s){const v=s.val()||{};if(joined&&!v[uid]){leave();alert('Kamu keluar dari room');return}
$('ll').innerHTML='';for(const id in v){const r=document.createElement('div');r.className='row';r.innerHTML=`<i style="background:${v[id].c1}"></i><b></b>`;r.lastChild.textContent=v[id].n+(id==uid?' (kamu)':'');if(host&&id!=uid){const x=document.createElement('button');x.className='kick';x.textContent=KX;x.onclick=()=>base.child('players/'+id).remove();r.append(x)}$('ll').append(r)}
for(const id in v){if(id==uid)continue;const d=v[id];let p=P[id];if(!p){p=P[id]=mkP(d);p.x=d.x;p.z=d.z;p.y=d.y||0;if((d.jb||0)>=500){toast('🎉 '+d.n+' Memiliki '+d.jb+' JB Memainkan gamenya!!!')}}
p.tx=d.x;p.tz=d.z;p.tr=d.r;p.ty=d.y||0;p.jbLvl=(d.jb||0)>=500?4:(d.jb||0)>=100?3:(d.jb||0)>=50?2:(d.jb||0)>=10?1:0;
if(d.et!==p.lEt){if(p.init&&d.e>=0)setE(p,d.e);p.lEt=d.et}
if(d.ct!==p.lCt){if(p.init&&d.ch.trim())say(p,d.ch);p.lCt=d.ct}p.init=1}
for(const id in P)if(!v[id]){sc.remove(P[id].root);delete P[id]}}
function start(map){build(map);world.visible=true;menuG.visible=false;sc.add(pl.root);playing=true;pl.y=map=='parkour'?2:0;pl.x=pl.z=0;pl.vx=pl.vz=pl.vy=0;
['menu','lobby'].forEach(i=>$(i).classList.add('hide'));$('hud').classList.remove('hide');zd=10}
async function leave(){joined=false;playing=false;if(base){base.child('players').off();base.child('meta').off();try{if(host&&rid[0]!='g')await base.remove();else await me.remove()}catch(e){}}for(const id in P)sc.remove(P[id].root);P={};base=me=null;$('hud').classList.add('hide');$('pause').classList.add('hide');menuMode();show('menu')}
$('mp').onclick=async()=>{const m=selMap;$('mp').disabled=true;const ok=await join('g_'+m,m,false);$('mp').disabled=false;if(!ok)toast('Main solo (offline)');start(m)};
const code=()=>Math.random().toString(36).slice(2,7).toUpperCase();
$('rc').onclick=async()=>{const er=await ready;if(er)return toast(ERR[er]);const m=selMap,c=code();try{await db.ref('rooms/'+c+'/meta').set({host:uid,map:m,started:false})}catch(e){return toast('Gagal buat room: '+e.code)}if(await join(c,m,true)){$('lc').textContent=c;$('lg').classList.remove('hide');show('lobby')}};
$('rj').onclick=async()=>{const er=await ready;if(er)return toast(ERR[er]);const c=$('ri').value.trim().toUpperCase();let r;try{r=await db.ref('rooms/'+c+'/meta').once('value')}catch(e){return toast('Gagal: '+e.code)}if(!r.exists())return toast('Room tidak ditemukan');const m=r.val().map;if(await join(c,m,false)){$('lc').textContent=c;$('lg').classList.add('hide');show('lobby')}};
$('lg').onclick=async()=>{await base.child('meta/started').set(true);start(roomMap)};
$('lx').onclick=leave;$('pe').onclick=leave;$('pb').onclick=()=>$('pause').classList.remove('hide');$('pr').onclick=()=>$('pause').classList.add('hide');$('ps').onclick=()=>{$('pause').classList.add('hide');$('set').classList.remove('hide')};
IC.forEach((ic,i)=>{const b=document.createElement('button');b.append(icoC(i));b.insertAdjacentHTML('beforeend','<small>'+(i+1)+'</small>');b.onclick=()=>emo(i);$('bar').append(b)});
function emo(i){if(!playing)return;const n=pl.e==i?-1:i;setE(pl,n);me&&me.update({e:n,et:TS});[...$('bar').children].forEach((b,j)=>b.classList.toggle('on',j==n));setTimeout(()=>[...$('bar').children].forEach(b=>b.classList.remove('on')),700)}
function send(){const t=$('ci').value.trim();if(t){say(pl,t);me&&me.update({ch:t,ct:TS})}$('ci').value='';$('chat').classList.add('hide')}
$('cb').onclick=()=>{$('chat').classList.toggle('hide');$('ci').focus()};$('cs').onclick=send;$('ci').onkeydown=e=>{if(e.key=='Enter')send()};
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;keys[e.code]=1;if(e.key>='1'&&e.key<='8')emo(+e.key-1);if(e.key=='Enter'){$('chat').classList.remove('hide');$('ci').focus();e.preventDefault()}});addEventListener('keyup',e=>keys[e.code]=0);
let ds=0,lx=0,ly=0,cvT={};const look=(dx,dy)=>{cy-=dx*.008;pitch=Math.min(1.35,Math.max(.05,pitch+dy*.006))};
cv.onmousedown=e=>{ds=1;lx=e.clientX;ly=e.clientY};addEventListener('mouseup',()=>ds=0);addEventListener('mousemove',e=>{if(ds&&playing){look(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY}});cv.onwheel=e=>zd=Math.min(20,Math.max(3,zd+e.deltaY*.01));
cv.ontouchstart=e=>{for(const t of e.changedTouches)cvT[t.identifier]={x:t.clientX,y:t.clientY}};
cv.ontouchmove=e=>{const ids=Object.keys(cvT);if(ids.length>=2){const a=cvT[ids[0]],b=cvT[ids[1]],d0=Math.hypot(a.x-b.x,a.y-b.y);for(const t of e.changedTouches)if(cvT[t.identifier])Object.assign(cvT[t.identifier],{x:t.clientX,y:t.clientY});zd=Math.min(20,Math.max(3,zd-(Math.hypot(a.x-b.x,a.y-b.y)-d0)*.03))}else for(const t of e.changedTouches){const o=cvT[t.identifier];if(o){if(playing)look(t.clientX-o.x,t.clientY-o.y);o.x=t.clientX;o.y=t.clientY}}};
cv.ontouchend=cv.ontouchcancel=e=>{for(const t of e.changedTouches)delete cvT[t.identifier]};
const lockL=()=>{try{if(matchMedia('(pointer:coarse)').matches)(document.documentElement.requestFullscreen?document.documentElement.requestFullscreen():Promise.resolve()).then(()=>screen.orientation.lock('landscape')).catch(()=>{})}catch(e){}};addEventListener('pointerdown',lockL,{once:true});
if(matchMedia('(pointer:coarse)').matches)$('mob').classList.remove('hide');
const joy=$('joy'),kn=$('kn');const jm=e=>{const t=e.targetTouches[0],r=joy.getBoundingClientRect(),dx=t.clientX-r.left-60,dy=t.clientY-r.top-60,l=Math.min(1,Math.hypot(dx,dy)/50),a=Math.atan2(dy,dx);ix=Math.cos(a)*l;iy=-Math.sin(a)*l;kn.style.left=40+Math.cos(a)*l*40+'px';kn.style.top=40+Math.sin(a)*l*40+'px'};
joy.ontouchstart=joy.ontouchmove=e=>{e.stopPropagation();jm(e)};joy.ontouchend=()=>{ix=iy=0;kn.style.left=kn.style.top='40px'};$('jb').ontouchstart=()=>jmp=true;$('rb').ontouchstart=()=>{run=!run;$('rb').classList.toggle('s',!run)};
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;
if(playing){if(keys.ArrowLeft)cy+=dt*2;if(keys.ArrowRight)cy-=dt*2;if(keys.ArrowUp)pitch=Math.max(.05,pitch-dt*1.5);if(keys.ArrowDown)pitch=Math.min(1.35,pitch+dt*1.5);
let a=ix+(keys.KeyD?1:0)-(keys.KeyA?1:0),b=iy+(keys.KeyW?1:0)-(keys.KeyS?1:0);const l=Math.hypot(a,b);if(l>1)a/=l,b/=l;
const mx=Math.cos(cy)*a-Math.sin(cy)*b,mz=-Math.sin(cy)*a-Math.cos(cy)*b,sp=(run||keys.ShiftLeft)?9:5;
let GY=0,SLIP=0;
if(curMap=='parkour'){GY=-999;
  for(const p of plats){if(!p.on)continue;const dx=pl.x-p.x,dz=pl.z-p.z;if(Math.abs(dx)<=p.w/2+.45&&Math.abs(dz)<=p.d/2+.45){if(pl.y>=p.y-.4&&p.y>GY){GY=p.y;SLIP=p.slip}}}
  if(pl.y<-25){pl.x=pl.z=0;pl.y=3;pl.vx=pl.vz=pl.vy=0;GY=0}}
const fric=SLIP?3:24;
pl.vx+=(mx*sp-pl.vx)*Math.min(1,dt*fric);pl.vz+=(mz*sp-pl.vz)*Math.min(1,dt*fric);
pl.x+=pl.vx*dt;pl.z+=pl.vz*dt;
if(a||b){const t=Math.atan2(mx,mz);let d=t-pl.r;d=Math.atan2(Math.sin(d),Math.cos(d));pl.r+=d*Math.min(1,dt*12)}
const jn=jmp||keys.Space;if(pl.y<=GY+.01)pl.jc=0;
if(jn&&(pl.y<=GY+.01?1:!pl.jh)&&pl.jc<2){pl.vy=pl.jc?9:8;pl.jc++}pl.jh=!!jn;jmp=false;
pl.vy-=22*dt;pl.y+=pl.vy*dt;
if(pl.y<=GY){pl.y=GY;if(pl.vy<0)pl.vy=0}
if(curMap=='parkour')plats.forEach(p=>{if(p.vanish){const t=((now/1000)+p.phase)%p.period;p.on=t<p.period*.65}p.mesh.visible=p.on});
for(const o of obs){const dx=pl.x-o.x,dz=pl.z-o.z,d=Math.hypot(dx,dz),m=o.r+.6;if(d<m&&d>0&&pl.y<2){pl.x=o.x+dx/d*m;pl.z=o.z+dz/d*m}}
const rr=Math.hypot(pl.x,pl.z);if(rr>LIM){pl.x*=LIM/rr;pl.z*=LIM/rr}}
else{pl.r=0;pl.vx=pl.vz=0}
for(let i=jbs.length-1;i>=0;i--){const j=jbs[i];j.m.position.y=j.y+Math.sin(now/500+j.ph)*.25;j.m.rotation.y=now/1000+j.ph;
  const dx=pl.x-j.x,dz=pl.z-j.z,dy=pl.y+1-j.m.position.y;
  if(dx*dx+dz*dz+dy*dy<1.6){cfg.jb++;sv();$('jbn').textContent=cfg.jb+' JB';sc.remove(j.m);jbs.splice(i,1);me&&me.update({jb:cfg.jb});setSelf();puff(j.x,j.z,4,'#7fd0ff')}}
const all=[pl,...Object.values(P)];for(const p of all){if(p!==pl)p.root.visible=playing;
if(p!==pl){p.x+=(p.tx-p.x)*Math.min(1,dt*10);p.z+=(p.tz-p.z)*Math.min(1,dt*10);p.y+=((p.ty||0)-p.y)*Math.min(1,dt*14);let d=p.tr-p.r;d=Math.atan2(Math.sin(d),Math.cos(d));p.r+=d*Math.min(1,dt*10)}
if(Math.hypot(p.x-p.lx,p.z-p.lz)>.02&&p.y<.1&&(p.tt-=dt)<=0){trail(p.x,p.z,p.c1);p.tt=.12}
p.spd=Math.hypot(p.x-p.lx,p.z-p.lz)/Math.max(dt,.001);p.lx=p.x;p.lz=p.z;jelly(p,dt);p.root.position.set(p.x,p.y,p.z);p.m.rotation.y=p.r;animE(p,now)}
PT.forEach(q=>{if(q.l>0){q.l-=dt;q.vy-=14*dt;q.m.position.x+=q.vx*dt;q.m.position.y+=q.vy*dt;q.m.position.z+=q.vz*dt;q.m.material.opacity=Math.min(1,q.l*3);q.m.scale.setScalar(Math.max(.2,q.l*1.5));if(q.l<=0)q.m.visible=false}});
TR.forEach(t=>{if(t.l>0){t.l-=dt;t.m.material.opacity=Math.max(0,t.l/2.5)*.7;t.m.scale.setScalar(.6+.4*t.l/2.5);if(t.l<=0)t.m.visible=false}});
if(playing){const cp=Math.cos(pitch);cam.position.set(pl.x+Math.sin(cy)*cp*zd,pl.y+1+Math.sin(pitch)*zd,pl.z+Math.cos(cy)*cp*zd);cam.lookAt(pl.x,pl.y+.8,pl.z)}else{menuG.rotation.y+=dt*.7;cam.position.set(0,3.4,8.5);cam.lookAt(0,1.2,0)}
R.render(sc,cam);
if(playing){const x=$('mm').getContext('2d'),f=v=>(v/LIM+1)*48;x.fillStyle='#'+(MAPS[curMap]?MAPS[curMap][1]:0x2f6b3a).toString(16).padStart(6,'0');x.fillRect(0,0,96,96);
  x.fillStyle='#7fd0ff';for(const j of jbs){if(j.x*j.x+j.z*j.z<LIM*LIM)x.fillRect(f(j.x)-1,f(j.z)-1,2,2)}
  for(const id in P){x.fillStyle='#e22';x.fillRect(f(P[id].x)-2,f(P[id].z)-2,4,4)}x.fillStyle='#ff0';x.fillRect(f(pl.x)-2,f(pl.z)-2,4,4);x.strokeStyle='#000';x.strokeRect(f(pl.x)-3,f(pl.z)-3,6,6)}}
requestAnimationFrame(frame);
setInterval(()=>{if(playing&&me&&(Math.abs(pl.x-(pl.sx||0))>.05||Math.abs(pl.z-(pl.sz||0))>.05||Math.abs(pl.r-(pl.sr||0))>.05||Math.abs(pl.y-(pl.sy2||0))>.05)){pl.sx=pl.x;pl.sz=pl.z;pl.sr=pl.r;pl.sy2=pl.y;me.update({x:+pl.x.toFixed(2),z:+pl.z.toFixed(2),y:+pl.y.toFixed(2),r:+pl.r.toFixed(2)})}},120);
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
