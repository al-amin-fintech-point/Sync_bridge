/**
 * ============================================================================
 * @file        src/hooks/useDevices.js
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Core Custom React Hook
 * @version     1.1.0
 * @date        2026-06-06
 * @academic    Final Year Project ( B.Sc. in Computer Science & Engineering )
 * @author      Md Al-Amin ( Associate Software Engineer )
 * @email       mdallamininfo@gmail.com
 * @phone       +880 1300-385188
 * @github      https://github.com/al-amin5188/Sync_bridge
 * @description State distribution engine managing local socket network scopes,
 * pairing lifecycle hooks, and automated mesh handshake event states.
 * @copyright   (c) 2026 Md Al-Amin. All rights reserved.
 * ============================================================================
 */

import { useEffect, useState } from "react";
import socket from "../services/socket";
import { getDeviceId } from "../utils/device";

export default function useDevices() {
    const [ socketId, setSocketId ] = useState( "" );
    const [ deviceId, setDeviceId ] = useState( "" );
    const [ devices, setDevices ] = useState( [] );
    
    const [ incomingRequest, setIncomingRequest ] = useState( null ); 
    const [ sentRequestTo, setSentRequestTo ] = useState( null ); 
    const [ generatedPin, setGeneratedPin ] = useState( "" ); 
    const [ pairError, setPairError ] = useState( "" ); 
    const [ pairedDevices, setPairedDevices ] = useState( {} );

    useEffect( () => {
        const savedDeviceId = getDeviceId();
        setDeviceId( savedDeviceId );

        const register = () => {
            setSocketId( socket.id );
            socket.emit( "register-device", {
                deviceId: savedDeviceId,
                deviceName: "Amin Desktop",
                deviceType: "desktop"
            } );
        };

        socket.on( "connect", register );
        if ( socket.connected ) register();

        socket.on( "devices-updated", ( allDevices ) => {
            setDevices( allDevices );
        } );

        socket.on( "receive-pair-request", ( data ) => {
            setIncomingRequest( data );
            setPairError( "" ); 
        } );

        socket.on( "pair-pin-generated", ( data ) => {
            setGeneratedPin( data.pin ); 
        } );

        socket.on( "pair-success", ( data ) => {
            setPairedDevices( data.pairedDevices || {} );
            setIncomingRequest( null );
            setSentRequestTo( null );
            setGeneratedPin( "" );
            setPairError( "" );
        } );

        socket.on( "pair-error", ( data ) => {
            setPairError( data.message );
        } );

        socket.on( "pair-canceled", () => {
            setIncomingRequest( null );
            setSentRequestTo( null );
            setGeneratedPin( "" );
            setPairError( "" );
        } );

        socket.on( "unpair-success", ( data ) => {
            setPairedDevices( data.pairedDevices || {} );
            setSentRequestTo( null );
            setGeneratedPin( "" );
            setPairError( "" );
        } );

        return () => {
            socket.off( "connect" );
            socket.off( "devices-updated" );
            socket.off( "receive-pair-request" );
            socket.off( "pair-pin-generated" );
            socket.off( "pair-success" );
            socket.off( "pair-error" );
            socket.off( "pair-canceled" );
            socket.off( "unpair-success" );
        };
    }, [] );

    // Transmit secure validation sequence request to target node
    const sendPairRequest = ( targetDeviceId ) => {
        setSentRequestTo( targetDeviceId );
        socket.emit( "send-pair-request", {
            fromDeviceId: deviceId,
            toDeviceId: targetDeviceId
        } );
    };

    // Dispatches validation parameters back to network manager
    const acceptPairRequest = ( enteredPin ) => {
        if ( incomingRequest ) {
            socket.emit( "accept-pair-request", {
                requesterId: incomingRequest.fromDeviceId,
                accepterId: deviceId,
                enteredPin: enteredPin
            } );
        }
    };

    // Interrupts target verification queues and clears buffer states
    const rejectPairRequest = () => {
        const targetRequesterId = incomingRequest ? incomingRequest.fromDeviceId : deviceId;
        socket.emit( "cancel-pair-request", { requesterId: targetRequesterId } );
        setIncomingRequest( null );
        setPairError( "" );
    };

    // Requests unpair schema teardown for explicit node instances
    const disconnectPair = ( targetDeviceId ) => {
        socket.emit( "disconnect-pair", {
            requesterId: deviceId,
            targetId: targetDeviceId
        } );
    };

    return {
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
    };
}