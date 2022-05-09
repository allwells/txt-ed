const {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  Notification,
  Menu,
} = require("electron");
const path = require("path");
const fs = require("fs");

const isDevEnv = process.env.NODE_ENV === "development";

if (isDevEnv) {
  try {
    require("electron-reloader")(module);
  } catch {}
}

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
    title: "❌ Error",
    body: "Something went wrong 😢",
  }).show();
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

  if (isDevEnv) {
    mainWindow.webContents.openDevTools();
  }

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
          handleError();
        } else {
          openedFilePath = filePath;
          mainWindow.webContents.send("document-opened", { filePath, content });
        }
      });
    });
});

ipcMain.on("create-document-triggered", (_, data) => {
  dialog
    .showSaveDialog(mainWindow, {
      filters: [{ name: "Files", extensions: ext }],
    })
    .then(({ filePath }) => {
      fs.writeFile(filePath, data, (error) => {
        if (error) {
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
      handleError();
    }
  });
});
