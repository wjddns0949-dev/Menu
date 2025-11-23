const CACHE_NAME = "menu-roulette-v1";
const PRECACHE_URLS = [
  "/Menu/",
  "/Menu/index.html",
  "/Menu/icon.png",
  "/Menu/og_image.png"
];

// 설치: 필요한 파일 캐시에 넣기
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

// 활성화: 이전 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// fetch: 캐시 우선, 없으면 네트워크
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // GET만 캐싱
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // 완전 오프라인이고 캐시도 없을 때 index.html 반환
          return caches.match("/Menu/index.html");
        });
    })
  );
});
