import Header from "../components/Header";
import DeviceList from "../components/DeviceList";

import useDevices from "../hooks/useDevices";

export default function Dashboard() {

    const {
        socketId,
        deviceId,
        devices,
        incomingRequest,
        pairingInfo,
        sendPairRequest,
        acceptPairRequest,
        rejectPairRequest
    } = useDevices();

    return (
        <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
            <Header />

            <h2>Your Device</h2>
            <p><strong>Device ID:</strong><br />{deviceId}</p>
            <p><strong>Socket ID:</strong><br />{socketId}</p>

            {pairingInfo && (
                <div style={{ background: "#e0f7fa", padding: "12px", borderRadius: "6px", marginBottom: "20px", border: "1px solid #00acc1" }}>
                    <p style={{ margin: 0, color: "#006064" }}>
                        🔒 <strong>Status: Paired Securely</strong> (Room: {pairingInfo.roomId})
                    </p>
                </div>
            )}

            <hr />

            <DeviceList 
                devices={devices} 
                currentDeviceId={deviceId}
                onPairClick={sendPairRequest}
                pairingInfo={pairingInfo}
            />

            {incomingRequest && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999
                }}>
                    <div style={{ background: "#fff", padding: "25px", borderRadius: "8px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.3)", minWidth: "300px" }}>
                        <h3 style={{ margin: "0 0 10px 0" }}>🤝 Pairing Request</h3>
                        <p style={{ color: "#555" }}>
                            <strong>{incomingRequest.fromDeviceName}</strong> wants to pair with you.
                        </p>
                        <div style={{ marginTop: "20px" }}>
                            <button onClick={acceptPairRequest} style={{ background: "#4CAF50", color: "#fff", padding: "8px 20px", border: "none", borderRadius: "4px", marginRight: "10px", cursor: "pointer", fontWeight: "bold" }}>
                                Accept
                            </button>
                            <button onClick={rejectPairRequest} style={{ background: "#f44336", color: "#fff", padding: "8px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // return (

    //     <div style={{ padding: "30px" }}>

    //         <Header />

    //         <h2>Your Device</h2>

    //         <p>
    //             <strong>Device ID:</strong>
    //             <br />
    //             {deviceId}
    //         </p>

    //         <p>
    //             <strong>Socket ID:</strong>
    //             <br />
    //             {socketId}
    //         </p>

    //         <hr />

    //         <DeviceList devices={devices} />

    //     </div>
    // );
}