import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    axios.post('/users/register', { email, password })
      .then((res) => {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.use);
        navigate('/');
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1a0a1d] via-[#1a1a2e] to-[#2c003e]">
      <div className="w-full max-w-md p-8 bg-black/60 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">Sign Up</h2>
        <form className="space-y-5 w-full" onSubmit={submitHandler}>
          <div>
            <label className="text-gray-400 block text-sm mb-1">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 bg-[#232136] text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
          <div>
            <label className="text-gray-400 block text-sm mb-1">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 bg-[#232136] text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-pink-500 outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-500 via-red-500 to-indigo-500 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-lg shadow-lg transition duration-200 text-lg"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-pink-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
