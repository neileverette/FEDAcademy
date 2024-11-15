import React from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import TaskList from './components/TaskList/TaskList';
import Archive from './components/Archive/Archive';
import Portfolio from './components/Portfolio/Portfolio';
import Review from './components/Review/Review';

function App() {
  return (
    <Router>
      <Container>
        <Header />
        <Navigation />
        <Routes>
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/review" element={<Review />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
