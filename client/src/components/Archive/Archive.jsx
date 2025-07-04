import React, { useState } from 'react';
import { Modal, Form, Button, Toast, ToastContainer } from 'react-bootstrap';
import TaskList from '../TaskList'; // Adjust path based on your file structure
import { useAppContext } from '../AppContext';

function Archive() {
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);

    // Get data and functions from context
    const { 
        archivedTasks, 
        notification, 
        batchUpdateTasks, 
        deleteTasks, 
        showNotification 
    } = useAppContext();

    const handleTaskClick = (task) => {
        setShowTaskDialog(true);
        setCurrentTask(task);
    };

    // Define actions specific to Archive view
    const archiveActions = [
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
            label: "Restore",
            variant: "primary",
            handler: async (selectedTaskIds) => {
                const success = await batchUpdateTasks(selectedTaskIds, { archive: false });
                if (success) {
                    showNotification('Tasks restored!', 'success');
                }
            }
        },
        {
            label: "Delete",
            variant: "danger",
            handler: async (selectedTaskIds) => {
                if (window.confirm('Are you sure you want to permanently delete these tasks?')) {
                    const success = await deleteTasks(selectedTaskIds);
                    if (success) {
                        showNotification('Tasks deleted permanently!', 'success');
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
                tasks={archivedTasks}
                onTaskUpdate={null} // No completion toggle for archived tasks
                title="Archive"
                subtitle="Tasks no longer active."
                actions={archiveActions}
                onTaskClick={handleTaskClick}
                showCreateButton={false} // No create button in archive
            />

            {/* Read-only Task Modal for archived tasks */}
            <Modal show={showTaskDialog} onHide={() => setShowTaskDialog(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>View Archived Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="taskTitle" className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={currentTask ? currentTask.title : ''} 
                                readOnly 
                            />
                        </Form.Group>
                        <Form.Group controlId="taskDescription" className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                value={currentTask ? currentTask.description : ''} 
                                readOnly 
                            />
                        </Form.Group>
                        <Form.Group controlId="taskDueDate" className="mb-3">
                            <Form.Label>Due Date</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={currentTask ? currentTask.dueDate : ''} 
                                readOnly 
                            />
                        </Form.Group>
                        <Form.Group controlId="taskNotes" className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                value={currentTask ? currentTask.notes : ''} 
                                readOnly 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTaskDialog(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Archive;