import { io } from "socket.io-client";

const DEPLOYED_URL = "https://fun-rps-abhi.onrender.com";
const LOCAL_URL = "http://localhost:6000/";

const socket = io(DEPLOYED_URL, { 
  transports: ["websocket"],
  fallback: LOCAL_URL  // fallback to local if deployed fails
});

export default socket;
