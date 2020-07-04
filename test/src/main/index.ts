import { app, BrowserWindow } from "electron";
import path from "path";

const dirname = path.dirname(__dirname);
const file = path.join(dirname, "renderer", "index.html")
const winURL = process.env.NODE_ENV === "development"  ? "http://localhost:9080" : `file://${file}`

let mainWindow: BrowserWindow | null;

function createWindow(){
    mainWindow = new BrowserWindow({
        height: 563,
        width: 900,
        useContentSize:true,
        // frame: process.platform !== 'darwin' ? false : true,
        titleBarStyle: "hiddenInset",
        backgroundColor: "#fff",
        // show: false,
        webPreferences: {
            // 此设置运行渲染进程 使用node Api
            nodeIntegration: true,
        }
    })

    mainWindow.loadURL(winURL)


    mainWindow.on("closed", () => {
        mainWindow = null
        app.exit()
    })

    mainWindow.on("ready-to-show", () => {
        if (mainWindow) {
            mainWindow.show()
        }
    })

    mainWindow.flashFrame(true)
}



app.on("ready", createWindow)

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow()
    }
})
