import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[url('/travel.jpg')] bg-cover bg-center">

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Card del login */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-96">

        {/* Título */}
        <h1 className="text-3xl font-bold text-center text-emerald-600 mb-1">
          QuePlan 🌍
        </h1>

        <p className="text-center text-gray-600 mb-6 text-sm">
          Plan your next adventure
        </p>

        {/* Input email */}
        <input
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Input password */}
        <input
          className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Botón */}
        <button
          className="w-full bg-emerald-500 text-white p-3 rounded-xl font-semibold hover:bg-emerald-600 transition"
          onClick={() => console.log(email, password)}
        >
          Explore Now ✈️
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-5">
          New here?
          <span className="text-emerald-600 font-semibold cursor-pointer ml-1 hover:underline">
            Create account
          </span>
        </p>

      </div>
    </div>
  );
}