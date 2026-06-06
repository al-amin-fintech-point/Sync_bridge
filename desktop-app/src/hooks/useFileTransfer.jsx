/**
 * ============================================================================
 * @file        src/hooks/useFileTransfer.jsx
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Custom Core Hook Layer
 * @version     1.0.0
 * @date        2026-06-06
 * @description State orchestration hook handling binary chunk slicing, web socket
 * streaming distribution, and local file composition handshakes.
 * ============================================================================
 */

import { useState, useEffect } from "react";

const CHUNK_SIZE = 64 * 1024; // Standardized high-throughput 64KB operational binary chunks

export default function useFileTransfer( socketId, pairedDevices ) {
    const [ isSending, setIsSending ] = useState( false );
    const [ isReceiving, setIsReceiving ] = useState( false );
    const [ transferProgress, setTransferProgress ] = useState( 0 );
    const [ transferStatus, setTransferStatus ] = useState( "" );

    // Internal state pointer tracking cumulative binary pieces coming from networks
    let receivedChunks = [];
    let activeFileMeta = null;

    useEffect( () => {
        // Shared-file global window event channel listeners for useDevices fallback hooks
        const handleIncomingMeta = ( e ) => {
            const { fileName, fileSize, totalChunks } = e.detail;
            activeFileMeta = { fileName, fileSize, totalChunks };
            receivedChunks = [];
            setIsReceiving( true );
            setTransferProgress( 0 );
            setTransferStatus( `Receiving: ${ fileName }...` );
        };

        const handleIncomingChunk = async ( e ) => {
            const { chunk, chunkIndex } = e.detail;
            if ( !activeFileMeta ) return;

            receivedChunks.push( chunk );
            
            const currentProgress = Math.round( ( receivedChunks.length / activeFileMeta.totalChunks ) * 100 );
            setTransferProgress( currentProgress );

            // When full blocks allocations match expected schemas metadata, commit compilation
            if ( receivedChunks.length === activeFileMeta.totalChunks ) {
                setTransferStatus( "Finalizing file compilation..." );
                
                try {
                    // Combine all distinct chunk allocations into one massive binary blog array
                    const finalBlob = new Blob( receivedChunks );
                    const arrayBuffer = await finalBlob.arrayBuffer();

                    // Safely dispatch execution thread to Electron native storage pipelines
                    const response = await window.electronAPI.saveSharedFile( {
                        fileName: activeFileMeta.fileName,
                        fileBuffer: arrayBuffer
                    } );

                    if ( response.success ) {
                        setTransferStatus( `Successfully saved to Downloads!` );
                    } else {
                        setTransferStatus( `FS Error: ${ response.error }` );
                    }
                } catch ( err ) {
                    setTransferStatus( "Failed to process compiled buffers." );
                } finally {
                    setIsReceiving( false );
                    activeFileMeta = null;
                    receivedChunks = [];
                }
            }
        };

        window.addEventListener( "syncbridge-file-meta", handleIncomingMeta );
        window.addEventListener( "syncbridge-file-chunk", handleIncomingChunk );

        return () => {
            window.removeEventListener( "syncbridge-file-meta", handleIncomingMeta );
            window.removeEventListener( "syncbridge-file-chunk", handleIncomingChunk );
        };
    }, [] );

    /**
     * Slices target user physical asset vectors into streaming array buffers.
     * @param { File } file - Standard DOM reference instance of the file asset.
     * @param { Function } emitSocketEvent - Trigger dispatch callback referencing core socket channels.
     */
    const streamFile = ( file, emitSocketEvent ) => {
        if ( !file || !pairedDevices || Object.keys( pairedDevices ).length === 0 ) {
            setTransferStatus( "No active secure connection found." );
            return;
        }

        setIsSending( true );
        setTransferProgress( 0 );
        setTransferStatus( `Streaming: ${ file.name }...` );

        const fileReader = new FileReader();
        let offset = 0;
        const totalChunks = Math.ceil( file.size / CHUNK_SIZE );
        let chunkIndex = 0;

        // Initialize handshake across remote mesh networks targeting matching session slots
        emitSocketEvent( "file-meta", {
            fileName: file.name,
            fileSize: file.size,
            totalChunks
        } );

        fileReader.onload = ( e ) => {
            const chunk = e.target.result;
            
            emitSocketEvent( "file-chunk", {
                chunk,
                chunkIndex
            } );

            chunkIndex++;
            offset += CHUNK_SIZE;

            const currentProgress = Math.round( ( chunkIndex / totalChunks ) * 100 );
            setTransferProgress( currentProgress );

            if ( offset < file.size ) {
                readNextChunk();
            } else {
                setTransferStatus( "File successfully transmitted!" );
                setIsSending( false );
            }
        };

        const readNextChunk = () => {
            const slice = file.slice( offset, offset + CHUNK_SIZE );
            fileReader.readAsArrayBuffer( slice );
        };

        // Fire initial streaming sequence loop
        readNextChunk();
    };

    return {
        isSending,
        isReceiving,
        transferProgress,
        transferStatus,
        streamFile
    };
}