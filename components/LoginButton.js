'use client';

import { useEffect, useState } from 'react';
import { signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../lib/auth";

export default function LoginButton() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Önce redirect sonucunu bekle
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          setLoading(false);
          return;
        }
        // Redirect yoksa auth state'e bak
        const unsubscribe = onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
          unsubscribe();
        });
      })
      .catch((err) => {
        setError(err.code);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ color: '#00D9FF', padding: '12px', textAlign: 'center' }}>
      ⏳ Kontrol ediliyor...
    </div>
  );

  if (user) return (
    <div style={{ padding: '16px', backgroundColor: '#0a0a0a', borderRadius: '12px', border: '1px solid #00D9FF', textAlign: 'center' }}>
      <p style={{ color: '#00D9FF', fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
        👋 {user.displayName}
      </p>
      <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px' }}>{user.email}</p>
      <button
        onClick={() => signOut(auth).then(() => setUser(null))}
        style={{ backgroundColor: '#FF006E', color: '#fff', padding: '8px 20px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
      >
        Çıkış Yap
      </button>
    </div>
  );

  return (
    <div>
      {error && <p style={{ color: 'red', fontSize: '12px', marginBottom: '8px' }}>HATA: {error}</p>}
      <button
        onClick={() => signInWithRedirect(auth, googleProvider)}
        style={{ backgroundColor: '#00D9FF', color: '#000', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer', width: '100%' }}
      >
        🔑 Google ile Giriş Yap
      </button>
    </div>
  );
}

