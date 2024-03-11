// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBx1Iu6rr6F5suhcT9dW_9jTuqL9ro4XE4",
  authDomain: "fakechat-users.firebaseapp.com",
  projectId: "fakechat-users",
  storageBucket: "fakechat-users.appspot.com",
  messagingSenderId: "1091789915587",
  appId: "1:1091789915587:web:fbf6747c050944173a2976"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig,'usersFirestore');
export const db = getFirestore(app);