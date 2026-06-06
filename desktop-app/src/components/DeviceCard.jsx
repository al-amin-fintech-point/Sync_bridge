export default function DeviceCard({ device, currentDeviceId, onPairClick, pairingInfo }) {
    const isMe = device.deviceId === currentDeviceId;
    const isPairedWithThisDevice = pairingInfo && pairingInfo.pairedWith === device.deviceId;

    return (
        <div
            style={{
                border: "1px solid gray",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between", // 👈 এখানে 'space-between' করে দেওয়া হয়েছে
                alignItems: "center"
            }}
        >
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 5px 0" }}>
                    {device.deviceName} {isMe && <span style={{ fontSize: "12px", color: "gray" }}>(Your Device)</span>}
                </h3>
                <p style={{ margin: "0 0 5px 0" }}>
                    <strong>Device ID:</strong> {device.deviceId}
                </p>
                <p style={{ margin: 0 }}>
                    <strong>Status:</strong> {device.online ? "🟢 Online" : "🔴 Offline"}
                </p>
            </div>

            {!isMe && (
                <div>
                    {isPairedWithThisDevice ? (
                        <span style={{ background: "#4CAF50", color: "white", padding: "8px 12px", borderRadius: "5px", fontWeight: "bold" }}>
                            ✓ Paired
                        </span>
                    ) : (
                        <button
                            onClick={() => {
                                console.log("Button Clicked for device:", device.deviceId); // 👈 ট্রেস করার জন্য লগ
                                onPairClick(device.deviceId);
                            }}
                            disabled={!device.online}
                            style={{
                                background: device.online ? "#007BFF" : "#CCCCCC",
                                color: "white",
                                border: "none",
                                padding: "8px 15px",
                                borderRadius: "5px",
                                cursor: device.online ? "pointer" : "not-allowed",
                                fontWeight: "bold"
                            }}
                        >
                            Pair Device
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}