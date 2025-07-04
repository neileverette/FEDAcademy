import React from 'react';
import { Card, Form } from 'react-bootstrap';

function AppCard({ 
    task, 
    selectMode = false, 
    selectedTasks = [], 
    showSelectCheckbox = true,
    showCompletionCheckbox = true,
    showPortfolioStar = true,
    onCardClick, 
    onSelectToggle, 
    onCompletionToggle 
}) {
    return (
        <Card onClick={() => onCardClick && onCardClick(task)} className="app-card">
            <Card.Body>
                {/* Select checkbox for task */}
                {selectMode && showSelectCheckbox && (
                    <Form.Check
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onClick={e => { e.stopPropagation(); }}
                        onChange={() => onSelectToggle && onSelectToggle(task.id)}
                        className="position-absolute top-0 end-0 m-2"
                    />
                )}

                {/* Task Title */}
                <Card.Title>
                    {task.title}

                    {/* Portfolio Star */}
                    {task.portfolio && showPortfolioStar && (
                        <div className="position-absolute bottom-0 end-0 m-2">★</div>
                    )}
                </Card.Title>

                {/* Task Description */}
                <Card.Text>{task.description}</Card.Text>

                {/* Completion Status with Checkbox */}
                {showCompletionCheckbox && (
                    <div className="d-flex justify-content-between align-items-center position-absolute bottom-0">
                        <Form.Check
                            type="checkbox"
                            label="Completed"
                            checked={task.done}
                            onClick={e => { e.stopPropagation(); }}
                            onChange={(event) => onCompletionToggle && onCompletionToggle(task, event.target.checked)}
                        />
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}

export default AppCard;