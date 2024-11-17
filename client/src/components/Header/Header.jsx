import React, { useEffect, useState } from 'react';
import { Row, Col, Button, ButtonGroup, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

// Header Component
function Header({ theme }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ firstName: '', surname: '', email: '' });

  const updateTheme = (selectedTheme) => {
    theme.set(selectedTheme);
    axios.put('http://localhost:8080/api/theme', { theme: selectedTheme })
      .catch(error => alert('Failed to load theme.'), 'error');
  }
  useEffect(() => {
    axios.get('http://localhost:8080/api/profile')
      .then(response => setProfile(response.data))
      .catch(error => alert('Failed to load profile.'), 'error');
    axios.get('http://localhost:8080/api/theme')
      .then(response => theme.set(response.data.theme))
      .catch(error => alert('Failed to load theme.'), 'error');
  }, []);

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
      </Row>

      <div className="app-menu">
        <Button variant="danger" onClick={resetTasks}>Reset</Button>
        &nbsp;&nbsp;
        <ButtonGroup>
          <Button variant="secondary" onClick={() => setShowSettings(true)}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              fill='currentColor'
              viewBox='0 0 16 16'
            >
              <path d='M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z' />
            </svg>
          </Button>
          <Button variant="secondary" onClick={() => setShowProfile(true)}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              fill='currentColor'
              viewBox='0 0 16 16'
            >
              <path d='M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6' />
            </svg>
          </Button>
        </ButtonGroup>
      </div>

      {/* Settings Modal */}
      <Modal show={showSettings} onHide={() => setShowSettings(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="themeSelect">
              <ButtonGroup aria-label="Basic example">
                <Button variant={theme.current == 'light' ? 'primary' : 'secondary'} onClick={e => updateTheme('light')}>Light</Button>
                <Button variant={theme.current == 'default' ? 'primary' : 'secondary'} onClick={e => updateTheme('default')}>Default</Button>
                <Button variant={theme.current == 'dark' ? 'primary' : 'secondary'} onClick={e => updateTheme('dark')}>Dark</Button>
              </ButtonGroup>
            </Form.Group>
          </Form>
        </Modal.Body>
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
            <Form.Group controlId="surname">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" value={profile.surname} onChange={(e) => setProfile({ ...profile, surname: e.target.value })} />
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