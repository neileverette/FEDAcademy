import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
const AppContext = createContext();

// Custom hook to use the context
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// Provider component
export const AppProvider = ({ children }) => {
    const [allTasks, setAllTasks] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '', show: false });
    const [loading, setLoading] = useState(false);

    // Fetch all tasks from server
    const refreshTasks = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/tasks');
            setAllTasks(response.data);
        } catch (error) {
            showNotification('Failed to load tasks.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        refreshTasks();
    }, []);

    // Show notification helper
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, show: true });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    };

    // Toggle task completion
    const toggleTaskCompletion = async (task, done) => {
        try {
            const updatedTask = {
                ...task,
                done: done,
                doneDate: done ? new Date().toISOString() : null
            };
            
            await axios.put(`http://localhost:8080/api/tasks/task`, updatedTask);
            showNotification(`Task marked as ${done ? '' : 'un'}completed!`, 'success');
            
            // Update local state
            setAllTasks(prevTasks => 
                prevTasks.map(t => t.id === task.id ? updatedTask : t)
            );
        } catch (error) {
            showNotification('Failed to update task.', 'error');
        }
    };

    // Update a single task
    const updateTask = async (task) => {
        try {
            if (task.id) {
                await axios.put(`http://localhost:8080/api/tasks/task`, task);
                showNotification('Task Updated Successfully!', 'success');
                
                // Update local state
                setAllTasks(prevTasks => 
                    prevTasks.map(t => t.id === task.id ? task : t)
                );
            } else {
                const response = await axios.post('http://localhost:8080/api/tasks/new', task);
                showNotification('Task Created Successfully!', 'success');
                
                // Add new task to local state
                setAllTasks(prevTasks => [...prevTasks, response.data]);
            }
        } catch (error) {
            showNotification('Failed to save task.', 'error');
        }
    };

    // Batch update tasks (for select actions)
    const batchUpdateTasks = async (selectedTaskIds, updates) => {
        try {
            const updateData = selectedTaskIds.map(taskId => {
                const task = allTasks.find(t => t.id === taskId);
                return task ? { ...task, ...updates } : null;
            }).filter(task => task !== null);

            await Promise.all(updateData.map(task =>
                axios.put(`http://localhost:8080/api/tasks/task`, task)
            ));

            // Update local state
            setAllTasks(prevTasks =>
                prevTasks.map(task =>
                    selectedTaskIds.includes(task.id)
                        ? { ...task, ...updates }
                        : task
                )
            );

            return true; // Success
        } catch (error) {
            showNotification('Failed to update tasks.', 'error');
            return false; // Failure
        }
    };

    // Delete tasks
    const deleteTasks = async (selectedTaskIds) => {
        try {
            await Promise.all(selectedTaskIds.map(taskId =>
                axios.delete(`http://localhost:8080/api/tasks`, { data: { id: taskId } })
            ));

            // Remove from local state
            setAllTasks(prevTasks =>
                prevTasks.filter(task => !selectedTaskIds.includes(task.id))
            );

            return true; // Success
        } catch (error) {
            showNotification('Failed to delete tasks.', 'error');
            return false; // Failure
        }
    };

    // Computed values for different views
    const tasks = allTasks.filter(task => !task.archive);
    const archivedTasks = allTasks.filter(task => task.archive);
    const portfolioTasks = allTasks.filter(task => task.portfolio);

    // Context value
    const value = {
        // Data
        allTasks,
        tasks,
        archivedTasks,
        portfolioTasks,
        loading,
        notification,

        // Actions
        refreshTasks,
        updateTask,
        toggleTaskCompletion,
        batchUpdateTasks,
        deleteTasks,
        showNotification
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};