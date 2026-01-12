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
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{ 
          backgroundImage: 'url(/assets/banners/banner-classic.png)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-holy-walnut/80 to-holy-espresso/60"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-holy-ivory px-6 sm:px-12 lg:px-16">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Title */}
          <div className="text-center">
            <img 
              src="/assets/logos/logo-symbol.png" 
              alt="홀리기타" 
              className="mx-auto h-20 w-auto mb-6"
            />
            <h1 className="font-serif text-3xl font-bold text-holy-espresso mb-2">
              홀리기타
            </h1>
            <p className="text-lg text-holy-walnut mb-8">
              HolyGuitar
            </p>
            <h2 className="text-2xl font-bold text-holy-espresso">
              환영합니다
            </h2>
          </div>

          {/* Login Form */}
          <div className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-holy-cream-300 rounded-lg focus:border-holy-amber focus:outline-none transition-colors text-holy-espresso placeholder-holy-walnut-400"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-holy-cream-300 rounded-lg focus:border-holy-amber focus:outline-none transition-colors text-holy-espresso placeholder-holy-walnut-400"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-holy-amber hover:bg-holy-honey text-holy-espresso rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-warm"
                >
                  {loading ? '로그인 중...' : '로그인'}
                </button>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-holy-amber focus:ring-holy-amber border-holy-cream-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-holy-walnut">
                  회원가입이 통생에 보세요.
                </label>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-holy-cream-300" />
                </div>
              </div>
            </div>

            {/* Additional Links */}
            <div className="space-y-3 text-center">
              <p className="text-sm text-holy-walnut">
                <Link to="/signup" className="text-holy-espresso hover:text-holy-amber font-medium">
                  이름
                </Link>
              </p>
              <p className="text-sm text-holy-walnut">
                <a href="#" className="text-holy-espresso hover:text-holy-amber font-medium">
                  비밀번호 확인
                </a>
              </p>
              <p className="text-sm text-holy-walnut">
                <Link to="/signup" className="text-holy-espresso hover:text-holy-amber font-medium">
                  회원가입
                </Link>
              </p>
            </div>

            {/* Social Login */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-holy-cream-300 rounded-lg bg-white text-holy-espresso hover:bg-holy-cream-100 font-medium transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              <button
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-holy-cream-300 rounded-lg bg-white text-holy-espresso hover:bg-holy-cream-100 font-medium transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#FF6B00' }}
              >
                <span className="text-white font-bold">F</span>
                <span className="text-white">Facebook</span>
              </button>

              <div className="relative">
                <button
                  onClick={handleNaverSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-holy-cream-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#03C75A', color: '#ffffff' }}
                >
                  <span className="font-bold">N</span>
                  <span>Naver</span>
                </button>
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
