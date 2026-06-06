import DeviceCard from "./DeviceCard";

export default function DeviceList({ devices, currentDeviceId, onPairClick, pairingInfo }) {
    return (
        <div>
            <h2>Connected Devices</h2>
            {
                devices.map((device) => (
                    <DeviceCard
                        key={device.deviceId}
                        device={device}
                        currentDeviceId={currentDeviceId}
                        onPairClick={onPairClick}
                        pairingInfo={pairingInfo}
                    />
                ))
            }
        </div>
    );
}