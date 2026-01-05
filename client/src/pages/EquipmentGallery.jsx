import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const EquipmentCard = ({ equipment }) => {
  return (
    <Link to={`/posts/${equipment.id}`} className="card group">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={equipment.imageUrl || '/placeholder-equipment.jpg'} 
          alt={equipment.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          {equipment.subcategory === '기타' && (
            <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              🎸 기타
            </span>
          )}
          {equipment.subcategory === '앰프' && (
            <span className="bg-secondary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              🔊 앰프
            </span>
          )}
          {equipment.subcategory === '이펙터' && (
            <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              🎛️ 이펙터
            </span>
          )}
          {equipment.subcategory === '악세서리' && (
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              🎯 악세서리
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {equipment.title}
        </h3>
        {equipment.brand && (
          <p className="text-sm text-primary-600 font-medium mb-2">
            {equipment.brand} {equipment.model && `· ${equipment.model}`}
          </p>
        )}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {equipment.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
              {equipment.authorName?.charAt(0) || 'U'}
            </div>
            <span className="text-gray-700 font-medium">{equipment.authorName}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              {equipment.likes || 0}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {equipment.commentsCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const EquipmentGallery = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, guitar, amp, pedal, accessory
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchEquipment();
  }, [filter]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      let q = query(
        collection(db, 'posts'),
        where('category', '==', 'equipment'),
        orderBy('createdAt', 'desc')
      );

      if (filter !== 'all') {
        q = query(
          collection(db, 'posts'),
          where('category', '==', 'equipment'),
          where('subcategory', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const equipmentData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEquipment(equipmentData);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">장비 갤러리</h1>
          <p className="text-gray-600">소중한 기타와 장비를 자랑하고 정보를 나누세요</p>
        </div>
        {currentUser && (
          <Link to="/create-post" className="btn-primary mt-4 md:mt-0">
            + 장비 등록
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
          onClick={() => setFilter('기타')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === '기타'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          🎸 기타
        </button>
        <button
          onClick={() => setFilter('앰프')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === '앰프'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          🔊 앰프
        </button>
        <button
          onClick={() => setFilter('이펙터')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === '이펙터'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          🎛️ 이펙터
        </button>
        <button
          onClick={() => setFilter('악세서리')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            filter === '악세서리'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          🎯 악세서리
        </button>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : equipment.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {equipment.map(item => (
            <EquipmentCard key={item.id} equipment={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎸</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            아직 등록된 장비가 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            첫 번째 장비를 등록해보세요!
          </p>
          {currentUser && (
            <Link to="/create-post" className="btn-primary">
              장비 등록하기
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default EquipmentGallery;
