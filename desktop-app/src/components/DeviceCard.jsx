export default function DeviceCard({ 
    device, 
    currentDeviceId, 
    onPairClick, 
    onUnpairClick, 
    pairedDevices = {}, // 💡 ডিফোল্ট অবজেক্ট দেওয়া হলো যেন undefined এরর না আসে
    sentRequestTo 
}) {
    const isMe = device.deviceId === currentDeviceId;
    
    // 💡 অবজেক্টের ভেতর এই ডিভাইস আইডিটি 'Key' হিসেবে আছে কিনা তা একদম নিশ্চিতভাবে চেক করা
    const isPairedWithThisDevice = pairedDevices && Object.prototype.hasOwnProperty.call(pairedDevices, device.deviceId);
    
    const isWaitingForThisDevice = sentRequestTo === device.deviceId;

    return (
        <div
            style={{
                border: isPairedWithThisDevice ? "1px solid #dc3545" : "1px solid gray",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: isPairedWithThisDevice ? "#fff5f5" : "#fff" // পেয়ারড হলে হালকা লালচে ব্যাকগ্রাউন্ড দিবে
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
                    <strong>Status:</strong> {isPairedWithThisDevice ? "🔒 Paired" : (device.online ? "🟢 Online" : "🔴 Offline")}
                </p>
            </div>

            {!isMe && (
                <div>
                    {isPairedWithThisDevice ? (
                        /* 🔴 ডিসকানেক্ট বাটন */
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                console.log("Button Clicked for ID:", device.deviceId); // 💡 ডিবাগিং লগ
                                onUnpairClick(device.deviceId);
                            }}
                            style={{
                                background: "#dc3545",
                                color: "white",
                                border: "none",
                                padding: "8px 15px",
                                borderRadius: "5px",
                                cursor: "pointer", // কার্সার পয়েন্টার নিশ্চিত করা হলো
                                fontWeight: "bold",
                                position: "relative",
                                zIndex: 10 // বাটনটি যেন অন্য কোনো লেয়ারের নিচে ঢাকা না পড়ে
                            }}
                        >
                            Disconnect
                        </button>
                    ) : isWaitingForThisDevice ? (
                        /* ⏳ রিকোয়েস্ট পাঠানো অবস্থা */
                        <span style={{ color: "#ffc107", fontWeight: "bold", fontSize: "14px" }}>
                            ⏳ Sending Request...
                        </span>
                    ) : (
                        /* 🔵 নরমাল স্টেট: পেয়ার বাটন */
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