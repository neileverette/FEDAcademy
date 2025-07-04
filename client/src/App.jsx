import React, { useEffect, useState } from 'react';
import { Container, Nav } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider } from './components/AppContext';

import Header from './components/Header/Header';
import Navigation from './components/Navigation/Navigation';
import Tasks from './views/Tasks/Tasks';
import Archive from './components/Archive/Archive';
import Portfolio from './components/Portfolio/Portfolio';
import Review from './components/Review/Review';

function App() {
  const [theme, setTheme] = useState('default');

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)');
    const activeTheme = theme == 'default'
      ? isDark && 'dark' || 'light'
      : theme
    document.body.setAttribute('data-bs-theme', activeTheme);
  }, [theme]);

  return (
    <AppProvider>
      <Router>
        <Container className='app-container'>
          <Header theme={{current: theme, set: setTheme}} />
          <Navigation />
          <Routes>
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/review" element={<Review />} />
            <Route path="*" element={<Navigate to="/tasks" replace={true} />} />
          </Routes>
        </Container>
      </Router>
    </AppProvider>
  );
}

export default App;
