'use client';

import { useEffect, useState } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../lib/auth";

export default function LoginButton() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (e) {
      setError(e.code + ": " + e.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) return (
    <div style={{ color: '#00D9FF', padding: '12px' }}>Yükleniyor...</div>
  );

  if (user) return (
    <div style={{ padding: '12px', backgroundColor: '#0a0a0a', borderRadius: '12px', border: '1px solid #00D9FF' }}>
      <p style={{ color: '#00D9FF', fontWeight: 'bold', marginBottom: '8px' }}>👋 {user.displayName}</p>
      <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>{user.email}</p>
      <button onClick={handleSignOut} style={{ backgroundColor: '#FF006E', color: '#fff', padding: '8px 20px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
        Çıkış Yap
      </button>
    </div>
  );

  return (
    <div>
      {error && (
        <p style={{ color: 'red', fontSize: '12px', marginBottom: '8px', wordBreak: 'break-all' }}>
          HATA: {error}
        </p>
      )}
      <button onClick={handleLogin} style={{ backgroundColor: '#00D9FF', color: '#000', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer', width: '100%', marginBottom: '16px' }}>
        🔑 Google ile Giriş Yap
      </button>
    </div>
  );
}

