import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav className="bg-holy-walnut shadow-warm-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/assets/logos/logo-horizontal.png" 
                alt="홀리기타 Holy Guitar" 
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/videos" className="text-holy-ivory hover:text-holy-amber font-medium transition-colors duration-300">
              연주 영상
            </Link>
            <Link to="/equipment" className="text-holy-ivory hover:text-holy-amber font-medium transition-colors duration-300">
              장비 갤러리
            </Link>
            <Link to="/community" className="text-holy-ivory hover:text-holy-amber font-medium transition-colors duration-300">
              커뮤니티
            </Link>

            {currentUser ? (
              <>
                <Link to="/create-post" className="px-5 py-2 bg-holy-amber text-holy-espresso rounded-lg font-semibold hover:bg-holy-honey transition-colors duration-300 text-sm">
                  글쓰기
                </Link>
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName} 
                        className="w-9 h-9 rounded-full border-2 border-holy-amber"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-holy-amber flex items-center justify-center text-holy-espresso font-bold">
                        {currentUser.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium text-holy-ivory">{currentUser.displayName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-holy-ivory hover:text-holy-amber font-medium transition-colors duration-300"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-holy-ivory hover:text-holy-amber font-medium transition-colors duration-300">
                  로그인
                </Link>
                <Link to="/signup" className="px-5 py-2 bg-holy-amber text-holy-espresso rounded-lg font-semibold hover:bg-holy-honey transition-colors duration-300 text-sm">
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-holy-ivory hover:text-holy-amber transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-holy-walnut-700 border-t border-holy-walnut-600">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/videos"
              className="block px-3 py-2 rounded-md text-base font-medium text-holy-ivory hover:text-holy-amber hover:bg-holy-walnut-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              연주 영상
            </Link>
            <Link
              to="/equipment"
              className="block px-3 py-2 rounded-md text-base font-medium text-holy-ivory hover:text-holy-amber hover:bg-holy-walnut-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              장비 갤러리
            </Link>
            <Link
              to="/community"
              className="block px-3 py-2 rounded-md text-base font-medium text-holy-ivory hover:text-holy-amber hover:bg-holy-walnut-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              커뮤니티
            </Link>

            {currentUser ? (
              <>
                <Link
                  to="/create-post"
                  className="block px-3 py-2 rounded-md text-base font-medium text-holy-amber hover:bg-holy-walnut-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  글쓰기
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-holy-ivory hover:bg-holy-walnut-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  프로필
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-holy-amber hover:bg-holy-walnut-600 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-holy-ivory hover:bg-holy-walnut-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-holy-amber hover:bg-holy-walnut-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
