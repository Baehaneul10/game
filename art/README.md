# 커스텀 아트 폴더

이 폴더에 이미지를 넣으면 게임 UI(팔레트·도감·상점·정보 패널)에 자동 적용됩니다.
파일이 없으면 게임이 자체 생성한 초상화를 사용합니다.

## 파일 이름 규칙 (jpg 또는 png, 정사각형 권장 — 256×256 이상)

### 타워 9종
| 파일명 | 타워 |
|---|---|
| tower-dart.jpg | 팬텀 스팅어 |
| tower-sniper.jpg | 데드아이 레인저 |
| tower-bomb.jpg | 캐터클리즘 봄버 |
| tower-ice.jpg | 글래시얼 코어 |
| tower-tesla.jpg | 아크 테슬라 |
| tower-buff.jpg | 커맨드 비콘 |
| tower-poison.jpg | 베놈 하이브 |
| tower-laser.jpg | 프리즘 캐논 |
| tower-bank.jpg | 골드 리저브 |

### 몬스터 8종
| 파일명 | 몬스터 |
|---|---|
| enemy-red.jpg | 섀도우 스카웃 |
| enemy-blue.jpg | 블리츠 러너 |
| enemy-green.jpg | 시즈 골렘 |
| enemy-yellow.jpg | 플라즈마 와이번 |
| enemy-purple.jpg | 볼트 스펙터 |
| enemy-metal.jpg | 아이언 셸가드 |
| enemy-split.jpg | 톡식 크롤러 |
| enemy-boss.jpg | 오블리비언 타이탄 |

넣은 뒤 `git add art && git commit && git push` 하면 배포에 반영됩니다.
(AI 생성 일러스트에서 카드별로 잘라 저장하면 됩니다 — 이름표/가격 글자는 빼고 그림 부분만)
