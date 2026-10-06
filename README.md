# 🏫 학급운영 (Classroom Management Hub)

> **고등학교 교사와 학생을 위한 클레이모피즘 + 벤토 그리드 올인원 대시보드 & 생산성 도구**  
> Vercel 서울 리전(`icn1`) 및 Supabase 서울 리전(`ap-northeast-2`) 통일 최적화

---

## ✨ 핵심 기능

1. **학급시간표 & 실시간 변동 관리**
   - 주간 35시수(월~금 1~7교시) 정규 시간표
   - 출장, 결강, 교사 연수 시 원클릭 시간표 변경 / 대강 / 보강 등록
   - 실시간 변동 과목 및 변경 사유 하이라이트 표시

2. **스마트 자리바꾸기 추첨기**
   - 30인 학급 맞춤형 5x6 교실 책상 배치도 & 교탁/칠판 기준선
   - 핀(Pin) 고정석 기능 (시력 저하, 특별 배려 학생 위치 유지)
   - 원클릭 공정 랜덤 셔플 & 폭죽(Confetti) 애니메이션

3. **학급 행사 및 공지사항 게시판**
   - 카테고리별 공지 (학사일정, 수행평가, 학급행사, 전체)
   - 실시간 하트 좋아요(Like) 인터랙션
   - Supabase `posts` 테이블 연동 (id, title, content, author, created_at, likes)

4. **학급 활동 & 칭찬 랭킹**
   - 참여도, 퀴즈 배틀, 봉사활동 칭찬 스탬프 보드
   - 1·2·3위 포디움 트로피 및 순위별 게이지 바
   - Supabase `scores` 테이블 연동 (id, nickname, score, played_at)

5. **디자인 및 성능 최적화**
   - **Claymorphism + Bento Grid**: 부드러운 3D 점토 볼륨감과 애플 스타일 모듈러 카드 격자
   - **다크 모드 / 라이트 모드**: 원클릭 테마 전환
   - **한국 서울(Seoul) 리전 통일**: Vercel `icn1` + Supabase `ap-northeast-2` 초저지연 RTT (5ms 이하)

---

## 🚀 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS, Claymorphism custom utilities
- **Icons & Animation**: Lucide React, Canvas Confetti
- **Database**: Supabase PostgreSQL (`posts`, `scores`)
- **Hosting & Infrastructure**: Vercel (Region: `icn1`)
