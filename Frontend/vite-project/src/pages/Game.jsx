import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import { usePlayer } from "../context/PlayerContext";

const choices = ["rock", "paper", "scissors"];

const Game = () => {
  const { player } = usePlayer();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [roundResult, setRoundResult] = useState(null);
  const [moves, setMoves] = useState({});
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [hasPicked, setHasPicked] = useState(false);

  useEffect(() => {
    socket.on("both-players-joined", ({ players: ps, scores: sc }) => {
      setPlayers(ps);
      setScores(sc);
    });

    socket.on("round-result", ({ moves, winnerId, scores }) => {
      setMoves(moves);
      setScores(scores);
      setRoundResult(winnerId);
      setHasPicked(false);
    });

    socket.on("rematch-start", () => {
      setRoundResult(null);
      setMoves({});
      setHasPicked(false);
    });

    const handleChat = (msg) => {
      setChat((prev) => [...prev, msg]);
    };

    socket.on("chat-message", handleChat);

    socket.on("opponent-left", () => {
      alert("Opponent left the game.");
      navigate("/");
    });

    setChat([]);

    return () => {
      socket.off("chat-message", handleChat);
      socket.off("both-players-joined");
      socket.off("round-result");
      socket.off("rematch-start");
      socket.off("opponent-left");
    };
  }, [navigate]);

  const sendMove = (choice) => {
    if (!hasPicked && roundResult === null) {
      socket.emit("player-move", choice);
      setHasPicked(true);
    }
  };

  const rematch = () => {
    socket.emit("rematch");
  };

  const sendChat = () => {
    if (message.trim()) {
      socket.emit("chat-message", message);
      setMessage("");
    }
  };

  const getPlayerName = (id) =>
    players.find((p) => p.id === id)?.name || "Unknown";

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden text-white">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-indigo-900 to-cyan-800 animate-gradient-x"></div>

      {/* Glow orbs */}
      <div className="absolute top-10 left-20 w-72 h-72 bg-purple-500 opacity-30 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-10 right-20 w-64 h-64 bg-cyan-400 opacity-30 blur-3xl rounded-full animate-pulse delay-700"></div>

      {/* Game Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 backdrop-blur-xl bg-white/10 border-r border-white/10">
        {/* Player Info */}
        <div className="text-lg mb-2 text-gray-200">
          Welcome,{" "}
          <span className="text-cyan-400 font-semibold">{player.name}</span>
        </div>
        <div className="text-center mb-6">
          <p className="uppercase text-xs text-gray-400 tracking-wide">
            Room Code
          </p>
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
            #{roomId}
          </div>
        </div>

        {/* Choices */}
        <div className="flex space-x-8 mb-8">
          {choices.map((choice) => (
            <button
              key={choice}
              onClick={() => sendMove(choice)}
              disabled={hasPicked || roundResult !== null}
              className={`relative px-8 py-4 rounded-full capitalize text-lg font-bold tracking-wide transition-all duration-300 
                ${
                  hasPicked || roundResult !== null
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-110 shadow-lg hover:shadow-cyan-500/60"
                }
              `}
            >
              ✊ {choice}
              <span className="absolute inset-0 rounded-full blur-md bg-gradient-to-r from-cyan-400 to-purple-400 opacity-40 -z-10"></span>
            </button>
          ))}
        </div>

        {/* Result */}
        {roundResult !== null && (
          <div className="mt-4 bg-white/10 p-6 rounded-2xl text-center shadow-lg border border-white/20 w-full max-w-md">
            <h3
              className={`text-3xl font-extrabold mb-3 ${
                roundResult === socket.id
                  ? "text-green-400"
                  : roundResult === null
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {roundResult === socket.id
                ? "🎉 You Won!"
                : roundResult === null
                ? "🤝 Draw!"
                : "😞 You Lost!"}
            </h3>
            <p className="text-gray-200">
              You chose: <span className="font-semibold text-cyan-300">{moves[socket.id]}</span>
            </p>
            <p className="text-gray-200 mb-4">
              Opponent chose:{" "}
              <span className="font-semibold text-purple-300">
                {Object.entries(moves).find(([id]) => id !== socket.id)?.[1]}
              </span>
            </p>
            <button
              onClick={rematch}
              className="px-10 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:scale-110 text-white font-semibold rounded-full shadow-lg transition-all duration-300"
            >
              🔁 Rematch
            </button>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      <div className="w-full md:w-1/3 p-4 flex flex-col z-10 backdrop-blur-xl bg-white/10 border-l border-white/20">
        <h3 className="text-xl font-bold text-center text-cyan-300 mb-4 border-b border-white/20 pb-2">
          💬 Live Chat
        </h3>

        <div className="flex-1 overflow-y-auto space-y-3 px-2 py-3 rounded-xl bg-black/30 shadow-inner border border-white/10">
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === player.name ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-md ${
                  msg.sender === player.name
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-bl-none"
                }`}
              >
                <span className="block text-xs font-semibold mb-1 opacity-80">
                  {msg.sender}
                </span>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex mt-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-l-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            onClick={sendChat}
            className="px-6 py-2 rounded-r-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:scale-105 transition-all font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;
