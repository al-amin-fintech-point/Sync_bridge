import DeviceCard from "./DeviceCard";

export default function DeviceList({ 
    devices, 
    currentDeviceId, 
    onPairClick, 
    onUnpairClick, // 💡 যোগ করা হয়েছে
    pairedDevices,
    sentRequestTo  // 💡 যোগ করা হয়েছে
}) {
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
                        onUnpairClick={onUnpairClick} // 💡 কার্ডে পাস করা হলো
                        pairedDevices={pairedDevices}
                        sentRequestTo={sentRequestTo}   // 💡 কার্ডে পাস করা হলো
                    />
                ))
            }
        </div>
    );
}