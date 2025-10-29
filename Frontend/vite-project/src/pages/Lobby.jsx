// src/pages/Lobby.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";
import { usePlayer } from "../context/PlayerContext";

const Lobby = () => {
  const { player } = usePlayer();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!player.name) {
      navigate("/");
      return;
    }

    socket.emit("join-room", { roomId, name: player.name });

    socket.on("room-full", () => {
      alert("Room is full!");
      navigate("/");
    });

    socket.on("both-players-joined", ({ players }) => {
      setPlayers(players);
      setTimeout(() => {
        navigate(`/game/${roomId}`);
      }, 1500);
    });

    socket.on("opponent-left", () => {
      alert("Opponent disconnected");
      navigate("/");
    });

    return () => {
      socket.off("room-full");
      socket.off("both-players-joined");
      socket.off("opponent-left");
    };
  }, [player, roomId, navigate]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden text-white">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-indigo-900 to-cyan-800 animate-gradient-x"></div>

      {/* Neon glow orbs */}
      <div className="absolute top-10 left-20 w-72 h-72 bg-purple-500 opacity-30 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-10 right-20 w-64 h-64 bg-cyan-400 opacity-30 blur-3xl rounded-full animate-pulse delay-700"></div>

      {/* Lobby Card */}
      <div className="relative z-10 backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-10 text-center max-w-md w-full">
        <h2 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]">
          Lobby Room
        </h2>

        <div className="mb-6">
          <p className="uppercase text-gray-300 text-sm tracking-widest">
            Room Code
          </p>
          <div className="mt-2 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_15px_rgba(56,189,248,0.7)]">
            #{roomId}
          </div>
        </div>

        <p className="text-lg text-gray-200 mb-4 animate-pulse">
          Waiting for opponent to join...
        </p>

        {/* Player list */}
        <div className="mt-4 space-y-3">
          {players.map((p) => (
            <div
              key={p.id}
              className="text-xl flex items-center justify-center space-x-2 bg-white/10 px-5 py-3 rounded-full border border-white/20 shadow-inner"
            >
              <span className="text-green-400 text-2xl">✅</span>
              <span className="font-semibold text-gray-100 tracking-wide">
                {p.name}
              </span>
            </div>
          ))}
        </div>

        {/* Glowing loader */}
        <div className="mt-8 flex justify-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <p className="mt-3 text-sm text-gray-400 italic">
          Invite your friend to join using the code above 💬
        </p>
      </div>
    </div>
  );
};

export default Lobby;
