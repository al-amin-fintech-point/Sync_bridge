export default function DeviceCard({ device }) {

    return (

        <div
            style={{
                border: "1px solid gray",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "10px"
            }}
        >

            <h3>{device.deviceName}</h3>

            <p>
                <strong>Device ID:</strong>
                <br />
                {device.deviceId}
            </p>

            <p>
                <strong>Status:</strong>
                <br />
                {device.online ? "🟢 Online" : "🔴 Offline"}
            </p>

        </div>
    );
}