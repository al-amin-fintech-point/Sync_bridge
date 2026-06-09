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
    const [ deviceId ] = useState( () => getDeviceId() );
    const [ devices, setDevices ] = useState( [] );
    
    const [ incomingRequest, setIncomingRequest ] = useState( null ); 
    const [ sentRequestTo, setSentRequestTo ] = useState( null ); 
    const [ generatedPin, setGeneratedPin ] = useState( "" ); 
    const [ pairError, setPairError ] = useState( "" ); 
    const [ pairedDevices, setPairedDevices ] = useState( {} );

    useEffect( () => {
        const register = () => {
            setSocketId( socket.id );
            socket.emit( "register-device", {
                deviceId: deviceId,
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

        // Phase 4 Socket Chunk Streaming Interceptions
        socket.on( "file-meta", ( data ) => {
            console.log( "📥 Socket event 'file-meta' received:", data );
            window.dispatchEvent( new CustomEvent( "syncbridge-file-meta", { detail: data } ) );
        } );

        socket.on( "file-chunk", ( data ) => {
            console.log( `📦 Socket event 'file-chunk' received - chunk index: ${data.chunkIndex}` );
            window.dispatchEvent( new CustomEvent( "syncbridge-file-chunk", { detail: data } ) );
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
            socket.off( "file-meta" );
            socket.off( "file-chunk" );
        };
    }, [ deviceId ] );

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

    /**
     * Custom dispatch bridge to transmit low-level file chunks safely to targeted socket.
     * FIX: Use deviceId (key) instead of roomId (value) for proper server routing
     */
    const emitFileSocketEvent = ( eventName, payload ) => {
        if ( socket ) {
            // Find target paired peer identifier key (deviceId, not roomId)
            const targetDeviceId = Object.keys( pairedDevices )[0];
            if ( targetDeviceId ) {
                console.log( `📤 Emitting ${eventName} to device: ${targetDeviceId}` );
                socket.emit( eventName, { to: targetDeviceId, ...payload } );
            } else {
                console.warn( "⚠️ No paired devices available for file transfer" );
            }
        }
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
        disconnectPair,
        emitFileSocketEvent
    };
}