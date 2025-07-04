import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Form, Toast, ToastContainer, InputGroup, FormControl } from 'react-bootstrap';
import axios from 'axios';
import AppCard from '../AppCard'; // Import the shared AppCard component

function Archive() {
    const [tasks, setTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '', show: false });

    const refreshTasks = () =>
        axios.get('http://localhost:8080/api/tasks')
            .then(response => setTasks(response.data.filter(task => task.archive))) // Filter for archived tasks
            .catch(error => showNotification('Failed to load archived tasks.', 'error'));

    useEffect(() => {
        refreshTasks();
    }, []);

    const toggleSelectTask = (taskId) => {
        setSelectedTasks(prevSelectedTasks =>
            prevSelectedTasks.includes(taskId)
                ? prevSelectedTasks.filter(id => id !== taskId)
                : [...prevSelectedTasks, taskId]
        );
    };

    // Archive-specific actions: Restore and Delete
    const updateSelectedTasks = (action) => {
        if (selectedTasks.length === 0) return;

        const updateData = selectedTasks.map(taskId => {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return null;

            switch (action) {
                case 'restore':
                    return { ...task, archive: false }; // Restore from archive
                case 'portfolio':
                    return { ...task, portfolio: true }; // Add to portfolio
                case 'delete':
                    return { id: taskId }; // Delete permanently
                default:
                    return null;
            }
        }).filter(task => task !== null);

        if (action === 'delete') {
            Promise.all(updateData.map(task => axios.delete(`http://localhost:8080/api/tasks`, task)))
                .then(() => {
                    showNotification('Selected tasks deleted permanently!', 'success');
                    setSelectMode(false);
                    setSelectedTasks([]);
                })
                .catch(error => showNotification('Failed to delete tasks.', 'error'))
                .finally(() => refreshTasks());
        } else {
            Promise.all(updateData.map(task =>
                axios.put(`http://localhost:8080/api/tasks/task`, task)
            ))
                .then(() => {
                    const actionText = action === 'restore' ? 'restored' : 'added to portfolio';
                    showNotification(`Selected tasks ${actionText}!`, 'success');
                    setSelectMode(false);
                    setSelectedTasks([]);
                })
                .catch(error => showNotification(`Failed to ${action} tasks.`, 'error'))
                .finally(() => refreshTasks());
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, show: true });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    };

    const handleTaskClick = (task) => {
        setShowTaskDialog(true);
        setCurrentTask(task);
    };

    const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div>
            <ToastContainer position="top-end" className="p-3">
                {notification.show && (
                    <Toast bg={notification.type === 'success' ? 'success' : 'danger'} onClose={() => setNotification({ ...notification, show: false })} delay={3000} autohide>
                        <Toast.Body>{notification.message}</Toast.Body>
                    </Toast>
                )}
            </ToastContainer>

            <h2>Archive</h2>
            <p>Tasks no longer active.</p>

            <Row className="app-controls">
                <Col className="col-auto">
                    <FormControl className="mb-4" placeholder="Search archived tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </Col>
                <Col>
                    <InputGroup className="mb-4">
                        {selectMode && selectedTasks.length > 0 && (
                            <>
                                <Button variant="success" onClick={() => updateSelectedTasks('portfolio')}>Use in Portfolio</Button>
                                <Button variant="info" onClick={() => updateSelectedTasks('restore')}>Restore</Button>
                                <Button variant="danger" onClick={() => updateSelectedTasks('delete')}>Delete</Button>
                            </>
                        )}
                        
                        <Button variant="secondary" onClick={() => setSelectMode(!selectMode)}>
                            {selectMode ? 'Cancel' : 'Select'}
                        </Button>
                    </InputGroup>
                </Col>
            </Row>

            <Row className="app-tasks">
                {filteredTasks.map(task => (
                    <Col sm={4} key={task.id} className="mb-3">
                        {/* REPLACED: Card component with AppCard */}
                        <AppCard
                            task={task}
                            selectMode={selectMode}
                            selectedTasks={selectedTasks}
                            showSelectCheckbox={true}
                            showCompletionCheckbox={false}
                            showPortfolioStar={true}
                            onCardClick={handleTaskClick}
                            onSelectToggle={toggleSelectTask}
                            onCompletionToggle={null}
                        />
                    </Col>
                ))}
            </Row>

            {/* Task Modal for viewing archived tasks (read-only) */}
            <Modal show={showTaskDialog} onHide={() => setShowTaskDialog(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>View Archived Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="taskTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" value={currentTask ? currentTask.title : ''} readOnly />
                        </Form.Group>
                        <Form.Group controlId="taskDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" value={currentTask ? currentTask.description : ''} readOnly />
                        </Form.Group>
                        <Form.Group controlId="taskDueDate">
                            <Form.Label>Due Date</Form.Label>
                            <Form.Control type="date" value={currentTask ? currentTask.dueDate : ''} readOnly />
                        </Form.Group>
                        <Form.Group controlId="taskNotes">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control as="textarea" value={currentTask ? currentTask.notes : ''} readOnly />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTaskDialog(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Archive;