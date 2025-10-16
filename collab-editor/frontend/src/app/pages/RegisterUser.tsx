// import { useState } from "react";
// import { useSetRecoilState } from "recoil";
// import { userAtom } from "../state/userAtom";
// import { User } from '../../../../shared-types/src/lib/shared-types';
// import { api } from "../api/api"; // Import your api object

// type RegisterUserProps = {
//   setUser?: (user: User) => void;
// };

// const RegisterUser: React.FC<RegisterUserProps> = ({ setUser }) => {
//   const setUserAtom = useSetRecoilState(userAtom);
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);

//   const handleRegister = async () => {
//     setError(null);
//     try {
//       const user = await api.register(email, name, password);
//       if (setUser) {
//         setUser(user);
//       } else {
//         setUserAtom(user);
//         localStorage.setItem("user", JSON.stringify(user));
//       }
//     } catch (err: any) {
//       setError(err?.message || "Registration failed");
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-bg to-bg-secondary"
//       style={{
//         position: 'relative',
//         zIndex: 0,
//       }}
//     >
//       {/* Coding background image (lightly blurred and darkened) */}
//       <img
//         src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80"
//         alt="Coding background"
//         className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm"
//         style={{ zIndex: 1 }}
//       />
//       {/* Overlay color for readability */}
//       <div
//         className="absolute inset-0 bg-gradient-to-br from-bg/90 to-bg-secondary/90"
//         style={{ zIndex: 2 }}
//       />
//       {/* Registration Card */}
//       <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8 animate-fade-in relative"
//            style={{ zIndex: 3 }}>
//         <h2 className="text-2xl font-bold text-primary mb-6 text-center">
//           Register to use the editor
//         </h2>
//         <form
//           className="space-y-6"
//           onSubmit={(e) => {
//             e.preventDefault();
//             handleRegister();
//           }}
//         >
//           <div>
//             <label className="block text-sm font-medium text-muted mb-1" htmlFor="name">
//               Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               placeholder="Your Name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               required
//               className="input w-full px-4 py-2 bg-card border border-border rounded-md focus:border-accent focus:ring-2 focus:ring-accent transition text-primary"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-muted mb-1" htmlFor="email">
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               placeholder="you@email.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="input w-full px-4 py-2 bg-card border border-border rounded-md focus:border-accent focus:ring-2 focus:ring-accent transition text-primary"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-muted mb-1" htmlFor="password">
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               placeholder="Your Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="input w-full px-4 py-2 bg-card border border-border rounded-md focus:border-accent focus:ring-2 focus:ring-accent transition text-primary"
//             />
//           </div>
//           {error && (
//             <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
//           )}
//           <button
//             type="submit"
//             className="btn btn-primary w-full py-2 text-base font-semibold rounded-md transition hover:shadow-glow"
//           >
//             Register
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RegisterUser;