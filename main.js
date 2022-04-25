const { BrowserWindow, app } = require("electron");
require("electron-reloader")(module);
const path = require("path");

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(app.getAppPath(), "renderer.js"),
    },
  });

  // mainWindow.webContents.openDevTools();
  mainWindow.loadFile("index.html");
};
app.whenReady().then(createWindow);
