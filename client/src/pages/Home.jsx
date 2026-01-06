import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="bg-gradient-to-b from-holy-cream to-holy-ivory">
      {/* Hero Section with Banner */}
      <section 
        className="relative bg-cover bg-center min-h-[600px] flex items-center"
        style={{ 
          backgroundImage: 'url(/assets/banners/banner-community.png)',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-holy-walnut/80 to-holy-walnut/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-holy-ivory mb-6 drop-shadow-lg">
            찬양과 연주로 하나님을 예배하는
            <span className="block text-holy-amber mt-3">기타 애호가들의 특별한 공간</span>
          </h1>
          <p className="text-xl md:text-2xl text-holy-cream mb-10 max-w-3xl mx-auto drop-shadow">
            기타를 사랑하는 크리스천들이 모여 연주 영상을 공유하고,
            장비를 소개하며, 서로의 신앙과 음악을 나누는 커뮤니티입니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {currentUser ? (
              <Link to="/create-post" className="inline-block px-8 py-4 bg-holy-amber hover:bg-holy-honey text-holy-espresso rounded-lg font-bold text-lg shadow-warm-lg transition-all duration-300 transform hover:scale-105">
                지금 바로 시작하기
              </Link>
            ) : (
              <>
                <Link to="/signup" className="inline-block px-8 py-4 bg-holy-amber hover:bg-holy-honey text-holy-espresso rounded-lg font-bold text-lg shadow-warm-lg transition-all duration-300 transform hover:scale-105">
                  무료로 시작하기
                </Link>
                <Link to="/videos" className="inline-block px-8 py-4 border-2 border-holy-ivory text-holy-ivory hover:bg-holy-ivory hover:text-holy-walnut rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105">
                  둘러보기
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-holy-espresso mb-4">
          특별한 기능들
        </h2>
        <p className="text-center text-holy-walnut-600 text-lg mb-16 max-w-2xl mx-auto">
          홀리기타에서 제공하는 다양한 기능을 통해 음악과 신앙을 나누세요
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Video Gallery */}
          <Link to="/videos" className="card p-8 hover:scale-105 transition-transform duration-300">
            <div className="text-6xl mb-6 text-center">🎬</div>
            <h3 className="text-2xl font-bold text-holy-espresso mb-4 text-center">연주 영상</h3>
            <p className="text-holy-walnut-600 mb-6 text-center">
              찬양곡 연주, 커버 영상, 레슨 영상 등 
              다양한 기타 연주 영상을 공유하고 감상하세요.
            </p>
            <div className="text-holy-amber font-semibold flex items-center justify-center hover:text-holy-honey transition-colors">
              더 알아보기 
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Equipment Gallery */}
          <Link to="/equipment" className="card p-8 hover:scale-105 transition-transform duration-300">
            <div className="text-6xl mb-6 text-center">🎸</div>
            <h3 className="text-2xl font-bold text-holy-espresso mb-4 text-center">장비 갤러리</h3>
            <p className="text-holy-walnut-600 mb-6 text-center">
              소중한 기타, 이펙터, 앰프 등 
              여러분의 장비를 자랑하고 정보를 나누세요.
            </p>
            <div className="text-holy-amber font-semibold flex items-center justify-center hover:text-holy-honey transition-colors">
              더 알아보기 
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Community */}
          <Link to="/community" className="card p-8 hover:scale-105 transition-transform duration-300">
            <div className="text-6xl mb-6 text-center">💬</div>
            <h3 className="text-2xl font-bold text-holy-espresso mb-4 text-center">커뮤니티</h3>
            <p className="text-holy-walnut-600 mb-6 text-center">
              신앙 이야기, 연주 팁, 기타 정보 등
              자유롭게 소통하고 교제하세요.
            </p>
            <div className="text-holy-amber font-semibold flex items-center justify-center hover:text-holy-honey transition-colors">
              더 알아보기 
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-holy-walnut text-holy-ivory py-20 shadow-warm-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-holy-amber">
            함께 성장하는 커뮤니티
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-holy-walnut-700 rounded-lg p-6 shadow-warm">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-holy-amber">500+</div>
              <div className="text-holy-cream text-sm md:text-base">회원</div>
            </div>
            <div className="bg-holy-walnut-700 rounded-lg p-6 shadow-warm">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-holy-amber">1,200+</div>
              <div className="text-holy-cream text-sm md:text-base">연주 영상</div>
            </div>
            <div className="bg-holy-walnut-700 rounded-lg p-6 shadow-warm">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-holy-amber">800+</div>
              <div className="text-holy-cream text-sm md:text-base">장비 리뷰</div>
            </div>
            <div className="bg-holy-walnut-700 rounded-lg p-6 shadow-warm">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-holy-amber">2,500+</div>
              <div className="text-holy-cream text-sm md:text-base">커뮤니티 글</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimony Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-holy-ivory rounded-2xl p-12 shadow-warm-lg border border-holy-cream-300">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-holy-espresso mb-4">
              "시편, 찬송, 신령한 노래들로"
            </h2>
            <p className="text-xl text-holy-walnut-600 italic">
              "서로 화답하며 너희의 마음으로 주께 노래하며 찬송하며"
            </p>
            <p className="text-lg text-holy-honey mt-2">- 에베소서 5:19</p>
          </div>
          <p className="text-center text-holy-walnut-600 max-w-3xl mx-auto">
            홀리기타는 하나님의 영광을 위해, 그리고 기타를 통해 찬양하는 모든 크리스천들을 위해 만들어졌습니다.
            이 공간에서 우리는 음악으로 하나되고, 신앙으로 격려하며, 함께 성장합니다.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-holy-walnut to-holy-espresso rounded-2xl p-12 text-center text-holy-ivory shadow-warm-lg">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            지금 바로 시작하세요!
          </h2>
          <p className="text-xl mb-10 text-holy-cream max-w-2xl mx-auto">
            무료 회원가입하고 크리스천 기타리스트들과 함께 찬양과 음악을 나누세요
          </p>
          {!currentUser && (
            <Link to="/signup" className="inline-block px-10 py-5 bg-holy-amber hover:bg-holy-honey text-holy-espresso rounded-lg font-bold text-xl shadow-warm-lg transition-all duration-300 transform hover:scale-105">
              무료 회원가입 →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
