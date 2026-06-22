// assets/js/task.js
// ============================================
// FILE: task.js
// FUNGSI: CRUD operations untuk tasks collection
// VERSI: Tanpa composite index (untuk development)
// ============================================

import { db } from './firebase.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    getDoc,
    doc, 
    updateDoc, 
    deleteDoc,
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { showNotification } from './utils.js';

class TaskService {
    constructor() {
        this.collectionName = 'tasks';
        this.tasksRef = collection(db, this.collectionName);
    }

    // ============================================
    // CREATE TASK
    // ============================================
    async createTask(taskData) {
        try {
            // Validasi data
            if (!taskData.title || !taskData.title.trim()) {
                throw new Error('Judul task wajib diisi!');
            }

            if (!taskData.user_id) {
                throw new Error('User ID tidak valid!');
            }

            // Siapkan data task
            const task = {
                title: taskData.title.trim(),
                description: taskData.description ? taskData.description.trim() : '',
                status: taskData.status || 'Pending',
                priority: taskData.priority || 'Medium',
                user_id: taskData.user_id,
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            };

            console.log('Creating task:', task);

            // Insert ke Firestore
            const docRef = await addDoc(this.tasksRef, task);
            
            console.log('Task created with ID:', docRef.id);
            
            return {
                id: docRef.id,
                ...task
            };
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    // ============================================
    // READ ALL TASKS - VERSI TANPA COMPOSITE INDEX
    // ============================================
    async getTasks(userId, filters = {}) {
        try {
            console.log('getTasks called with userId:', userId);
            console.log('Filters:', filters);
            
            if (!userId) {
                console.error('No userId provided');
                return [];
            }

            // GUNAKAN QUERY SEDERHANA - HANYA WHERE USER_ID
            // Untuk menghindari composite index
            const q = query(
                this.tasksRef,
                where('user_id', '==', userId)
                // Tidak pakai orderBy dulu
            );

            console.log('Executing query...');
            
            // Eksekusi query
            const querySnapshot = await getDocs(q);
            
            console.log('Documents found:', querySnapshot.size);
            
            // Map hasil query ke array
            let tasks = [];
            querySnapshot.forEach((doc) => {
                tasks.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Lakukan filter dan sorting di client-side (JavaScript)
            // Ini menghindari kebutuhan composite index
            
            // Filter by status
            if (filters.status && filters.status !== 'All') {
                console.log('Filtering by status:', filters.status);
                tasks = tasks.filter(task => task.status === filters.status);
            }

            // Filter by priority
            if (filters.priority) {
                console.log('Filtering by priority:', filters.priority);
                tasks = tasks.filter(task => task.priority === filters.priority);
            }

            // Sort by created_at
            console.log('Sorting by:', filters.sortBy || 'newest');
            tasks.sort((a, b) => {
                const timeA = a.created_at?.toDate?.() || new Date(a.created_at);
                const timeB = b.created_at?.toDate?.() || new Date(b.created_at);
                
                if (filters.sortBy === 'oldest') {
                    return timeA - timeB;
                } else {
                    // Default: terbaru dulu
                    return timeB - timeA;
                }
            });

            console.log('Tasks after filter/sort:', tasks.length);
            
            return tasks;
        } catch (error) {
            console.error('Error getting tasks:', error);
            
            // Jika error tentang index, beri pesan yang lebih jelas
            if (error.message && error.message.includes('index')) {
                console.warn('PERHATIAN: Firestore membutuhkan composite index.');
                console.warn('Silakan buka link yang diberikan di error untuk membuat index.');
                console.warn('Atau gunakan versi kode ini yang melakukan filter di client-side.');
            }
            
            throw error;
        }
    }

    // ============================================
    // READ SINGLE TASK
    // ============================================
    async getTaskById(taskId) {
        try {
            if (!taskId) {
                throw new Error('Task ID tidak valid!');
            }

            console.log('Getting task by ID:', taskId);
            
            const docRef = doc(db, this.collectionName, taskId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                console.log('Task found:', docSnap.data());
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            } else {
                throw new Error('Task tidak ditemukan!');
            }
        } catch (error) {
            console.error('Error getting task:', error);
            throw error;
        }
    }

    // ============================================
    // UPDATE TASK
    // ============================================
    async updateTask(taskId, updateData) {
        try {
            if (!taskId) {
                throw new Error('Task ID tidak valid!');
            }

            console.log('Updating task:', taskId, updateData);
            
            const docRef = doc(db, this.collectionName, taskId);
            
            const data = {
                ...updateData,
                updated_at: serverTimestamp()
            };

            await updateDoc(docRef, data);
            
            console.log('Task updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    // ============================================
    // DELETE TASK
    // ============================================
    async deleteTask(taskId) {
        try {
            if (!taskId) {
                throw new Error('Task ID tidak valid!');
            }

            console.log('Deleting task:', taskId);
            
            const docRef = doc(db, this.collectionName, taskId);
            await deleteDoc(docRef);
            
            console.log('Task deleted successfully');
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    // ============================================
    // GET TASK STATISTICS
    // ============================================
    async getTaskStatistics(userId) {
        try {
            console.log('Getting statistics for user:', userId);
            
            if (!userId) {
                return {
                    total: 0,
                    pending: 0,
                    inProgress: 0,
                    completed: 0
                };
            }

            // Get all tasks untuk user ini
            const tasks = await this.getTasks(userId);
            
            // Hitung statistik
            const statistics = {
                total: tasks.length,
                pending: tasks.filter(t => t.status === 'Pending').length,
                inProgress: tasks.filter(t => t.status === 'In Progress').length,
                completed: tasks.filter(t => t.status === 'Completed').length
            };
            
            console.log('Statistics:', statistics);
            
            return statistics;
        } catch (error) {
            console.error('Error getting statistics:', error);
            return {
                total: 0,
                pending: 0,
                inProgress: 0,
                completed: 0
            };
        }
    }

    // ============================================
    // SEARCH TASKS (Client-side)
    // ============================================
    searchTasks(tasks, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return tasks;
        }
        
        const term = searchTerm.toLowerCase().trim();
        
        return tasks.filter(task => {
            return (
                (task.title && task.title.toLowerCase().includes(term)) ||
                (task.description && task.description.toLowerCase().includes(term))
            );
        });
    }
}

// Export singleton instance
const taskService = new TaskService();
export default taskService;