export default function DeviceCard({ device, currentDeviceId, onPairClick, pairingInfo }) {
    // চেক করা হচ্ছে এটা নিজের ল্যাপটপ কিনা
    const isMe = device.deviceId === currentDeviceId;
    
    // চেক করা হচ্ছে এই নির্দিষ্ট ডিভাইসটির সাথে অলরেডি পেয়ারিং সাকসেসফুল কিনা
    const isPairedWithThisDevice = pairingInfo && pairingInfo.pairedWith === device.deviceId;

    return (
        <div
            style={{
                border: "1px solid gray",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "between",
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

            {/* 🛠️ পেয়ার বাটন কন্ডিশনাল রেন্ডারিং */}
            {!isMe && (
                <div>
                    {isPairedWithThisDevice ? (
                        <span style={{ background: "#4CAF50", color: "white", padding: "8px 12px", borderRadius: "5px", fontWeight: "bold" }}>
                            ✓ Paired
                        </span>
                    ) : (
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