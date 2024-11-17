import React from 'react';
import { Link } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';

// Navigation Component
function Navigation() {
    return (
      <nav className="my-4">
        <ListGroup horizontal className="app-nav">
          <ListGroup.Item as={Link} to="/tasks">Tasks</ListGroup.Item>
          <ListGroup.Item as={Link} to="/archive">Archive</ListGroup.Item>
          <ListGroup.Item as={Link} to="/portfolio">Portfolio</ListGroup.Item>
          <ListGroup.Item as={Link} to="/review">Review</ListGroup.Item>
        </ListGroup>
      </nav>
    );
  }

export default Navigation;