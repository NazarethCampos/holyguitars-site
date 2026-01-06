import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ReportModal({ isOpen, onClose, targetType, targetId, postId }) {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reportReasons = {
    post: [
      { value: 'spam', label: '스팸' },
      { value: 'harassment', label: '괴롭힘' },
      { value: 'hate_speech', label: '혐오 발언' },
      { value: 'violence', label: '폭력적 콘텐츠' },
      { value: 'inappropriate_content', label: '부적절한 콘텐츠' },
      { value: 'misinformation', label: '허위 정보' },
      { value: 'copyright', label: '저작권 침해' },
      { value: 'other', label: '기타' }
    ],
    comment: [
      { value: 'spam', label: '스팸' },
      { value: 'harassment', label: '괴롭힘' },
      { value: 'hate_speech', label: '혐오 발언' },
      { value: 'violence', label: '폭력적 콘텐츠' },
      { value: 'inappropriate_content', label: '부적절한 콘텐츠' },
      { value: 'misinformation', label: '허위 정보' },
      { value: 'other', label: '기타' }
    ],
    user: [
      { value: 'spam', label: '스팸' },
      { value: 'harassment', label: '괴롭힘' },
      { value: 'impersonation', label: '사칭' },
      { value: 'inappropriate_profile', label: '부적절한 프로필' },
      { value: 'suspicious_activity', label: '의심스러운 활동' },
      { value: 'other', label: '기타' }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!reason) {
      alert('신고 사유를 선택해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const token = await currentUser.getIdToken();
      
      let endpoint = '';
      let data = { reason, description };

      if (targetType === 'post') {
        endpoint = `${API_URL}/reports/posts/${targetId}`;
      } else if (targetType === 'comment') {
        endpoint = `${API_URL}/reports/comments/${targetId}`;
        data.postId = postId;
      } else if (targetType === 'user') {
        endpoint = `${API_URL}/reports/users/${targetId}`;
      }

      await axios.post(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
      onClose();
      setReason('');
      setDescription('');
    } catch (err) {
      console.error('Error submitting report:', err);
      alert(err.response?.data?.error || '신고 접수에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">신고하기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              신고 사유
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">선택해주세요</option>
              {reportReasons[targetType]?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 설명 (선택사항)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="신고 사유에 대한 추가 설명을 입력해주세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ 허위 신고는 제재의 대상이 될 수 있습니다.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              {submitting ? '제출 중...' : '신고하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportModal;
