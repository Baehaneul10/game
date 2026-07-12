# 네온 팝 디펜스 — Flutter 웹뷰 앱

카카오톡/삼성인터넷에서 뒤로가기로 게임이 꺼지는 문제를 해결하는 앱 래퍼입니다.
(웹 자체에도 뒤로가기 보호 + PWA 설치가 이미 들어있으니, 앱 빌드 전에
**크롬 → 메뉴 → "홈 화면에 추가"** 로 먼저 써보는 것을 추천합니다. 거의 동일한 경험)

## 빌드 방법 (이 PC에는 Flutter가 없어서 직접 빌드 필요)

1. Flutter SDK 설치: https://docs.flutter.dev/get-started/install/windows (약 10분)
2. 이 폴더에서 실행:
   ```
   flutter create . --platforms android   # 안드로이드 프로젝트 뼈대 생성 (최초 1회)
   flutter pub get
   flutter build apk --release
   ```
3. APK 위치: `build/app/outputs/flutter-apk/app-release.apk` → 폰에 설치

## 설정

- 게임 주소 변경: `lib/main.dart` 상단 `gameUrl` (Vercel 도메인으로 교체 가능)
- 앱 이름/아이콘: `flutter create` 후 `android/app/src/main/AndroidManifest.xml`의
  `android:label`, 아이콘은 `flutter_launcher_icons` 패키지 사용 권장
  (저장소 루트의 icon-512.jpg 활용)

## 동작

- 뒤로가기 → 웹뷰 내 히스토리 이동, 최상위면 "한 번 더 누르면 종료" 스낵바 (실수 종료 방지)
- 전체화면 몰입 모드, 다크 배경
- 인터넷 권한: `flutter create` 후 AndroidManifest.xml에 `<uses-permission android:name="android.permission.INTERNET"/>` 확인
