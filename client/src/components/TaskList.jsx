import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Form, Toast, ToastContainer, InputGroup, FormControl } from 'react-bootstrap';
import axios from 'axios';
import AppCard from './AppCard'; // Import the generic AppCard component

// Task List Component with Select Mode
function TaskList({ 
    tasks, 
    onTaskUpdate,  
    title = 'Tasks',
    subtitle = 'Live tasks that you are still engaged with.',
    showCreateButton = true,
    onCreateTask = null,
    actions = []
}) {
//    const [tasks, setTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    // Add the notification state
    const [notification, setNotification] = useState({ message: '', type: '', show: false });

    const refreshTasks = () =>
        axios.get('http://localhost:8080/api/tasks')
            .then(response => setTasks(response.data.filter(task => !task.archive)))
            .catch(error => showNotification('Failed to load tasks.'), 'error');

 /*   useEffect(() => {
        refreshTasks();
    }, []); */

    // Handle task selection/deselection
    const toggleSelectTask = (taskId) => {
        setSelectedTasks(prevSelectedTasks =>
            prevSelectedTasks.includes(taskId)
                ? prevSelectedTasks.filter(id => id !== taskId)
                : [...prevSelectedTasks, taskId]
        );
    };

    const toggleTaskCompletion = (task, done) => {
        task.done = done;
        task.doneDate = { type: 'date', value: (new Date()).toISOString() };
        axios.put(`http://localhost:8080/api/tasks/task`, task)
            .then(response => showNotification(`Task marked as ${done ? '' : 'un'}completed!`, 'success'))
            .catch(error => showNotification('Failed to mark task as completed.', 'error'))
            .finally(() => refreshTasks());
    };

    const handleTaskSubmit = (task) => {
        if (task.id) {
            axios.put(`http://localhost:8080/api/tasks/task`, task)
                .then(response => showNotification('Task Updated Successfully!', 'success'))
                .catch(error => showNotification('Failed to update task.', 'error'))
                .finally(() => refreshTasks());
        } else {
            axios.post('http://localhost:8080/api/tasks/new', task)
                .then(response => showNotification('Task Created Successfully!', 'success'))
                .catch(error => showNotification('Failed to create task.', 'error'))
                .finally(() => refreshTasks());
        }
        setShowTaskDialog(false);
        setCurrentTask(null);
    };

    // Handle task updates (Use in Portfolio, Archive, Delete)
    const updateSelectedTasks = (action) => {
        if (selectedTasks.length === 0) return;

        // Prepare the payload based on the action
        const updateData = selectedTasks.map(taskId => {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return null;

            switch (action) {
                case 'portfolio':
                    return { ...task, portfolio: true }; // Mark as portfolio
                case 'archive':
                    return { ...task, archive: true }; // Mark as done (archived)
                case 'delete':
                    return { id: taskId }; // Only the id for deletion
                default:
                    return null;
            }
        }).filter(task => task !== null);

        // Send updated tasks to backend
        if (action === 'delete') {
            // For delete, send a delete request
            Promise.all(updateData.map(task => axios.delete(`http://localhost:8080/api/tasks`, task)))
                .then(() => {
                    showNotification('Selected tasks deleted!', 'success');
                    setSelectMode(false);
                    setSelectedTasks([]);
                    setTasks(prevTasks => prevTasks.filter(task => !selectedTasks.includes(task.id)));
                })
                .catch(error => showNotification('Failed to delete tasks.', 'error'))
                .finally(() => refreshTasks());
        } else {
            // For other actions (portfolio, archive), send an update request
            Promise.all(updateData.map(task =>
                axios.put(`http://localhost:8080/api/tasks/task`, task)
            ))
                .then(() => {
                    showNotification(`Selected tasks ${action === 'portfolio' ? 'added to portfolio' : 'archived'}`, 'success');
                    setSelectMode(false);
                    setSelectedTasks([]);
                    setTasks(prevTasks => prevTasks.map(task =>
                        selectedTasks.includes(task.id)
                            ? { ...task, ...updateData.find(updatedTask => updatedTask.id === task.id) }
                            : task
                    ));
                })
                .catch(error => showNotification(`Failed to update tasks for action: ${action}`, 'error'))
                .finally(() => refreshTasks());
        }
    };

    // Handle success and failure notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type, show: true });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000); // Hide toast after 3 seconds
    };

    // Handler functions for AppCard
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

            <h2>{title}</h2>
            <p>{subtitle}</p>

            <Row className="app-controls">
                <Col className="col-auto">
                    <FormControl className="mb-4" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </Col>
                <Col>
                    <InputGroup className="mb-4">
                        {showCreateButton && (
                        <Button variant="primary" onClick={onCreateTask || (() => setShowTaskDialog(true))}>Create Task</Button>
                    )}

                        {selectMode && selectedTasks.length > 0 && actions.length > 0 && (
    <>
                            {actions.map((action, index) => (
                                <Button 
                                    key={index}
                                    variant={action.variant || "primary"} 
                                    onClick={() => action.handler(selectedTasks)}
                                >
                                    {action.label}
                                </Button>
                            ))}
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
                        <AppCard
                            task={task}
                            selectMode={selectMode}
                            selectedTasks={selectedTasks}
                            showSelectCheckbox={true}
                            showCompletionCheckbox={true}
                            showPortfolioStar={true}
                            onCardClick={handleTaskClick}
                            onSelectToggle={toggleSelectTask}
                            onCompletionToggle={toggleTaskCompletion}
                        />
                    </Col>
                ))}
            </Row>

            {/* Task Modal */}
            <Modal show={showTaskDialog} onHide={() => setShowTaskDialog(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentTask ? 'Edit Task' : 'Create Task'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="taskTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control type="text" defaultValue={currentTask ? currentTask.title : ''} />
                        </Form.Group>
                        <Form.Group controlId="taskDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" defaultValue={currentTask ? currentTask.description : ''} />
                        </Form.Group>
                        <Form.Group controlId="taskDueDate">
                            <Form.Label>Due Date</Form.Label>
                            <Form.Control type="date" defaultValue={currentTask ? currentTask.dueDate : ''} />
                        </Form.Group>
                        <Form.Group controlId="taskNotes">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control as="textarea" defaultValue={currentTask ? currentTask.notes : ''} />
                        </Form.Group>
                        <Form.Group controlId="taskImage">
                            <Form.Label>Image</Form.Label>
                            <Form.Control type="file" />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTaskDialog(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => handleTaskSubmit({
                        ...currentTask,
                        id: currentTask ? currentTask.id : null,
                        title: document.getElementById('taskTitle').value,
                        description: document.getElementById('taskDescription').value,
                        dueDate: document.getElementById('taskDueDate').value,
                        notes: document.getElementById('taskNotes').value,
                        // Note: You can handle file upload logic here if needed
                    })}>
                        {currentTask ? 'Save Changes' : 'Create Task'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default TaskList;