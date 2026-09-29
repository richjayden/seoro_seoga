// 아주 가벼운 서비스워커: 앱 껍데기(HTML/아이콘)만 캐시해서
// "홈 화면에 추가"가 정상적으로 뜨게 해주는 최소 구성이에요.
// 책 데이터는 Firestore가 직접 실시간으로 처리하므로 여기서 손대지 않습니다.
//
// v2에서 바뀐 점: 예전 버전은 HTML도 "캐시 우선"으로 서빙해서, 배포를 새로
// 해도 이미 홈 화면에 추가했거나 한 번 방문한 사람에게는 계속 옛날 화면이
// 보이고(새로고침을 해야만 새 버전이 뜨는) 문제가 있었어요. 이제는 HTML(페이지
// 자체)은 "네트워크 우선"으로 바꿔서, 온라인이면 항상 최신 배포를 바로 보여주고
// 오프라인일 때만 캐시로 대체해요. 아이콘/매니페스트처럼 자주 안 바뀌는 파일만
// 계속 캐시 우선으로 빠르게 서빙합니다.
var CACHE_NAME = "seoro-seoga-shell-v2";
var SHELL_FILES = ["./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-180.png"];

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
  // Firestore/Firebase/Google Fonts 등 다른 출처 요청은 그대로 네트워크로.
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  var isHTML = event.request.mode === "navigate" ||
    (event.request.headers.get("accept") || "").indexOf("text/html") !== -1;

  if (isHTML) {
    // 페이지 자체는 네트워크 우선: 최신 배포가 항상 바로 보이도록.
    // 성공하면 그 결과를 오프라인 대비용으로 캐시에도 저장해두고,
    // 오프라인일 때만 마지막으로 저장된 화면으로 대체.
    event.respondWith(
      fetch(event.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        return res;
      }).catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match("./index.html");
        });
      })
    );
    return;
  }

  // 아이콘/매니페스트 등 정적 껍데기 파일은 캐시 우선(빠른 로딩).
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});