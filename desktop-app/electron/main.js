const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            sandbox: false
        }
    });

    const portsToTry = [5173, 5174, 5175, 5176];

    const tryPorts = async (ports) => {
        for (const p of ports) {
            const url = `http://localhost:${p}`;
            try {
                await win.loadURL(url);
                console.log('Loaded', url);
                return;
            } catch (err) {
                console.warn('Failed to load', url, err.message || err);
            }
        }

        // Fallback to production build if available
        const indexHtml = path.join(__dirname, '..', 'dist', 'index.html');
        try {
            await win.loadFile(indexHtml);
            console.log('Loaded local index.html');
        } catch (e) {
            console.error('Failed to load any dev URL or local index.html', e);
        }
    };

    tryPorts(portsToTry);

    return win;
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});