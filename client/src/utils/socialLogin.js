// Kakao Login Helper
export const initKakao = () => {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    const kakaoKey = import.meta.env.VITE_KAKAO_APP_KEY;
    if (kakaoKey) {
      window.Kakao.init(kakaoKey);
      console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
    }
  }
};

export const kakaoLogin = () => {
  return new Promise((resolve, reject) => {
    if (!window.Kakao) {
      reject(new Error('Kakao SDK not loaded'));
      return;
    }

    window.Kakao.Auth.login({
      success: (authObj) => {
        // Get user info
        window.Kakao.API.request({
          url: '/v2/user/me',
          success: (res) => {
            resolve({
              id: res.id,
              email: res.kakao_account?.email,
              name: res.kakao_account?.profile?.nickname,
              photoURL: res.kakao_account?.profile?.profile_image_url,
              provider: 'kakao'
            });
          },
          fail: (error) => {
            reject(error);
          }
        });
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
};

export const kakaoLogout = () => {
  return new Promise((resolve, reject) => {
    if (!window.Kakao || !window.Kakao.Auth) {
      resolve();
      return;
    }

    if (window.Kakao.Auth.getAccessToken()) {
      window.Kakao.Auth.logout(() => {
        resolve();
      });
    } else {
      resolve();
    }
  });
};

// Naver Login Helper
export const initNaver = () => {
  return new Promise((resolve) => {
    const naverClientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    const callbackUrl = import.meta.env.VITE_NAVER_CALLBACK_URL;

    if (!naverClientId || !callbackUrl) {
      console.error('Naver credentials not configured');
      resolve(null);
      return;
    }

    const naverLogin = new window.naver.LoginWithNaverId({
      clientId: naverClientId,
      callbackUrl: callbackUrl,
      isPopup: false,
      loginButton: { color: 'green', type: 3, height: 48 }
    });

    naverLogin.init();
    resolve(naverLogin);
  });
};

export const getNaverUserInfo = (naverLogin) => {
  return new Promise((resolve, reject) => {
    naverLogin.getLoginStatus((status) => {
      if (status) {
        const user = naverLogin.user;
        resolve({
          id: user.id,
          email: user.email,
          name: user.name || user.nickname,
          photoURL: user.profile_image,
          provider: 'naver'
        });
      } else {
        reject(new Error('Not logged in'));
      }
    });
  });
};
