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

const devicePairs = {};

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
            
            // রুম আইডি জেনারেট (সবসময় ছোট আইডি আগে রেখে ইউনিক রুম আইডি করা ভালো)
            const roomId = [requesterId, accepterId].sort().join("-");
            
            const requesterSocket = io.sockets.sockets.get(requester?.socketId);
            const accepterSocket = io.sockets.sockets.get(accepter?.socketId);

            if (requesterSocket) requesterSocket.join(roomId);
            if (accepterSocket) accepterSocket.join(roomId);

            // 💡 মেমরিতে মাল্টিপল পেয়ার সেভ করা
            if (!devicePairs[requesterId]) devicePairs[requesterId] = {};
            if (!devicePairs[accepterId]) devicePairs[accepterId] = {};
            
            devicePairs[requesterId][accepterId] = roomId;
            devicePairs[accepterId][requesterId] = roomId;

            // উভয়কে তাদের নতুন পেয়ারড ডিভাইসের লিস্ট পাঠানো
            io.to(requester.socketId).emit("pair-success", { 
                pairedDevices: devicePairs[requesterId] 
            });
            io.to(accepter.socketId).emit("pair-success", { 
                pairedDevices: devicePairs[accepterId] 
            });
            
            delete activePairRequests[requesterId];
            console.log(`✅ Multi-Pair successful for room: ${roomId}`);
        } else {
            io.to(accepter?.socketId).emit("pair-error", { message: "Invalid PIN! Please try again." });
        }
    });

    // 🔌 ২. ডিসকানেক্ট করা (নির্দিষ্ট ডিভাইস আনপেয়ার করা)
    socket.on("disconnect-pair", ({ requesterId, targetId }) => {
        console.log(`🔌 Unpairing requested between ${requesterId} and ${targetId}`);

        const roomId = [requesterId, targetId].sort().join("-");
        const requester = connectedDevices[requesterId];
        const target = connectedDevices[targetId];

        const requesterSocket = io.sockets.sockets.get(requester?.socketId);
        const targetSocket = io.sockets.sockets.get(target?.socketId);

        if (requesterSocket) requesterSocket.leave(roomId);
        if (targetSocket) targetSocket.leave(roomId);

        // মেমরি থেকে এই স্পেসিফিক পেয়ারটি ডিলিট করা
        if (devicePairs[requesterId]) delete devicePairs[requesterId][targetId];
        if (devicePairs[targetId]) delete devicePairs[targetId][requesterId];

        // উভয়কে আপডেটেড লিস্ট পাঠানো
        if (requester) io.to(requester.socketId).emit("unpair-success", { pairedDevices: devicePairs[requesterId] || {} });
        if (target) io.to(target.socketId).emit("unpair-success", { pairedDevices: devicePairs[targetId] || {} });
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