import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { initKakao, initNaver, getNaverUserInfo } from '../utils/socialLogin';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [naverLogin, setNaverLogin] = useState(null);
  const { signin, signInWithGoogle, signInWithKakao, signInWithNaver } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Kakao SDK
    initKakao();

    // Initialize Naver SDK
    initNaver().then((login) => {
      setNaverLogin(login);
    });

    // Check if returning from Naver callback
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      handleNaverCallback();
    }
  }, []);

  const handleNaverCallback = async () => {
    if (naverLogin) {
      try {
        setError('');
        setLoading(true);
        const naverUser = await getNaverUserInfo(naverLogin);
        await signInWithNaver(naverUser);
        navigate('/');
      } catch (err) {
        setError('Naver 로그인에 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await signin(email, password);
      navigate('/');
    } catch (err) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Google 로그인에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithKakao();
      navigate('/');
    } catch (err) {
      setError('Kakao 로그인에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNaverSignIn = () => {
    // Naver login uses popup/redirect, handled by SDK
    const naverBtn = document.getElementById('naverIdLogin_loginButton');
    if (naverBtn) {
      naverBtn.click();
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <span className="text-6xl">🎸</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            또는{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              새 계정 만들기
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  로그인 상태 유지
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  비밀번호 찾기
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {/* Google Login */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 로그인
              </button>

              {/* Kakao Login */}
              <button
                onClick={handleKakaoSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3 rounded-lg shadow-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#FEE500', color: '#000000' }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 3C6.486 3 2 6.262 2 10.29c0 2.546 1.693 4.776 4.244 6.043l-1.002 3.683a.389.389 0 00.585.442l4.315-2.885a13.672 13.672 0 002.858.298c5.514 0 10-3.262 10-7.29C22 6.262 17.514 3 12 3z"
                  />
                </svg>
                Kakao로 로그인
              </button>

              {/* Naver Login */}
              <div className="relative">
                <button
                  onClick={handleNaverSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-3 rounded-lg shadow-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#03C75A', color: '#ffffff' }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"
                    />
                  </svg>
                  Naver로 로그인
                </button>
                {/* Hidden Naver login button for SDK */}
                <div id="naverIdLogin" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
