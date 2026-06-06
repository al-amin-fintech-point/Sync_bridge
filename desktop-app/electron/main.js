/**
 * ============================================================================
 * @file        electron/main.js ( or your main process entry file )
 * @project     SyncBridge - Multi-Device Mesh Network Architecture
 * @type        Electron Main Process Engine
 * @version     1.3.0
 * @date        2026-06-06
 * @academic    Final Year Project ( B.Sc. in Computer Science & Engineering )
 * @author      Md Al-Amin ( Associate Software Engineer )
 * @email       mdallamininfo@gmail.com
 * @phone       +880 1300-385188
 * @github      https://github.com/al-amin5188/Sync_bridge
 * @description Core electron main thread orchestration layer configuring safe
 * context bridges, window lifecycles, and native OS clipboard ipc channels.
 * @copyright   (c) 2026 Md Al-Amin. All rights reserved.
 * ============================================================================
 */

const { app, BrowserWindow, ipcMain, clipboard, dialog } = require( "electron" );
const path = require( "path" );

function createWindow() {
    const win = new BrowserWindow( {
        width: 1200,
        height: 800,
        webPreferences: {
            sandbox: false,
            preload: path.join( __dirname, "preload.js" ), // Securely injecting the preload script pipeline
            contextIsolated: true, // Safeguarding execution environments
            nodeIntegration: false // Preventing remote script exploits
        }
    } );

    const portsToTry = [ 5173, 5174, 5175, 5176 ];

    const tryPorts = async ( ports ) => {
        for ( const p of ports ) {
            const url = `http://localhost:${ p }`;
            try {
                await win.loadURL( url );
                console.log( "Loaded", url );
                return;
            } catch ( err ) {
                console.warn( "Failed to load", url, err.message || err );
            }
        }

        // Fallback to production build if available
        const indexHtml = path.join( __dirname, "..", "dist", "index.html" );
        try {
            await win.loadFile( indexHtml );
            console.log( "Loaded local index.html" );
        } catch ( e ) {
            console.error( "Failed to load any dev URL or local index.html", e );
        }
    };

    tryPorts( portsToTry );

    return win;
}

// Register native OS clipboard IPC event handlers on application setup
app.whenReady().then( () => {
    
    // Low-level channel to intercept and return current local desktop clipboard state
    ipcMain.handle( "read-clipboard", async () => {
        return clipboard.readText();
    } );

    // Low-level bridge channel to programmatically overwrite native OS clipboard buffers
    ipcMain.on( "write-clipboard", ( event, text ) => {
        if ( text ) {
            clipboard.writeText( text );
        }
    } );

    ipcMain.handle( "save-shared-file", async ( event, { fileName, fileBuffer } ) => {
        const fs = require( "fs" );
        const path = require( "path" );
        
        try {
            const { canceled, filePath } = await dialog.showSaveDialog( {
                title: "Select Destination to Save Bridge Asset",
                defaultPath: path.join( app.getPath( "downloads" ), fileName ),
                buttonLabel: "Save File",
                properties: [ "showOverwriteConfirmation" ]
            } );

            if ( canceled || !filePath ) {
                return { success: false, error: "Save operation aborted by user." };
            }

            fs.writeFileSync( filePath, Buffer.from( fileBuffer ) );
            
            return { success: true, path: filePath };
        } catch ( error ) {
            console.error( "Failed to save file via IPC Main:", error );
            return { success: false, error: error.message };
        }
    } );

    createWindow();

    app.on( "activate", () => {
        if ( BrowserWindow.getAllWindows().length === 0 ) createWindow();
    } );
} );

app.on( "window-all-closed", () => {
    if ( process.platform !== "darwin" ) app.quit();
} );