import React, { useState } from 'react';
import { Modal, Form, Button, Toast, ToastContainer } from 'react-bootstrap';
import TaskList from '../../components/TaskList';
import { useAppContext } from '../../components/AppContext';

function Tasks() {
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);

    // Get data and functions from context
    const { 
        tasks, 
        notification, 
        updateTask, 
        toggleTaskCompletion, 
        batchUpdateTasks, 
        deleteTasks, 
        showNotification 
    } = useAppContext();

    const handleTaskClick = (task) => {
        setShowTaskDialog(true);
        setCurrentTask(task);
    };

    const handleCreateTask = () => {
        setShowTaskDialog(true);
        setCurrentTask(null);
    };

    const handleTaskSubmit = async (task) => {
        await updateTask(task);
        setShowTaskDialog(false);
        setCurrentTask(null);
    };

    // Define actions specific to Tasks view
    const taskActions = [
        {
            label: "Use in Portfolio",
            variant: "success",
            handler: async (selectedTaskIds) => {
                const success = await batchUpdateTasks(selectedTaskIds, { portfolio: true });
                if (success) {
                    showNotification('Tasks added to portfolio!', 'success');
                }
            }
        },
        {
            label: "Archive", 
            variant: "warning",
            handler: async (selectedTaskIds) => {
                const success = await batchUpdateTasks(selectedTaskIds, { archive: true });
                if (success) {
                    showNotification('Tasks archived!', 'success');
                }
            }
        },
        {
            label: "Delete",
            variant: "danger", 
            handler: async (selectedTaskIds) => {
                if (window.confirm('Are you sure you want to delete these tasks?')) {
                    const success = await deleteTasks(selectedTaskIds);
                    if (success) {
                        showNotification('Tasks deleted!', 'success');
                    }
                }
            }
        }
    ];

    return (
        <div>
            <ToastContainer position="top-end" className="p-3">
                {notification.show && (
                    <Toast 
                        bg={notification.type === 'success' ? 'success' : 'danger'} 
                        onClose={() => showNotification('', 'success', false)} 
                        delay={3000} 
                        autohide
                    >
                        <Toast.Body>{notification.message}</Toast.Body>
                    </Toast>
                )}
            </ToastContainer>

            <TaskList 
                tasks={tasks}
                onTaskUpdate={toggleTaskCompletion}
                actions={taskActions}
                onTaskClick={handleTaskClick}
                showCreateButton={true}
                onCreateTask={handleCreateTask}
            />

            {/* Task Modal */}
            <Modal show={showTaskDialog} onHide={() => setShowTaskDialog(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentTask ? 'Edit Task' : 'Create Task'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="taskTitle" className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control 
                                type="text" 
                                defaultValue={currentTask ? currentTask.title : ''} 
                            />
                        </Form.Group>
                        <Form.Group controlId="taskDescription" className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                defaultValue={currentTask ? currentTask.description : ''} 
                            />
                        </Form.Group>
                        <Form.Group controlId="taskDueDate" className="mb-3">
                            <Form.Label>Due Date</Form.Label>
                            <Form.Control 
                                type="date" 
                                defaultValue={currentTask ? currentTask.dueDate : ''} 
                            />
                        </Form.Group>
                        <Form.Group controlId="taskNotes" className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                defaultValue={currentTask ? currentTask.notes : ''} 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTaskDialog(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => handleTaskSubmit({
                            ...currentTask,
                            id: currentTask ? currentTask.id : null,
                            title: document.getElementById('taskTitle').value,
                            description: document.getElementById('taskDescription').value,
                            dueDate: document.getElementById('taskDueDate').value,
                            notes: document.getElementById('taskNotes').value,
                        })}
                    >
                        {currentTask ? 'Save Changes' : 'Create Task'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Tasks;