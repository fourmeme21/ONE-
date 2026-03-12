'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithRedirect, GoogleAuthProvider, getRedirectResult, onAuthStateChanged } from 'firebase/auth';

export default function LoginButton() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) setUser(result.user);
      })
      .catch((error) => console.error("Redirect error:", error))
      .finally(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        });
        return () => unsubscribe();
      });
  }, []);

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
  };

  if (loading) return (
    <div style={{ color: '#00D9FF', padding: '12px', textAlign: 'center' }}>⏳ Yükleniyor...</div>
  );

  if (user) return (
    <div style={{ padding: '16px', backgroundColor: '#0a0a0a', borderRadius: '12px', border: '1px solid #00D9FF', textAlign: 'center' }}>
      <p style={{ color: '#00D9FF', fontWeight: 'bold', marginBottom: '8px' }}>👋 {user.displayName}</p>
      <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px' }}>{user.email}</p>
      <button
        onClick={() => auth.signOut().then(() => setUser(null))}
        style={{ backgroundColor: '#FF006E', color: '#fff', padding: '8px 20px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
      >
        Çıkış Yap
      </button>
    </div>
  );

  return (
    <button
      onClick={handleLogin}
      style={{ backgroundColor: '#00D9FF', color: '#000', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer', width: '100%' }}
    >
      🔑 Google ile Giriş Yap
    </button>
  );
}

