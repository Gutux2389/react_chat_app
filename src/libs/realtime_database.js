// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
import {getDatabase} from 'firebase/database';
import {getStorage} from 'firebase/storage';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBl0-TlirfLL6Hnpg10690ot-wEoUzuHdE",
  authDomain: "fakechat-d62f2.firebaseapp.com",
  databaseURL: "https://fakechat-d62f2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fakechat-d62f2",
  storageBucket: "fakechat-d62f2.appspot.com",
  messagingSenderId: "312015964941",
  appId: "1:312015964941:web:faef6d8d9aa1eee67d3e44"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getDatabase(app);
export const storage = getStorage(app);