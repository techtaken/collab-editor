import React from "react";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { userAtom } from "../state/userAtom";

type HomeProps = {
  onLogin: () => void;
};

const Home: React.FC<HomeProps> = ({ onLogin }) => {
  const user = useRecoilValue(userAtom);

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
          <button
            onClick={onLogin}
            style={{
              background: "#fff",
              color: "#764ba2",
              border: "none",
              borderRadius: "20px",
              padding: "0.5rem 1.5rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "background 0.2s",
            }}
          >
            Login
          </button>
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
        <h1 style={{ fontSize: "3rem", fontWeight: 700, marginBottom: "1rem" }}>
          Welcome to Collab Editor
        </h1>
        <p style={{ fontSize: "1.3rem", maxWidth: "600px", textAlign: "center", marginBottom: "2rem" }}>
          Collaborate, code, and create together in real-time. Experience seamless code editing with your team.
        </p>
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