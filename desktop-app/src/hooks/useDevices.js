import { useEffect, useState } from "react";

import socket from "../services/socket";
import { getDeviceId } from "../utils/device";

export default function useDevices() {

    const [socketId, setSocketId] = useState("");
    const [deviceId, setDeviceId] = useState("");
    const [devices, setDevices] = useState([]);

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

        return () => {

            socket.off("connect");
            socket.off("devices-updated");

        };

    }, []);

    return {
        socketId,
        deviceId,
        devices
    };
}