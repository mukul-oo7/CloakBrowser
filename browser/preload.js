// In preload.js

const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  },
});

window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

ipcRenderer.on('uncaught-exception', (event, message) => {
  console.error('Uncaught exception in main process:', message);
  // You can display this error to the user if needed
});