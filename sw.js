// 아주 가벼운 서비스워커: 앱 껍데기(HTML/아이콘)만 캐시해서
// "홈 화면에 추가"가 정상적으로 뜨게 해주는 최소 구성이에요.
// 책 데이터는 Firestore가 직접 실시간으로 처리하므로 여기서 손대지 않습니다.
var CACHE_NAME = "seoro-seoga-shell-v1";
var SHELL_FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(SHELL_FILES); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  // Firestore/Firebase/Google Fonts 요청은 그대로 네트워크로 보내고,
  // 같은 출처의 앱 껍데기 파일만 캐시 우선으로 서빙합니다.
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
