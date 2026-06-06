import { useEffect, useState } from "react";
import socket from "../services/socket";
import { getDeviceId } from "../utils/device";

export default function useDevices() {
    const [socketId, setSocketId] = useState("");
    const [deviceId, setDeviceId] = useState("");
    const [devices, setDevices] = useState([]);
    
    const [incomingRequest, setIncomingRequest] = useState(null); 
    const [pairingInfo, setPairingInfo] = useState(null); 
    const [sentRequestTo, setSentRequestTo] = useState(null); 
    const [generatedPin, setGeneratedPin] = useState(""); 
    const [pairError, setPairError] = useState(""); 

    const [pairedDevices, setPairedDevices] = useState({});

    useEffect(() => {
        const savedDeviceId = getDeviceId();
        setDeviceId(savedDeviceId);

        const register = () => {
            setSocketId(socket.id);
            socket.emit("register-device", {
                deviceId: savedDeviceId,
                deviceName: "Amin Desktop",
                deviceType: "desktop"
            });
        };

        socket.on("connect", register);
        if (socket.connected) register();

        socket.on("devices-updated", (allDevices) => {
            setDevices(allDevices);
        });

        socket.on("receive-pair-request", (data) => {
            setIncomingRequest(data);
            setPairError(""); 
        });

        socket.on("pair-pin-generated", (data) => {
            setGeneratedPin(data.pin); 
        });

        socket.on("pair-success", (data) => {
            setPairedDevices(data.pairedDevices || {});
            setIncomingRequest(null);
            setSentRequestTo(null);
            setGeneratedPin("");
            setPairError("");
        });

        socket.on("pair-error", (data) => {
            setPairError(data.message);
        });

        socket.on("pair-canceled", () => {
            setIncomingRequest(null);
            setSentRequestTo(null);
            setGeneratedPin("");
            setPairError("");
        });

        socket.on("unpair-success", (data) => {
            setPairedDevices(data.pairedDevices || {});
            setSentRequestTo(null);
            setGeneratedPin("");
            setPairError("");
            alert("Device updated successfully!");
        });

        return () => {
            socket.off("connect");
            socket.off("devices-updated");
            socket.off("receive-pair-request");
            socket.off("pair-pin-generated");
            socket.off("pair-success");
            socket.off("pair-error");
            socket.off("pair-canceled");
            socket.off("unpair-success");
        };
    }, []);

    const sendPairRequest = (targetDeviceId) => {
        setSentRequestTo(targetDeviceId);
        socket.emit("send-pair-request", {
            fromDeviceId: deviceId,
            toDeviceId: targetDeviceId
        });
    };

    const acceptPairRequest = (enteredPin) => {
        if (incomingRequest) {
            socket.emit("accept-pair-request", {
                requesterId: incomingRequest.fromDeviceId,
                accepterId: deviceId,
                enteredPin: enteredPin
            });
        }
    };

    const rejectPairRequest = () => {
        const targetRequesterId = incomingRequest ? incomingRequest.fromDeviceId : deviceId;
        socket.emit("cancel-pair-request", { requesterId: targetRequesterId });
        setIncomingRequest(null);
        setPairError("");
    };

    const disconnectPair = (targetDeviceId) => {
        if (pairingInfo) {
            socket.emit("disconnect-pair", {
                roomId: pairingInfo.roomId,
                requesterId: deviceId,
                targetId: targetDeviceId
            });
        }
    };

    return {
        socketId,
        deviceId,
        devices,
        incomingRequest,
        pairedDevices,
        sentRequestTo,
        generatedPin, 
        pairError,     
        sendPairRequest,
        acceptPairRequest,
        rejectPairRequest,
        disconnectPair
    };
}