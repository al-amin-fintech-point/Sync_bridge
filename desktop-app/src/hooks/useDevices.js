import { useEffect, useState } from "react";

import socket from "../services/socket";
import { getDeviceId } from "../utils/device";

export default function useDevices() {

    const [socketId, setSocketId] = useState("");
    const [deviceId, setDeviceId] = useState("");
    const [devices, setDevices] = useState([]);

    const [incomingRequest, setIncomingRequest] = useState(null); // { fromDeviceId, fromDeviceName }
    const [pairingInfo, setPairingInfo] = useState(null); // { pairedWith, roomId }

    useEffect(() => {

        const savedDeviceId = getDeviceId();

        setDeviceId(savedDeviceId);

        socket.on("connect", () => {

            setSocketId(socket.id);

            socket.emit("register-device", {

                deviceId: savedDeviceId,
                deviceName: "Amin Desktop",
                deviceType: "desktop"

            });

        });

        socket.on("devices-updated", (allDevices) => {

            setDevices(allDevices);

        });

        socket.on("receive-pair-request", (data) => {
            setIncomingRequest(data);
        });

        socket.on("pair-success", (data) => {
            setPairingInfo(data);
            setIncomingRequest(null);
        });

        return () => {

            socket.off("connect");
            socket.off("devices-updated");

            socket.off("receive-pair-request");
            socket.off("pair-success");
        };

    }, []);

    const sendPairRequest = (targetDeviceId) => {
        socket.emit("send-pair-request", {
            fromDeviceId: deviceId,
            toDeviceId: targetDeviceId
        });
    };

    const acceptPairRequest = () => {
        if (incomingRequest) {
            socket.emit("accept-pair-request", {
                requesterId: incomingRequest.fromDeviceId,
                accepterId: deviceId
            });
        }
    };

    const rejectPairRequest = () => {
        setIncomingRequest(null);
    };

    return {
        socketId,
        deviceId,
        devices,
        incomingRequest,
        pairingInfo,
        sendPairRequest,
        acceptPairRequest,
        rejectPairRequest
    };
}

    // return {
    //     socketId,
    //     deviceId,
    //     devices
    // };
// }