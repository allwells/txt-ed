const { ipcRenderer } = require("electron");
const path = require("path");

window.addEventListener("DOMContentLoaded", () => {
  const evt = {
    editor: document.getElementById("editor"),
    documentName: document.getElementById("document_name"),
    openDocumentBtn: document.getElementById("open_document"),
    createDocumentBtn: document.getElementById("create_document"),
  };

  const handleDocumentChange = (filePath, content = "") => {
    evt.documentName.innerHTML = path.parse(filePath).base + " - ";

    evt.editor.removeAttribute("disabled");
    evt.editor.value = content;
    evt.editor.focus();
  };

  evt.editor.addEventListener("input", (event) => {
    ipcRenderer.send("file-updated", event.target.value);
  });

  evt.openDocumentBtn.addEventListener("click", () => {
    ipcRenderer.send("open-document-triggered");
  });

  evt.createDocumentBtn.addEventListener("click", () => {
    ipcRenderer.send("create-document-triggered");
  });

  ipcRenderer.on("document-opened", (_, { filePath, content }) => {
    handleDocumentChange(filePath, content);
  });

  ipcRenderer.on("document-created", (_, filePath) => {
    handleDocumentChange(filePath);
  });
});

// const NOTIFICATION_TITLE = "Success";
// const NOTIFICATION_BODY = "File saved succefully!";
// const CLICK_MESSAGE = "File Saved!";

// new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick =
//   () => (document.getElementById("output").innerHTML = CLICK_MESSAGE);
