# 홀리기타 컬러 테마 변경 가이드

## 🎨 현재 컬러 팔레트

### Primary - Holy Walnut (호두나무)
- 용도: 네비게이션, 버튼, 헤더
- DEFAULT: `#5D4037`
- 50-900: 밝음→어두움

### Accent - Holy Amber (황금빛 호박)
- 용도: 하이라이트, CTA 버튼, 호버
- DEFAULT: `#D4A574`

### Background - Holy Cream (크림)
- 용도: 페이지 배경
- DEFAULT: `#FDF6E3`

### Text - Holy Espresso (에스프레소)
- 용도: 본문 텍스트, 헤드라인
- DEFAULT: `#3E2723`

### Secondary - Holy Honey (꿀)
- 용도: 태그, 배지, 부드러운 강조
- DEFAULT: `#C4956A`

### Light Background - Holy Ivory (아이보리)
- 용도: 카드 배경, 입력 필드
- DEFAULT: `#FFFEF9`

---

## 🔧 컬러 변경 방법

### 방법 1: Tailwind Config 직접 수정

1. `tailwind.config.js` 파일 열기
2. `theme.extend.colors.holy` 섹션 찾기
3. 원하는 컬러의 HEX 코드 변경
4. 50-900 shade도 함께 조정 (온라인 도구 사용 권장)

### 방법 2: 온라인 도구 사용

1. https://uicolors.app/create 접속
2. 원하는 메인 컬러 입력
3. 생성된 shade 복사
4. `tailwind.config.js`에 붙여넣기

### 방법 3: CSS 변수 사용 (권장 - 동적 테마)

더 고급 기능이 필요하다면 CSS 변수로 마이그레이션:

```css
/* src/styles/theme.css */
:root {
  --color-holy-walnut: #5D4037;
  --color-holy-amber: #D4A574;
  /* ... */
}
```

---

## 🎨 추천 컬러 조합

### 조합 1: 더 따뜻한 톤 (Warmer)
- Primary: `#8B4513` (새들 브라운)
- Accent: `#DAA520` (골든로드)
- Background: `#FFF8DC` (콘실크)

### 조합 2: 더 모던한 톤 (Modern)
- Primary: `#2C3E50` (미드나잇 블루)
- Accent: `#E67E22` (카로트)
- Background: `#ECF0F1` (클라우즈)

### 조합 3: 더 밝은 톤 (Lighter)
- Primary: `#A0826D` (라이트 브라운)
- Accent: `#E8C4A0` (라이트 골드)
- Background: `#FFFBF5` (올드 레이스)

---

## ⚡ 빠른 테스트 방법

1. 브라우저 개발자 도구 열기 (F12)
2. Elements 탭에서 `<html>` 선택
3. Styles 패널에서 직접 색상 변경해보기
4. 마음에 드는 조합을 찾으면 코드에 적용

---

## 📝 변경 후 확인 사항

- [ ] 네비게이션 바 가독성
- [ ] 버튼 대비(contrast) 확인
- [ ] 텍스트 가독성 (WCAG 기준)
- [ ] 다크/라이트 영역 밸런스
- [ ] 모바일에서 확인

---

## 🎨 컬러 접근성 체크

- **대비율 체크**: https://webaim.org/resources/contrastchecker/
- **WCAG 기준**: 최소 4.5:1 (일반 텍스트), 3:1 (큰 텍스트)
