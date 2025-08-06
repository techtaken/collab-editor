import { useState } from "react";
import { useSetRecoilState } from "recoil";
import { userAtom } from "../state/userAtom";
import { User } from '../../../../shared-types/src/lib/shared-types';

type RegisterUserProps = {
  setUser?: (user: User) => void;
};

const RegisterUser: React.FC<RegisterUserProps> = ({ setUser }) => {
  const setUserAtom = useSetRecoilState(userAtom);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const handleRegister = () => {
    const user = {
      id: '1',
      email,
      name,
    };
    if (setUser) {
      setUser(user);
    } else {
      setUserAtom(user);
      localStorage.setItem("user", JSON.stringify(user));
    }
  };
  return (
    <div>
      <h2>Please register to use the editor</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};
export default RegisterUser;