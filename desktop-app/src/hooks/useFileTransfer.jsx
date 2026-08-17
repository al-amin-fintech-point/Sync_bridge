/**
 * ============================================================================
 * @file        src/hooks/useFileTransfer.jsx
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Core Custom React Hook
 * @version     1.1.0
 * @date        2026-06-09
 * @academic    Final Year Project ( B.Sc. in Computer Science & Engineering )
 * @author      Md Al-Amin ( Associate Software Engineer )
 * @email       mdallamininfo@gmail.com
 * @phone       +880 1300-385188
 * @github      https://github.com/al-amin5188/Sync_bridge
 * @description High-volume binary data streaming engine with explicit consent
 *              handshakes, chunk-based transmission, and progress tracking.
 * @copyright   (c) 2026 Md Al-Amin. All rights reserved.
 * ============================================================================
 */

import { useEffect, useState, useRef } from "react";
import socket from "../services/socket";

export default function useFileTransfer( socketId, pairedDevices ) {
    const [ isSending, setIsSending ] = useState( false );
    const [ isReceiving, setIsReceiving ] = useState( false );
    const [ transferProgress, setTransferProgress ] = useState( 0 );
    const [ transferStatus, setTransferStatus ] = useState( "" );
    const [ showIncomingAlert, setShowIncomingAlert ] = useState( false );
    const [ incomingFileMeta, setIncomingFileMeta ] = useState( null );

    const fileChunksRef = useRef( {} ); // Store received chunks
    const receivedChunksRef = useRef( {} ); // Track received chunk count per file

    const CHUNK_SIZE = 64 * 1024; // 64 KB chunks

    useEffect( () => {
        // Listen for incoming file metadata from remote paired device
        const handleFileMeta = ( event ) => {
            const { from, fileName, fileSize, totalChunks } = event.detail;
            console.log( `File metadata received from ${from}: ${fileName} (${fileSize} bytes, ${totalChunks} chunks)` );
            
            setIncomingFileMeta( {
                from,
                fileName,
                fileSize,
                totalChunks
            } );
            setShowIncomingAlert( true );
            setIsReceiving( true );
            fileChunksRef.current[ fileName ] = [];
            receivedChunksRef.current[ fileName ] = 0;
        };

        // Listen for incoming file chunks
        const handleFileChunk = ( event ) => {
            const { from, chunk, chunkIndex } = event.detail;
            
            if ( incomingFileMeta ) {
                const fileName = incomingFileMeta.fileName;
                
                // Store chunk in correct order
                if ( !fileChunksRef.current[ fileName ] ) {
                    fileChunksRef.current[ fileName ] = [];
                }
                
                fileChunksRef.current[ fileName ][ chunkIndex ] = new Uint8Array( chunk );
                receivedChunksRef.current[ fileName ]++;

                // Update progress
                const progress = Math.round( ( receivedChunksRef.current[ fileName ] / incomingFileMeta.totalChunks ) * 100 );
                setTransferProgress( progress );
                setTransferStatus( `Receiving: ${progress}%` );

                console.log( `Chunk ${chunkIndex + 1}/${incomingFileMeta.totalChunks} received (${progress}%)` );

                // Check if all chunks received
                if ( receivedChunksRef.current[ fileName ] === incomingFileMeta.totalChunks ) {
                    console.log( `All chunks received for ${fileName}, ready to save` );
                    // Chunks are stored, user can now accept and save
                }
            }
        };

        window.addEventListener( "syncbridge-file-meta", handleFileMeta );
        window.addEventListener( "syncbridge-file-chunk", handleFileChunk );

        return () => {
            window.removeEventListener( "syncbridge-file-meta", handleFileMeta );
            window.removeEventListener( "syncbridge-file-chunk", handleFileChunk );
        };
    }, [ incomingFileMeta ] );

    /**
     * Streams a file to paired device by chunking and sending via socket events
     */
    const streamFile = ( file, emitFileSocketEvent ) => {
        if ( !file || Object.keys( pairedDevices ).length === 0 ) {
            console.error( "No file selected or no paired devices" );
            return;
        }

        setIsSending( true );
        setTransferProgress( 0 );
        setTransferStatus( "Starting transfer..." );

        const reader = new FileReader();
        const totalChunks = Math.ceil( file.size / CHUNK_SIZE );

        console.log( `Starting file transfer: ${file.name} (${file.size} bytes, ${totalChunks} chunks)` );

        // Send file metadata first
        emitFileSocketEvent( "file-meta", {
            fileName: file.name,
            fileSize: file.size,
            totalChunks: totalChunks
        } );

        let chunkIndex = 0;

        reader.onload = ( event ) => {
            const chunk = event.target.result;
            
            // Convert to Array for socket transmission
            const chunkArray = Array.from( new Uint8Array( chunk ) );

            emitFileSocketEvent( "file-chunk", {
                chunk: chunkArray,
                chunkIndex: chunkIndex
            } );

            const progress = Math.round( ( ( chunkIndex + 1 ) / totalChunks ) * 100 );
            setTransferProgress( progress );
            setTransferStatus( `Sending: ${progress}%` );

            console.log( `Chunk ${chunkIndex + 1}/${totalChunks} sent (${progress}%)` );

            chunkIndex++;

            if ( chunkIndex < totalChunks ) {
                // Read next chunk
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min( start + CHUNK_SIZE, file.size );
                reader.readAsArrayBuffer( file.slice( start, end ) );
            } else {
                console.log( `File transfer completed: ${file.name}` );
                setTransferStatus( "Transfer complete! ✅" );
                setIsSending( false );

                // Reset after 3 seconds
                setTimeout( () => {
                    setTransferProgress( 0 );
                    setTransferStatus( "" );
                }, 3000 );
            }
        };

        reader.onerror = ( error ) => {
            console.error( "File read error:", error );
            setTransferStatus( "Error reading file" );
            setIsSending( false );
        };

        // Start reading first chunk
        const firstChunkEnd = Math.min( CHUNK_SIZE, file.size );
        reader.readAsArrayBuffer( file.slice( 0, firstChunkEnd ) );
    };

    /**
     * Accept incoming file and trigger download
     */
    const acceptIncomingFile = () => {
        if ( !incomingFileMeta ) return;

        const fileName = incomingFileMeta.fileName;
        const chunks = fileChunksRef.current[ fileName ];

        console.log( `Saving file: ${fileName}` );

        // Combine all chunks into a single Blob
        const combinedData = new Uint8Array( incomingFileMeta.fileSize );
        let offset = 0;

        for ( let i = 0; i < chunks.length; i++ ) {
            if ( chunks[ i ] ) {
                combinedData.set( chunks[ i ], offset );
                offset += chunks[ i ].length;
            }
        }

        const blob = new Blob( [ combinedData ], { type: "application/octet-stream" } );
        const url = URL.createObjectURL( blob );

        // Trigger download
        const a = document.createElement( "a" );
        a.href = url;
        a.download = fileName;
        document.body.appendChild( a );
        a.click();
        document.body.removeChild( a );
        URL.revokeObjectURL( url );

        // Clean up and reset
        setShowIncomingAlert( false );
        setIncomingFileMeta( null );
        setIsReceiving( false );
        setTransferProgress( 0 );
        setTransferStatus( "" );
        delete fileChunksRef.current[ fileName ];
        delete receivedChunksRef.current[ fileName ];

        console.log( `File saved: ${fileName}` );
    };

    /**
     * Decline incoming file transfer
     */
    const declineIncomingFile = () => {
        if ( incomingFileMeta ) {
            console.log( `Rejected incoming file: ${incomingFileMeta.fileName}` );
            delete fileChunksRef.current[ incomingFileMeta.fileName ];
            delete receivedChunksRef.current[ incomingFileMeta.fileName ];
        }

        setShowIncomingAlert( false );
        setIncomingFileMeta( null );
        setIsReceiving( false );
        setTransferProgress( 0 );
        setTransferStatus( "" );
    };

    return {
        isSending,
        isReceiving,
        transferProgress,
        transferStatus,
        showIncomingAlert,
        incomingFileMeta,
        streamFile,
        acceptIncomingFile,
        declineIncomingFile
    };
}