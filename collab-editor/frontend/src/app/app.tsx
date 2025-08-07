import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MonacoEditor from './components/MonacoEditor';
import RegisterUser from './components/RegisterUser';
import Home from './components/Home';
import NavBar from './components/NavBar';

export function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<MonacoEditor />} />
        <Route path="/register" element={<RegisterUser />} />
      </Routes>
    </Router>
  );
}

export default App;