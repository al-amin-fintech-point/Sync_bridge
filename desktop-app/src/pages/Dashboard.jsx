/**
 * ============================================================================
 * @file        /home/al-amin/Al-amin/Project/Sync_bridge/desktop-app/src/pages/Dashboard.jsx
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Core Dashboard Page Component
 * @version     1.2.0
 * @date        2026-06-06
 * @academic    Final Year Project ( B.Sc. in Computer Science & Engineering )
 * @author      Md Al-Amin ( Associate Software Engineer )
 * @email       mdallamininfo@gmail.com
 * @phone       +880 1300-385188
 * @github      https://github.com/al-amin5188/Sync_bridge
 * @description Central command center for the SyncBridge mesh network application
 * incorporating dual-hook core handshakes and clipboard distribution syncs.
 * @copyright   (c) 2026 Md Al-Amin. All rights reserved.
 * ============================================================================
 */

import { useState } from "react";
import Header from "../components/Header";
import DeviceList from "../components/DeviceList";
import useDevices from "../hooks/useDevices";
import { QRCodeSVG } from "qrcode.react";

import useClipboardSync from "../hooks/useClipboardSync";

import useFileTransfer from "../hooks/useFileTransfer";
import FileShare from "../components/FileShare";

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
        disconnectPair,
        emitFileSocketEvent
    } = useDevices();

    // Isolated Clipboard Synchronization Engine ( Hook Triggered Inline )
    const { lastCopiedText } = useClipboardSync( pairedDevices );

    // High-Volume Binary Data Streaming Engine with Explicit Consent Handshakes
    const { 
        isSending, 
        isReceiving, 
        transferProgress, 
        transferStatus, 
        showIncomingAlert,
        incomingFileMeta,
        streamFile,
        acceptIncomingFile,
        declineIncomingFile
    } = useFileTransfer( socketId, pairedDevices );

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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px"
        },
        infoContainer: {
            display: "flex",
            gap: "30px",
            alignItems: "center"
        },
        qrContainer: {
            background: "#ffffff",
            padding: "12px",
            borderRadius: "16px",
            boxShadow: "0 10px 25px rgba( 0, 0, 0, 0.3 )"
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
        clipboardBadge: {
            fontSize: "11px",
            background: "rgba( 99, 102, 241, 0.15 )",
            color: "#818cf8",
            border: "1px solid rgba( 99, 102, 241, 0.3 )",
            padding: "4px 10px",
            borderRadius: "20px",
            display: "inline-block",
            marginTop: "8px",
            fontWeight: "500",
            width: "fit-content"
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
            letterSpacing: pinInput ? "8px" : "normal",
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
        },
        fileMetaBox: {
            background: "rgba( 15, 23, 42, 0.4 )", 
            padding: "16px", 
            borderRadius: "12px", 
            marginBottom: "24px", 
            textAlign: "left"
        }
    };

    return (
        <div style={ styles.wrapper }>
            <div style={ styles.container }>
                <Header />

                <div style={ styles.userCard }>
                    <div style={ styles.infoContainer }>
                        <div style={ styles.infoGroup }>
                            <span style={ styles.label }>Current Device ID</span>
                            <span style={ styles.value }>{ deviceId }</span>
                            { /* Phase 3 Clipboard Status Indicator */ }
                            { lastCopiedText && (
                                <span style={ styles.clipboardBadge }>
                                    📋 Clipboard Active Syncing
                                </span>
                            ) }
                            <div style={ { ...styles.infoGroup, marginTop: "15px" } }>
                                <span style={ styles.label }>Active Socket Session</span>
                                <span style={ styles.value }>{ socketId }</span>
                            </div>
                        </div>
                    </div>

                    <div style={ styles.qrContainer }>
                        <QRCodeSVG 
                            value={ deviceId || "loading" } 
                            size={ 100 }
                            level={ "H" }
                            includeMargin={ false }
                        />
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

                { /* File Transfer Operation Panel - Rendered dynamically on authorization handshakes */ }
                { pairedDeviceCount > 0 && (
                    <FileShare 
                        isSending={ isSending }
                        isReceiving={ isReceiving }
                        transferProgress={ transferProgress }
                        transferStatus={ transferStatus }
                        pairedDevices={ pairedDevices }
                        // onFileSelect={ ( file, targetDeviceId ) => streamFile( file, emitFileSocketEvent ) }

                        onFileSelect={ ( file, targetDeviceId ) => {
                            console.log( `🧭 FileShare selected target: ${targetDeviceId} for file: ${file.name}` );
                            streamFile( file, ( eventName, payload ) => {
                                emitFileSocketEvent( eventName, targetDeviceId, payload );
                            } );
                        }}
                    />
                ) }

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

            { showIncomingAlert && incomingFileMeta && (
                <div style={ styles.modalOverlay }>
                    <div style={ styles.modalContent }>
                        <span style={ { fontSize: "40px", display: "block", marginBottom: "12px" } }>📥</span>
                        <h3 style={ { margin: "0 0 8px 0", fontSize: "20px" } }>Incoming File Asset</h3>
                        <p style={ { color: "#94a3b8", fontSize: "14px", lineHeight: "1.5", marginBottom: "8px" } }>
                            A paired mesh node wants to share a file with you.
                        </p>
                        
                        <div style={ styles.fileMetaBox }>
                            <p style={ { margin: "0 0 4px 0", fontSize: "13px", color: "#94a3b8", fontWeight: "600" } }>File Name:</p>
                            <p style={ { margin: "0 0 12px 0", fontSize: "14px", color: "#ffffff", fontFamily: "monospace", wordBreak: "break-all" } }>{ incomingFileMeta.fileName }</p>
                            
                            <p style={ { margin: "0 0 4px 0", fontSize: "13px", color: "#94a3b8", fontWeight: "600" } }>File Size:</p>
                            <p style={ { margin: "0", fontSize: "14px", color: "#6366f1", fontWeight: "600" } }>{ ( incomingFileMeta.fileSize / ( 1024 * 1024 ) ).toFixed( 2 ) } MB</p>
                        </div>

                        <div>
                            <button 
                                onClick={ acceptIncomingFile } 
                                style={ { ...styles.button, ...styles.primaryBtn } }
                            >
                                Accept & Download
                            </button>
                            <button 
                                onClick={ declineIncomingFile } 
                                style={ { ...styles.button, ...styles.secondaryBtn } }
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
}