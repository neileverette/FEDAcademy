import React, { useState } from 'react';
import { Modal, Form, Button, Toast, ToastContainer } from 'react-bootstrap';
import TaskList from '../TaskList'; // Adjust path based on your file structure
import { useAppContext } from '../AppContext';

function Portfolio() {
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);

    // Get data and functions from context
    const { 
        portfolioTasks, 
        notification, 
        batchUpdateTasks, 
        showNotification 
    } = useAppContext();

    const handleTaskClick = (task) => {
        setShowTaskDialog(true);
        setCurrentTask(task);
    };

    // Define actions specific to Portfolio view
    const portfolioActions = [
        {
            label: "Remove from Portfolio",
            variant: "warning",
            handler: async (selectedTaskIds) => {
                const success = await batchUpdateTasks(selectedTaskIds, { portfolio: false });
                if (success) {
                    showNotification('Tasks removed from portfolio!', 'success');
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
                tasks={portfolioTasks}
                onTaskUpdate={null} // No completion toggle for portfolio tasks
                title="Portfolio"
                subtitle="Achievements you want to highlight."
                actions={portfolioActions}
                onTaskClick={handleTaskClick}
                showCreateButton={false} // No create button in portfolio
            />

            {/* Read-only Task Modal for portfolio tasks */}
            <Modal show={showTaskDialog} onHide={() => setShowTaskDialog(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>View Portfolio Task</Modal.Title>
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

export default Portfolio;