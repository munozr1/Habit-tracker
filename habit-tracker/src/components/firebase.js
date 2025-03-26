import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "get_your_own_key",
  authDomain: "get_your_own_key",
  projectId: "get_your_own_key",
  storageBucket: "get_your_own_key",
  messagingSenderId: "get_your_own",
  appId: "  get_your_own",
  measurementId: "get_your_own"
}
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Important for Netlify
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, googleProvider };
export default app;