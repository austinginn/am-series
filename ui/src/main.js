import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getStorage }  from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD5gmcsMbchCVny2MqaNKq_tOvMjzXGBlY",
    authDomain: "am-series.firebaseapp.com",
    projectId: "am-series",
    storageBucket: "am-series.appspot.com",
    messagingSenderId: "409527088294",
    appId: "1:409527088294:web:a866033943645f473cf067"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

createApp(App).use(router).mount('#app')
