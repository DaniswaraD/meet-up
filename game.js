const $=i=>document.getElementById(i),cfg=Object.assign({name:'',c1:'#3a8dff',c2:'#7fd0ff',sh:0,nc:'#ffffff',nf:'monospace',rd:75},JSON.parse(localStorage.mu||'{}')),sv=()=>localStorage.mu=JSON.stringify(cfg);
if(typeof firebase!='undefined')firebase.initializeApp({apiKey:"AIzaSyBrcEg6Ddw8PLmKJxi8rf9-N7eGsy4AUFs",authDomain:"meet-up-e1be8.firebaseapp.com",databaseURL:"https://meet-up-e1be8-default-rtdb.firebaseio.com",projectId:"meet-up-e1be8",storageBucket:"meet-up-e1be8.firebasestorage.app",messagingSenderId:"47326775225",appId:"1:47326775225:web:290a6644c0559ee2979868"});
const TS=typeof firebase!='undefined'?firebase.database.ServerValue.TIMESTAMP:0,KX='X';let db,uid,tT;
const toast=t=>{const e=$('toast');e.textContent=t;e.classList.remove('hide');clearTimeout(tT);tT=setTimeout(()=>e.classList.add('hide'),4500)};
const URLS=['https://meet-up-e1be8-default-rtdb.asia-southeast1.firebasedatabase.app','https://meet-up-e1be8-default-rtdb.firebaseio.com'];
const ready=(async()=>{if(typeof firebase=='undefined')return'net';try{uid=(await firebase.auth().signInAnonymously()).user.uid}catch(e){return'auth'}
for(const u of URLS){const d=firebase.app().database(u),ok=await new Promise(r=>{const ref=d.ref('.info/connected'),f=x=>{if(x.val()){ref.off('value',f);r(1)}};ref.on('value',f);setTimeout(()=>{ref.off('value',f);r(0)},5000)});if(ok){db=d;return''}d.goOffline()}return'db'})();
const ERR={net:'Tidak ada internet',auth:'Aktifkan Anonymous di Firebase Authentication',db:'Database tidak terhubung - cek URL Realtime Database'};
const G={M:'10001 11011 10101 10001 10001 10001 10001',e:'00000 00000 01110 10001 11111 10000 01110',t:'00100 00100 01110 00100 00100 00100 00011','-':'00000 00000 00000 01110 00000 00000 00000',U:'000000100 000001110 000011111 001000100 001000100 001000100 000111000',P:'11110 10001 10001 11110 10000 10000 10000'};
document.querySelectorAll('.ttl').forEach(c=>{c.width=50;c.height=10;const x=c.getContext('2d');let ox=2;for(const ch of'Meet-UP'){const rw=G[ch].split(' ');[[1,1,'#17306b'],[0,0,ch=='U'?'#ffd23f':'#fff']].forEach(([dx,dy,col])=>{x.fillStyle=col;rw.forEach((r,j)=>[...r].forEach((v,i)=>v=='1'&&x.fillRect(ox+i+dx,1+j+dy,1,1)))});ox+=rw[0].length+1}});
// three
const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'low-power'}),sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,1,.1,200);
sc.add(new THREE.HemisphereLight(0xffffff,0x667788,.95));const dl=new THREE.DirectionalLight(0xffffff,.5);dl.position.set(.5,1,.3);sc.add(dl);
function rs(){const h=240,w=Math.round(h*innerWidth/innerHeight);R.setPixelRatio(1);R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}addEventListener('resize',rs);rs();
function setRD(){const r=cfg.rd;$('rl').textContent='Render distance: '+r+'J';if(sc.fog){sc.fog.near=r;sc.fog.far=r*1.5}cam.far=r*1.6+10;cam.updateProjectionMatrix()}
const MAPS={island:[0x8fd0ff,0x5cb85c],desert:[0xf2d49b,0xe0c070],forest:[0x5f8f64,0x2f6b3a],snow:[0xdcecff,0xf4f8ff]};
let world=new THREE.Group(),obs=[],curMap='island',LIM=46;
function build(n){sc.remove(world);world=new THREE.Group();sc.add(world);obs=[];curMap=n;LIM=n=='island'?46:47.5;const[sk,gr]=MAPS[n];sc.background=new THREE.Color(sk);sc.fog=new THREE.Fog(sk,cfg.rd,cfg.rd*1.5);setRD();
let s=n.length*7919;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
const M=(g,c,x,y,z)=>{const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c,flatShading:true}));m.position.set(x,y,z);world.add(m);return m},
disc=(r,c,y,x=0,z=0)=>M(new THREE.CircleGeometry(r,24).rotateX(-1.5708),c,x,y,z),C=(a,b,h,k)=>new THREE.CylinderGeometry(a,b,h,k),K=(r,h,k)=>new THREE.ConeGeometry(r,h,k);
disc(300,n=='island'?0x2a7fd0:gr,-.3);if(n=='island')disc(51,0xf0dc9a,-.1);disc(n=='island'?44:49,gr,0);if(n=='snow')disc(10,0xaee6ff,.03,14,-10);
if(n=='island'){for(let i=0;i<48;i++){const a=i/48*6.283;M(C(.15,.15,1.6,5),0x8b5a2b,Math.cos(a)*47.5,.8,Math.sin(a)*47.5)}[1.2,.6].forEach(y=>M(new THREE.TorusGeometry(47.5,.12,4,48).rotateX(1.5708),0x8b5a2b,0,y,0))}
else{const g=new THREE.CylinderGeometry(50,53,8,32,1,true),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),k=1+Math.sin(a*7)*.03;p.setX(i,x*k);p.setZ(i,z*k);if(p.getY(i)>0)p.setY(i,4+Math.abs(Math.sin(a*5))*2.5)}g.computeVertexNormals();M(g,{desert:0xc99a5b,forest:0x1f4d2a,snow:0xcfeaff}[n],0,3.7,0).material.side=THREE.DoubleSide}
const put=(c,f,r)=>{for(let i=0;i<c;i++){const a=rnd()*6.283,d=Math.sqrt(rnd())*(n=='island'?42:47),x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<4||n=='snow'&&Math.hypot(x-14,z+10)<11)continue;f(x,z);if(r)obs.push({x,z,r})}},
tree=(c,two)=>(x,z)=>{const k=1.7+rnd()*.9;M(C(.2*k,.3*k,1.4*k,5),0x6b4a2b,x,.7*k,z);M(K(1.2*k,2.4*k,6),c,x,2.4*k,z);if(two)M(K(.9*k,1.8*k,6),c,x,3.6*k,z)},rock=(x,z)=>M(new THREE.DodecahedronGeometry(.7+rnd()*.5),n=='snow'?0xcfd8e0:0x8a8a8a,x,.4,z);
if(n=='island'){put(30,(x,z)=>M(new THREE.IcosahedronGeometry(.7+rnd()*.4,0),0x3aa84a,x,.5,z));put(22,tree(0x2e8b3a,1),1.1);put(14,rock,.9);put(70,(x,z)=>M(new THREE.SphereGeometry(.14,4,3),[0xff6688,0xffee55,0xffffff][rnd()*3|0],x,.15,z))}
if(n=='desert'){put(18,(x,z)=>{M(C(.3,.3,2.2,6),0x3c8f4a,x,1.1,z);M(new THREE.BoxGeometry(.9,.25,.25),0x3c8f4a,x+.5,1.3,z)},.5);put(12,rock,.9);put(8,(x,z)=>M(new THREE.SphereGeometry(5,6,4),0xe6c880,x,-.6,z).scale.y=.3)}
if(n=='forest'){put(100,tree(0x1f5e2c,1),1.1);put(40,(x,z)=>disc(1+rnd()*1.5,0x4f8f3f,.02,x,z));put(10,rock,.9)}
if(n=='snow'){put(35,tree(0xe8f4ff,1),1.1);put(10,rock,.9)}}
// ui helpers
const spr=(w,h,f,sx,sy)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(sx,sy,1);s.renderOrder=9;return s},
nameS=(n,c,f)=>spr(128,24,x=>{x.font=`bold 16px ${f}`;x.textAlign='center';x.lineWidth=4;x.strokeStyle='#000';x.strokeText(n,64,17);x.fillStyle=c;x.fillText(n,64,17)},3.2,.6),
chatS=t=>spr(256,28,x=>{x.fillStyle='#fff';x.fillRect(0,0,256,28);x.fillStyle='#000';x.font='14px monospace';x.textAlign='center';x.fillText(t.slice(0,32),128,19)},5,.55),
IC=['..PPP... .PPYPP.. ..PPP... ...G.... .G.G.... .GGG.... ...G.... ...G....','..PPP... .PPPPP.. .WWWWW.. .WWWWW.. ..CCC... ..CCC... ...C.... ...C....','.RR..RR. RRRRRRRR RRRRRRRR RRRRRRRR .RRRRRR. ..RRRR.. ...RR... ........','...OO... ..OOOO.. .OOOOOO. .OOOOOO. ..OOOO.. ...OO... .SSSSSS. ........','R......R .R....R. ..R..R.. ...RR... ...RR... ..R..R.. .R....R. R......R','..YYYY.. .YYYYYY. YKYYYYKY YYYYYYYY YKKKKKKY .YKRRKY. ..YYYY.. ........','..YYYY.. .YYYYYY. YYKYYKYY YYSYYSYY YYSYYSYY YYYKKYYY .YKYYKY. ..YYYY..','..YYYY.. .YYYYYY. YRRYYRRY YRRYYRRY YYYYYYYY YKYYYYKY .YKKKKY. ..YYYY..'],
PAL={P:'#ff9ec4',Y:'#ffd23f',G:'#3fbf5f',W:'#ffffff',C:'#f6b26b',R:'#ff4d6d',O:'#ff8c1a',S:'#5db5ff',K:'#17306b'},
icoC=i=>{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');IC[i].split(' ').forEach((r,j)=>[...r].forEach((v,k)=>{if(v!='.'){x.fillStyle=PAL[v];x.fillRect(k,j,1,1)}}));return c},
icoS=i=>{const t=new THREE.CanvasTexture(icoC(i));t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(1.3,1.3,1);s.renderOrder=9;return s};
function mkP(o){const sh=o.sh|0,root=new THREE.Group(),m=new THREE.Group(),
geo=[new THREE.SphereGeometry(.9,8,5,0,6.2832,0,1.5708),new THREE.BoxGeometry(1.5,1,1.5).translate(0,.5,0),new THREE.ConeGeometry(1,1.3,3).translate(0,.65,0),new THREE.SphereGeometry(.85,8,6).translate(0,.85,0),new THREE.CylinderGeometry(.8,.9,1.1,8).translate(0,.55,0),new THREE.ConeGeometry(1,1.4,4).translate(0,.7,0),new THREE.OctahedronGeometry(.95).translate(0,.95,0)][sh],a=new THREE.Color(o.c1),b=new THREE.Color(o.c2),p=geo.attributes.position,cl=[];
for(let i=0;i<p.count;i++){const c=a.clone().lerp(b,Math.min(1,Math.max(0,p.getY(i)/1.1)));cl.push(c.r,c.g,c.b)}
geo.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));m.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true})));
const ez=[.78,.7,.5,.8,.84,.45,.45][sh],eyes=new THREE.Group(),hearts=new THREE.Group(),tears=new THREE.Group();
[-.3,.3].forEach(x=>{const e=new THREE.Mesh(new THREE.BoxGeometry(.16,.24,.1),new THREE.MeshBasicMaterial({color:0x111111}));e.position.set(x,.5,ez);eyes.add(e);const h=icoS(2);h.scale.set(.4,.4,1);h.position.set(x,.5,ez);hearts.add(h);const t=new THREE.Mesh(new THREE.BoxGeometry(.08,.14,.08),new THREE.MeshBasicMaterial({color:0x44aaff}));t.position.set(x,.3,ez+.05);tears.add(t)});
hearts.visible=tears.visible=false;m.add(eyes,hearts,tears);m.rotation.order='YXZ';root.add(m);const nm=nameS(o.n||o.name||'?',o.nc,o.nf);nm.position.y=2.1;root.add(nm);
const icos={};[0,1,2,4].forEach(k=>{const s=icoS(k);s.position.y=3.4;s.visible=false;root.add(s);icos[k]=s});
sc.add(root);return{root,m,eyes,hearts,tears,icos,x:0,z:0,y:0,vy:0,py:0,pvy:0,air:0,js:1,jx:1,sv:0,lean:0,flip:0,spd:0,jc:0,jh:0,ty:0,r:0,tx:0,tz:0,tr:0,e:-1,et:0,lEt:-1,lCt:-1,init:0,lx:0,lz:0,tt:0,c1:o.c1,chat:null,ce:0}}
function setE(p,e){p.e=e;p.et=performance.now()}
function say(p,t){if(p.chat)p.root.remove(p.chat);p.chat=chatS(t);p.chat.position.y=2.75;p.root.add(p.chat);p.ce=performance.now()+5000}
function animE(p,t){const d=(t-p.et)/1000,e=d<4?p.e:-1;let y=0,sx=1,sy=1;if(e==3){y=.9*Math.sin(d*4.5)**2;sy=1+.12*Math.cos(d*9)}if(e==4){sy=.75;sx=1.2}if(e==5&&d%2<1)y=Math.abs(Math.sin(d*14))*.5;if(e==6){sy=.7;sx=1.2}
p.eyes.scale.y=(t%3200<130)?.1:(p.air?1.35:1);p.hearts.visible=e==7;p.eyes.visible=e!=7;p.tears.visible=e==6;p.tears.children.forEach((c,i)=>c.position.y=.4-((d*1.5+i*.5)%1)*.4);for(const k in p.icos){p.icos[k].visible=+k==e;p.icos[k].position.y=3.4+Math.sin(t/200)*.1}
p.m.position.y=y+(p.air?0:Math.abs(Math.sin(t/110))*.1*Math.min(1,p.spd/4));p.m.rotation.z=p.air?0:Math.sin(t/110)*.06*Math.min(1,p.spd/4);p.m.rotation.x=p.lean+p.flip;p.m.scale.set(sx*p.jx,sy*p.js,sx*p.jx);if(p.chat&&t>p.ce){p.root.remove(p.chat);p.chat=null}}
function jelly(p,dt){const vy=(p.y-p.py)/Math.max(dt,.001);p.py=p.y;const air=p.y>.08;
if(air&&!p.air){p.js=.65;puff(p.x,p.z,7,p.c1)}
if(!air&&p.air){p.js=Math.max(.5,.9-Math.min(1,-p.pvy/14)*.45);p.sv=0;puff(p.x,p.z,14,p.c1);trail(p.x,p.z,p.c1)}
if(air&&p.air&&vy-p.pvy>6&&vy>3){p.flip=.01;puff(p.x,p.z,8,'#ffe27a',5)}
p.air=air;p.pvy=vy;const ty=air?1+Math.max(-.2,Math.min(.4,vy*.05)):1;
p.sv+=((ty-p.js)*240-p.sv*11)*dt;p.js=Math.max(.45,Math.min(1.6,p.js+p.sv*dt));p.jx=1/Math.sqrt(p.js);
if(p.flip>0){p.flip+=dt*13;if(p.flip>6.283)p.flip=0}
p.lean+=((air?0:Math.min(.3,p.spd*.035))-p.lean)*Math.min(1,dt*10)}
const PT=[],pG=new THREE.BoxGeometry(.2,.2,.2);
function puff(x,z,n,c,up){for(let i=0;i<n;i++){let q=PT.find(o=>o.l<=0);if(!q){if(PT.length>=60)return;const m=new THREE.Mesh(pG,new THREE.MeshBasicMaterial({transparent:true}));sc.add(m);q={m,l:0,vx:0,vy:0,vz:0};PT.push(q)}const a=Math.random()*6.283,v=1.5+Math.random()*2;q.l=.6;q.vx=Math.cos(a)*v;q.vz=Math.sin(a)*v;q.vy=1.5+Math.random()*(up||2.5);q.m.material.color.set(i%3?c:'#ffffff');q.m.position.set(x,.15,z);q.m.visible=true}}
const TR=[],trG=new THREE.CircleGeometry(.45,7).rotateX(-1.5708);
function trail(x,z,c){let t=TR.find(q=>q.l<=0);if(!t){if(TR.length>=40)return;const m=new THREE.Mesh(trG,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}));sc.add(m);t={m,l:0};TR.push(t)}t.l=2.5;t.m.material.color.set(c);t.m.position.set(x,.06,z);t.m.visible=true}
// state
let me,base,rid,host=false,playing=false,joined=false,pl,P={},cy=0,zd=5,pitch=.6,keys={},ix=0,iy=0,run=false,jmp=false,last=performance.now(),dpr;
const screens=['name','menu','skin','croom','lobby','set'],show=id=>screens.forEach(s=>$(s).classList.toggle('hide',s!=id));
function setSelf(){if(pl&&pl.root.parent)pl.root.parent.remove(pl.root);pl=mkP({...cfg,n:cfg.name});(playing?sc:menuG).add(pl.root)}
const menuG=new THREE.Group();menuG.add(new THREE.Mesh(new THREE.CylinderGeometry(3,3,.4,16),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true})).translateY(-.2),new THREE.Mesh(new THREE.CylinderGeometry(3.3,3.5,.3,16),new THREE.MeshLambertMaterial({color:0xb8d8ff,flatShading:true})).translateY(-.5));sc.add(menuG);
function menuMode(){playing=false;world.visible=false;menuG.visible=true;sc.background=new THREE.Color(0x8fd0ff);sc.fog=null;pl.x=pl.z=pl.y=0;menuG.add(pl.root);zd=5}
build('island');setSelf();menuMode();
$('nm').value=cfg.name;show(cfg.name?'menu':'name');
$('ng').onclick=()=>{const v=$('nm').value.trim().slice(0,14);if(!v)return;cfg.name=v;sv();setSelf();show('menu')};
document.querySelectorAll('.bk').forEach(b=>b.onclick=()=>show('menu'));
$('ms').onclick=()=>show('skin');$('mr').onclick=()=>show('croom');$('mt').onclick=()=>{show('set');$('set').classList.remove('hide')};
for(const k of['c1','c2','sh','nc','nf']){const el=$(k);el.value=cfg[k];el.oninput=()=>{cfg[k]=k=='sh'?+el.value:el.value;sv();setSelf()}}
$('rd').value=cfg.rd;$('rd').oninput=e=>{cfg.rd=+e.target.value;sv();setRD()};
$('sb').onclick=()=>{$('set').classList.add('hide');playing?$('pause').classList.remove('hide'):show('menu')};
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e});$('md').onclick=()=>dp?dp.prompt():alert('Browser menu > "Tambahkan ke layar utama"');
// net
async function join(id,map,h){const er=await ready;if(er){toast(ERR[er]);return 0}try{return await join2(id,map,h)}catch(e){toast('Gagal masuk: '+(e.code||e.message));return 0}}
async function join2(id,map,h){rid=id;host=h;base=db.ref('rooms/'+id);me=base.child('players/'+uid);me.onDisconnect().remove();const sx=(Math.random()-.5)*8,sz=(Math.random()-.5)*8;
await me.set({n:cfg.name,c1:cfg.c1,c2:cfg.c2,sh:cfg.sh,nc:cfg.nc,nf:cfg.nf,x:sx,z:sz,r:0,e:-1,et:0,ct:0,ch:' '});pl.x=sx;pl.z=sz;joined=true;base.child('players').on('value',onPl);
if(id[0]!='g'){base.child('meta').on('value',s=>{const m=s.val();if(m&&m.started&&!playing)start(m.map)})}return 1}
function onPl(s){const v=s.val()||{};if(joined&&!v[uid]){leave();alert('Kamu keluar dari room');return}
$('ll').innerHTML='';for(const id in v){const r=document.createElement('div');r.className='row';r.innerHTML=`<i style="background:${v[id].c1}"></i><b></b>`;r.lastChild.textContent=v[id].n+(id==uid?' (kamu)':'');if(host&&id!=uid){const x=document.createElement('button');x.className='kick';x.textContent=KX;x.onclick=()=>base.child('players/'+id).remove();r.append(x)}$('ll').append(r)}
for(const id in v){if(id==uid)continue;const d=v[id];let p=P[id];if(!p)p=P[id]=mkP(d),p.x=d.x,p.z=d.z;p.tx=d.x;p.tz=d.z;p.tr=d.r;p.ty=d.y||0;if(d.et!==p.lEt){if(p.init&&d.e>=0)setE(p,d.e);p.lEt=d.et}if(d.ct!==p.lCt){if(p.init&&d.ch.trim())say(p,d.ch);p.lCt=d.ct}p.init=1}
for(const id in P)if(!v[id]){sc.remove(P[id].root);delete P[id]}}
function start(map){build(map);world.visible=true;menuG.visible=false;sc.add(pl.root);playing=true;['menu','lobby'].forEach(i=>$(i).classList.add('hide'));$('hud').classList.remove('hide');zd=9}
async function leave(){joined=false;playing=false;if(base){base.child('players').off();base.child('meta').off();try{if(host&&rid[0]!='g')await base.remove();else await me.remove()}catch(e){}}for(const id in P)sc.remove(P[id].root);P={};base=me=null;$('hud').classList.add('hide');$('pause').classList.add('hide');menuMode();show('menu')}
$('mp').onclick=async()=>{const m='island';$('mp').disabled=true;const ok=await join('g_'+m,m,false);$('mp').disabled=false;if(!ok)toast('Main solo (offline)');start(m)};
const code=()=>Math.random().toString(36).slice(2,7).toUpperCase();
$('rc').onclick=async()=>{const er=await ready;if(er)return toast(ERR[er]);const m=$('rm').value,c=code();try{await db.ref('rooms/'+c+'/meta').set({host:uid,map:m,started:false})}catch(e){return toast('Gagal buat room: '+e.code)}if(await join(c,m,true)){$('lc').textContent=c;$('lg').classList.remove('hide');show('lobby')}};
$('rj').onclick=async()=>{const er=await ready;if(er)return toast(ERR[er]);const c=$('ri').value.trim().toUpperCase();let r;try{r=await db.ref('rooms/'+c+'/meta').once('value')}catch(e){return toast('Gagal: '+e.code)}if(!r.exists())return toast('Room tidak ditemukan');if(await join(c,r.val().map,false)){$('lc').textContent=c;$('lg').classList.add('hide');show('lobby')}};
$('lg').onclick=async()=>{await base.child('meta/started').set(true);start(curMapOf())};const curMapOf=()=>$('rm').value;
$('lx').onclick=leave;$('pe').onclick=leave;$('pb').onclick=()=>$('pause').classList.remove('hide');$('pr').onclick=()=>$('pause').classList.add('hide');$('ps').onclick=()=>{$('pause').classList.add('hide');$('set').classList.remove('hide')};
// hotbar & chat
IC.forEach((ic,i)=>{const b=document.createElement('button');b.append(icoC(i));b.insertAdjacentHTML('beforeend','<small>'+(i+1)+'</small>');b.onclick=()=>emo(i);$('bar').append(b)});
function emo(i){if(!playing)return;setE(pl,i);me&&me.update({e:i,et:TS});[...$('bar').children].forEach((b,j)=>b.classList.toggle('on',j==i));setTimeout(()=>[...$('bar').children].forEach(b=>b.classList.remove('on')),600)}
function send(){const t=$('ci').value.trim();if(t){say(pl,t);me&&me.update({ch:t,ct:TS})}$('ci').value='';$('chat').classList.add('hide')}
$('cb').onclick=()=>{$('chat').classList.toggle('hide');$('ci').focus()};$('cs').onclick=send;$('ci').onkeydown=e=>{if(e.key=='Enter')send()};
// input
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'){return}keys[e.code]=1;if(e.key>='1'&&e.key<='8')emo(e.key-1);if(e.key=='Enter'){$('chat').classList.remove('hide');$('ci').focus();e.preventDefault()}});addEventListener('keyup',e=>keys[e.code]=0);
let ds=0,lx=0,ly=0,cvT={};const look=(dx,dy)=>{cy-=dx*.008;pitch=Math.min(1.35,Math.max(.05,pitch+dy*.006))};
cv.onmousedown=e=>{ds=1;lx=e.clientX;ly=e.clientY};addEventListener('mouseup',()=>ds=0);addEventListener('mousemove',e=>{if(ds&&playing){look(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY}});cv.onwheel=e=>zd=Math.min(16,Math.max(3,zd+e.deltaY*.01));
cv.ontouchstart=e=>{for(const t of e.changedTouches)cvT[t.identifier]={x:t.clientX,y:t.clientY}};
cv.ontouchmove=e=>{const ids=Object.keys(cvT);if(ids.length>=2){const a=cvT[ids[0]],b=cvT[ids[1]],d0=Math.hypot(a.x-b.x,a.y-b.y);for(const t of e.changedTouches)if(cvT[t.identifier])Object.assign(cvT[t.identifier],{x:t.clientX,y:t.clientY});zd=Math.min(16,Math.max(3,zd-(Math.hypot(a.x-b.x,a.y-b.y)-d0)*.03))}else for(const t of e.changedTouches){const o=cvT[t.identifier];if(o){if(playing)look(t.clientX-o.x,t.clientY-o.y);o.x=t.clientX;o.y=t.clientY}}};
cv.ontouchend=cv.ontouchcancel=e=>{for(const t of e.changedTouches)delete cvT[t.identifier]};
const lockL=()=>{try{if(matchMedia('(pointer:coarse)').matches)(document.documentElement.requestFullscreen?document.documentElement.requestFullscreen():Promise.resolve()).then(()=>screen.orientation.lock('landscape')).catch(()=>{})}catch(e){}};addEventListener('pointerdown',lockL,{once:true});
if(matchMedia('(pointer:coarse)').matches)$('mob').classList.remove('hide');
const joy=$('joy'),kn=$('kn');const jm=e=>{const t=e.targetTouches[0],r=joy.getBoundingClientRect(),dx=t.clientX-r.left-60,dy=t.clientY-r.top-60,l=Math.min(1,Math.hypot(dx,dy)/50),a=Math.atan2(dy,dx);ix=Math.cos(a)*l;iy=-Math.sin(a)*l;kn.style.left=40+Math.cos(a)*l*40+'px';kn.style.top=40+Math.sin(a)*l*40+'px'};
joy.ontouchstart=joy.ontouchmove=e=>{e.stopPropagation();jm(e)};joy.ontouchend=()=>{ix=iy=0;kn.style.left=kn.style.top='40px'};$('jb').ontouchstart=()=>jmp=true;$('rb').ontouchstart=()=>{run=!run;$('rb').classList.toggle('s',!run)};
// loop
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;
if(playing){if(keys.ArrowLeft)cy+=dt*2;if(keys.ArrowRight)cy-=dt*2;if(keys.ArrowUp)pitch=Math.max(.05,pitch-dt*1.5);if(keys.ArrowDown)pitch=Math.min(1.35,pitch+dt*1.5);let a=ix+(keys.KeyD?1:0)-(keys.KeyA?1:0),b=iy+(keys.KeyW?1:0)-(keys.KeyS?1:0);const l=Math.hypot(a,b);if(l>1)a/=l,b/=l;
const mx=Math.cos(cy)*a-Math.sin(cy)*b,mz=-Math.sin(cy)*a-Math.cos(cy)*b,sp=(run||keys.ShiftLeft)?8:4.5;pl.x+=mx*sp*dt;pl.z+=mz*sp*dt;if(a||b){const t=Math.atan2(mx,mz);let d=t-pl.r;d=Math.atan2(Math.sin(d),Math.cos(d));pl.r+=d*Math.min(1,dt*12)}
const jn=jmp||keys.Space;if(pl.y<=0)pl.jc=0;if(jn&&(pl.y<=0?1:!pl.jh)&&pl.jc<2){pl.vy=pl.jc?9:8;pl.jc++}pl.jh=!!jn;jmp=false;pl.vy-=22*dt;pl.y=Math.max(0,pl.y+pl.vy*dt);if(pl.y==0&&pl.vy<0)pl.vy=0;
for(const o of obs){const dx=pl.x-o.x,dz=pl.z-o.z,d=Math.hypot(dx,dz),m=o.r+.6;if(d<m&&d>0&&pl.y<1.5){pl.x=o.x+dx/d*m;pl.z=o.z+dz/d*m}}const rr=Math.hypot(pl.x,pl.z);if(rr>LIM){pl.x*=LIM/rr;pl.z*=LIM/rr}}
else pl.r=0
const all=[pl,...Object.values(P)];for(const p of all){if(p!==pl)p.root.visible=playing;if(p!==pl){p.x+=(p.tx-p.x)*Math.min(1,dt*10);p.z+=(p.tz-p.z)*Math.min(1,dt*10);p.y+=((p.ty||0)-p.y)*Math.min(1,dt*14);let d=p.tr-p.r;d=Math.atan2(Math.sin(d),Math.cos(d));p.r+=d*Math.min(1,dt*10)}
if(Math.hypot(p.x-p.lx,p.z-p.lz)>.02&&p.y<.1&&(p.tt-=dt)<=0){trail(p.x,p.z,p.c1);p.tt=.12}p.spd=Math.hypot(p.x-p.lx,p.z-p.lz)/Math.max(dt,.001);p.lx=p.x;p.lz=p.z;jelly(p,dt);p.root.position.set(p.x,p.y,p.z);p.m.rotation.y=p.r;animE(p,now)}
PT.forEach(q=>{if(q.l>0){q.l-=dt;q.vy-=14*dt;q.m.position.x+=q.vx*dt;q.m.position.y+=q.vy*dt;q.m.position.z+=q.vz*dt;q.m.material.opacity=Math.min(1,q.l*3);q.m.scale.setScalar(Math.max(.2,q.l*1.5));if(q.l<=0)q.m.visible=false}});TR.forEach(t=>{if(t.l>0){t.l-=dt;t.m.material.opacity=Math.max(0,t.l/2.5)*.7;t.m.scale.setScalar(.6+.4*t.l/2.5);if(t.l<=0)t.m.visible=false}});
if(playing){const cp=Math.cos(pitch);cam.position.set(pl.x+Math.sin(cy)*cp*zd,pl.y+1+Math.sin(pitch)*zd,pl.z+Math.cos(cy)*cp*zd);cam.lookAt(pl.x,pl.y+.8,pl.z)}else{menuG.rotation.y+=dt*.7;cam.position.set(0,3.4,8.5);cam.lookAt(0,1.2,0)}R.render(sc,cam);
if(playing){const x=$('mm').getContext('2d'),f=v=>(v/50+1)*48;x.fillStyle='#'+MAPS[curMap][1].toString(16).padStart(6,'0');x.fillRect(0,0,96,96);for(const id in P){x.fillStyle='#e22';x.fillRect(f(P[id].x)-2,f(P[id].z)-2,4,4)}x.fillStyle='#ff0';x.strokeRect(f(pl.x)-3,f(pl.z)-3,6,6);x.fillRect(f(pl.x)-2,f(pl.z)-2,4,4)}}
requestAnimationFrame(frame);
setInterval(()=>{if(playing&&me&&(Math.abs(pl.x-(pl.sx||0))>.02||Math.abs(pl.z-(pl.sz||0))>.02||Math.abs(pl.r-(pl.sr||0))>.05||Math.abs(pl.y-(pl.sy2||0))>.04)){pl.sx=pl.x;pl.sz=pl.z;pl.sr=pl.r;pl.sy2=pl.y;me.update({x:+pl.x.toFixed(2),z:+pl.z.toFixed(2),r:+pl.r.toFixed(2),y:+pl.y.toFixed(2)})}},100);
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
