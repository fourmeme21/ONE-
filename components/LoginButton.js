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
    <button onClick={handleLogin}>
      Google ile Giriş Yap
    </button>
  );
}
