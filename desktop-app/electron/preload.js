/**
 * ============================================================================
 * @file        electron/preload.js
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Electron Preload Safe Bridge Script
 * @version     1.1.0
 * @date        2026-06-06
 * @academic    Final Year Project ( B.Sc. in Computer Science & Engineering )
 * @author      Md Al-Amin ( Associate Software Engineer )
 * @email       mdallamininfo@gmail.com
 * @phone       +880 1300-385188
 * @github      https://github.com/al-amin5188/Sync_bridge
 * @description Isolated context bridge layer securely exposing low-level OS
 *              native clipboard IPC channels to the frontend rendering layer.
 * @copyright   (c) 2026 Md Al-Amin. All rights reserved.
 * ============================================================================
 */

const { contextBridge, ipcRenderer } = require( "electron" );

// Securely expose context isolated native desktop APIs to the React renderer thread
contextBridge.exposeInMainWorld( "electronAPI", {
    
    /**
     * Asynchronously invokes the main process clipboard reader channel.
     * @returns { Promise<string> } Resolved plain-text string from native OS clipboard buffer.
     */
    readClipboard: () => ipcRenderer.invoke( "read-clipboard" ),

    /**
     * Dispatches a synchronization payload to overwrite the native OS clipboard buffer.
     * @param { string } text - Plain text format string to commit to the local OS clipboard.
     */
    writeClipboard: ( text ) => ipcRenderer.send( "write-clipboard", text ),

    /**
     * Dispatches bundled raw file buffers directly into the main desktop file system threads.
     * @param { Object } payload - Encapsulated file parameters.
     * @param { string } payload.fileName - Pure identity string of the target file.
     * @param { ArrayBuffer } payload.fileBuffer - Raw continuous binary buffer allocations.
     * @returns { Promise<Object> } Operation confirmations status and paths.
     */
    saveSharedFile: ( payload ) => ipcRenderer.invoke( "save-shared-file", payload )
    
} );