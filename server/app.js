const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const connectedDevices = {};

io.on("connection", (socket) => {

    console.log("🔌 Socket Connected:", socket.id);

    socket.on("register-device", (deviceData) => {

        connectedDevices[deviceData.deviceId] = {

            deviceId: deviceData.deviceId,
            socketId: socket.id,

            deviceName: deviceData.deviceName,
            deviceType: deviceData.deviceType,

            online: true,
            lastSeen: new Date()

        };

        console.log("✅ Device Registered");

        io.emit(
            "devices-updated",
            Object.values(connectedDevices)
        );
    });

    socket.on("disconnect", () => {

        console.log("❌ Socket Disconnected:", socket.id);

        for (const deviceId in connectedDevices) {

            if (
                connectedDevices[deviceId].socketId === socket.id
            ) {

                connectedDevices[deviceId].online = false;

                connectedDevices[deviceId].lastSeen = new Date();
            }
        }

        io.emit(
            "devices-updated",
            Object.values(connectedDevices)
        );
    });

});

server.listen(3000, () => {
    console.log("🚀 SyncBridge Server Running");
});