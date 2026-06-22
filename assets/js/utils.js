// assets/js/utils.js
// ============================================
// FILE: utils.js
// FUNGSI: Helper functions
// ANALOGI LARAVEL: Seperti helpers.php atau Utility class
// ============================================

// ============================================
// Redirect ke halaman lain
// ============================================
export function redirectTo(page) {
    console.log('Redirecting to:', page);
    window.location.href = page;
}

// ============================================
// Format tanggal ke format yang readable
// ============================================
export function formatDate(timestamp) {
    if (!timestamp) return '-';
    
    try {
        // Firebase Timestamp to Date object
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return date.toLocaleDateString('id-ID', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
}

// ============================================
// Format tanggal relatif
// ============================================
export function timeAgo(timestamp) {
    if (!timestamp) return '-';
    
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return interval + ' tahun yang lalu';
        
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + ' bulan yang lalu';
        
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + ' hari yang lalu';
        
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + ' jam yang lalu';
        
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + ' menit yang lalu';
        
        return 'Baru saja';
    } catch (error) {
        return '-';
    }
}

// ============================================
// Generate unique ID
// ============================================
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================
// Show notification (toast) - DIPERBAIKI
// ============================================
export function showNotification(message, type = 'info') {
    console.log(`Notification [${type}]:`, message);
    
    // Buat container notifikasi jika belum ada
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    
    const colors = {
        success: '#16A34A',
        error: '#DC2626',
        warning: '#F59E0B',
        info: '#2563EB'
    };
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const bgColor = colors[type] || colors.info;
    
    notification.style.cssText = `
        background: ${bgColor};
        color: white;
        padding: 16px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        line-height: 1.4;
        word-break: break-word;
    `;
    
    notification.innerHTML = `
        <span style="font-size: 18px; flex-shrink: 0;">${icons[type] || icons.info}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
            padding: 0 4px;
            flex-shrink: 0;
            opacity: 0.8;
            transition: opacity 0.2s;
        ">×</button>
    `;
    
    // Hover effect untuk close button
    const closeBtn = notification.querySelector('button');
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.opacity = '1';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.opacity = '0.8';
    });
    
    container.appendChild(notification);
    
    // Auto remove setelah 5 detik
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// ============================================
// Escape HTML untuk mencegah XSS
// ============================================
export function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Validasi email format
// ============================================
export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ============================================
// Debounce function untuk search
// ============================================
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// Debug logger - untuk development
// ============================================
export function debugLog(label, data) {
    const isDebug = localStorage.getItem('debug') === 'true';
    if (isDebug) {
        console.log(`[DEBUG] ${label}:`, data);
    }
}

// ============================================
// Get current user dengan multiple fallback
// ============================================
export function getCurrentUserFromStorage() {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    
    if (userId && userEmail) {
        return {
            uid: userId,
            email: userEmail
        };
    }
    
    return null;
}