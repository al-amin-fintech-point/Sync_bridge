/**
 * ============================================================================
 * @file        src/components/DeviceList.jsx
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Core Custom React Hook
 * @version     1.1.0
 * @date        2026-06-06
 * @academic    Final Year Project ( B.Sc. in Computer Science & Engineering )
 * @author      Md Al-Amin ( Associate Software Engineer )
 * @email       mdallamininfo@gmail.com
 * @phone       +880 1300-385188
 * @github      https://github.com/al-amin5188/Sync_bridge
 * @description Container component for rendering the active list of network-reachable devices.
 * @copyright   (c) 2026 Md Al-Amin. All rights reserved.
 * ============================================================================
 */

import DeviceCard from "./DeviceCard";

export default function DeviceList( { 
    devices, 
    currentDeviceId, 
    onPairClick, 
    onUnpairClick, 
    pairedDevices,
    sentRequestTo  
} ) {
    const styles = {
        container: {
            marginTop: "32px"
        },
        header: {
            fontSize: "20px",
            fontWeight: "700",
            color: "#f8fafc",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
        },
        list: {
            display: "flex",
            flexDirection: "column"
        }
    };

    return (
        <div style={ styles.container }>
            <h2 style={ styles.header }>
                <span style={ { color: "#6366f1" } }>📡</span> Available Network Devices
            </h2>
            <div style={ styles.list }>
                {
                    devices.map( ( device ) => (
                        <DeviceCard
                            key={ device.deviceId }
                            device={ device }
                            currentDeviceId={ currentDeviceId }
                            onPairClick={ onPairClick }
                            onUnpairClick={ onUnpairClick } 
                            pairedDevices={ pairedDevices }
                            sentRequestTo={ sentRequestTo }   
                        />
                    ) )
                }
            </div>
        </div>
    );
}