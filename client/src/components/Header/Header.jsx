import React, { useState } from 'react';
import { Row, Col, Button, Modal, Form } from 'react-bootstrap';

// Header Component
function Header() {
    const [showSettings, setShowSettings] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  
    const resetTasks = () => {
      if (window.confirm("Are you sure you want to clear all tasks?")) {
        axios.post('http://localhost:8080/api/reset')
          .then(response => alert('Tasks Reset Successfully!'))
          .catch(error => alert('Failed to reset tasks.'));
      }
    };
  
    const handleProfileSubmit = () => {
      axios.post('http://localhost:8080/api/profile', profile)
        .then(response => alert('Profile Updated Successfully!'))
        .catch(error => alert('Failed to update profile.'));
      setShowProfile(false);
    };
  
    return (
      <header className="my-4">
        <Row>
          <Col>
            <h1>PlanDuVu</h1>
          </Col>
          <Col className="text-end">
            <img src="..." alt="Profile" className="rounded-circle" style={{ cursor: 'pointer' }} onClick={() => setShowProfile(true)} />
            <Button variant="link" onClick={resetTasks}>Reset</Button>
            <Button variant="link" onClick={() => setShowSettings(true)}>Settings</Button>
          </Col>
        </Row>
  
        {/* Settings Modal */}
        <Modal show={showSettings} onHide={() => setShowSettings(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="themeSelect">
                <Form.Label>Select Theme</Form.Label>
                <Form.Control as="select">
                  <option>Light</option>
                  <option>Dark</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSettings(false)}>Close</Button>
            <Button variant="primary">Save Changes</Button>
          </Modal.Footer>
        </Modal>
  
        {/* Profile Modal */}
        <Modal show={showProfile} onHide={() => setShowProfile(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
              </Form.Group>
              <Form.Group controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
              </Form.Group>
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowProfile(false)}>Close</Button>
            <Button variant="primary" onClick={handleProfileSubmit}>Save</Button>
          </Modal.Footer>
        </Modal>
      </header>
    );
  }

  export default Header;