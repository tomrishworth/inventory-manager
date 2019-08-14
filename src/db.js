import * as firebase from 'firebase/app';

import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDHYNGVZ96FxdU5Ea9zVaUOprWNsjMqxas',
  authDomain: 'inventory-manager-99dea.firebaseapp.com',
  databaseURL: 'https://inventory-manager-99dea.firebaseio.com',
  projectId: 'inventory-manager-99dea',
  storageBucket: '',
  messagingSenderId: '685954992489',
  appId: '1:685954992489:web:e98c11058d98cc9b'
};

// Get a Firestore instance
export const db = firebase.initializeApp(firebaseConfig).firestore();

export const auth = firebase.auth();

export const provider = new firebase.auth.GoogleAuthProvider();
export const signInWithGoogle = () => auth.signInWithPopup(provider);
