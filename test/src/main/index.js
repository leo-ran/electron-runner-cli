import { app, BrowserWindow } from 'electron';
var winURL = process.env.NODE_ENV === 'development' ? 'http://localhost:9080' : "file://" + __dirname + "/index.html";
var mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({
        height: 563,
        width: 900,
        useContentSize: true,
        // frame: process.platform !== 'darwin' ? false : true,
        titleBarStyle: 'hiddenInset',
        backgroundColor: "#fff",
    });
    mainWindow.loadURL(winURL);
    mainWindow.on('closed', function () {
        mainWindow = null;
        app.exit();
    });
    mainWindow.on('ready-to-show', function () {
        if (mainWindow) {
            mainWindow.show();
        }
    });
    mainWindow.flashFrame(true);
}
app.on('ready', createWindow);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
