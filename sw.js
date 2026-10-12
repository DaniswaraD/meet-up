// sw.js — service worker minimal
const C='meetup-v1';
self.addEventListener('install',e=>{
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch',e=>{
  // biarkan default (network) biar tidak ada masalah caching
  return;
});
