import { io } from "socket.io-client";

// const socket = io("http://localhost:3000", {
//     reconnection: true
// });

const socket = io("http://192.168.0.205:3000", {
    reconnection: true
});

export default socket;