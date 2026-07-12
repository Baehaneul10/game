// 네온 팝 디펜스 서비스 워커: 오프라인 솔로 플레이 + 앱 설치 지원
const CACHE = 'npd-v1';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.startsWith('/api/')) return; // API는 항상 네트워크
  if (e.request.mode === 'navigate' || u.pathname.endsWith('index.html')) {
    // 페이지: 네트워크 우선 (업데이트 즉시 반영), 오프라인이면 캐시
    e.respondWith(
      fetch(e.request).then(r => {
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return r;
      }).catch(() => caches.match(e.request, {ignoreSearch: true}))
    );
  } else {
    // 정적 자원: 캐시 우선
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp));
        return r;
      }))
    );
  }
});
