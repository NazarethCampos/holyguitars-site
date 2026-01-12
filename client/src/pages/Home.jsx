import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../services/firebase';

const Home = () => {
  const { currentUser } = useAuth();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [popularDiscussions, setPopularDiscussions] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Featured Posts (equipment posts)
      const featuredQuery = query(
        collection(db, 'posts'),
        where('category', '==', 'equipment'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const featuredSnapshot = await getDocs(featuredQuery);
      const featuredData = featuredSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeaturedPosts(featuredData);

      // Popular Discussions (community posts with most likes)
      const discussionsQuery = query(
        collection(db, 'posts'),
        where('category', '==', 'community'),
        orderBy('likes', 'desc'),
        limit(3)
      );
      const discussionsSnapshot = await getDocs(discussionsQuery);
      const discussionsData = discussionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPopularDiscussions(discussionsData);

      // Recent Videos (video posts)
      const videosQuery = query(
        collection(db, 'posts'),
        where('category', '==', 'video'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const videosSnapshot = await getDocs(videosQuery);
      const videosData = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentVideos(videosData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching home data:', error);
      setLoading(false);
    }
  };

  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Banner - Matching Mockup Design */}
      <section 
        className="relative bg-cover bg-center h-[500px] flex items-center"
        style={{ 
          backgroundImage: 'url(/assets/banners/banner-community.png)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-holy-walnut/70 via-holy-walnut/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-holy-ivory mb-4 drop-shadow-lg">
              홀리기타
              <span className="block text-3xl md:text-4xl mt-2 italic">HolyGuitar</span>
            </h1>
            <p className="text-2xl md:text-3xl text-holy-cream font-medium drop-shadow">
              어쿠스틱 기타 커뮤니티
            </p>
          </div>
        </div>
      </section>

      {/* Three Column Section - Featured Posts, Popular Discussions, Recent Videos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Featured Posts - White Card with Border */}
          <div className="bg-white rounded-xl p-6 shadow-sharp-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500 text-center py-8">로딩 중...</div>
              ) : featuredPosts.length > 0 ? (
                featuredPosts.map((post) => (
                  <Link 
                    key={post.id} 
                    to={`/post/${post.id}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex gap-3">
                      {post.imageUrl && (
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-medium mb-1 line-clamp-2">{post.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <img 
                            src={post.authorPhoto || '/assets/logos/logo-symbol.png'} 
                            alt={post.authorName}
                            className="w-5 h-5 rounded-full"
                          />
                          <span>{post.authorName}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">아직 게시글이 없습니다</div>
              )}
            </div>
          </div>

          {/* Popular Discussions - White Card with Accent Border */}
          <div className="bg-white rounded-xl p-6 shadow-sharp-lg border-2 border-amber-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-amber-500 text-white px-3 py-1 rounded-lg text-sm mr-2">HOT</span>
              Popular Discussions
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500 text-center py-8">로딩 중...</div>
              ) : popularDiscussions.length > 0 ? (
                popularDiscussions.map((post) => (
                  <Link 
                    key={post.id} 
                    to={`/post/${post.id}`}
                    className="block bg-amber-50 rounded-lg p-4 hover:bg-amber-100 transition-colors border border-amber-200"
                  >
                    <div className="flex gap-3">
                      {post.imageUrl && (
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-medium mb-1 line-clamp-2">{post.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <img 
                            src={post.authorPhoto || '/assets/logos/logo-symbol.png'} 
                            alt={post.authorName}
                            className="w-5 h-5 rounded-full"
                          />
                          <span>{post.authorName}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">아직 게시글이 없습니다</div>
              )}
            </div>
          </div>

          {/* Recent Videos - White Card */}
          <div className="bg-white rounded-xl p-6 shadow-sharp-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Videos</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500 text-center py-8">로딩 중...</div>
              ) : recentVideos.length > 0 ? (
                recentVideos.map((post) => (
                  <Link 
                    key={post.id} 
                    to={`/post/${post.id}`}
                    className="block bg-gray-50 rounded-lg overflow-hidden hover:shadow-sharp transition-shadow border border-gray-200"
                  >
                    <div className="relative">
                      <img 
                        src={getYouTubeThumbnail(post.videoUrl) || '/assets/logos/logo-symbol.png'} 
                        alt={post.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded font-semibold">
                        2:36
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">VIDEO</span>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <h3 className="text-gray-900 font-medium mb-1 text-sm line-clamp-2">{post.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <img 
                          src={post.authorPhoto || '/assets/logos/logo-symbol.png'} 
                          alt={post.authorName}
                          className="w-4 h-4 rounded-full"
                        />
                        <span>{post.authorName}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">아직 영상이 없습니다</div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
