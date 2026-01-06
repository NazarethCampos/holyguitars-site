import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
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

  const youtubeId = extractYouTubeId(post.videoUrl);
  const thumbnailUrl = youtubeId 
    ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
    : post.imageUrl;

  return (
    <Link
      to={`/posts/${post.id}`}
      className="block bg-holy-ivory rounded-xl shadow-warm hover:shadow-warm-lg transition-all duration-300 overflow-hidden border border-holy-cream-200 transform hover:-translate-y-1"
    >
      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="relative aspect-video bg-holy-cream">
          <img
            src={thumbnailUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x225?text=No+Image';
            }}
          />
          {post.category === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-holy-walnut bg-opacity-80 rounded-full p-4 shadow-warm">
                <svg className="w-10 h-10 text-holy-amber" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Category Badge */}
        {post.subcategory && (
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-holy-amber-100 text-holy-amber-800 rounded-full mb-3">
            {post.subcategory}
          </span>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-holy-espresso mb-2 line-clamp-2 hover:text-holy-walnut transition-colors">
          {post.title}
        </h3>

        {/* Description */}
        {post.description && (
          <p className="text-holy-walnut-600 text-sm mb-4 line-clamp-2">
            {post.description}
          </p>
        )}

        {/* Equipment Info */}
        {post.brand && post.model && (
          <p className="text-sm text-holy-honey font-medium mb-4">
            {post.brand} - {post.model}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-holy-walnut-500 pt-4 border-t border-holy-cream-300">
          <div className="flex items-center gap-2">
            {post.authorPhoto ? (
              <img
                src={post.authorPhoto}
                alt={post.authorName}
                className="w-7 h-7 rounded-full border-2 border-holy-amber-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-holy-amber-100 flex items-center justify-center border-2 border-holy-amber-200">
                <span className="text-xs text-holy-amber-700 font-bold">
                  {post.authorName?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <span className="font-medium text-holy-walnut">{post.authorName}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-holy-honey">
              ❤️ {post.likes || 0}
            </span>
            <span className="flex items-center gap-1 text-holy-walnut">
              💬 {post.commentsCount || 0}
            </span>
            <span className="text-holy-walnut-400">{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
