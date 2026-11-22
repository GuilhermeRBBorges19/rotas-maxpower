/* Rotas Maxpower — guarda o aplicativo para abrir sem internet. Rotas, endereços e mapa continuam vindo da internet. */
const VERSAO = 'rotas-v1';
const APP = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
const BIBLIOTECAS = ['cdnjs.cloudflare.com', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(APP)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // páginas do próprio app: tenta a versão nova na internet; sem internet, usa a guardada
  if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSAO).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
    return;
  }
  // bibliotecas (mapa e fontes): usa a guardada e atualiza por trás
  if (BIBLIOTECAS.includes(u.hostname)) {
    e.respondWith(caches.match(e.request).then(hit => { const net = fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSAO).then(x => x.put(e.request, c)); return r; }).catch(() => hit); return hit || net; }));
  }
  // rotas, endereços e mapa: sempre da internet (o app tem modo estimativa se falhar)
});
