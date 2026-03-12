import { GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";

export { auth };
export const googleProvider = new GoogleAuthProvider();
