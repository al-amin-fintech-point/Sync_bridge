import Header from "../components/Header";
import DeviceList from "../components/DeviceList";

import useDevices from "../hooks/useDevices";

export default function Dashboard() {

    const {
        socketId,
        deviceId,
        devices
    } = useDevices();

    return (

        <div style={{ padding: "30px" }}>

            <Header />

            <h2>Your Device</h2>

            <p>
                <strong>Device ID:</strong>
                <br />
                {deviceId}
            </p>

            <p>
                <strong>Socket ID:</strong>
                <br />
                {socketId}
            </p>

            <hr />

            <DeviceList devices={devices} />

        </div>
    );
}