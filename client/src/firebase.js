
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC26uGxKqxoTMK4ZPOnTi4XS6FMHWct0c8",
    authDomain: "plaid-test-b0d36.firebaseapp.com",
    projectId: "plaid-test-b0d36",
    storageBucket: "plaid-test-b0d36.appspot.com",
    messagingSenderId: "626616938728",
    appId: "1:626616938728:web:5eb0518b96f714bdfa595d",
    measurementId: "G-JMF6N7EZN3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// accountsRef holds user account data
export const accountsRef = collection(db, 'accountsRef');