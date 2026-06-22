// assets/js/firebase.js
// ============================================
// FILE: firebase.js
// FUNGSI: Inisialisasi dan konfigurasi Firebase
// ANALOGI LARAVEL: Seperti .env + config/database.php + service provider
// ============================================

// Import Firebase modules (ES6 Modules)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Konfigurasi Firebase - GANTI DENGAN KONFIGURASI ANDA
const firebaseConfig = {
    apiKey: "AIzaSyDOZ3JVIBdAS6rUdB9gwciQfoLQbX00pNo",
    authDomain: "task-management-system-2f0a7.firebaseapp.com",
    projectId: "task-management-system-2f0a7",
    storageBucket: "task-management-system-2f0a7.firebasestorage.app",
    messagingSenderId: "250515963161",
    appId: "1:250515963161:web:dac0f79745d0dc4baf1988"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Firestore (Database)
const db = getFirestore(app);

// Inisialisasi Authentication
const auth = getAuth(app);

// Export untuk digunakan di file lain
export { app, db, auth };

// Export default untuk kemudahan akses
export default { app, db, auth };