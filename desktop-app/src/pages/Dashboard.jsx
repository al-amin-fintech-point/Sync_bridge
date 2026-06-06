/**
 * FILE: /home/al-amin/Al-amin/Project/Sync_bridge/desktop-app/src/pages/Dashboard.jsx
 * DESCRIPTION: Central command center for the SyncBridge mesh network application.
 */

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
        pairedDevices, 
        sentRequestTo,
        generatedPin,
        pairError,
        sendPairRequest,
        acceptPairRequest,
        rejectPairRequest,
        disconnectPair
    } = useDevices();

    const [ pinInput, setPinInput ] = useState( "" );

    /**
     * Calculates the total number of currently established secure connections
     * within the localized mesh network.
     */
    const pairedDeviceCount = pairedDevices ? Object.keys( pairedDevices ).length : 0;

    const styles = {
        wrapper: {
            minHeight: "100vh",
            background: "#0f172a",
            color: "#f1f5f9",
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            padding: "40px"
        },
        container: {
            maxWidth: "900px",
            margin: "0 auto"
        },
        userCard: {
            background: "rgba( 30, 41, 59, 0.5 )",
            border: "1px solid rgba( 255, 255, 255, 0.1 )",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "32px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px"
        },
        infoGroup: {
            display: "flex",
            flexDirection: "column",
            gap: "4px"
        },
        label: {
            fontSize: "12px",
            fontWeight: "600",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
        },
        value: {
            fontSize: "15px",
            fontWeight: "500",
            color: "#f8fafc",
            fontFamily: "monospace",
            wordBreak: "break-all"
        },
        statusBanner: {
            background: "linear-gradient( 135deg, rgba( 16, 185, 129, 0.1 ) 0%, rgba( 5, 150, 105, 0.1 ) 100% )",
            border: "1px solid rgba( 16, 185, 129, 0.2 )",
            padding: "16px 24px",
            borderRadius: "12px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
        },
        statusIcon: {
            fontSize: "20px"
        },
        statusText: {
            margin: 0,
            fontSize: "14px",
            color: "#10b981",
            fontWeight: "600"
        },
        modalOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba( 2, 6, 23, 0.8 )",
            backdropFilter: "blur( 8px )",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease"
        },
        modalContent: {
            background: "#1e293b",
            border: "1px solid rgba( 255, 255, 255, 0.1 )",
            padding: "40px",
            borderRadius: "24px",
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba( 0, 0, 0, 0.5 )",
            maxWidth: "400px",
            width: "90%"
        },
        pinDisplay: {
            letterSpacing: "12px",
            color: "#6366f1",
            background: "rgba( 99, 102, 241, 0.1 )",
            padding: "20px",
            borderRadius: "16px",
            margin: "24px 0",
            fontSize: "36px",
            fontWeight: "800",
            border: "1px dashed rgba( 99, 102, 241, 0.3 )"
        },
        input: {
            background: "rgba( 15, 23, 42, 0.5 )",
            border: "1px solid rgba( 255, 255, 255, 0.1 )",
            padding: "16px",
            fontSize: "24px",
            width: "100%",
            textAlign: "center",
            borderRadius: "12px",
            color: "#ffffff",
            marginBottom: "16px",
            letterSpacing: "8px",
            outline: "none",
            transition: "border-color 0.2s ease"
        },
        button: {
            padding: "12px 24px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            transition: "all 0.2s ease"
        },
        primaryBtn: {
            background: "linear-gradient( 135deg, #6366f1 0%, #4f46e5 100% )",
            color: "#ffffff",
            width: "100%",
            marginBottom: "12px"
        },
        secondaryBtn: {
            background: "transparent",
            color: "#94a3b8",
            border: "1px solid rgba( 148, 163, 184, 0.2 )",
            width: "100%"
        },
        errorText: {
            color: "#ef4444",
            fontSize: "13px",
            fontWeight: "600",
            marginTop: "-8px",
            marginBottom: "16px"
        }
    };

    return (
        <div style={ styles.wrapper }>
            <div style={ styles.container }>
                <Header />

                <div style={ styles.userCard }>
                    <div style={ styles.infoGroup }>
                        <span style={ styles.label }>Current Device ID</span>
                        <span style={ styles.value }>{ deviceId }</span>
                    </div>
                    <div style={ styles.infoGroup }>
                        <span style={ styles.label }>Active Socket Session</span>
                        <span style={ styles.value }>{ socketId }</span>
                    </div>
                </div>

                { /** Network Status Visualization */ }
                { pairedDeviceCount > 0 && (
                    <div style={ styles.statusBanner }>
                        <span style={ styles.statusIcon }>🛡️</span>
                        <p style={ styles.statusText }>
                            Securely connected to { pairedDeviceCount } peer{ pairedDeviceCount === 1 ? "" : "s" } in the Mesh Network.
                        </p>
                    </div>
                ) }

                <div style={ { borderTop: "1px solid rgba( 255, 255, 255, 0.05 )", paddingTop: "8px" } }>
                    <DeviceList 
                        devices={ devices } 
                        currentDeviceId={ deviceId }
                        onPairClick={ sendPairRequest }
                        onUnpairClick={ disconnectPair }
                        pairedDevices={ pairedDevices } 
                        sentRequestTo={ sentRequestTo }
                    />
                </div>
            </div>

            { /** Outgoing Pairing Request PIN Verification Modal */ }
            { generatedPin && (
                <div style={ styles.modalOverlay }>
                    <div style={ styles.modalContent }>
                        <h3 style={ { margin: "0 0 8px 0", fontSize: "20px" } }>🔑 Verification Required</h3>
                        <p style={ { color: "#94a3b8", fontSize: "14px", lineHeight: "1.5" } }>
                            To establish a secure bridge, enter this temporary PIN on the physical device you are connecting to.
                        </p>
                        <div style={ styles.pinDisplay }>
                            { generatedPin }
                        </div>
                        <button 
                            onClick={ rejectPairRequest } 
                            style={ { ...styles.button, ...styles.secondaryBtn } }
                        >
                            Cancel Connection
                        </button>
                    </div>
                </div>
            ) }

            { /** Incoming Pairing Request Authentication Modal */ }
            { incomingRequest && (
                <div style={ styles.modalOverlay }>
                    <div style={ styles.modalContent }>
                        <h3 style={ { margin: "0 0 8px 0", fontSize: "20px" } }>🤝 Connection Request</h3>
                        <p style={ { color: "#94a3b8", fontSize: "14px", lineHeight: "1.5", marginBottom: "24px" } }>
                            <strong style={ { color: "#ffffff" } }>{ incomingRequest.fromDeviceName }</strong> is requesting to bridge with your device.
                        </p>
                        
                        <input 
                            type="text" 
                            maxLength={ 4 }
                            placeholder="----"
                            value={ pinInput }
                            onChange={ ( e ) => setPinInput( e.target.value ) }
                            style={ styles.input }
                        />

                        { pairError && <p style={ styles.errorText }>{ pairError }</p> }

                        <div style={ { marginTop: "8px" } }>
                            <button 
                                onClick={ () => {
                                    acceptPairRequest( pinInput );
                                    setPinInput( "" ); 
                                } } 
                                style={ { ...styles.button, ...styles.primaryBtn } }
                            >
                                Authenticate & Connect
                            </button>
                            <button 
                                onClick={ () => {
                                    rejectPairRequest();
                                    setPinInput( "" );
                                } } 
                                style={ { ...styles.button, ...styles.secondaryBtn } }
                            >
                                Decline Request
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
}