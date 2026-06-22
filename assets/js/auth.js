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
        this.authReady = false;
        this.initAuthListener();
    }

    // ============================================
    // Listener Status Authentication
    // ============================================
    initAuthListener() {
        onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed:', user ? user.email : 'No user');
            
            if (user) {
                // User sedang login
                this.currentUser = user;
                console.log('User logged in:', {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified
                });
                
                // Simpan status login ke localStorage
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userId', user.uid);
                localStorage.setItem('userEmail', user.email);
                
                // Redirect ke dashboard jika di halaman auth
                const currentPath = window.location.pathname;
                if (currentPath.includes('login.html') || 
                    currentPath.includes('register.html') ||
                    currentPath === '/' ||
                    currentPath.endsWith('index.html')) {
                    redirectTo('dashboard.html');
                }
            } else {
                // User logout
                this.currentUser = null;
                console.log('User logged out');
                
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
            
            this.authReady = true;
            
            // Trigger event untuk memberitahu bahwa auth sudah siap
            window.dispatchEvent(new CustomEvent('authReady', { 
                detail: { user: this.currentUser } 
            }));
        });
    }

    // ============================================
    // Tunggu sampai auth siap
    // ============================================
    async waitForAuth() {
        if (this.authReady) {
            return this.currentUser;
        }
        
        return new Promise((resolve) => {
            const checkAuth = () => {
                if (this.authReady) {
                    resolve(this.currentUser);
                } else {
                    setTimeout(checkAuth, 100);
                }
            };
            checkAuth();
        });
    }

    // ============================================
    // Register User
    // ============================================
    async register(email, password) {
        try {
            console.log('Attempting to register:', email);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Registration successful:', userCredential.user.uid);
            showNotification('Registrasi berhasil! Silakan login.', 'success');
            
            // Logout dulu setelah register agar user login manual
            await signOut(auth);
            
            setTimeout(() => {
                redirectTo('login.html');
            }, 1500);
            
            return userCredential.user;
        } catch (error) {
            console.error('Register error:', error);
            
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
                case 'auth/network-request-failed':
                    errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet!';
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
    // ============================================
    async login(email, password) {
        try {
            console.log('Attempting to login:', email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', {
                uid: userCredential.user.uid,
                email: userCredential.user.email
            });
            
            showNotification('Login berhasil!', 'success');
            
            // Update currentUser immediately
            this.currentUser = userCredential.user;
            
            // Redirect setelah delay singkat
            setTimeout(() => {
                redirectTo('dashboard.html');
            }, 1000);
            
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
                case 'auth/too-many-requests':
                    errorMessage = 'Terlalu banyak percobaan. Coba lagi nanti!';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet!';
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
    // ============================================
    async logout() {
        try {
            console.log('Logging out...');
            await signOut(auth);
            this.currentUser = null;
            localStorage.clear();
            showNotification('Logout berhasil!', 'success');
            
            setTimeout(() => {
                redirectTo('login.html');
            }, 1000);
        } catch (error) {
            console.error('Logout error:', error);
            showNotification('Logout gagal!', 'error');
        }
    }

    // ============================================
    // Get Current User (dengan fallback)
    // ============================================
    getCurrentUser() {
        // Coba dapatkan dari properti class
        if (this.currentUser) {
            console.log('Got user from class property:', this.currentUser.uid);
            return this.currentUser;
        }
        
        // Fallback ke Firebase auth instance
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            console.log('Got user from Firebase auth:', firebaseUser.uid);
            this.currentUser = firebaseUser;
            return firebaseUser;
        }
        
        // Fallback ke localStorage (untuk kasus refresh)
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        if (userId && userEmail) {
            console.log('Got user from localStorage:', userId);
            return {
                uid: userId,
                email: userEmail
            };
        }
        
        console.warn('No user found in any source');
        return null;
    }

    // ============================================
    // Check if user is authenticated
    // ============================================
    isAuthenticated() {
        const user = this.getCurrentUser();
        return user !== null;
    }
}

// Export singleton instance
const authService = new AuthService();
export default authService;

// Juga export untuk kemudahan akses
export { authService };