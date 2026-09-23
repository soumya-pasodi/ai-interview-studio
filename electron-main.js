const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function startBackendServer() {
    console.log('🚀 Starting AI Interview Studio Backend & Database Server...');
    // Boot Node Express server in background
    require('./server.js');
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 728,
        title: "AI Interview Studio & Live Studio",
        icon: path.join(__dirname, 'frontend/public/vite.svg'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false
        },
        autoHideMenuBar: true,
        backgroundColor: '#020617',
        show: false
    });

    // Determine target URL: Vite dev server if running, or Express server
    const targetUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';

    // Wait 1.5 seconds for servers to settle then load URL
    setTimeout(() => {
        mainWindow.loadURL(targetUrl).catch(() => {
            console.log('Falling back to local express server...');
            mainWindow.loadURL('http://localhost:3000');
        });
    }, 1500);

    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
    });

    // Open external links in user's default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http:') || url.startsWith('https:')) {
            shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    startBackendServer();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
