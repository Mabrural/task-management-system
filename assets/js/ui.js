// assets/js/ui.js
// ============================================
// FILE: ui.js
// FUNGSI: Manipulasi tampilan (DOM)
// ANALOGI LARAVEL: Seperti Blade templates + Livewire
// ============================================

import { formatDate, escapeHtml } from './utils.js';

class UI {
    constructor() {
        this.taskTableBody = document.getElementById('taskTableBody');
        this.taskModal = document.getElementById('taskModal');
        this.confirmModal = document.getElementById('confirmModal');
    }

    // ============================================
    // RENDER TASK TABLE
    // Menampilkan data tasks dalam tabel
    // ============================================
    renderTaskTable(tasks) {
        if (!this.taskTableBody) {
            console.warn('Task table body not found');
            return;
        }

        if (tasks.length === 0) {
            this.taskTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 10px;">📝</div>
                        <h3>Tidak ada task</h3>
                        <p style="color: #666;">Buat task baru untuk memulai</p>
                    </td>
                </tr>
            `;
            return;
        }

        this.taskTableBody.innerHTML = tasks.map((task, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(task.title)}</strong></td>
                <td>${escapeHtml(task.description || '-')}</td>
                <td>${this.renderStatusBadge(task.status)}</td>
                <td>${this.renderPriorityBadge(task.priority)}</td>
                <td>${formatDate(task.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button 
                            class="btn btn-primary btn-sm" 
                            onclick="window.editTask('${task.id}')"
                            title="Edit"
                        >
                            ✏️
                        </button>
                        <button 
                            class="btn btn-danger btn-sm" 
                            onclick="window.deleteTask('${task.id}', '${escapeHtml(task.title)}')"
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // ============================================
    // RENDER STATUS BADGE
    // ============================================
    renderStatusBadge(status) {
        const badges = {
            'Pending': '#F59E0B',
            'In Progress': '#2563EB',
            'Completed': '#16A34A'
        };
        
        const color = badges[status] || '#6B7280';
        
        return `
            <span class="badge" style="
                background: ${color}20;
                color: ${color};
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid ${color}40;
            ">
                ${status}
            </span>
        `;
    }

    // ============================================
    // RENDER PRIORITY BADGE
    // ============================================
    renderPriorityBadge(priority) {
        const badges = {
            'Low': '#6B7280',
            'Medium': '#F59E0B',
            'High': '#DC2626'
        };
        
        const color = badges[priority] || '#6B7280';
        
        return `
            <span class="badge" style="
                background: ${color}20;
                color: ${color};
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid ${color}40;
            ">
                ${priority}
            </span>
        `;
    }

    // ============================================
    // RENDER DASHBOARD STATISTICS
    // ============================================
    renderDashboardStats(statistics) {
        const statsContainer = document.getElementById('dashboardStats');
        if (!statsContainer) return;

        const cards = [
            {
                label: 'Total Tasks',
                value: statistics.total,
                icon: '📊',
                color: '#2563EB'
            },
            {
                label: 'Pending',
                value: statistics.pending,
                icon: '⏳',
                color: '#F59E0B'
            },
            {
                label: 'In Progress',
                value: statistics.inProgress,
                icon: '🔄',
                color: '#2563EB'
            },
            {
                label: 'Completed',
                value: statistics.completed,
                icon: '✅',
                color: '#16A34A'
            }
        ];

        statsContainer.innerHTML = cards.map(card => `
            <div class="stat-card" style="
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                border-left: 4px solid ${card.color};
            ">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 14px; color: #666; margin-bottom: 5px;">
                            ${card.label}
                        </div>
                        <div style="font-size: 32px; font-weight: 700;">
                            ${card.value}
                        </div>
                    </div>
                    <div style="font-size: 36px; opacity: 0.3;">
                        ${card.icon}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ============================================
    // SHOW MODAL (Create/Edit)
    // ============================================
    showTaskModal(task = null) {
        const modal = document.getElementById('taskModal');
        if (!modal) return;

        const modalTitle = document.getElementById('modalTitle');
        const taskForm = document.getElementById('taskForm');
        const taskId = document.getElementById('taskId');

        if (task) {
            // Edit mode
            modalTitle.textContent = 'Edit Task';
            taskId.value = task.id;
            document.getElementById('title').value = task.title || '';
            document.getElementById('description').value = task.description || '';
            document.getElementById('status').value = task.status || 'Pending';
            document.getElementById('priority').value = task.priority || 'Medium';
        } else {
            // Create mode
            modalTitle.textContent = 'Tambah Task Baru';
            taskId.value = '';
            taskForm.reset();
        }

        modal.style.display = 'block';
    }

    // ============================================
    // HIDE MODAL
    // ============================================
    hideTaskModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ============================================
    // SHOW CONFIRM DELETE MODAL
    // ============================================
    showConfirmModal(taskId, taskTitle) {
        const modal = document.getElementById('confirmModal');
        const message = document.getElementById('confirmMessage');
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        
        if (modal && message && confirmBtn) {
            message.textContent = `Apakah Anda yakin ingin menghapus task "${taskTitle}"?`;
            confirmBtn.setAttribute('data-task-id', taskId);
            modal.style.display = 'block';
        }
    }

    // ============================================
    // HIDE CONFIRM MODAL
    // ============================================
    hideConfirmModal() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ============================================
    // UPDATE USER INFO DI SIDEBAR
    // ============================================
    updateUserInfo(email) {
        const userEmail = document.getElementById('userEmail');
        if (userEmail) {
            userEmail.textContent = email || 'User';
        }
    }
}

// Export singleton instance
const ui = new UI();
export default ui;