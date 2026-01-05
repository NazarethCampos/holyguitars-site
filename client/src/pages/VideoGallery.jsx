import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const VideoCard = ({ video }) => {
  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(video.videoUrl || '');
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '/placeholder-video.jpg';

  return (
    <Link to={`/posts/${video.id}`} className="card group">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
          🎬 영상
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {video.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
              {video.authorName?.charAt(0) || 'U'}
            </div>
            <span className="text-gray-700 font-medium">{video.authorName}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              {video.likes || 0}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {video.commentsCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, worship, cover, lesson
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchVideos();
  }, [filter]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      let q = query(
        collection(db, 'posts'),
        where('category', '==', 'video'),
        orderBy('createdAt', 'desc')
      );

      if (filter !== 'all') {
        q = query(
          collection(db, 'posts'),
          where('category', '==', 'video'),
          where('subcategory', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const videosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setVideos(videosData);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">연주 영상 갤러리</h1>
          <p className="text-gray-600">찬양곡, 커버, 레슨 영상을 감상하고 공유하세요</p>
        </div>
        {currentUser && (
          <Link to="/create-post" className="btn-primary mt-4 md:mt-0">
            + 영상 업로드
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
          onClick={() => setFilter('찬양곡')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === '찬양곡'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          🙏 찬양곡
        </button>
        <button
          onClick={() => setFilter('커버곡')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === '커버곡'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          🎵 커버곡
        </button>
        <button
          onClick={() => setFilter('레슨')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === '레슨'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          📚 레슨
        </button>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            아직 영상이 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            첫 번째 연주 영상을 업로드해보세요!
          </p>
          {currentUser && (
            <Link to="/create-post" className="btn-primary">
              영상 업로드하기
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoGallery;
