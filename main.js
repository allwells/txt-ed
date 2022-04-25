const {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  Notification,
  Menu,
} = require("electron");
require("electron-reloader")(module);
const path = require("path");
const fs = require("fs");

const ext = [
  "txt",
  "py",
  "java",
  "cpp",
  "c",
  "kt",
  "js",
  "jsx",
  "ts",
  "tsx",
  "md",
  "html",
  "css",
  "json",
  "php",
];

let mainWindow;
let openedFilePath;
const handleError = () => {
  new Notification({
    title: "Error",
    body: "Something went wrong :(",
  });
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // frame: false,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(app.getAppPath(), "renderer.js"),
    },
  });

  mainWindow.loadFile("index.html");

  const menuTemplate = [
    {
      label: "File",
      submenu: [
        {
          label: "Open File",
          click: () => ipcMain.emit("open-document-triggered"),
        },
        {
          label: "Create New File",
          click: () => ipcMain.emit("create-document-triggered"),
        },
        {
          role: "quit",
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};

app.whenReady().then(createWindow);

ipcMain.on("open-document-triggered", () => {
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      filters: [
        {
          name: "Files",
          extensions: ext,
        },
      ],
    })
    .then(({ filePaths }) => {
      const filePath = filePaths[0];

      fs.readFile(filePath, "utf8", (error, content) => {
        if (error) {
          // console.log("open-document-triggered", error);
          handleError();
        } else {
          openedFilePath = filePath;
          mainWindow.webContents.send("document-opened", { filePath, content });
        }
      });
    });
});

ipcMain.on("create-document-triggered", () => {
  dialog
    .showSaveDialog(mainWindow, {
      filters: [
        {
          name: "Files",
          extensions: ext,
        },
      ],
    })
    .then(({ filePath }) => {
      fs.writeFile(filePath, "", (error) => {
        if (error) {
          // console.log("create-document-triggered", error);
          handleError();
        } else {
          openedFilePath = filePath;
          mainWindow.webContents.send("document-created", filePath);
        }
      });
    });
});

ipcMain.on("file-updated", (_, editorContent) => {
  fs.writeFile(openedFilePath, editorContent, (error) => {
    if (error) {
      // console.log("file-updated", error);
      handleError();
    }
  });
});
