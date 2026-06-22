// assets/js/task.js
// ============================================
// FILE: task.js
// FUNGSI: CRUD operations untuk tasks collection
// ANALOGI LARAVEL: Seperti TaskController + Task Model
// COLLECTION = TABLE: 'tasks'
// DOCUMENT = ROW: Satu task
// FIELD = COLUMN: title, description, status, dll
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
    Timestamp,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { generateId } from './utils.js';

class TaskService {
    constructor() {
        // Nama collection di Firestore
        // Analogi: Nama table di database MySQL
        this.collectionName = 'tasks';
        
        // Reference ke collection
        // Analogi: DB::table('tasks') di Laravel
        this.tasksRef = collection(db, this.collectionName);
    }

    // ============================================
    // CREATE TASK
    // Analogi: Task::create($request->all())
    // ============================================
    async createTask(taskData) {
        try {
            // Validasi data
            if (!taskData.title || !taskData.title.trim()) {
                throw new Error('Judul task wajib diisi!');
            }

            // Siapkan data task
            // Analogi: Menyiapkan array $data sebelum insert
            const task = {
                title: taskData.title.trim(),
                description: taskData.description ? taskData.description.trim() : '',
                status: taskData.status || 'Pending',
                priority: taskData.priority || 'Medium',
                user_id: taskData.user_id, // Firebase UID
                created_at: serverTimestamp(), // Timestamp Firestore
                updated_at: serverTimestamp()
            };

            // Insert ke Firestore
            // Analogi: INSERT INTO tasks (fields) VALUES (values)
            const docRef = await addDoc(this.tasksRef, task);
            
            console.log('Task created with ID:', docRef.id);
            
            // Kembalikan data task dengan ID
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
    // READ ALL TASKS (dengan filter & sorting)
    // Analogi: Task::where()->orderBy()->get()
    // ============================================
    async getTasks(userId, filters = {}) {
        try {
            // Buat query dasar
            // Analogi: DB::table('tasks')->where('user_id', $userId)
            let tasksQuery = query(
                this.tasksRef,
                where('user_id', '==', userId)
            );

            // Filter berdasarkan status (jika ada)
            // Analogi: ->where('status', $status)
            if (filters.status && filters.status !== 'All') {
                tasksQuery = query(
                    tasksQuery,
                    where('status', '==', filters.status)
                );
            }

            // Filter berdasarkan priority (jika ada)
            // Analogi: ->where('priority', $priority)
            if (filters.priority) {
                tasksQuery = query(
                    tasksQuery,
                    where('priority', '==', filters.priority)
                );
            }

            // Sorting berdasarkan created_at
            // Analogi: ->orderBy('created_at', 'desc')
            if (filters.sortBy === 'oldest') {
                tasksQuery = query(tasksQuery, orderBy('created_at', 'asc'));
            } else {
                // Default: terbaru dulu
                tasksQuery = query(tasksQuery, orderBy('created_at', 'desc'));
            }

            // Eksekusi query
            // Analogi: ->get() di Laravel
            const querySnapshot = await getDocs(tasksQuery);
            
            // Map hasil query ke array
            // Analogi: Mengubah Collection menjadi Array
            const tasks = [];
            querySnapshot.forEach((doc) => {
                tasks.push({
                    id: doc.id, // Document ID = Primary Key
                    ...doc.data() // Data fields
                });
            });

            return tasks;
        } catch (error) {
            console.error('Error getting tasks:', error);
            throw error;
        }
    }

    // ============================================
    // READ SINGLE TASK
    // Analogi: Task::find($id)
    // ============================================
    async getTaskById(taskId) {
        try {
            // Reference ke document spesifik
            // Analogi: DB::table('tasks')->where('id', $taskId)->first()
            const docRef = doc(db, this.collectionName, taskId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
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
    // Analogi: Task::find($id)->update($data)
    // ============================================
    async updateTask(taskId, updateData) {
        try {
            // Reference ke document yang akan diupdate
            const docRef = doc(db, this.collectionName, taskId);
            
            // Siapkan data update
            const data = {
                ...updateData,
                updated_at: serverTimestamp() // Update timestamp
            };

            // Update document
            // Analogi: UPDATE tasks SET field=value WHERE id=$id
            await updateDoc(docRef, data);
            
            console.log('Task updated:', taskId);
            return true;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    // ============================================
    // DELETE TASK
    // Analogi: Task::find($id)->delete()
    // ============================================
    async deleteTask(taskId) {
        try {
            // Reference ke document yang akan dihapus
            const docRef = doc(db, this.collectionName, taskId);
            
            // Hapus document
            // Analogi: DELETE FROM tasks WHERE id=$id
            await deleteDoc(docRef);
            
            console.log('Task deleted:', taskId);
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    // ============================================
    // GET TASK STATISTICS
    // Mengambil statistik untuk dashboard
    // ============================================
    async getTaskStatistics(userId) {
        try {
            // Get all tasks untuk user ini
            const tasks = await this.getTasks(userId);
            
            // Hitung statistik
            const statistics = {
                total: tasks.length,
                pending: tasks.filter(t => t.status === 'Pending').length,
                inProgress: tasks.filter(t => t.status === 'In Progress').length,
                completed: tasks.filter(t => t.status === 'Completed').length
            };
            
            return statistics;
        } catch (error) {
            console.error('Error getting statistics:', error);
            throw error;
        }
    }

    // ============================================
    // SEARCH TASKS (Client-side)
    // Karena Firestore tidak support full-text search native
    // ============================================
    searchTasks(tasks, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return tasks;
        }
        
        const term = searchTerm.toLowerCase().trim();
        
        return tasks.filter(task => {
            return (
                task.title.toLowerCase().includes(term) ||
                task.description.toLowerCase().includes(term)
            );
        });
    }
}

// Export singleton instance
const taskService = new TaskService();
export default taskService;