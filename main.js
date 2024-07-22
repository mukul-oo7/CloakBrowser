const { app, BrowserWindow, Menu, globalShortcut, ipcMain, session, net } = require('electron');
const path = require('node:path');
// const setupProxy = require('./proxyConfig');
const setupInterceptors = require('./interceptor');
const axios = require('axios');
const https = require('https');
const http = require('http');
const fs = require('fs');
const url = require('url');


let win;

function setupProxy() {
  const proxyUrl = 'http://localhost:8000';

  const filter = {
    urls: ['<all_urls>']
  };

  session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    if (details.url.startsWith(proxyUrl) || details.url.startsWith('file://')) {
      callback({});
    } else {
      const proxyReq = net.request({
        method: details.method,
        url: `${proxyUrl}/proxy/${encodeURIComponent(details.url)}`,
        session: session.defaultSession
      });

      proxyReq.on('response', (proxyRes) => {
        const chunks = [];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
          callback({
            responseHeaders: proxyRes.headers,
            statusCode: proxyRes.statusCode,
            data: Buffer.concat(chunks)
          });
        });
      });

      proxyReq.on('error', (error) => {
        console.error('Proxy request failed:', error);
        callback({ cancel: true });
      });

      if (details.uploadData) {
        details.uploadData.forEach(data => {
          if (data.bytes) proxyReq.write(data.bytes);
          else if (data.file) proxyReq.write(require('fs').readFileSync(data.file));
        });
      }

      proxyReq.end();

      return { cancel: true };
    }
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      webviewTag: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'browser/preload.js'),
      contextIsolation: false,  // Add this line
      nodeIntegration: true,    // Add this line
    }
  });


  win.loadFile('browser/webui.html')

  // SetupProxy();
  
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
    win.loadFile('browser/error.html')
    // You can load a local error page here if you want
    // win.loadFile('error.html');
  });

  

    Menu.setApplicationMenu(null);

    globalShortcut.register('CmdOrCtrl+R', () => {
        win.reload();
    });

    win.maximize();

    globalShortcut.register('CmdOrCtrl+I', ()=> {
        win.openDevTools();

    })

    win.once('ready-to-show', () => {
        win.show();
    });
};


app.whenReady().then(() => {
    try {
      setupProxy();
      createWindow();
    } catch (error) {
      console.error('Error creating window:', error);
    }
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        try {
          createWindow();
        } catch (error) {
          console.error('Error creating window:', error);
        }
      }
    });
  });
  
  app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
  });

  
ipcMain.on('minimize-window', () => {
    win.minimize();
});

ipcMain.on('maximize-window', () => {
    if (win.isMaximized()) {
        win.unmaximize();
    } else {
        win.maximize();
    }
});

ipcMain.on('close-window', () => {
    win.close();
});

