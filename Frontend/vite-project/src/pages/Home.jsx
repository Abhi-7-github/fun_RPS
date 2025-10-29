import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

const Home = () => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();
  const { setPlayer } = usePlayer();

  const createRoom = () => {
    if (!name.trim()) return alert("Enter your name");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPlayer({ name, roomId: code });
    navigate(`/lobby/${code}`);
  };

  const joinRoom = () => {
    if (!name.trim()) return alert("Enter your name");
    if (roomCode.length !== 6) return alert("Enter valid room code");
    setPlayer({ name, roomId: roomCode });
    navigate(`/lobby/${roomCode}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-blue-800 to-cyan-600 animate-gradient-x"></div>

      {/* Glow Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 opacity-30 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-cyan-400 opacity-30 blur-3xl rounded-full animate-pulse delay-700"></div>

      {/* Main Card */}
      <div className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">
          Rock Paper Scissors
        </h1>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
        />

        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
          <button
            onClick={joinRoom}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
          >
            Join
          </button>
        </div>

        <div className="relative my-6">
          <hr className="border-gray-600" />
          <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white/10 px-3 text-sm text-gray-300">or</span>
        </div>

        <button
          onClick={createRoom}
          className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-400/50 transition-all duration-300"
        >
          Create New Room
        </button>

        <p className="mt-6 text-sm text-gray-300 italic">
          Challenge your friends and see who rules the arena 💥
        </p>
      </div>
    </div>
  );
};

export default Home;
