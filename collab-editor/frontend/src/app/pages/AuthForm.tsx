import { useState, useEffect } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { useLocation, useNavigate } from "react-router-dom";
import { userAtom } from "../state/userAtom";
import { User } from '../../../../shared-types/src/lib/shared-types';
import { api } from "../api/api";

type AuthFormProps = {
  setUser?: (user: User) => void;
};

const AuthForm: React.FC<AuthFormProps> = ({ setUser }) => {
  const setUserAtom = useSetRecoilState(userAtom);
  const user = useRecoilValue(userAtom);
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === "/login";

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in and token is valid
  useEffect(() => {
    if (
      user &&
      user.token &&
      user.tokenExpiry &&
      new Date(user.tokenExpiry).getTime() > Date.now()
    ) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    setError(null);
    try {
      let userObj: User;
      let authResponse;
      if (isLogin) {
        authResponse = await api.login(email, password);
      } else {
        authResponse = await api.register(email, name, password);
      }
      console.log("Auth Response:", authResponse);
      userObj = authResponse.user;
      userObj.token = authResponse.token;
      userObj.tokenExpiry = Date.now() + authResponse.expiresIn*1000;
      if (setUser) {
        setUser(userObj);
      } else {
        setUserAtom(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
      }
      navigate("/"); // Redirect to home after successful login/register
    } catch (err: any) {
      setError(err?.message || (isLogin ? "Login failed" : "Registration failed"));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-bg to-bg-secondary"
      style={{
        position: 'relative',
        zIndex: 0,
      }}
    >
      <img
        src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80"
        alt="Coding background"
        className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm"
        style={{ zIndex: 1 }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-bg/90 to-bg-secondary/90"
        style={{ zIndex: 2 }}
      />
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8 animate-fade-in relative"
           style={{ zIndex: 3 }}>
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">
          {isLogin ? "Login to use the editor" : "Register to use the editor"}
        </h2>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-muted mb-1" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="input w-full px-4 py-2 bg-card border border-border rounded-md focus:border-accent focus:ring-2 focus:ring-accent transition text-primary"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-muted mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input w-full px-4 py-2 bg-card border border-border rounded-md focus:border-accent focus:ring-2 focus:ring-accent transition text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input w-full px-4 py-2 bg-card border border-border rounded-md focus:border-accent focus:ring-2 focus:ring-accent transition text-primary"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
          )}
          <button
            type="submit"
            className="btn btn-primary w-full py-2 text-base font-semibold rounded-md transition hover:shadow-glow bg-primary hover:bg-primary/90"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;