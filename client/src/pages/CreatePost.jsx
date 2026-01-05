import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../services/firebase';

const CreatePost = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'video',
    subcategory: '',
    videoUrl: '',
    brand: '',
    model: ''
  });

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = {
    video: ['찬양곡', '커버곡', '레슨', '기타'],
    equipment: ['기타', '앰프', '이펙터', '악세서리', '기타'],
    community: ['신앙나눔', '자유게시판', '연주팁', '질문답변', '기타']
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category,
      subcategory: ''
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }

      setFile(selectedFile);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const uploadFile = async (file) => {
    const folder = file.type.startsWith('image/') ? 'images' : 'videos';
    const fileName = `${folder}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!formData.title || !formData.category) {
      setError('제목과 카테고리는 필수입니다.');
      return;
    }

    // Validate category-specific requirements
    if (formData.category === 'video' && !formData.videoUrl && !file) {
      setError('영상 URL 또는 영상 파일을 업로드해주세요.');
      return;
    }

    if (formData.category === 'equipment' && !file) {
      setError('장비 이미지를 업로드해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const postData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorPhoto: currentUser.photoURL || null,
        likes: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Upload file if provided
      if (file) {
        const fileUrl = await uploadFile(file);
        
        if (file.type.startsWith('image/')) {
          postData.imageUrl = fileUrl;
        } else {
          postData.videoFileUrl = fileUrl;
        }
      }

      // Add video URL for YouTube embeds
      if (formData.videoUrl) {
        postData.videoUrl = formData.videoUrl;
      }

      // Add equipment specific fields
      if (formData.category === 'equipment') {
        if (formData.brand) postData.brand = formData.brand;
        if (formData.model) postData.model = formData.model;
      }

      await addDoc(collection(db, 'posts'), postData);

      // Navigate to appropriate page based on category
      if (formData.category === 'video') {
        navigate('/video-gallery');
      } else if (formData.category === 'equipment') {
        navigate('/equipment-gallery');
      } else {
        navigate('/community');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('게시글 작성에 실패했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
        <p className="text-gray-600 mb-6">게시글을 작성하려면 먼저 로그인해주세요.</p>
        <button
          onClick={() => navigate('/login')}
          className="btn-primary"
        >
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">새 게시글 작성</h1>
        <p className="mt-2 text-gray-600">연주 영상, 장비, 또는 커뮤니티 게시글을 작성하세요.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리 *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleCategoryChange}
            className="input-field"
            required
          >
            <option value="video">연주 영상</option>
            <option value="equipment">장비 갤러리</option>
            <option value="community">커뮤니티</option>
          </select>
        </div>

        {/* Subcategory Selection */}
        {formData.category && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              세부 카테고리
            </label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">선택하세요</option>
              {categories[formData.category].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="input-field"
            placeholder="게시글 제목을 입력하세요"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="6"
            className="input-field"
            placeholder="게시글 내용을 입력하세요"
          />
        </div>

        {/* Video URL (for video category) */}
        {formData.category === 'video' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube 영상 URL
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              className="input-field"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="mt-1 text-sm text-gray-500">
              YouTube 영상 URL 또는 아래에서 영상 파일을 업로드하세요
            </p>
          </div>
        )}

        {/* Equipment specific fields */}
        {formData.category === 'equipment' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                브랜드
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="input-field"
                placeholder="예: Fender, Gibson, Marshall..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                모델명
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="input-field"
                placeholder="예: Stratocaster, Les Paul..."
              />
            </div>
          </>
        )}

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.category === 'video' ? '영상 파일' : '이미지 파일'}
            {formData.category === 'equipment' && ' *'}
          </label>
          <div className="mt-2 flex items-center gap-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept={formData.category === 'video' ? 'video/*,image/*' : 'image/*'}
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="btn-secondary">
                파일 선택
              </span>
            </label>
            {file && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{file.name}</span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            최대 10MB, {formData.category === 'video' ? '이미지 또는 영상' : '이미지'} 파일
          </p>

          {/* File Preview */}
          {filePreview && (
            <div className="mt-4">
              {file.type.startsWith('image/') ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-w-md rounded-lg shadow-md"
                />
              ) : (
                <video
                  src={filePreview}
                  controls
                  className="max-w-md rounded-lg shadow-md"
                />
              )}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '작성 중...' : '게시글 작성'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
