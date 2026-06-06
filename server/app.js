/**
 * ============================================================================
 * @file        server/app.js
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Core Backend Network Server
 * @version     1.1.0
 * @date        2026-06-06
 * * @academic    Final Year Project ( B.Sc. in Computer Science & Engineering )
 * @author      Md Al-Amin ( Associate Software Engineer )
 * @email       mdallamininfo@gmail.com
 * @phone       +880 1300-385188
 * @github      https://github.com/al-amin5188/Sync_bridge
 * * @description Real-time socket server enabling local mesh network routing,
 * secure PIN-based multi-device pairing, and state sync.
 * @copyright   (c) 2026 Md Al-Amin. All rights reserved.
 * ============================================================================
 */

const express = require( "express" );
const http = require( "http" );
const { Server } = require( "socket.io" );

const app = express();
const server = http.createServer( app );

const io = new Server( server, {
    cors: {
        origin: "*"
    }
} );

// In-memory data stores for active sessions
const connectedDevices = {};
const activePairRequests = {};
const devicePairs = {};

io.on( "connection", ( socket ) => {

    console.log( "Socket Connected:", socket.id );

    // Register a new device or re-establish session on connect
    socket.on( "register-device", ( deviceData ) => {
        connectedDevices[ deviceData.deviceId ] = {
            deviceId: deviceData.deviceId,
            socketId: socket.id,
            deviceName: deviceData.deviceName,
            deviceType: deviceData.deviceType,
            online: true,
            lastSeen: new Date()
        };

        console.log( "Device Registered" );

        io.emit(
            "devices-updated",
            Object.values( connectedDevices )
        );
    } );

    // Handle abrupt socket disconnections
    socket.on("disconnect", () => {
        console.log( "Socket Disconnected:", socket.id );

        for ( const deviceId in connectedDevices ) {
            if ( connectedDevices[ deviceId ].socketId === socket.id ) {
                connectedDevices[ deviceId ].online = false;
                connectedDevices[ deviceId ].lastSeen = new Date();
            }
        }

        io.emit(
            "devices-updated",
            Object.values( connectedDevices )
        );
    } );

    // Initiate pairing flow and generate secure 4-digit PIN
    socket.on( "send-pair-request", ( { fromDeviceId, toDeviceId } ) => {
        console.log( `Pair request triggered from ${fromDeviceId} to ${toDeviceId}` );
        
        const targetDevice = connectedDevices[ toDeviceId ];
        const senderDevice = connectedDevices[ fromDeviceId ];
        
        if ( targetDevice && targetDevice.online && senderDevice ) {
            const generatedPin = Math.floor( 1000 + Math.random() * 9000 ).toString();
            
            activePairRequests[ fromDeviceId ] = {
                pin: generatedPin,
                targetDeviceId: toDeviceId,
                timestamp: new Date()
            };

            socket.emit( "pair-pin-generated", { pin: generatedPin, toDeviceName: targetDevice.deviceName } );

            io.to( targetDevice.socketId ).emit( "receive-pair-request", {
                fromDeviceId: fromDeviceId,
                fromDeviceName: senderDevice.deviceName
            } );
            
            console.log( `PIN [ ${generatedPin} ] generated for pairing.` );
        }
    } );

    // Validate PIN and establish room-bound bidirectional bridge
    socket.on( "accept-pair-request", ( { requesterId, accepterId, enteredPin } ) => {
        console.log( `Verifying PIN for ${requesterId} and ${accepterId}` );
        
        const pendingRequest = activePairRequests[ requesterId ];
        const requester = connectedDevices[ requesterId ];
        const accepter = connectedDevices[ accepterId ];

        if ( pendingRequest && pendingRequest.pin === enteredPin && pendingRequest.targetDeviceId === accepterId ) {
            
            // Normalize room name sorting to ensure consistency
            const roomId = [ requesterId, accepterId ].sort().join( "-" );
            
            const requesterSocket = io.sockets.sockets.get( requester?.socketId );
            const accepterSocket = io.sockets.sockets.get( accepter?.socketId );

            if ( requesterSocket ) requesterSocket.join( roomId );
            if ( accepterSocket ) accepterSocket.join( roomId );

            // Store pairing matrix for decentralized topology tracking
            if ( !devicePairs[ requesterId ] ) devicePairs[ requesterId ] = {};
            if ( !devicePairs[ accepterId ] ) devicePairs[ accepterId ] = {};
            
            devicePairs[ requesterId ][ accepterId ] = roomId;
            devicePairs[ accepterId ][ requesterId ] = roomId;

            // Dispatch updated topology matrices to respective network nodes
            io.to( requester.socketId ).emit( "pair-success", { 
                pairedDevices: devicePairs[ requesterId ] 
            } );
            io.to( accepter.socketId ).emit( "pair-success", { 
                pairedDevices: devicePairs[ accepterId ] 
            } );
            
            delete activePairRequests[ requesterId ];
            console.log( `Multi-Pair successful for room: ${roomId}` );
        } else {
            io.to( accepter?.socketId ).emit( "pair-error", { message: "Invalid PIN! Please try again." } );
        }
    } );

    // Teardown pairing maps and leave mutual socket channel
    socket.on( "disconnect-pair", ( { requesterId, targetId } ) => {
        console.log( `Unpairing requested between ${requesterId} and ${targetId}` );

        const roomId = [ requesterId, targetId ].sort().join( "-" );
        const requester = connectedDevices[ requesterId ];
        const target = connectedDevices[ targetId ];

        const requesterSocket = io.sockets.sockets.get( requester?.socketId );
        const targetSocket = io.sockets.sockets.get( target?.socketId );

        if ( requesterSocket ) requesterSocket.leave( roomId );
        if ( targetSocket ) targetSocket.leave( roomId );

        // Delete entry from active matrix schemas
        if ( devicePairs[ requesterId ] ) delete devicePairs[ requesterId ][ targetId ];
        if ( devicePairs[ targetId ] ) delete devicePairs[ targetId ][ requesterId ];

        if ( requester ) io.to( requester.socketId ).emit( "unpair-success", { pairedDevices: devicePairs[ requesterId ] || {} } );
        if ( target ) io.to( target.socketId ).emit( "unpair-success", { pairedDevices: devicePairs[ targetId ] || {} } );
    } );

    // Abort pending pair lifecycle before pin validation expires
    socket.on( "cancel-pair-request", ( { requesterId } ) => {
        console.log( `Pair request canceled by requester or target for: ${requesterId}` );
        
        const pendingRequest = activePairRequests[ requesterId ];
        const requester = connectedDevices[ requesterId ];
        
        if ( pendingRequest ) {
            const target = connectedDevices[ pendingRequest.targetDeviceId ];
            
            if ( requester ) io.to( requester.socketId ).emit( "pair-canceled" );
            if ( target ) io.to( target.socketId ).emit( "pair-canceled" );
            
            delete activePairRequests[ requesterId ];
        }
    } );

    // Broadcast clipboard content to all securely paired devices in the network matrix
    socket.on( "sync-clipboard", ( { text } ) => {
        console.log( `Clipboard sync triggered from socket: ${ socket.id }` );

        let senderDeviceId = null;
        for ( const id in connectedDevices ) {
            if ( connectedDevices[ id ].socketId === socket.id ) {
                senderDeviceId = id;
                break;
            }
        }

        if ( senderDeviceId && devicePairs[ senderDeviceId ] ) {
            const pairedNodes = devicePairs[ senderDeviceId ];

            for ( const targetId in pairedNodes ) {
                const roomId = pairedNodes[ targetId ];
                
                // Broadcast to the specific room, excluding the sender node
                socket.to( roomId ).emit( "receive-clipboard-sync", {
                    text: text,
                    fromDeviceId: senderDeviceId
                } );
            }
            console.log( `Clipboard data distributed to paired nodes of: ${ senderDeviceId }` );
        }
    } );

    /**
     * Relays file metadata handshake packet to the targeted mesh peer node.
     */
    socket.on( "file-meta", ( data ) => {
        const { to, fileName, fileSize, totalChunks } = data;
        if ( to ) {
            io.to( to ).emit( "file-meta", {
                from: socket.id,
                fileName,
                fileSize,
                totalChunks
            } );
        }
    } );

    /**
     * Relays high-frequency binary array buffer chunks sequentially to the target peer.
     */
    socket.on( "file-chunk", ( data ) => {
        const { to, chunk, chunkIndex } = data;
        if ( to ) {
            io.to( to ).emit( "file-chunk", {
                from: socket.id,
                chunk,
                chunkIndex
            } );
        }
    } );


} );

server.listen( 3000, () => {
    console.log( "SyncBridge Server Running on Port 3000" );
} );