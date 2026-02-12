// Test Firebase connectivity
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBv3KBIP-T6Bhx_7dO0sfOGb9woqdpxp2Q",
  authDomain: "sidhealthcareapp.firebaseapp.com",
  projectId: "sidhealthcareapp",
  storageBucket: "sidhealthcareapp.firebasestorage.app",
  messagingSenderId: "506606835618",
  appId: "1:506606835618:web:d35690e459e8e7fbc6c4fb",
  databaseURL: "https://sidhealthcareapp-default-rtdb.firebaseio.com",
  measurementId: "G-K8RFJ5LZ5Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Test with a simple sign-in attempt
console.log('Testing Firebase connection...');
console.log('Firebase config:', firebaseConfig);

// This will help us see if it's a network or auth issue
signInWithEmailAndPassword(auth, 'test@example.com', 'test123456')
  .then(() => console.log('Auth service reachable'))
  .catch(error => {
    console.log('Auth error details:', error.code, error.message);
    if (error.code === 'auth/network-request-failed') {
      console.log('This is a network connectivity issue');
    }
  });
