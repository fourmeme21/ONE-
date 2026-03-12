'use client';

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/auth";

export default function LoginButton() {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Giriş başarılı:", result.user.displayName);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

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
