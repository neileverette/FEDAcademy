import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Card } from 'react-bootstrap';
import axios from 'axios';

// Portfolio Component
function Portfolio() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/api/tasks')
            .then(response => {
                // Filter tasks that are marked as portfolio
                const portfolioTasks = response.data.filter(task => task.portfolio === true);
                setTasks(portfolioTasks);
            })
            .catch(error => {
                console.error('Failed to load tasks:', error);
                alert('Failed to load tasks.');
            });
    }, []);

    return (
        <div>
            <h2>Portfolio</h2>
            <p>Achievements you want to highlight.</p>
            <Row className="app-tasks">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <Col sm={4} key={task.id} className="mb-3">
                            <Card className="app-card">
                                <Card.Body>
                                    <Card.Title>{task.title}</Card.Title>
                                    <Card.Text>{task.description}</Card.Text>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No Due Date'}
                                    </Card.Subtitle>
                                    <Button variant="info" disabled>
                                        Portfolio Task
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <p>No portfolio tasks found.</p>
                )}
            </Row>
        </div>
    );
}

export default Portfolio;