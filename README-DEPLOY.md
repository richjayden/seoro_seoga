# 서로서가 — 독립 웹앱 배포 가이드

이 폴더에는 Claude 계정 없이 **링크만으로 누구나 쓸 수 있는** 독립 버전이 들어 있어요.
Firebase(무료 플랜)로 실시간 데이터베이스를 두고, Vercel로 호스팅하는 구조예요 —
트리폴/쏘맨/내일지도 만드실 때와 같은 방식(GitHub + Vercel)이라 익숙하실 거예요.

## 포함된 파일
- `index.html` — 앱 전체 (Firebase 연동 부분만 비어있는 상태)
- `manifest.json` — 홈 화면에 추가했을 때 앱처럼 보이게 해주는 설정
- `sw.js` — 오프라인/설치를 위한 최소한의 서비스워커
- `icon-192.png`, `icon-512.png`, `icon-180.png` — 앱 아이콘

## 1. Firebase 프로젝트 만들기 (5분)
1. https://console.firebase.google.com 접속 → 구글 계정으로 로그인 → "프로젝트 추가"
2. 프로젝트 이름 아무거나 (예: `seoro-seoga`) → Google Analytics는 꺼도 무방 → 만들기

## 2. Firestore 데이터베이스 켜기
1. 왼쪽 메뉴 "빌드 > Firestore Database" → "데이터베이스 만들기"
2. 위치는 `asia-northeast3 (서울)` 추천 → 처음엔 "테스트 모드"로 시작해도 되지만,
   아래 3번에서 규칙을 꼭 바꿔주세요 (테스트 모드는 30일 후 잠깁니다).

## 3. 익명 로그인 켜기
1. 왼쪽 메뉴 "빌드 > Authentication" → "시작하기"
2. "Sign-in method" 탭 → "익명" 선택 → 사용 설정 → 저장
   (이 덕분에 사용자에게 로그인 화면이 전혀 보이지 않으면서도, 완전히 열려있지는 않은
   상태로 데이터를 보호할 수 있어요.)

## 4. Firestore 보안 규칙 설정
"Firestore Database > 규칙" 탭에서 아래 내용으로 바꾸고 "게시"하세요.
(로그인 화면 없이도 익명으로 자동 인증된 방문자만 읽고 쓸 수 있게 하는 규칙이에요.)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 5. 웹 앱 등록하고 설정값 복사하기
1. 프로젝트 개요(홈) 화면에서 `</>` (웹) 아이콘 클릭 → 앱 닉네임 아무거나 입력 → 앱 등록
2. Firebase Hosting은 체크 안 해도 됩니다 (Vercel을 쓸 거라서요)
3. 화면에 나오는 `firebaseConfig` 객체를 복사해두세요. 아래처럼 생겼어요:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "seoro-seoga-xxxx.firebaseapp.com",
  projectId: "seoro-seoga-xxxx",
  storageBucket: "seoro-seoga-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

4. `index.html`을 열어서 `FIREBASE_CONFIG` 부분(스크립트 맨 위쪽)을 위 값으로 그대로 바꿔주세요.

## 6. Vercel에 배포하기
평소 하시던 방식 그대로예요:
1. 이 폴더(`index.html`, `manifest.json`, `sw.js`, 아이콘 3개)를 GitHub 저장소에 올리기
2. https://vercel.com 에서 그 저장소를 Import
3. Framework Preset은 "Other"로 두고 그대로 Deploy
4. 끝나면 `seoro-seoga.vercel.app` 같은 주소가 생겨요. 원하시면 Vercel 설정에서
   구매하신 도메인을 연결하셔도 됩니다.

## 참고
- 지금 Claude 아티팩트 버전에 이미 등록해두신 책 데이터가 있다면, 그건 이 새
  Firestore로 자동으로 옮겨지지 않아요. 실제로 쓰던 데이터를 옮기고 싶으시면
  말씀해주세요 — 옮겨주는 스크립트를 만들어드릴게요.
- 나중에 앱스토어/플레이스토어까지 올리고 싶으시면, 이 상태에서 Capacitor로
  한 번 더 감싸면 됩니다. 지금 단계에서는 필요 없어요.
