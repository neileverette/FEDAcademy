import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Card } from 'react-bootstrap';
import axios from 'axios';

// Archive Component (Placeholder for now)
function Archive() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/api/tasks')
            .then(response => {
                // Filter tasks that are marked as done
                const archivedTasks = response.data.filter(task => task.archive === true);
                setTasks(archivedTasks);
            })
            .catch(error => {
                console.error('Failed to load tasks:', error);
                alert('Failed to load tasks.');
            });
    }, []);

    return (
        <div>
            <h2>Archive</h2>
            <Row>
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <Col sm={4} key={task.id} className="mb-3">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{task.title}</Card.Title>
                                    <Card.Text>{task.description}</Card.Text>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No Due Date'}
                                    </Card.Subtitle>
                                    <Button variant="danger" disabled>
                                        Archived
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <p>No archived tasks found.</p>
                )}
            </Row>
        </div>
    );
}

export default Archive;