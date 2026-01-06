import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Comment from '../components/Comment';
import ReportModal from '../components/ReportModal';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchPostData();
  }, [id]);

  const fetchPostData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts/${id}`);
      setPost(response.data);
      setComments(response.data.comments || []);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const response = await axios.post(
        `${API_URL}/posts/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setLiked(response.data.liked);
      setPost(prev => ({
        ...prev,
        likes: response.data.liked ? prev.likes + 1 : prev.likes - 1
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
      alert('좋아요 처리에 실패했습니다.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const token = await currentUser.getIdToken();
      const response = await axios.post(
        `${API_URL}/posts/${id}/comments`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments([response.data, ...comments]);
      setCommentText('');
      setPost(prev => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/posts/${id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComments(comments.filter(c => c.id !== commentId));
      setPost(prev => ({ ...prev, commentsCount: Math.max(0, prev.commentsCount - 1) }));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate(-1);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="text-red-600 mb-4">{error || '게시글을 찾을 수 없습니다.'}</div>
        <button onClick={() => navigate(-1)} className="btn-primary">
          돌아가기
        </button>
      </div>
    );
  }

  const youtubeId = extractYouTubeId(post.videoUrl);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetId={id}
      />

      {/* Post Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
          >
            ← 목록으로
          </button>
          
          <div className="flex gap-2">
            {currentUser && currentUser.uid === post.authorId ? (
              <>
                <Link
                  to={`/posts/${id}/edit`}
                  className="btn-secondary text-sm"
                >
                  수정
                </Link>
                <button
                  onClick={handleDeletePost}
                  className="btn-secondary text-sm text-red-600 hover:text-red-700"
                >
                  삭제
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowReportModal(true)}
                className="text-sm text-gray-600 hover:text-red-600"
              >
                🚨 신고
              </button>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            {post.authorPhoto ? (
              <img src={post.authorPhoto} alt={post.authorName} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {post.authorName?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <span className="font-medium">{post.authorName}</span>
          </div>
          <span>•</span>
          <span>{formatDate(post.createdAt)}</span>
          <span>•</span>
          <span className="text-primary-600">{post.subcategory || post.category}</span>
        </div>
      </div>

      {/* Post Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Media Content */}
        {youtubeId && (
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={post.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {post.videoFileUrl && !youtubeId && (
          <video controls className="w-full">
            <source src={post.videoFileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="w-full object-cover" />
        )}

        {/* Post Body */}
        <div className="p-6">
          {post.brand && post.model && (
            <div className="mb-4 text-sm text-gray-600">
              <span className="font-medium">브랜드:</span> {post.brand} | 
              <span className="font-medium ml-2">모델:</span> {post.model}
            </div>
          )}

          {post.description && (
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap">{post.description}</p>
            </div>
          )}

          {/* Likes and Comments Count */}
          <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 ${
                liked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
              } transition-colors`}
            >
              <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
              <span>{post.likes || 0}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              <span>💬</span>
              <span>{post.commentsCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">
          댓글 {comments.length}개
        </h2>

        {/* Comment Form */}
        {currentUser ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="flex gap-4">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-semibold">
                    {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  rows="3"
                  className="input-field mb-2"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? '작성 중...' : '댓글 작성'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
            <Link to="/login" className="btn-primary">
              로그인하기
            </Link>
          </div>
        )}

        {/* Comments List with Nested Replies */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">첫 댓글을 작성해보세요!</p>
          ) : (
            comments
              .filter(comment => !comment.parentId) // Only show top-level comments
              .map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  postId={id}
                  onDelete={handleDeleteComment}
                  level={0}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
