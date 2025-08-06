// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { userAtom } from "./state/userAtom";
import Home from './components/Home';
import MonacoEditor from './components/MonacoEditor';
import RegisterUser from './components/RegisterUser';
import { User } from '../../../shared-types/src/lib/shared-types';


export function App() {
  const [user, setUser] = useRecoilState(userAtom);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = () => setShowRegister(true);

  const handleRegister = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    setShowRegister(false);
  };

  if (user) {
    return <MonacoEditor />;
  }
  if (showRegister) {
    return <RegisterUser setUser={handleRegister} />;
  }
  return <Home onLogin={handleLogin} />;
}

export default App;
