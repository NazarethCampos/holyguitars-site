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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">커뮤니티</h1>
          <p className="text-gray-600">신앙 이야기와 기타 정보를 자유롭게 나누세요</p>
        </div>
        {currentUser && (
          <Link to="/create-post" className="btn-primary mt-4 md:mt-0">
            + 글쓰기
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === 'all'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter('신앙나눔')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === '신앙나누'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          🙏 신앙나눔
        </button>
        <button
          onClick={() => setFilter('자유게시판')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === '자유게시판'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          💬 자유게시판
        </button>
        <button
          onClick={() => setFilter('연주팁')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === '연주팁'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          💡 연주 팁
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            아직 게시글이 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            첫 번째 게시글을 작성해보세요!
          </p>
          {currentUser && (
            <Link to="/create-post" className="btn-primary">
              글쓰기
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Community;
