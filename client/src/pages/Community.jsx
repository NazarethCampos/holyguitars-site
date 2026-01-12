import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const PostCard = ({ post }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Link to={`/posts/${post.id}`} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors mb-2">
            {post.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {post.description}
          </p>
        </div>
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-20 h-20 object-cover rounded-lg ml-4"
          />
        )}
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
              {post.authorName?.charAt(0) || 'U'}
            </div>
            {post.authorName}
          </span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            {post.likes || 0}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            {post.commentsCount || 0}
          </span>
        </div>
      </div>
    </Link>
  );
};

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, faith, free, tips
  const [activeUsers, setActiveUsers] = useState([
    { name: 'AcousticLover', online: true },
    { name: 'GuitarMaster', online: true },
    { name: 'FingerPicker', online: true },
    { name: 'Finger335', online: true },
  ]);
  const [trendingTags, setTrendingTags] = useState([
    '#통기타입문',
    '#미테ID-28',
    '#미테ID-28',
    '#기타출고제',
    '#기타입문투톤',
    '#기타알포좌정',
    '#그다포프리얼'
  ]);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let q = query(
        collection(db, 'posts'),
        where('category', '==', 'community'),
        orderBy('createdAt', 'desc')
      );

      if (filter !== 'all') {
        q = query(
          collection(db, 'posts'),
          where('category', '==', 'community'),
          where('subcategory', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (subcategory) => {
    const icons = {
      '자유게시판': '💬',
      '기타 리뷰': '🎸',
      '연주 영상': '▶',
      'Q&A': '❓'
    };
    return icons[subcategory] || '💬';
  };

  const getCategoryLabel = (subcategory) => {
    return subcategory || '자유게시판';
  };

  return (
    <div className="bg-holy-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content - Left Side */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-holy-espresso mb-8">커뮤니티 게시판</h1>
            
            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* 자유게시판 */}
              <Link to="/community?filter=자유게시판" className="bg-holy-ivory border-2 border-holy-cream-300 rounded-2xl p-8 hover:shadow-warm-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-6xl">💬</div>
                </div>
                <h2 className="text-2xl font-bold text-holy-espresso mb-2">자유게시판</h2>
                <p className="text-holy-walnut mb-3">
                  Posts: 1,250
                </p>
                <p className="text-sm text-holy-walnut-600 mb-4">
                  Recent: '새 기타 자랑합니다!'
                </p>
                <div className="flex items-center gap-2 text-xs text-holy-walnut mb-4">
                  <img src="/assets/logos/logo-symbol.png" className="w-5 h-5 rounded-full" alt="user" />
                  <span>by AcousticLover</span>
                  <span className="text-holy-walnut-500">5 mins ago</span>
                </div>
                <button className="w-full bg-holy-honey text-holy-ivory px-4 py-2 rounded-lg font-medium hover:bg-holy-honey-600 transition-colors">
                  바로가기
                </button>
              </Link>

              {/* 기타 리뷰 */}
              <Link to="/community?filter=기타 리뷰" className="bg-holy-ivory border-2 border-holy-cream-300 rounded-2xl p-8 hover:shadow-warm-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-6xl">🎸</div>
                </div>
                <h2 className="text-2xl font-bold text-holy-espresso mb-2">기타 리뷰</h2>
                <p className="text-holy-walnut mb-3">
                  Posts: 450
                </p>
                <p className="text-sm text-holy-walnut-600 mb-4">
                  Recent: '테일러 814ce 실증 리뷰'
                </p>
                <div className="flex items-center gap-2 text-xs text-holy-walnut mb-4">
                  <img src="/assets/logos/logo-symbol.png" className="w-5 h-5 rounded-full" alt="user" />
                  <span>by GuitarMaster</span>
                  <span className="text-holy-walnut-500">2 hours ago</span>
                </div>
                <button className="w-full bg-holy-honey text-holy-ivory px-4 py-2 rounded-lg font-medium hover:bg-holy-honey-600 transition-colors">
                  바로가기 (Go)
                </button>
              </Link>

              {/* 연주 영상 */}
              <Link to="/community?filter=연주 영상" className="bg-holy-ivory border-2 border-holy-cream-300 rounded-2xl p-8 hover:shadow-warm-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-6xl">▶</div>
                </div>
                <h2 className="text-2xl font-bold text-holy-espresso mb-2">연주 영상</h2>
                <p className="text-holy-walnut mb-3">
                  Posts: 890
                </p>
                <p className="text-sm text-holy-walnut-600 mb-4">
                  Recent: '핑거스타일 커버 궁금'
                </p>
                <div className="flex items-center gap-2 text-xs text-holy-walnut mb-4">
                  <img src="/assets/logos/logo-symbol.png" className="w-5 h-5 rounded-full" alt="user" />
                  <span>by FingerPicker</span>
                  <span className="text-holy-walnut-500">1 day ago</span>
                </div>
                <button className="w-full bg-holy-honey text-holy-ivory px-4 py-2 rounded-lg font-medium hover:bg-holy-honey-600 transition-colors">
                  바로가기 (Go)
                </button>
              </Link>

              {/* Q&A */}
              <Link to="/community?filter=Q&A" className="bg-holy-ivory border-2 border-holy-cream-300 rounded-2xl p-8 hover:shadow-warm-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-6xl">❓</div>
                </div>
                <h2 className="text-2xl font-bold text-holy-espresso mb-2">Q&A</h2>
                <p className="text-holy-walnut mb-3">
                  Posts: 315
                </p>
                <p className="text-sm text-holy-walnut-600 mb-4">
                  Recent: '초보자용 기타 추천 부탁드립니다'
                </p>
                <div className="flex items-center gap-2 text-xs text-holy-walnut mb-4">
                  <img src="/assets/logos/logo-symbol.png" className="w-5 h-5 rounded-full" alt="user" />
                  <span>by NewbieGuitarist</span>
                  <span className="text-holy-walnut-500">30 mins ago</span>
                </div>
                <button className="w-full bg-holy-honey text-holy-ivory px-4 py-2 rounded-lg font-medium hover:bg-holy-honey-600 transition-colors">
                  바로가기 (Go)
                </button>
              </Link>

            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            
            {/* 활동 중인 멤버 */}
            <div className="bg-holy-ivory rounded-xl p-6 shadow-warm border border-holy-cream-300">
              <h3 className="text-xl font-bold text-holy-espresso mb-4">활동 중인 멤버</h3>
              <div className="space-y-3">
                {activeUsers.map((user, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src="/assets/logos/logo-symbol.png" 
                        className="w-10 h-10 rounded-full"
                        alt={user.name}
                      />
                      {user.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <span className="text-holy-espresso font-medium">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 인기 토픽 */}
            <div className="bg-holy-ivory rounded-xl p-6 shadow-warm border border-holy-cream-300">
              <h3 className="text-xl font-bold text-holy-espresso mb-4">인기 토픽</h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      idx === 0 ? 'bg-holy-amber-100 text-holy-amber-700' :
                      idx === 1 || idx === 2 ? 'bg-holy-honey-100 text-holy-honey-700' :
                      'bg-holy-walnut-100 text-holy-walnut-700'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 커뮤니티 통계 */}
            <div className="bg-holy-ivory rounded-xl p-6 shadow-warm border border-holy-cream-300">
              <h3 className="text-xl font-bold text-holy-espresso mb-4">커뮤니티 통계</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-holy-walnut">Total members</span>
                  <span className="font-bold text-holy-espresso">5,550</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-holy-walnut">Total posts</span>
                  <span className="font-bold text-holy-espresso">1,832</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-holy-walnut">Online users</span>
                  <span className="font-bold text-green-600">12</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
