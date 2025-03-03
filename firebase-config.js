// Import the functions you need from the SDKs you need
  import { initializeApp, getApps, getApp  } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALR4gcsmbDY492xPAKwRxDOTzyFPTYIME",
  authDomain: "shoretempleapp.firebaseapp.com",
  projectId: "shoretempleapp",
  storageBucket: "shoretempleapp.firebasestorage.app",
  messagingSenderId: "473036972586",
  appId: "1:473036972586:web:ffdca8dd4c5a8a53301953"
};

// Initialize Firebase only if not already initialized
const app = initializeApp(firebaseConfig);

export { app };