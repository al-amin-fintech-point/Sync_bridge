import { useState } from "react";
import Header from "../components/Header";
import DeviceList from "../components/DeviceList";
import useDevices from "../hooks/useDevices";

export default function Dashboard() {
    const {
        socketId,
        deviceId,
        devices,
        incomingRequest,
        pairedDevices, // 💡 pairingInfo বদলে এখানে 'pairedDevices' রিসিভ করা হলো
        sentRequestTo,
        generatedPin,
        pairError,
        sendPairRequest,
        acceptPairRequest,
        rejectPairRequest,
        disconnectPair
    } = useDevices();

    const [pinInput, setPinInput] = useState("");

    // 💡 pairedDevices অবজেক্টের ভেতর কয়টি ডিভাইস কানেক্টেড আছে তা গণনা করা
    const pairedDeviceCount = pairedDevices ? Object.keys(pairedDevices).length : 0;

    return (
        <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
            <Header />

            <h2>Your Device</h2>
            <p><strong>Device ID:</strong><br />{deviceId}</p>
            <p><strong>Socket ID:</strong><br />{socketId}</p>

            {/* 🔒 যদি অন্তত একটি ডিভাইসও পেয়ারড থাকে, তবে মেশ নেটওয়ার্ক স্ট্যাটাস বার দেখাবে */}
            {pairedDeviceCount > 0 && (
                <div style={{ background: "#e0f7fa", padding: "12px", borderRadius: "6px", marginBottom: "20px", border: "1px solid #00acc1" }}>
                    <p style={{ margin: 0, color: "#006064" }}>
                        🔒 <strong>Status: Connected to Mesh Network</strong> ({pairedDeviceCount} {pairedDeviceCount === 1 ? "device" : "devices"} paired)
                    </p>
                </div>
            )}

            <hr />

            <DeviceList 
                devices={devices} 
                currentDeviceId={deviceId}
                onPairClick={sendPairRequest}
                onUnpairClick={disconnectPair}
                pairedDevices={pairedDevices} // 💡 এটি এখন হুক থেকে ডিফাইনড ডেটা পাবে
                sentRequestTo={sentRequestTo}
            />

            {/* 🔑 ১. রিকোয়েস্ট সেন্ডারের জন্য পিন ডিসপ্লে মোডাল (Cancel বাটনসহ) */}
            {generatedPin && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999
                }}>
                    <div style={{ background: "#fff", padding: "30px", borderRadius: "8px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
                        <h3 style={{ margin: "0 0 10px 0" }}>🔑 Secure Pairing PIN</h3>
                        <p style={{ color: "#555" }}>Enter this PIN on the target device to pair securely:</p>
                        <h1 style={{ letterSpacing: "8px", color: "#007BFF", background: "#f0f0f0", padding: "10px", borderRadius: "5px", margin: "15px 0" }}>
                            {generatedPin}
                        </h1>
                        <button 
                            onClick={rejectPairRequest} 
                            style={{ background: "#f44336", color: "#fff", padding: "8px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" }}
                        >
                            Cancel Request
                        </button>
                    </div>
                </div>
            )}

            {/* 🤝 ২. রিকোয়েস্ট রিসিভারের জন্য পিন ইনপুট মোডাল */}
            {incomingRequest && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999
                }}>
                    <div style={{ background: "#fff", padding: "25px", borderRadius: "8px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.3)", minWidth: "320px" }}>
                        <h3 style={{ margin: "0 0 10px 0" }}>🤝 Pairing Request</h3>
                        <p style={{ color: "#555", marginBottom: "15px" }}>
                            <strong>{incomingRequest.fromDeviceName}</strong> wants to pair with you.
                        </p>
                        
                        <input 
                            type="text" 
                            maxLength={4}
                            placeholder="Enter 4-Digit PIN"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            style={{ padding: "10px", fontSize: "18px", width: "80%", textAlign: "center", borderRadius: "5px", border: "1px solid #ccc", marginBottom: "10px", letterSpacing: "4px" }}
                        />

                        {pairError && <p style={{ color: "#dc3545", margin: "5px 0", fontSize: "14px", fontWeight: "bold" }}>{pairError}</p>}

                        <div style={{ marginTop: "20px" }}>
                            <button 
                                onClick={() => {
                                    acceptPairRequest(pinInput);
                                    setPinInput(""); 
                                }} 
                                style={{ background: "#4CAF50", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "4px", marginRight: "10px", cursor: "pointer", fontWeight: "bold" }}
                            >
                                Verify & Accept
                            </button>
                            <button 
                                onClick={() => {
                                    rejectPairRequest();
                                    setPinInput("");
                                }} 
                                style={{ background: "#f44336", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}