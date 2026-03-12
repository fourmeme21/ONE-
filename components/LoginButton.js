'use client';

import { useEffect, useState } from 'react';
import { signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/auth";

export default function LoginButton() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(auth).then((result) => {
      if (result?.user) setUser(result.user);
      setLoading(false);
    }).catch(() => setLoading(false));

    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    signInWithRedirect(auth, googleProvider);
  };

  const handleLogout = () => {
    signOut(auth).then(() => setUser(null));
  };

  if (loading) return null;

  if (user) return (
    <div style={{ textAlign: 'center', padding: '12px' }}>
      <p style={{ color: '#00D9FF', fontWeight: 'bold', marginBottom: '8px' }}>
        👋 {user.displayName}
      </p>
      <button onClick={handleLogout} style={{ backgroundColor: '#FF006E', color: '#fff', padding: '8px 20px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
        Çıkış Yap
      </button>
    </div>
  );

  return (
    <button
      onClick={handleLogin}
      style={{
        backgroundColor: '#00D9FF',
        color: '#000',
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: '16px',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        marginBottom: '16px'
      }}
    >
      🔑 Google ile Giriş Yap
    </button>
  );
}
