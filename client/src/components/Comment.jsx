import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Comment({ comment, postId, onDelete, level = 0 }) {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes || 0);

  useEffect(() => {
    if (comment.repliesCount > 0) {
      fetchReplies();
    }
  }, [comment.repliesCount]);

  const fetchReplies = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/posts/${postId}/comments/${comment.id}/replies`
      );
      setReplies(response.data.replies);
    } catch (err) {
      console.error('Error fetching replies:', err);
    }
  };

  const handleEdit = async () => {
    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/posts/${postId}/comments/${comment.id}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      comment.content = editContent;
      setIsEditing(false);
      alert('댓글이 수정되었습니다.');
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleLike = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.post(
        `${API_URL}/posts/${postId}/comments/${comment.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setLiked(response.data.liked);
      setLikesCount(prev => response.data.liked ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Error liking comment:', err);
      alert('로그인이 필요합니다.');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;

    try {
      const token = await currentUser.getIdToken();
      const response = await axios.post(
        `${API_URL}/posts/${postId}/comments`,
        { 
          content: replyContent,
          parentId: comment.id 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setReplies([...replies, response.data]);
      setReplyContent('');
      setShowReplyForm(false);
      comment.repliesCount = (comment.repliesCount || 0) + 1;
    } catch (err) {
      console.error('Error adding reply:', err);
      alert('답글 작성에 실패했습니다.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  const marginLeft = level > 0 ? 'ml-12' : '';

  return (
    <div className={`${marginLeft} mb-4`}>
      <div className="flex gap-3 bg-gray-50 p-4 rounded-lg">
        {/* Avatar */}
        <img
          src={comment.userPhoto || '/default-avatar.png'}
          alt={comment.userName}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{comment.userName}</span>
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg resize-none"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-2 text-sm">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 ${
                    liked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                  }`}
                >
                  <span>{liked ? '❤️' : '🤍'}</span>
                  <span>{likesCount}</span>
                </button>

                {level < 2 && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    답글
                  </button>
                )}

                {comment.repliesCount > 0 && (
                  <button
                    onClick={() => setShowReplies(!showReplies)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {showReplies ? '답글 숨기기' : `답글 ${comment.repliesCount}개 보기`}
                  </button>
                )}

                {currentUser && currentUser.uid === comment.userId && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => onDelete(comment.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleReply} className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 입력하세요..."
                className="w-full px-3 py-2 border rounded-lg resize-none"
                rows="2"
                required
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  답글 작성
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {showReplies && replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Comment;
