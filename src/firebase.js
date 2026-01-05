// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_BIz6ZgGdTt-E7TVXvdP3p5UmFZ_wlzI",
  authDomain: "wtb-tourism-a8017.firebaseapp.com",
  projectId: "wtb-tourism-a8017",
  storageBucket: "wtb-tourism-a8017.firebasestorage.app",
  messagingSenderId: "1069062283622",
  appId: "1:1069062283622:web:b543482ee2eee4ce6da8a7",
  measurementId: "G-MD4VVCZCJ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };