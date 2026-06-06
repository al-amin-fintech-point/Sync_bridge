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

    socket.on("send-pair-request", ({ fromDeviceId, toDeviceId }) => {
        console.log(`📩 Pair request from ${fromDeviceId} to ${toDeviceId}`);
        
        const targetDevice = connectedDevices[toDeviceId];
        
        if (targetDevice && targetDevice.online) {
            io.to(targetDevice.socketId).emit("receive-pair-request", {
                fromDeviceId: fromDeviceId,
                fromDeviceName: connectedDevices[fromDeviceId]?.deviceName || "Unknown Device"
            });
        }
    });

    socket.on("accept-pair-request", ({ requesterId, accepterId }) => {
        console.log(`🤝 Pair accepted between ${requesterId} and ${accepterId}`);
        
        const requester = connectedDevices[requesterId];
        const accepter = connectedDevices[accepterId];

        if (requester && accepter) {
            const roomId = `room-${requesterId}-${accepterId}`;

            const requesterSocket = io.sockets.sockets.get(requester.socketId);
            const accepterSocket = io.sockets.sockets.get(accepter.socketId);

            if (requesterSocket) requesterSocket.join(roomId);
            if (accepterSocket) accepterSocket.join(roomId);

            io.to(requester.socketId).emit("pair-success", { pairedWith: accepterId, roomId });
            io.to(accepter.socketId).emit("pair-success", { pairedWith: requesterId, roomId });
        }
    });

});

server.listen(3000, () => {
    console.log("🚀 SyncBridge Server Running");
});