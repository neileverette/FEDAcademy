import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Review Component
function Review() {
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
            <h2>Portfolio Review</h2>
            {tasks.length > 0 ? (
                tasks.map(task => (
                    <div key={task.id} className="mb-5">
                        <div className="border p-4 mb-3">
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>

                            <h5>Completed:</h5>
                            <p>
                                {task.done ? (
                                    `Completed on ${new Date(task.doneDate).toLocaleDateString()}`
                                ) : (
                                    "Incomplete"
                                )}
                            </p>

                            <h5>Results:</h5>
                            <p>{task.results}</p>

                            {task.image && (
                                <div className="mt-3">
                                    <img
                                        src={'http://localhost:8080/api/' + task.image?.value}  // Assuming `image` is a URL or base64 string
                                        alt="Task"
                                        className="img-fluid"
                                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p>No portfolio tasks available for review.</p>
            )}
        </div>
    );
}

export default Review;