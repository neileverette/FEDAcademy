import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Form, Card, ListGroup, InputGroup, FormControl } from 'react-bootstrap';
import axios from 'axios';

// Task List Component with Select Mode
function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTasks, setSelectedTasks] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8080/api/tasks')
            .then(response => setTasks(response.data.filter(task => !task.archive)))
            .catch(error => alert('Failed to load tasks.'));
    }, []);

    // Handle task selection/deselection
    const toggleSelectTask = (taskId) => {
        setSelectedTasks(prevSelectedTasks =>
            prevSelectedTasks.includes(taskId)
                ? prevSelectedTasks.filter(id => id !== taskId)
                : [...prevSelectedTasks, taskId]
        );
    };

    const toggleTaskCompletion = (task) => {
        task.done = true;
        task.doneDate = { type: 'date', value: (new Date()).toISOString() };
        axios.put(`http://localhost:8080/api/tasks/task`, task)
            .then(response => alert('Task marked as completed!'))
            .catch(error => alert('Failed to mark task as completed.'));
    };

    const handleTaskSubmit = (task) => {
        if (task.id) {
            axios.put(`http://localhost:8080/api/tasks`, task)
                .then(response => alert('Task Updated Successfully!'))
                .catch(error => alert('Failed to update task.'));
        } else {
            axios.post('http://localhost:8080/api/tasks/new', task)
                .then(response => alert('Task Created Successfully!'))
                .catch(error => alert('Failed to create task.'));
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
                    return { ...task, done: true, doneDate: new Date().toISOString() }; // Mark as done (archived)
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
                    alert('Selected tasks deleted!');
                    setSelectMode(false);
                    setSelectedTasks([]);
                    setTasks(prevTasks => prevTasks.filter(task => !selectedTasks.includes(task.id)));
                })
                .catch(error => alert('Failed to delete tasks.'));
        } else {
            // For other actions (portfolio, archive), send an update request
            Promise.all(updateData.map(task =>
                axios.put(`http://localhost:8080/api/tasks/task`, task)
            ))
                .then(() => {
                    alert(`Selected tasks ${action === 'portfolio' ? 'added to portfolio' : 'archived'}`);
                    setSelectMode(false);
                    setSelectedTasks([]);
                    setTasks(prevTasks => prevTasks.map(task =>
                        selectedTasks.includes(task.id)
                            ? { ...task, ...updateData.find(updatedTask => updatedTask.id === task.id) }
                            : task
                    ));
                })
                .catch(error => alert(`Failed to update tasks for action: ${action}`));
        }
    };

    const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div>
            <InputGroup className="mb-4">
                <FormControl placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <Button variant="outline-secondary" onClick={() => setShowTaskDialog(true)}>Create Task</Button>
                <Button variant="outline-secondary" onClick={() => setSelectMode(true)} disabled={selectMode}>
                    {selectMode ? 'Cancel' : 'Select'}
                </Button>
            </InputGroup>

            {selectMode && selectedTasks.length > 0 && (
                <div className="mb-3">
                    <Button variant="success" onClick={() => updateSelectedTasks('portfolio')}>Use in Portfolio</Button>
                    <Button variant="warning" onClick={() => updateSelectedTasks('archive')}>Archive</Button>
                    <Button variant="danger" onClick={() => updateSelectedTasks('delete')}>Delete</Button>
                    <Button variant="secondary" onClick={() => setSelectMode(false)}>Cancel</Button>
                </div>
            )}

            <Row>
                {filteredTasks.map(task => (
                    <Col sm={4} key={task.id} className="mb-3">
                        <Card>
                            <Card.Body>
                                {/* Select checkbox for task */}
                                {selectMode && (
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectedTasks.includes(task.id)}
                                        onChange={() => toggleSelectTask(task.id)}
                                        className="position-absolute top-0 start-0 m-2"
                                    />
                                )}

                                {/* Portfolio Star */}
                                {task.portfolio && (
                                    <span className="position-absolute top-0 end-0 p-2" style={{ fontSize: '20px', color: 'gold' }}>
                                        <i className="bi bi-star-fill"></i>
                                    </span>
                                )}

                                {/* Task Title */}
                                <Card.Title>{task.title}</Card.Title>

                                {/* Task Description */}
                                <Card.Text>{task.description}</Card.Text>


                                {/* Completion Status with Checkbox */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <Form.Check
                                        type="checkbox"
                                        label="Completed"
                                        checked={task.done}
                                        onChange={() => toggleTaskCompletion(task.id)}
                                        disabled={task.done}  // Disables the checkbox if the task is already completed
                                    />
                                </div>

                                <Button variant="link" onClick={() => { setShowTaskDialog(true); setCurrentTask(task); }}>
                                    Edit
                                </Button>
                            </Card.Body>
                        </Card>
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