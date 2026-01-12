# 컬러 테마 변경 예시

## 예시: 더 밝고 모던한 톤으로 변경하기

### STEP 1: 새로운 컬러 결정

메인 컬러를 결정합니다:
- 기존 Walnut: #5D4037 (어두운 브라운)
- 새로운 Primary: #A0826D (밝은 브라운)

### STEP 2: Shade 생성

https://uicolors.app/create 에서 #A0826D 입력하고 shade 생성

### STEP 3: tailwind.config.js 수정

```javascript
holy: {
  walnut: {
    DEFAULT: '#A0826D',  // 변경!
    50: '#FAF7F5',       // 자동 생성된 값
    100: '#F5EDE8',
    200: '#EBD9CE',
    300: '#D4B9A8',
    400: '#BD9982',
    500: '#A0826D',
    600: '#8B6F5E',
    700: '#6D5749',
    800: '#4F3F35',
    900: '#312721',
  },
  // 다른 컬러들도 원하면 변경...
}
```

### STEP 4: 개발 서버 재시작

```bash
npm run dev
```

Tailwind가 새로운 컬러를 감지하고 CSS를 재생성합니다!

## 🎯 특정 페이지만 다른 컬러 적용하기

특정 컴포넌트나 페이지에만 다른 컬러를 쓰고 싶다면:

```jsx
// 특정 버튼만 다른 색
<button className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white">
  특별한 버튼
</button>

// 또는 CSS 변수 사용
<div style={{ backgroundColor: 'var(--custom-color, #FF6B6B)' }}>
  커스텀 색상 영역
</div>
```

## 💡 Pro Tip: 테마 전환 기능 추가

다크모드나 여러 테마를 지원하려면:

1. CSS 변수 방식으로 마이그레이션
2. Context API로 테마 상태 관리
3. localStorage에 선택한 테마 저장
4. 클래스 전환으로 테마 변경

예시 구조:
```javascript
// ThemeContext.js
const themes = {
  warm: { primary: '#5D4037', accent: '#D4A574' },
  cool: { primary: '#2C3E50', accent: '#3498DB' },
  bright: { primary: '#A0826D', accent: '#E8C4A0' }
}
```
