import React, {useState} from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userAtom } from "../state/userAtom";
import { useNavigate } from 'react-router-dom';


const Home: React.FC = () => {
  const user = useRecoilValue(userAtom);
  const [collabCode, setCollabCode] = useState('');

  const navigate = useNavigate();

  const handleCollabClick = () => {
    if (collabCode.trim()) {
      navigate(`/editor?collabCode=${encodeURIComponent(collabCode)}`);
    } else {
      alert('Please enter a collaboration code!');
    }
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        fontFamily: "Segoe UI, sans-serif",
        position: "relative",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "1.5rem 2rem",
        }}
      >
        {user ? (
          <span style={{ marginRight: "1rem" }}>Hello, {user.name}!</span>
        ) : null}
        {!user ? (
          <Link
          to="/register"
          style={{
            textDecoration: 'none',
            color: '#fff',
            backgroundColor: '#007bff',
            padding: '10px 20px',
            borderRadius: '5px',
            display: 'inline-block',
            marginTop: '20px',
          }}
        >
          Register / Login
        </Link>
        ) : (
          <Link
            to="/editor"
            style={{
              background: "#fff",
              color: "#764ba2",
              border: "none",
              borderRadius: "20px",
              padding: "0.5rem 1.5rem",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "background 0.2s",
            }}
          >
            Go to Editor
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "70vh",
        }}
      >
       <h1>Welcome to the Code Editor</h1>
      <p>Enter your collab code below to start collaborating!</p>
      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Enter your collab code here"
          value={collabCode}
          onChange={(e) => setCollabCode(e.target.value)}
          style={{
            padding: '10px',
            width: '300px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '16px',
            marginRight: '10px',
          }}
        />
        <button
          onClick={handleCollabClick}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
        >
          Collab
        </button>
      </div>
        {/* Simple SVG graphic */}
        <svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="160" cy="150" rx="120" ry="20" fill="#fff" fillOpacity="0.2"/>
          <rect x="60" y="40" width="200" height="80" rx="16" fill="#fff" fillOpacity="0.15"/>
          <rect x="80" y="60" width="40" height="40" rx="8" fill="#fff" fillOpacity="0.25"/>
          <rect x="140" y="60" width="40" height="40" rx="8" fill="#fff" fillOpacity="0.25"/>
          <rect x="200" y="60" width="40" height="40" rx="8" fill="#fff" fillOpacity="0.25"/>
          <rect x="110" y="90" width="100" height="10" rx="5" fill="#fff" fillOpacity="0.18"/>
        </svg>
      </div>
    </div>
  );
};

export default Home;