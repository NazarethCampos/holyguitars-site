import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Check if user is admin
    if (currentUser.role !== 'admin' && currentUser.role !== 'moderator') {
      navigate('/');
      return;
    }

    fetchData();
  }, [currentUser, navigate, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'stats') {
        const response = await axios.get(`${API_URL}/admin/stats`, { headers });
        setStats(response.data);
      } else if (activeTab === 'users') {
        const response = await axios.get(`${API_URL}/admin/users`, { headers });
        setUsers(response.data.users);
      } else if (activeTab === 'posts') {
        const response = await axios.get(`${API_URL}/admin/posts`, { headers });
        setPosts(response.data.posts);
      } else if (activeTab === 'reports') {
        const response = await axios.get(`${API_URL}/admin/reports`, { headers });
        setReports(response.data.reports);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (uid, role) => {
    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/admin/users/${uid}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User role updated successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user role');
    }
  };

  const handleBanUser = async (uid, banned, reason = '') => {
    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/admin/users/${uid}/ban`,
        { banned, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(banned ? 'User banned successfully' : 'User unbanned successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to ban/unban user');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const token = await currentUser.getIdToken();
      await axios.delete(`${API_URL}/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Post deleted successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post');
    }
  };

  const handleUpdateReport = async (reportId, status, action = '') => {
    try {
      const token = await currentUser.getIdToken();
      await axios.put(
        `${API_URL}/admin/reports/${reportId}`,
        { status, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Report updated successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">커뮤니티 관리 및 통계</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['stats', 'users', 'posts', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'stats' && '통계'}
                  {tab === 'users' && '사용자 관리'}
                  {tab === 'posts' && '게시글 관리'}
                  {tab === 'reports' && '신고 관리'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Statistics Tab */}
            {activeTab === 'stats' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">총 사용자</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                  <p className="text-sm text-blue-700 mt-2">이번 주 신규: {stats.newUsersThisWeek}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-green-900 mb-2">총 게시글</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.totalPosts}</p>
                  <p className="text-sm text-green-700 mt-2">이번 주 신규: {stats.newPostsThisWeek}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-900 mb-2">총 댓글</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalComments}</p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-red-900 mb-2">대기 중인 신고</h3>
                  <p className="text-3xl font-bold text-red-600">{stats.pendingReports}</p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">사용자</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={user.photoURL || '/default-avatar.png'}
                              alt={user.displayName}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.displayName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                            disabled={currentUser.role !== 'admin'}
                          >
                            <option value="member">Member</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            user.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {user.banned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleBanUser(user.id, !user.banned, 'Admin action')}
                            className={`${
                              user.banned ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'
                            } mr-4`}
                          >
                            {user.banned ? 'Unban' : 'Ban'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{post.description?.substring(0, 100)}...</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>작성자: {post.authorName}</span>
                          <span>좋아요: {post.likes}</span>
                          <span>댓글: {post.commentsCount}</span>
                          <span className="px-2 py-1 bg-gray-100 rounded">{post.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                          <span className="text-sm font-medium">{report.targetType}</span>
                          <span className="text-sm text-gray-500">사유: {report.reason}</span>
                        </div>
                        <p className="text-gray-700 mt-2">{report.description}</p>
                        <p className="text-sm text-gray-500 mt-2">신고자: {report.reporterName}</p>
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateReport(report.id, 'resolved', 'Content removed')}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            해결
                          </button>
                          <button
                            onClick={() => handleUpdateReport(report.id, 'dismissed')}
                            className="text-gray-600 hover:text-gray-900 text-sm"
                          >
                            무시
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
