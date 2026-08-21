import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Expose both raw Firebase user fields and friendly properties expected by UI
        setUser({
          ...currentUser,
          uid: currentUser.uid,
          id: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Citizen',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Citizen',
          avatarUrl: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          memberSince: 'August 2026',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, displayName = '') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      });
      setUser({
        ...userCredential.user,
        uid: userCredential.user.uid,
        id: userCredential.user.uid,
        email: userCredential.user.email,
        name: displayName.trim(),
        displayName: displayName.trim(),
        avatarUrl: userCredential.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        memberSince: 'August 2026',
      });
    }
    return userCredential.user;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  // Seamless login or registration fallback for pre-configured institutional accounts
  const loginOrRegister = async (email, password, displayName = '') => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/invalid-login-credentials'
      ) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          if (displayName && userCredential.user) {
            await updateProfile(userCredential.user, { displayName: displayName.trim() });
          }
          return userCredential.user;
        } catch (signupErr) {
          throw err;
        }
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const getToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  };

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    signup,
    login,
    loginOrRegister,
    loginWithGoogle,
    logout,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
