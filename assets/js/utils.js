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
    window.location.href = page;
}

// ============================================
// Format tanggal ke format yang readable
// Analogi: Carbon::parse()->format() di Laravel
// ============================================
export function formatDate(timestamp) {
    if (!timestamp) return '-';
    
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
}

// ============================================
// Format tanggal relatif (contoh: "2 jam yang lalu")
// ============================================
export function timeAgo(timestamp) {
    if (!timestamp) return '-';
    
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
}

// ============================================
// Generate unique ID
// Analogi: Str::uuid() di Laravel
// ============================================
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================
// Show notification (toast)
// Analogi: session()->flash() di Laravel
// ============================================
export function showNotification(message, type = 'info') {
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
        `;
        document.body.appendChild(container);
    }
    
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background: ${type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : type === 'warning' ? '#F59E0B' : '#2563EB'};
        color: white;
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
        min-width: 300px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;
    
    // Icon berdasarkan tipe
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <span style="margin-right: 10px;">${icons[type] || icons.info}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
            margin-left: 10px;
        ">×</button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove setelah 5 detik
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ============================================
// Escape HTML untuk mencegah XSS
// Analogi: htmlspecialchars() di PHP / Blade {{ }}
// ============================================
export function escapeHtml(text) {
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