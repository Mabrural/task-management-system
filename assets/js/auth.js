// assets/js/auth.js
// ============================================
// FILE: auth.js
// FUNGSI: Menangani semua operasi authentication
// ANALOGI LARAVEL: Seperti AuthController + middleware auth
// ============================================

import { auth } from './firebase.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { showNotification, redirectTo } from './utils.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.initAuthListener();
    }

    // ============================================
    // Listener Status Authentication
    // Analogi: Middleware auth di Laravel
    // ============================================
    initAuthListener() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User sedang login
                this.currentUser = user;
                console.log('User logged in:', user.email);
                
                // Simpan status login ke localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', user.uid);
                localStorage.setItem('userEmail', user.email);
                
                // Redirect ke dashboard jika di halaman auth
                if (window.location.pathname.includes('login.html') || 
                    window.location.pathname.includes('register.html') ||
                    window.location.pathname === '/' ||
                    window.location.pathname.includes('index.html')) {
                    redirectTo('dashboard.html');
                }
            } else {
                // User logout
                this.currentUser = null;
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userId');
                localStorage.removeItem('userEmail');
                
                // Redirect ke login jika di halaman yang memerlukan auth
                const protectedPages = ['dashboard.html', 'tasks.html'];
                const currentPage = window.location.pathname.split('/').pop();
                
                if (protectedPages.includes(currentPage)) {
                    redirectTo('login.html');
                }
            }
        });
    }

    // ============================================
    // Register User
    // Analogi: POST /register di AuthController
    // ============================================
    async register(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            showNotification('Registrasi berhasil! Silakan login.', 'success');
            redirectTo('login.html');
            return userCredential.user;
        } catch (error) {
            console.error('Register error:', error);
            
            // Handle error messages (Bahasa Indonesia)
            let errorMessage = 'Registrasi gagal!';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email sudah terdaftar!';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Format email tidak valid!';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password minimal 6 karakter!';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            showNotification(errorMessage, 'error');
            throw error;
        }
    }

    // ============================================
    // Login User
    // Analogi: POST /login di AuthController
    // ============================================
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            showNotification('Login berhasil!', 'success');
            redirectTo('dashboard.html');
            return userCredential.user;
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Login gagal!';
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'User tidak ditemukan!';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Password salah!';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Format email tidak valid!';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Email atau password salah!';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            showNotification(errorMessage, 'error');
            throw error;
        }
    }

    // ============================================
    // Logout User
    // Analogi: POST /logout di AuthController
    // ============================================
    async logout() {
        try {
            await signOut(auth);
            localStorage.clear();
            showNotification('Logout berhasil!', 'success');
            redirectTo('login.html');
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('Logout gagal!', 'error');
        }
    }

    // ============================================
    // Get Current User
    // Analogi: Auth::user() di Laravel
    // ============================================
    getCurrentUser() {
        return this.currentUser || auth.currentUser;
    }

    // ============================================
    // Check if user is authenticated
    // Analogi: Auth::check() di Laravel
    // ============================================
    isAuthenticated() {
        return this.currentUser !== null || auth.currentUser !== null;
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;