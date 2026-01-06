# 홀리기타 디자인 가이드

## 🎨 브랜드 컬러 팔레트

### Primary Colors

#### Holy Walnut (호두나무)
- **Main**: `#5D4037` - `bg-holy-walnut` / `text-holy-walnut`
- 따뜻하고 신뢰감 있는 기본 브랜드 컬러
- 네비게이션 바, 버튼, 헤더 등에 사용

#### Holy Amber (황금빛 호박)
- **Main**: `#D4A574` - `bg-holy-amber` / `text-holy-amber`
- 고급스러운 악센트 컬러
- 하이라이트, 호버 효과, 중요한 CTA에 사용

#### Holy Cream (크림)
- **Main**: `#FDF6E3` - `bg-holy-cream` / `text-holy-cream`
- 부드러운 배경 컬러
- 페이지 기본 배경, 카드 배경에 사용

### Secondary Colors

#### Holy Espresso (에스프레소)
- **Main**: `#3E2723` - `bg-holy-espresso` / `text-holy-espresso`
- 진하고 깊은 텍스트 컬러
- 헤드라인, 본문 텍스트에 사용

#### Holy Honey (꿀)
- **Main**: `#C4956A` - `bg-holy-honey` / `text-holy-honey`
- 따뜻한 보조 컬러
- 태그, 배지, 부드러운 강조에 사용

#### Holy Ivory (아이보리)
- **Main**: `#FFFEF9` - `bg-holy-ivory` / `text-holy-ivory`
- 가장 밝은 배경 컬러
- 카드 내부, 입력 필드 배경에 사용

## 📐 컬러 사용 가이드

### 배경
```jsx
// 페이지 메인 배경
<body className="bg-holy-cream">

// 카드 배경
<div className="bg-holy-ivory">

// 다크 섹션
<section className="bg-holy-walnut">
```

### 텍스트
```jsx
// 메인 헤드라인
<h1 className="text-holy-espresso">

// 본문 텍스트
<p className="text-holy-walnut-600">

// 링크 및 강조
<a className="text-holy-amber hover:text-holy-honey">
```

### 버튼
```jsx
// Primary 버튼
<button className="bg-holy-walnut hover:bg-holy-walnut-700 text-holy-ivory">

// Secondary 버튼
<button className="bg-holy-amber hover:bg-holy-honey text-holy-espresso">

// Outline 버튼
<button className="border-2 border-holy-walnut text-holy-walnut hover:bg-holy-walnut hover:text-holy-ivory">
```

### 카드 및 컨테이너
```jsx
// 카드
<div className="bg-holy-ivory rounded-lg shadow-warm border border-holy-cream">

// 호버 효과
<div className="bg-holy-ivory hover:shadow-warm-lg transition-shadow duration-300">
```

## 🔤 타이포그래피

### 폰트 패밀리
- **Sans-serif**: Inter (본문, UI 요소)
- **Serif**: Merriweather (헤드라인, 강조 텍스트)

### 텍스트 스타일
```jsx
// 메인 타이틀
<h1 className="font-serif text-4xl font-bold text-holy-espresso">

// 섹션 타이틀
<h2 className="font-serif text-3xl font-bold text-holy-walnut">

// 본문
<p className="font-sans text-base text-holy-walnut-700">

// 캡션
<span className="font-sans text-sm text-holy-walnut-500">
```

## 🎯 컴포넌트 예제

### Navigation Bar
```jsx
<nav className="bg-holy-walnut text-holy-ivory shadow-warm">
  <div className="container mx-auto px-4">
    <img src="/assets/logos/logo-horizontal.png" alt="홀리기타" />
  </div>
</nav>
```

### Hero Section
```jsx
<section className="bg-gradient-to-b from-holy-cream to-holy-ivory">
  <div className="container mx-auto px-4 py-16">
    <h1 className="font-serif text-5xl font-bold text-holy-espresso mb-4">
      찬양과 연주로 하나님을 예배하는
    </h1>
    <p className="text-xl text-holy-walnut-600 mb-8">
      기타 애호가들의 특별한 공간
    </p>
    <button className="bg-holy-walnut hover:bg-holy-walnut-700 text-holy-ivory px-8 py-3 rounded-lg font-semibold transition-colors duration-300">
      시작하기
    </button>
  </div>
</section>
```

### Card Component
```jsx
<div className="bg-holy-ivory rounded-lg shadow-warm hover:shadow-warm-lg transition-all duration-300 overflow-hidden border border-holy-cream-200">
  <img src="image.jpg" className="w-full h-48 object-cover" />
  <div className="p-6">
    <h3 className="font-serif text-xl font-bold text-holy-espresso mb-2">
      카드 제목
    </h3>
    <p className="text-holy-walnut-600 mb-4">
      카드 설명 텍스트
    </p>
    <div className="flex gap-2">
      <span className="bg-holy-amber-100 text-holy-amber-700 px-3 py-1 rounded-full text-sm">
        태그1
      </span>
      <span className="bg-holy-honey-100 text-holy-honey-700 px-3 py-1 rounded-full text-sm">
        태그2
      </span>
    </div>
  </div>
</div>
```

### Button Styles
```jsx
// Primary
<button className="bg-holy-walnut hover:bg-holy-walnut-700 text-holy-ivory px-6 py-2 rounded-lg font-semibold transition-colors duration-300 shadow-warm">
  Primary Button
</button>

// Secondary
<button className="bg-holy-amber hover:bg-holy-honey text-holy-espresso px-6 py-2 rounded-lg font-semibold transition-colors duration-300">
  Secondary Button
</button>

// Outline
<button className="border-2 border-holy-walnut text-holy-walnut hover:bg-holy-walnut hover:text-holy-ivory px-6 py-2 rounded-lg font-semibold transition-all duration-300">
  Outline Button
</button>

// Ghost
<button className="text-holy-walnut hover:text-holy-amber px-6 py-2 rounded-lg font-semibold transition-colors duration-300">
  Ghost Button
</button>
```

### Input Fields
```jsx
<input 
  type="text"
  className="w-full px-4 py-2 bg-holy-ivory border-2 border-holy-cream-300 rounded-lg focus:border-holy-amber focus:outline-none focus:ring-2 focus:ring-holy-amber-200 transition-all duration-300"
  placeholder="입력하세요"
/>
```

### Badge / Tag
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-holy-amber-100 text-holy-amber-800">
  New
</span>

<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-holy-walnut-100 text-holy-walnut-800">
  Popular
</span>
```

## 🖼️ 디자인 에셋 위치

### 로고
- **가로형 로고**: `/assets/logos/logo-horizontal.png`
- **심볼 로고**: `/assets/logos/logo-symbol.png`
- **세로형 로고**: `/assets/logos/logo-vertical.png`
- **다크 버전**: `/assets/logos/logo-dark.png`
- **영문 전용**: `/assets/logos/logo-english.png`
- **앱 아이콘**: `/assets/logos/app-icon.png`
- **모노그램**: `/assets/logos/logo-monogram.png`

### 배너
- **커뮤니티**: `/assets/banners/banner-community.png`
- **클래식**: `/assets/banners/banner-classic.png`
- **모던**: `/assets/banners/banner-modern.png`

### UI 가이드
- **아이콘 세트**: `/assets/ui-guides/icon-set.png`
- **컬러 가이드**: `/assets/ui-guides/brand-color-guide.png`
- **컴포넌트 가이드**: `/assets/ui-guides/ui-components-guide.png`

### 목업 (개발 참고용)
- `/assets/mockups/homepage-desktop.png`
- `/assets/mockups/homepage-mobile.png`
- `/assets/mockups/community-forum.png`
- `/assets/mockups/course-page.png`
- `/assets/mockups/marketplace-page.png`
- `/assets/mockups/gallery-page.png`
- `/assets/mockups/login-page.png`

## 🎨 그라데이션

### 배경 그라데이션
```jsx
// 따뜻한 크림 그라데이션
<div className="bg-gradient-to-b from-holy-cream to-holy-ivory">

// 앰버 그라데이션
<div className="bg-gradient-to-r from-holy-amber to-holy-honey">

// 다크 그라데이션
<div className="bg-gradient-to-br from-holy-walnut to-holy-espresso">
```

## 📱 반응형 디자인

### 브레이크포인트
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### 반응형 예제
```jsx
<div className="px-4 sm:px-6 md:px-8 lg:px-12">
  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-holy-espresso">
    반응형 타이틀
  </h1>
</div>
```

## 🌟 애니메이션 & 트랜지션

### 호버 효과
```jsx
// 부드러운 색상 전환
<button className="bg-holy-walnut hover:bg-holy-walnut-700 transition-colors duration-300">

// 그림자 효과
<div className="shadow-warm hover:shadow-warm-lg transition-shadow duration-300">

// 스케일 효과
<img className="transform hover:scale-105 transition-transform duration-300">
```

## ✨ 접근성 (Accessibility)

- 텍스트와 배경의 대비율 최소 4.5:1 유지
- 버튼 및 링크에 명확한 호버 상태 표시
- 폼 요소에 적절한 라벨 제공
- 키보드 네비게이션 지원

## 🎸 브랜드 보이스

- **따뜻함**: 어쿠스틱 기타의 자연스러운 온기
- **신앙**: 하나님을 향한 찬양과 예배
- **커뮤니티**: 함께 성장하고 나누는 공간
- **품질**: 고급스럽고 정성스러운 디자인

---

**마지막 업데이트**: 2026-01-06
**디자인 버전**: 1.0.0
