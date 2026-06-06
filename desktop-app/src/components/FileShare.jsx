/**
 * ============================================================================
 * @file        src/components/FileShare.jsx
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Shared Component UI
 * @version     1.0.0
 * @date        2026-06-06
 * @description High fidelity dashboard drag-and-drop module visualising streaming
 * byte ratios and network transfer channels cleanly.
 * ============================================================================
 */

import React, { useRef } from "react";

export default function FileShare( { isSending, isReceiving, transferProgress, transferStatus, onFileSelect } ) {
    const fileInputRef = useRef( null );

    const styles = {
        card: {
            background: "rgba( 30, 41, 59, 0.5 )",
            border: "1px solid rgba( 255, 255, 255, 0.1 )",
            borderRadius: "20px",
            padding: "24px",
            marginTop: "32px"
        },
        dropZone: {
            border: "2px dashed rgba( 99, 102, 241, 0.4 )",
            borderRadius: "12px",
            padding: "32px",
            textAlign: "center",
            cursor: "pointer",
            background: "rgba( 15, 23, 42, 0.2 )",
            transition: "all 0.2s ease"
        },
        title: {
            margin: "0 0 8px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#f8fafc"
        },
        subText: {
            margin: 0,
            fontSize: "13px",
            color: "#94a3b8"
        },
        progressContainer: {
            marginTop: "20px"
        },
        progressBarTrack: {
            width: "100%",
            height: "8px",
            background: "#1e293b",
            borderRadius: "10px",
            overflow: "hidden",
            marginTop: "8px"
        },
        progressBarFill: {
            width: `${ transferProgress }%`,
            height: "100%",
            background: "linear-gradient( 135deg, #6366f1 0%, #4f46e5 100% )",
            transition: "width 0.1s linear"
        },
        statusText: {
            fontSize: "13px",
            color: "#818cf8",
            fontWeight: "500",
            fontFamily: "monospace"
        }
    };

    const handleFileChange = ( e ) => {
        if ( e.target.files && e.target.files[0] ) {
            onFileSelect( e.target.files[0] );
        }
    };

    return (
        <div style={ styles.card }>
            <h3 style={ { margin: "0 0 16px 0", fontSize: "18px", color: "#f1f5f9" } }>📂 High-Speed File Streaming</h3>
            
            <div 
                style={ styles.dropZone } 
                onClick={ () => !isSending && !isReceiving && fileInputRef.current.click() }
            >
                <input 
                    type="file" 
                    ref={ fileInputRef } 
                    onChange={ handleFileChange } 
                    style={ { display: "none" } } 
                    disabled={ isSending || isReceiving }
                />
                <span style={ { fontSize: "32px", display: "block", marginBottom: "8px" } }>🚀</span>
                <p style={ styles.title }>Click to select high-volume assets</p>
                <p style={ styles.subText }>Files will stream via multi-device secure socket channels</p>
            </div>

            { ( isSending || isReceiving || transferStatus ) && (
                <div style={ styles.progressContainer }>
                    <div style={ { display: "flex", justifyContent: "space-between", alignItems: "center" } }>
                        <span style={ styles.statusText }>{ transferStatus }</span>
                        <span style={ { ...styles.statusText, color: "#f1f5f9" } }>{ transferProgress }%</span>
                    </div>
                    <div style={ styles.progressBarTrack }>
                        <div style={ styles.progressBarFill }></div>
                    </div>
                </div>
            ) }
        </div>
    );
}