// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmw_3M5bCUDZFJr-31NVrQR38HK_bKWfs",
  authDomain: "wtb-tourism-a6c1d.firebaseapp.com",
  projectId: "wtb-tourism-a6c1d",
  storageBucket: "wtb-tourism-a6c1d.firebasestorage.app",
  messagingSenderId: "1070600261414",
  appId: "1:1070600261414:web:64bf877abdb7c776613be7",
  measurementId: "G-TYNWLFLKD1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export app if needed later
export { app };
