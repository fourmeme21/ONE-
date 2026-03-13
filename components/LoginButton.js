'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Supabase istemcini buraya import ediyoruz

export default function LoginButton() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Mevcut oturumu kontrol et
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    // Oturum değişikliklerini dinle (Giriş/Çıkış yapıldığında otomatik güncellenir)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // Giriş sonrası ana sayfaya döner
      },
    });
    if (error) console.error("Giriş hatası:", error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return (
    <div style={{ color: '#00D9FF', padding: '12px', textAlign: 'center' }}>⏳ Yükleniyor...</div>
  );

  if (user) return (
    <div style={{ padding: '16px', backgroundColor: '#0a0a0a', borderRadius: '12px', border: '1px solid #00D9FF', textAlign: 'center' }}>
      <p style={{ color: '#00D9FF', fontWeight: 'bold', marginBottom: '8px' }}>👋 {user.user_metadata?.full_name || 'Kullanıcı'}</p>
      <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px' }}>{user.email}</p>
      <button
        onClick={handleLogout}
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
