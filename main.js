const { app, BrowserWindow, Menu, globalShortcut, ipcMain, session } = require('electron');
const path = require('node:path');
// const setupProxy = require('./proxyConfig');
const setupInterceptors = require('./interceptor');
const axios = require('axios');

let win;

function setupProxy(win) {
  const filter = {
    urls: ['*://*/*']
  };

  session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    if (win.isDestroyed()) {
      callback({});
      return;
    }

    const proxyUrl = 'http://localhost:8000/proxy/';
    
    console.log('Original URL:', details.url);
    
    // Check if the URL is already proxied
    if (details.url.startsWith(proxyUrl)) {
      console.log('Already proxied, not modifying:', details.url);
      callback({});
    } else if (details.url.startsWith('http://localhost:8000')) {
      // If it's a local URL (like a Google search), we need to proxy it
      const newUrl = proxyUrl + encodeURIComponent(details.url);
      console.log('Local URL, proxying to:', newUrl);
      callback({ redirectURL: newUrl });
    } else {
      const newUrl = proxyUrl + encodeURIComponent(details.url);
      console.log('Redirecting to:', newUrl);
      callback({ redirectURL: newUrl });
    }
  });
}

// Add this function to handle uncaught exceptions
function handleUncaughtException(error) {
  console.error('Uncaught Exception:', error);
  if (win && !win.isDestroyed()) {
    win.webContents.send('uncaught-exception', error.message);
  }
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

  setupProxy(win);

  win.loadFile('browser/webui.html')

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!win.isDestroyed()) {
      console.error('Failed to load:', errorCode, errorDescription, validatedURL);
      win.loadFile('browser/error.html')
    }
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



ipcMain.handle('proxy-request', async (event, requestConfig) => {
  const { url, method, headers, data } = requestConfig;
  try {
    const response = await axios({
      url,
      method,
      headers,
      data,
    });
    return response.data;
  } catch (error) {
    return { error: error.message };
  }
});

app.on('ready', () => {
  try {
    createWindow();
  } catch (error) {
    console.error('Error creating window:', error);
  }

  // Set up the uncaught exception handler
  process.on('uncaughtException', handleUncaughtException);
});


// app.whenReady().then(() => {
//     try {
//       createWindow();
//     } catch (error) {
//       console.error('Error creating window:', error);
//     }
  
//     app.on('activate', () => {
//       if (BrowserWindow.getAllWindows().length === 0) {
//         try {
//           createWindow();
//         } catch (error) {
//           console.error('Error creating window:', error);
//         }
//       }
//     });
//   });

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

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
