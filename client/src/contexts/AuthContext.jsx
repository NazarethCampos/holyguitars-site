import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { kakaoLogin, kakaoLogout } from '../utils/socialLogin';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        photoURL: null,
        bio: '',
        favoriteGuitar: '',
        createdAt: new Date().toISOString(),
        role: 'member'
      });

      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with email and password
  const signin = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        // Create user document for new Google users
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          bio: '',
          favoriteGuitar: '',
          createdAt: new Date().toISOString(),
          role: 'member'
        });
      }

      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Kakao
  const signInWithKakao = async () => {
    try {
      setError(null);
      const kakaoUser = await kakaoLogin();
      
      // Create or get Firebase user with Kakao info
      const userDocRef = doc(db, 'users', `kakao_${kakaoUser.id}`);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          uid: `kakao_${kakaoUser.id}`,
          email: kakaoUser.email || `kakao_${kakaoUser.id}@kakao.com`,
          displayName: kakaoUser.name,
          photoURL: kakaoUser.photoURL,
          bio: '',
          favoriteGuitar: '',
          createdAt: new Date().toISOString(),
          role: 'member',
          provider: 'kakao'
        });
      }

      // Store Kakao user info in sessionStorage for custom auth
      sessionStorage.setItem('kakaoUser', JSON.stringify({
        uid: `kakao_${kakaoUser.id}`,
        email: kakaoUser.email || `kakao_${kakaoUser.id}@kakao.com`,
        displayName: kakaoUser.name,
        photoURL: kakaoUser.photoURL,
        provider: 'kakao'
      }));

      // Trigger auth state change
      const userData = userDoc.exists() ? userDoc.data() : await getDoc(userDocRef).then(doc => doc.data());
      setCurrentUser({ ...kakaoUser, ...userData, uid: `kakao_${kakaoUser.id}` });
      
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Naver
  const signInWithNaver = async (naverUser) => {
    try {
      setError(null);
      
      // Create or get Firebase user with Naver info
      const userDocRef = doc(db, 'users', `naver_${naverUser.id}`);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          uid: `naver_${naverUser.id}`,
          email: naverUser.email || `naver_${naverUser.id}@naver.com`,
          displayName: naverUser.name,
          photoURL: naverUser.photoURL,
          bio: '',
          favoriteGuitar: '',
          createdAt: new Date().toISOString(),
          role: 'member',
          provider: 'naver'
        });
      }

      // Store Naver user info in sessionStorage
      sessionStorage.setItem('naverUser', JSON.stringify({
        uid: `naver_${naverUser.id}`,
        email: naverUser.email || `naver_${naverUser.id}@naver.com`,
        displayName: naverUser.name,
        photoURL: naverUser.photoURL,
        provider: 'naver'
      }));

      // Trigger auth state change
      const userData = userDoc.exists() ? userDoc.data() : await getDoc(userDocRef).then(doc => doc.data());
      setCurrentUser({ ...naverUser, ...userData, uid: `naver_${naverUser.id}` });
      
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      
      // Logout from Kakao if logged in via Kakao
      const kakaoUser = sessionStorage.getItem('kakaoUser');
      if (kakaoUser) {
        await kakaoLogout();
        sessionStorage.removeItem('kakaoUser');
      }

      // Logout from Naver if logged in via Naver
      const naverUser = sessionStorage.getItem('naverUser');
      if (naverUser) {
        sessionStorage.removeItem('naverUser');
      }

      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get user profile from Firestore
  const getUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check for social login sessions
    const kakaoUser = sessionStorage.getItem('kakaoUser');
    const naverUser = sessionStorage.getItem('naverUser');

    if (kakaoUser) {
      const userData = JSON.parse(kakaoUser);
      getUserProfile(userData.uid).then(profile => {
        setCurrentUser({ ...userData, ...profile });
        setLoading(false);
      });
    } else if (naverUser) {
      const userData = JSON.parse(naverUser);
      getUserProfile(userData.uid).then(profile => {
        setCurrentUser({ ...userData, ...profile });
        setLoading(false);
      });
    } else {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Fetch additional user data from Firestore
          const userProfile = await getUserProfile(user.uid);
          setCurrentUser({ ...user, ...userProfile });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });

      return unsubscribe;
    }
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    signup,
    signin,
    signInWithGoogle,
    signInWithKakao,
    signInWithNaver,
    logout,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
