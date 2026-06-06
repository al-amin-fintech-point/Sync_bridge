/**
 * ============================================================================
 * @file        src/hooks/useClipboardSync.js
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Core Custom React Hook
 * @version     1.1.0
 * @date        2026-06-06
 * @academic    Final Year Project ( B.Sc. in Computer Science & Engineering )
 * @author      Md Al-Amin ( Associate Software Engineer )
 * @email       mdallamininfo@gmail.com
 * @phone       +880 1300-385188
 * @github      https://github.com/al-amin5188/Sync_bridge
 * @description Isolated hook managing global OS clipboard polling, transmission
 * buffers, and incoming network synchronization events.
 * @copyright   (c) 2026 Md Al-Amin. All rights reserved.
 * ============================================================================
 */

import { useEffect, useState } from "react";
import socket from "../services/socket";

export default function useClipboardSync( pairedDevices ) {
    const [ lastCopiedText, setLastCopiedText ] = useState( "" );

    useEffect( () => {
        
        // Listen for clipboard data dispatched from remote paired network nodes
        socket.on( "receive-clipboard-sync", ( data ) => {
            console.log( "Received clipboard text from network:", data.text );
            
            if ( data.text && data.text !== lastCopiedText ) {
                setLastCopiedText( data.text );
                
                // Write directly to the system clipboard using safe fallbacks
                if ( window.electronAPI && window.electronAPI.writeClipboard ) {
                    window.electronAPI.writeClipboard( data.text );
                } else if ( navigator.clipboard ) {
                    navigator.clipboard.writeText( data.text ).catch( ( err ) => {
                        console.error( "Failed to write to system clipboard:", err );
                    } );
                }
            }
        } );

        // Local clipboard polling monitor (Checks for new local copies every 1.5 seconds)
        const clipboardInterval = setInterval( () => {
            
            // Only poll and sync if this device has active paired connection matrixes
            const hasPairs = pairedDevices && Object.keys( pairedDevices ).length > 0;
            
            if ( hasPairs ) {
                if ( window.electronAPI && window.electronAPI.readClipboard ) {
                    window.electronAPI.readClipboard().then( ( text ) => {
                        if ( text && text !== lastCopiedText ) {
                            setLastCopiedText( text );
                            console.log( "📡 New local copy detected via Electron, broadcasting..." );
                            socket.emit( "sync-clipboard", { text: text } );
                        }
                    } );
                } else if ( navigator.clipboard ) {
                    navigator.clipboard.readText().then( ( text ) => {
                        if ( text && text !== lastCopiedText ) {
                            setLastCopiedText( text );
                            console.log( "New local copy detected via Web API, broadcasting..." );
                            socket.emit( "sync-clipboard", { text: text } );
                        }
                    } ).catch( ( () => {} ) );
                }
            }
        }, 1500 );

        return () => {
            socket.off( "receive-clipboard-sync" );
            clearInterval( clipboardInterval );
        };
    }, [ lastCopiedText, pairedDevices ] );

    return {
        lastCopiedText
    };
}