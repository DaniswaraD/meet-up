const $=i=>document.getElementById(i),cfg=Object.assign({name:'',c1:'#3a8dff',c2:'#7fd0ff',sh:0,nc:'#ffffff',nf:'monospace',rd:75},JSON.parse(localStorage.mu||'{}')),sv=()=>localStorage.mu=JSON.stringify(cfg);
firebase.initializeApp({apiKey:"AIzaSyBrcEg6Ddw8PLmKJxi8rf9-N7eGsy4AUFs",authDomain:"meet-up-e1be8.firebaseapp.com",databaseURL:"https://meet-up-e1be8-default-rtdb.firebaseio.com",projectId:"meet-up-e1be8",storageBucket:"meet-up-e1be8.firebasestorage.app",messagingSenderId:"47326775225",appId:"1:47326775225:web:290a6644c0559ee2979868"});
const db=firebase.database(),TS=firebase.database.ServerValue.TIMESTAMP;let uid;firebase.auth().signInAnonymously().then(u=>uid=u.user.uid).catch(e=>alert('Auth gagal: aktifkan Anonymous di Firebase Auth'));
// title (pixel)
for(const id of['t0','title']){const x=$(id).getContext('2d');x.fillStyle=x.strokeStyle='#123';x.font='bold 22px monospace';x.textBaseline='top';x.fillText('Meet-',2,3);x.lineWidth=4;x.beginPath();x.moveTo(71,6);x.lineTo(71,17);x.arc(79,17,8,Math.PI,0,true);x.lineTo(87,8);x.stroke();x.lineWidth=3;x.beginPath();x.moveTo(82,10);x.lineTo(87,3);x.lineTo(92,10);x.stroke();x.fillText('P',96,3)}
// three
const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'low-power'}),sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(60,1,.1,200);
sc.add(new THREE.HemisphereLight(0xffffff,0x667788,.95));const dl=new THREE.DirectionalLight(0xffffff,.5);dl.position.set(.5,1,.3);sc.add(dl);
function rs(){const h=240,w=Math.round(h*innerWidth/innerHeight);R.setPixelRatio(1);R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}addEventListener('resize',rs);rs();
function setRD(){const r=cfg.rd;$('rl').textContent='Render distance: '+r+'J';if(sc.fog){sc.fog.near=r;sc.fog.far=r*1.5}cam.far=r*1.6+10;cam.updateProjectionMatrix()}
const MAPS={island:[0x8fd0ff,0x5cb85c],desert:[0xf2d49b,0xe0c070],forest:[0x5f8f64,0x2f6b3a],snow:[0xdcecff,0xf4f8ff]};
let world=new THREE.Group(),obs=[],curMap='island';
function build(n){sc.remove(world);world=new THREE.Group();sc.add(world);obs=[];curMap=n;const[sk,gr]=MAPS[n];sc.background=new THREE.Color(sk);sc.fog=new THREE.Fog(sk,cfg.rd,cfg.rd*1.5);setRD();
let s=n.length*7919;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
const M=(g,c,x,y,z)=>{const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c,flatShading:true}));m.position.set(x,y,z);world.add(m);return m},
disc=(r,c,y,x=0,z=0)=>M(new THREE.CircleGeometry(r,24).rotateX(-1.5708),c,x,y,z),C=(a,b,h,k)=>new THREE.CylinderGeometry(a,b,h,k),K=(r,h,k)=>new THREE.ConeGeometry(r,h,k);
disc(300,n=='island'?0x2a7fd0:gr,-.3);if(n=='island')disc(51,0xf0dc9a,-.1);disc(n=='island'?44:49,gr,0);if(n=='snow')disc(10,0xaee6ff,.03,14,-10);
const put=(c,f,r)=>{for(let i=0;i<c;i++){const a=rnd()*6.283,d=Math.sqrt(rnd())*(n=='island'?42:47),x=Math.cos(a)*d,z=Math.sin(a)*d;if(Math.hypot(x,z)<4||n=='snow'&&Math.hypot(x-14,z+10)<11)continue;f(x,z);if(r)obs.push({x,z,r})}},
tree=(c,two)=>(x,z)=>{M(C(.2,.3,1.4,5),0x6b4a2b,x,.7,z);M(K(1.2,2.4,6),c,x,2.4,z);if(two)M(K(.9,1.8,6),c,x,3.6,z)},rock=(x,z)=>M(new THREE.DodecahedronGeometry(.7+rnd()*.5),n=='snow'?0xcfd8e0:0x8a8a8a,x,.4,z);
if(n=='island'){put(22,tree(0x2e8b3a),.7);put(14,rock,.9);put(70,(x,z)=>M(new THREE.SphereGeometry(.14,4,3),[0xff6688,0xffee55,0xffffff][rnd()*3|0],x,.15,z))}
if(n=='desert'){put(18,(x,z)=>{M(C(.3,.3,2.2,6),0x3c8f4a,x,1.1,z);M(new THREE.BoxGeometry(.9,.25,.25),0x3c8f4a,x+.5,1.3,z)},.5);put(12,rock,.9);put(8,(x,z)=>M(new THREE.SphereGeometry(5,6,4),0xe6c880,x,-.6,z).scale.y=.3)}
if(n=='forest'){put(100,tree(0x1f5e2c,1),.7);put(40,(x,z)=>disc(1+rnd()*1.5,0x4f8f3f,.02,x,z));put(10,rock,.9)}
if(n=='snow'){put(35,tree(0xe8f4ff,1),.7);put(10,rock,.9)}}
// ui helpers
const spr=(w,h,f,sx,sy)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(sx,sy,1);s.renderOrder=9;return s},
nameS=(n,c,f)=>spr(128,24,x=>{x.font=`bold 16px ${f}`;x.textAlign='center';x.lineWidth=4;x.strokeStyle='#000';x.strokeText(n,64,17);x.fillStyle=c;x.fillText(n,64,17)},3.2,.6),
chatS=t=>spr(256,28,x=>{x.fillStyle='#fff';x.fillRect(0,0,256,28);x.fillStyle='#000';x.font='14px monospace';x.textAlign='center';x.fillText(t.slice(0,32),128,19)},5,.55),
icoS=e=>spr(32,32,x=>{x.font='26px serif';x.textAlign='center';x.fillText(e,16,26)},1,1),IC=['🌸','🍦','❤️','⤴','💢','😂','😭','😍'];
function mkP(o){const sh=o.sh|0,root=new THREE.Group(),m=new THREE.Group(),
geo=[new THREE.SphereGeometry(.9,8,5,0,6.2832,0,1.5708),new THREE.BoxGeometry(1.5,1,1.5).translate(0,.5,0),new THREE.ConeGeometry(1,1.3,3).translate(0,.65,0)][sh],a=new THREE.Color(o.c1),b=new THREE.Color(o.c2),p=geo.attributes.position,cl=[];
for(let i=0;i<p.count;i++){const c=a.clone().lerp(b,Math.min(1,Math.max(0,p.getY(i)/1.1)));cl.push(c.r,c.g,c.b)}
geo.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));m.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true})));
const ez=[.78,.7,.5][sh],eyes=new THREE.Group(),hearts=new THREE.Group(),tears=new THREE.Group();
[-.3,.3].forEach(x=>{const e=new THREE.Mesh(new THREE.BoxGeometry(.16,.24,.1),new THREE.MeshBasicMaterial({color:0x111111}));e.position.set(x,.5,ez);eyes.add(e);const h=icoS('❤️');h.scale.set(.4,.4,1);h.position.set(x,.5,ez);hearts.add(h);const t=new THREE.Mesh(new THREE.BoxGeometry(.08,.14,.08),new THREE.MeshBasicMaterial({color:0x44aaff}));t.position.set(x,.3,ez+.05);tears.add(t)});
hearts.visible=tears.visible=false;m.add(eyes,hearts,tears);root.add(m);const nm=nameS(o.n||o.name||'?',o.nc,o.nf);nm.position.y=2.1;root.add(nm);
const icos={};[0,1,2,4].forEach(k=>{const s=icoS(IC[k]);s.position.y=3.4;s.visible=false;root.add(s);icos[k]=s});
sc.add(root);return{root,m,eyes,hearts,tears,icos,x:0,z:0,y:0,vy:0,r:0,tx:0,tz:0,tr:0,e:-1,et:0,lEt:-1,lCt:-1,init:0,lx:0,lz:0,tt:0,c1:o.c1,chat:null,ce:0}}
function setE(p,e){p.e=e;p.et=performance.now()}
function say(p,t){if(p.chat)p.root.remove(p.chat);p.chat=chatS(t);p.chat.position.y=2.75;p.root.add(p.chat);p.ce=performance.now()+5000}
function animE(p,t){const d=(t-p.et)/1000,e=d<4?p.e:-1;let y=0,sx=1,sy=1;if(e==3){y=.9*Math.sin(d*4.5)**2;sy=1+.12*Math.cos(d*9)}if(e==4){sy=.75;sx=1.2}if(e==5&&d%2<1)y=Math.abs(Math.sin(d*14))*.5;if(e==6){sy=.7;sx=1.2}
p.hearts.visible=e==7;p.eyes.visible=e!=7;p.tears.visible=e==6;p.tears.children.forEach((c,i)=>c.position.y=.4-((d*1.5+i*.5)%1)*.4);for(const k in p.icos){p.icos[k].visible=+k==e;p.icos[k].position.y=3.4+Math.sin(t/200)*.1}
p.m.position.y=y;p.m.scale.set(sx,sy,sx);if(p.chat&&t>p.ce){p.root.remove(p.chat);p.chat=null}}
const TR=[],trG=new THREE.CircleGeometry(.45,7).rotateX(-1.5708);
function trail(x,z,c){let t=TR.find(q=>q.l<=0);if(!t){if(TR.length>=40)return;const m=new THREE.Mesh(trG,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}));sc.add(m);t={m,l:0};TR.push(t)}t.l=2.5;t.m.material.color.set(c);t.m.position.set(x,.06,z);t.m.visible=true}
// state
let me,base,rid,host=false,playing=false,joined=false,self,P={},cy=0,zd=5,pitch=.6,keys={},ix=0,iy=0,run=false,jmp=false,last=performance.now(),dpr;
const screens=['name','menu','skin','croom','lobby','set'],show=id=>screens.forEach(s=>$(s).classList.toggle('hide',s!=id));
function setSelf(){if(self)sc.remove(self.root);self=mkP({...cfg,n:cfg.name});sc.add(self.root)}
build('island');setSelf();
$('nm').value=cfg.name;show(cfg.name?'menu':'name');
$('ng').onclick=()=>{const v=$('nm').value.trim().slice(0,14);if(!v)return;cfg.name=v;sv();setSelf();show('menu')};
document.querySelectorAll('.bk').forEach(b=>b.onclick=()=>show('menu'));
$('ms').onclick=()=>show('skin');$('mr').onclick=()=>show('croom');$('mt').onclick=()=>{show('set');$('set').classList.remove('hide')};
for(const k of['c1','c2','sh','nc','nf']){const el=$(k);el.value=cfg[k];el.oninput=()=>{cfg[k]=k=='sh'?+el.value:el.value;sv();setSelf()}}
$('rd').value=cfg.rd;$('rd').oninput=e=>{cfg.rd=+e.target.value;sv();setRD()};
$('sb').onclick=()=>{$('set').classList.add('hide');playing?$('pause').classList.remove('hide'):show('menu')};
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e});$('md').onclick=()=>dp?dp.prompt():alert('Browser menu > "Tambahkan ke layar utama"');
// net
async function join(id,map,h){rid=id;host=h;base=db.ref('rooms/'+id);me=base.child('players/'+uid);me.onDisconnect().remove();const sx=(Math.random()-.5)*8,sz=(Math.random()-.5)*8;
await me.set({n:cfg.name,c1:cfg.c1,c2:cfg.c2,sh:cfg.sh,nc:cfg.nc,nf:cfg.nf,x:sx,z:sz,r:0,e:-1,et:0,ct:0,ch:' '});self.x=sx;self.z=sz;joined=true;base.child('players').on('value',onPl);
if(id[0]!='g'){base.child('meta').on('value',s=>{const m=s.val();if(m&&m.started&&!playing)start(m.map)})}}
function onPl(s){const v=s.val()||{};if(joined&&!v[uid]){leave();alert('Kamu keluar dari room');return}
$('ll').innerHTML='';for(const id in v){const r=document.createElement('div');r.className='r';r.textContent=v[id].n;if(host&&id!=uid){const x=document.createElement('button');x.textContent='X';x.onclick=()=>base.child('players/'+id).remove();r.append(x)}$('ll').append(r)}
for(const id in v){if(id==uid)continue;const d=v[id];let p=P[id];if(!p)p=P[id]=mkP(d),p.x=d.x,p.z=d.z;p.tx=d.x;p.tz=d.z;p.tr=d.r;if(d.et!==p.lEt){if(p.init&&d.e>=0)setE(p,d.e);p.lEt=d.et}if(d.ct!==p.lCt){if(p.init&&d.ch.trim())say(p,d.ch);p.lCt=d.ct}p.init=1}
for(const id in P)if(!v[id]){sc.remove(P[id].root);delete P[id]}}
function start(map){build(map);playing=true;['menu','lobby'].forEach(i=>$(i).classList.add('hide'));$('hud').classList.remove('hide');zd=9}
async function leave(){joined=false;playing=false;if(base){base.child('players').off();base.child('meta').off();try{if(host&&rid[0]!='g')await base.remove();else await me.remove()}catch(e){}}for(const id in P)sc.remove(P[id].root);P={};$('hud').classList.add('hide');$('pause').classList.add('hide');build('island');zd=5;show('menu')}
$('mp').onclick=async()=>{const m=['island','desert','forest','snow'][Math.random()*4|0];await join('g_'+m,m,false);start(m)};
const code=()=>Math.random().toString(36).slice(2,7).toUpperCase();
$('rc').onclick=async()=>{const m=$('rm').value,c=code();await db.ref('rooms/'+c+'/meta').set({host:uid,map:m,started:false});await join(c,m,true);$('lc').textContent='Kode: '+c;$('lg').classList.remove('hide');show('lobby')};
$('rj').onclick=async()=>{const c=$('ri').value.trim().toUpperCase(),s=await db.ref('rooms/'+c+'/meta').once('value');if(!s.exists())return alert('Room tidak ada');await join(c,s.val().map,false);$('lc').textContent='Kode: '+c;$('lg').classList.add('hide');show('lobby')};
$('lg').onclick=async()=>{await base.child('meta/started').set(true);start(curMapOf())};const curMapOf=()=>$('rm').value;
$('lx').onclick=leave;$('pe').onclick=leave;$('pb').onclick=()=>$('pause').classList.remove('hide');$('pr').onclick=()=>$('pause').classList.add('hide');$('ps').onclick=()=>{$('pause').classList.add('hide');$('set').classList.remove('hide')};
// hotbar & chat
IC.forEach((ic,i)=>{const b=document.createElement('button');b.textContent=ic;b.onclick=()=>emo(i);$('bar').append(b)});
function emo(i){if(!playing)return;setE(self,i);me.update({e:i,et:TS});[...$('bar').children].forEach((b,j)=>b.classList.toggle('on',j==i));setTimeout(()=>[...$('bar').children].forEach(b=>b.classList.remove('on')),600)}
function send(){const t=$('ci').value.trim();if(t){say(self,t);me.update({ch:t,ct:TS})}$('ci').value='';$('chat').classList.add('hide')}
$('cb').onclick=()=>{$('chat').classList.toggle('hide');$('ci').focus()};$('cs').onclick=send;$('ci').onkeydown=e=>{if(e.key=='Enter')send()};
// input
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'){return}keys[e.code]=1;if(e.key>='1'&&e.key<='8')emo(e.key-1);if(e.key=='Enter'){$('chat').classList.remove('hide');$('ci').focus();e.preventDefault()}});addEventListener('keyup',e=>keys[e.code]=0);
let ds=0,lx=0,pd=0;cv.onmousedown=e=>{ds=1;lx=e.clientX};addEventListener('mouseup',()=>ds=0);addEventListener('mousemove',e=>{if(ds){cy-=(e.clientX-lx)*.01;lx=e.clientX}});cv.onwheel=e=>zd=Math.min(16,Math.max(3,zd+e.deltaY*.01));
cv.ontouchstart=e=>{lx=e.touches[0].clientX;pd=0};cv.ontouchmove=e=>{if(e.touches.length==2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pd)zd=Math.min(16,Math.max(3,zd-(d-pd)*.03));pd=d}else{cy-=(e.touches[0].clientX-lx)*.01;lx=e.touches[0].clientX}};
if(matchMedia('(pointer:coarse)').matches)$('mob').classList.remove('hide');
const joy=$('joy'),kn=$('kn');const jm=e=>{const t=e.touches[0],r=joy.getBoundingClientRect(),dx=t.clientX-r.left-60,dy=t.clientY-r.top-60,l=Math.min(1,Math.hypot(dx,dy)/50),a=Math.atan2(dy,dx);ix=Math.cos(a)*l;iy=-Math.sin(a)*l;kn.style.left=40+Math.cos(a)*l*40+'px';kn.style.top=40+Math.sin(a)*l*40+'px'};
joy.ontouchstart=joy.ontouchmove=e=>{e.stopPropagation();jm(e)};joy.ontouchend=()=>{ix=iy=0;kn.style.left=kn.style.top='40px'};$('jb').ontouchstart=()=>jmp=true;$('rb').ontouchstart=()=>run=!run;
// loop
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;
if(playing&&!$('pause').classList.contains('hide')===false||playing){let a=ix+(keys.KeyD?1:0)-(keys.KeyA?1:0),b=iy+(keys.KeyW?1:0)-(keys.KeyS?1:0);const l=Math.hypot(a,b);if(l>1)a/=l,b/=l;
const mx=Math.cos(cy)*a-Math.sin(cy)*b,mz=-Math.sin(cy)*a-Math.cos(cy)*b,sp=(run||keys.ShiftLeft)?8:4.5;self.x+=mx*sp*dt;self.z+=mz*sp*dt;if(a||b){const t=Math.atan2(mx,mz);let d=t-self.r;d=Math.atan2(Math.sin(d),Math.cos(d));self.r+=d*Math.min(1,dt*12)}
if((jmp||keys.Space)&&self.y<=0){self.vy=8}jmp=false;self.vy-=22*dt;self.y=Math.max(0,self.y+self.vy*dt);if(self.y==0&&self.vy<0)self.vy=0;
for(const o of obs){const dx=self.x-o.x,dz=self.z-o.z,d=Math.hypot(dx,dz),m=o.r+.6;if(d<m&&d>0&&self.y<1.5){self.x=o.x+dx/d*m;self.z=o.z+dz/d*m}}const rr=Math.hypot(self.x,self.z);if(rr>47){self.x*=47/rr;self.z*=47/rr}}
else{cy+=dt*.4;self.r+=dt}
const all=[self,...Object.values(P)];for(const p of all){if(p!==self){p.x+=(p.tx-p.x)*Math.min(1,dt*10);p.z+=(p.tz-p.z)*Math.min(1,dt*10);let d=p.tr-p.r;d=Math.atan2(Math.sin(d),Math.cos(d));p.r+=d*Math.min(1,dt*10)}
if(Math.hypot(p.x-p.lx,p.z-p.lz)>.02&&p.y<.1&&(p.tt-=dt)<=0){trail(p.x,p.z,p.c1);p.tt=.12}p.lx=p.x;p.lz=p.z;p.root.position.set(p.x,p.y,p.z);p.m.rotation.y=p.r;animE(p,now)}
TR.forEach(t=>{if(t.l>0){t.l-=dt;t.m.material.opacity=Math.max(0,t.l/2.5)*.7;t.m.scale.setScalar(.6+.4*t.l/2.5);if(t.l<=0)t.m.visible=false}});
const px=playing?self.x:0,pz=playing?self.z:0,cp=Math.cos(pitch);cam.position.set(px+Math.sin(cy)*cp*zd,self.y+1+Math.sin(pitch)*zd,pz+Math.cos(cy)*cp*zd);cam.lookAt(px,self.y+.8,pz);R.render(sc,cam);
if(playing){const x=$('mm').getContext('2d'),f=v=>(v/50+1)*48;x.fillStyle='#'+MAPS[curMap][1].toString(16).padStart(6,'0');x.fillRect(0,0,96,96);for(const id in P){x.fillStyle='#e22';x.fillRect(f(P[id].x)-2,f(P[id].z)-2,4,4)}x.fillStyle='#ff0';x.strokeRect(f(self.x)-3,f(self.z)-3,6,6);x.fillRect(f(self.x)-2,f(self.z)-2,4,4)}}
requestAnimationFrame(frame);
setInterval(()=>{if(playing&&me&&(Math.abs(self.x-(self.sx||0))>.02||Math.abs(self.z-(self.sz||0))>.02||Math.abs(self.r-(self.sr||0))>.05)){self.sx=self.x;self.sz=self.z;self.sr=self.r;me.update({x:+self.x.toFixed(2),z:+self.z.toFixed(2),r:+self.r.toFixed(2)})}},100);
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
