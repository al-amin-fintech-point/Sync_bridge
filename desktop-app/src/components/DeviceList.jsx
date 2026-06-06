/**
 * FILE: /home/al-amin/Al-amin/Project/Sync_bridge/desktop-app/src/components/DeviceList.jsx
 * DESCRIPTION: Container component for rendering the active list of network-reachable devices.
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