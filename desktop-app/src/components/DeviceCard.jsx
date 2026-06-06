export default function DeviceCard({ device, currentDeviceId, onPairClick, onUnpairClick, pairingInfo, sentRequestTo }) {
    const isMe = device.deviceId === currentDeviceId;
    
    const isPairedWithThisDevice = pairedDevices && !!pairedDevices[device.deviceId]; 
    
    const isWaitingForThisDevice = sentRequestTo === device.deviceId;

    return (
        <div
            style={{
                border: "1px solid gray",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
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
                        /* 🔴 ডিসকানেক্ট বাটন */
                        <button
                            onClick={() => onUnpairClick(device.deviceId)}
                            style={{
                                background: "#dc3545",
                                color: "white",
                                border: "none",
                                padding: "8px 15px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            Disconnect
                        </button>
                    ) : isWaitingForThisDevice ? (
                        /* ⏳ রিকোয়েস্ট পাঠানো অবস্থা */
                        <span style={{ color: "#ffc107", fontWeight: "bold", fontSize: "14px" }}>
                            ⏳ Sending Request...
                        </span>
                    ) : (
                        /* 🔵 নরমাল স্টেট: পেয়ার বাটন */
                        <button
                            onClick={() => onPairClick(device.deviceId)}
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