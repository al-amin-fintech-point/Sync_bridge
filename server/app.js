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

const activePairRequests = {};

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
        console.log(`📩 Pair request triggered from ${fromDeviceId} to ${toDeviceId}`);
        
        const targetDevice = connectedDevices[toDeviceId];
        const senderDevice = connectedDevices[fromDeviceId];
        
        if (targetDevice && targetDevice.online && senderDevice) {
            const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
            
            activePairRequests[fromDeviceId] = {
                pin: generatedPin,
                targetDeviceId: toDeviceId,
                timestamp: new Date()
            };

            socket.emit("pair-pin-generated", { pin: generatedPin, toDeviceName: targetDevice.deviceName });

            io.to(targetDevice.socketId).emit("receive-pair-request", {
                fromDeviceId: fromDeviceId,
                fromDeviceName: senderDevice.deviceName
            });
            
            console.log(`🔑 PIN [${generatedPin}] generated for pairing.`);
        }
    });

    socket.on("accept-pair-request", ({ requesterId, accepterId, enteredPin }) => {
        console.log(`🤝 Verifying PIN for ${requesterId} and ${accepterId}`);
        
        const pendingRequest = activePairRequests[requesterId];
        const requester = connectedDevices[requesterId];
        const accepter = connectedDevices[accepterId];

        if (pendingRequest && pendingRequest.pin === enteredPin && pendingRequest.targetDeviceId === accepterId) {
            
            const roomId = `room-${requesterId}-${accepterId}`;
            const requesterSocket = io.sockets.sockets.get(requester?.socketId);
            const accepterSocket = io.sockets.sockets.get(accepter?.socketId);

            if (requesterSocket) requesterSocket.join(roomId);
            if (accepterSocket) accepterSocket.join(roomId);

            io.to(requester.socketId).emit("pair-success", { pairedWith: accepterId, roomId });
            io.to(accepter.socketId).emit("pair-success", { pairedWith: requesterId, roomId });
            
            delete activePairRequests[requesterId];
            console.log(`✅ PIN Verified! Pair successful.`);
        } else {
            io.to(accepter?.socketId).emit("pair-error", { message: "Invalid PIN! Please try again." });
            console.log(`❌ Invalid PIN entered by target device.`);
        }
    });

    socket.on("disconnect-pair", ({ roomId, requesterId, targetId }) => {
        console.log(`🔌 Unpairing requested between ${requesterId} and ${targetId}`);

        const requester = connectedDevices[requesterId];
        const target = connectedDevices[targetId];

        const requesterSocket = io.sockets.sockets.get(requester?.socketId);
        const targetSocket = io.sockets.sockets.get(target?.socketId);

        if (requesterSocket) requesterSocket.leave(roomId);
        if (targetSocket) targetSocket.leave(roomId);

        if (requester) io.to(requester.socketId).emit("unpair-success");
        if (target) io.to(target.socketId).emit("unpair-success");
    });

    socket.on("cancel-pair-request", ({ requesterId }) => {
        console.log(`🚫 Pair request canceled by requester or target for: ${requesterId}`);
        
        const pendingRequest = activePairRequests[requesterId];
        const requester = connectedDevices[requesterId];
        
        if (pendingRequest) {
            const target = connectedDevices[pendingRequest.targetDeviceId];
            
            if (requester) io.to(requester.socketId).emit("pair-canceled");
            if (target) io.to(target.socketId).emit("pair-canceled");
            
            delete activePairRequests[requesterId];
        }
    });

});

server.listen(3000, () => {
    console.log("🚀 SyncBridge Server Running");
});