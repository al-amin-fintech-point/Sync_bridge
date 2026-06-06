/*
 * FILE: /home/al-amin/Al-amin/Project/Sync_bridge/desktop-app/src/components/DeviceCard.jsx
 * DESCRIPTION: Premium UI component for displaying individual network devices and their connection states.
 */

export default function DeviceCard( { 
    device, 
    currentDeviceId, 
    onPairClick, 
    onUnpairClick, 
    pairedDevices = {}, 
    sentRequestTo 
} ) {
    const isMe = device.deviceId === currentDeviceId;
    
    /**
     * Determines if the current device is actively paired with this instance by checking
     * the presence of the device ID within the paired devices object mapping.
     */
    const isPairedWithThisDevice = pairedDevices && Object.prototype.hasOwnProperty.call( pairedDevices, device.deviceId );
    
    /**
     * Checks if a pairing request has been initiated and is currently pending for this device.
     */
    const isWaitingForThisDevice = sentRequestTo === device.deviceId;

    const styles = {
        card: {
            background: isPairedWithThisDevice 
                ? "rgba( 16, 185, 129, 0.05 )" 
                : "rgba( 30, 41, 59, 0.7 )",
            border: isPairedWithThisDevice 
                ? "1px solid rgba( 16, 185, 129, 0.3 )" 
                : "1px solid rgba( 255, 255, 255, 0.1 )",
            padding: "20px",
            marginBottom: "16px",
            borderRadius: "16px",
            backdropFilter: "blur( 12px )",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "all 0.3s ease",
            boxShadow: isPairedWithThisDevice 
                ? "0 4px 20px rgba( 16, 185, 129, 0.1 )" 
                : "0 4px 12px rgba( 0, 0, 0, 0.2 )"
        },
        infoContainer: { 
            flex: 1 
        },
        deviceName: { 
            margin: "0 0 4px 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        badge: {
            fontSize: "10px",
            background: "rgba( 255, 255, 255, 0.1 )",
            padding: "2px 8px",
            borderRadius: "100px",
            color: "#94a3b8",
            fontWeight: "500",
            textTransform: "uppercase"
        },
        deviceId: { 
            margin: "0 0 8px 0",
            fontSize: "12px",
            fontFamily: "monospace",
            color: "#64748b" 
        },
        statusContainer: { 
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: "500"
        },
        statusIndicator: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isPairedWithThisDevice 
                ? "#10b981" 
                : ( device.online ? "#10b981" : "#ef4444" )
        },
        statusText: {
            color: isPairedWithThisDevice ? "#10b981" : "#94a3b8"
        },
        actions: {
            display: "flex",
            alignItems: "center"
        },
        button: {
            padding: "10px 20px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            transition: "all 0.2s ease",
            outline: "none"
        },
        disconnectBtn: {
            background: "rgba( 239, 68, 68, 0.1 )",
            color: "#ef4444",
            border: "1px solid rgba( 239, 68, 68, 0.2 )"
        },
        pairBtn: {
            background: device.online 
                ? "linear-gradient( 135deg, #6366f1 0%, #4f46e5 100% )" 
                : "#334155",
            color: "#ffffff",
            opacity: device.online ? 1 : 0.5,
            boxShadow: device.online ? "0 4px 12px rgba( 99, 102, 241, 0.3 )" : "none"
        },
        pendingText: { 
            color: "#f59e0b", 
            fontWeight: "600", 
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
        }
    };

    return (
        <div style={ styles.card }>
            <div style={ styles.infoContainer }>
                <h3 style={ styles.deviceName }>
                    { device.deviceName } 
                    { isMe && <span style={ styles.badge }>Your Device</span> }
                </h3>
                <p style={ styles.deviceId }>
                    { device.deviceId }
                </p>
                <div style={ styles.statusContainer }>
                    <span style={ styles.statusIndicator }></span>
                    <span style={ styles.statusText }>
                        { isPairedWithThisDevice ? "Securely Paired" : ( device.online ? "Available" : "Offline" ) }
                    </span>
                </div>
            </div>

            { !isMe && (
                <div style={ styles.actions }>
                    { isPairedWithThisDevice ? (
                        /** Active Disconnection Action */
                        <button
                            type="button"
                            onClick={ ( e ) => {
                                e.preventDefault();
                                onUnpairClick( device.deviceId );
                            } }
                            style={ { ...styles.button, ...styles.disconnectBtn } }
                        >
                            Disconnect
                        </button>
                    ) : isWaitingForThisDevice ? (
                        /** Pending Connection State */
                        <span style={ styles.pendingText }>
                            <span style={ { animation: "pulse 2s infinite" } }>⏳</span> 
                            Pairing Request Sent...
                        </span>
                    ) : (
                        /** Primary Paring Action */
                        <button
                            onClick={ () => onPairClick( device.deviceId ) }
                            disabled={ !device.online }
                            style={ { ...styles.button, ...styles.pairBtn, cursor: device.online ? "pointer" : "not-allowed" } }
                        >
                            Connect Device
                        </button>
                    ) }
                </div>
            ) }
        </div>
    );
}