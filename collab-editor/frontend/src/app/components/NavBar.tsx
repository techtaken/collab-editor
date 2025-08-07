import React from 'react';
import { Link } from 'react-router-dom';

const NavBar: React.FC = () => {
  return (
    <nav
      style={{
        padding: '10px 20px',
        backgroundColor: '#1a1a2e',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#e94560' }}>
        Code Editor
      </h1>
      <div style={{ display: 'flex', gap: '15px' }}>
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: '#fff',
            backgroundColor: '#0f3460',
            padding: '10px 15px',
            borderRadius: '5px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#16213e')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0f3460')}
        >
          Home
        </Link>
        <Link
          to="/editor"
          style={{
            textDecoration: 'none',
            color: '#fff',
            backgroundColor: '#0f3460',
            padding: '10px 15px',
            borderRadius: '5px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#16213e')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0f3460')}
        >
          Editor
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;