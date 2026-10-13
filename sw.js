// ══════ Meet-UP Service Worker ══════
// Versi cache — ubah angka ini kalau mau force update cache baru
const CACHE_NAME='meetup-v3';

// File yang wajib di-cache biar bisa jalan offline
const CORE_ASSETS=[
  './',
  './index.html',
  './game.js',
  './three.min.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// ── INSTALL: cache file utama ──
self.addEventListener('install',event=>{
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(CORE_ASSETS).catch(err=>{
        // Kalau ada file yang gagal (misal ikon belum ada), tetap lanjut
        console.warn('[SW] Sebagian asset gagal di-cache:',err);
      }))
      .then(()=>self.skipWaiting()) // langsung aktif tanpa nunggu tab lama ditutup
  );
});

// ── ACTIVATE: hapus cache versi lama ──
self.addEventListener('activate',event=>{
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys=>{
      return Promise.all(
        keys.filter(k=>k!==CACHE_NAME).map(k=>{
          console.log('[SW] Hapus cache lama:',k);
          return caches.delete(k);
        })
      );
    }).then(()=>self.clients.claim()) // langsung kontrol semua tab
  );
});

// ── FETCH: strategi cache-first untuk asset lokal, network-first untuk API ──
self.addEventListener('fetch',event=>{
  const req=event.request;
  const url=new URL(req.url);

  // Jangan intercept request ke Firebase / Google / gstatic (biar auth & DB lancar)
  if(
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firebasedatabase.app')
  ){
    return; // biarkan browser handle langsung (network)
  }

  // Hanya handle GET
  if(req.method!=='GET')return;

  // Network-first untuk HTML/JS/JSON (biar update game langsung terbaru), cache sebagai cadangan offline
  if(req.mode==='navigate'||/\.(html|js|json)$/.test(url.pathname)||url.pathname.endsWith('/')){
    event.respondWith(
      fetch(req).then(res=>{
        if(res&&res.status===200&&res.type==='basic'){const c=res.clone();caches.open(CACHE_NAME).then(x=>x.put(req,c)).catch(()=>{})}
        return res;
      }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||(req.mode==='navigate'?caches.match('./index.html'):new Response('Offline',{status:503}))))
    );
    return;
  }

  // Cache-first untuk asset statis (gambar, font)
  event.respondWith(
    caches.match(req).then(cached=>{
      if(cached)return cached;
      return fetch(req).then(res=>{
        // Simpan response baru ke cache (kalau valid)
        if(res && res.status===200 && res.type==='basic'){
          const clone=res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(req,clone)).catch(()=>{});
        }
        return res;
      }).catch(()=>{
        // Kalau offline & tidak ada di cache → coba fallback ke index.html
        if(req.mode==='navigate'){
          return caches.match('./index.html');
        }
        return new Response('Offline',{status:503,statusText:'Offline'});
      });
    })
  );
});

// ── MESSAGE: support force update dari halaman ──
self.addEventListener('message',event=>{
  if(event.data==='SKIP_WAITING')self.skipWaiting();
});
