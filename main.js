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
      const proxyUrl = 'http://localhost:8000/proxy/';
      
      console.log('Original URL:', details.url);
      
      if (!details.url.startsWith(proxyUrl)) {
        const newUrl = proxyUrl + encodeURIComponent(details.url);
        console.log('Redirecting to:', newUrl);
        callback({ redirectURL: newUrl });
      } else {
        console.log('URL already proxied:', details.url);
        callback({});
      }
    });
  }

const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
          webviewTag: true,
          webSecurity: false,
          allowRunningInsecureContent: true,
          preload: path.join(__dirname, 'browser/preload.js'),
        }
    });

    setupProxy(win);

    win.loadFile('browser/webui.html')

    // setupInterceptors(session.defaultSession);

    const menuTemplate = [
        {
            label: 'tools',
            submenu: [
                {
                    label: 'Dev tools',
                    accelerator: 'Shift+CommandOrControl+I',
                    click: () => {
                        win.webContents.openDevTools();
                    }
                }
            ]
        }
    ];

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      console.error('Failed to load:', errorCode, errorDescription, validatedURL);
      win.loadFile('browser/error.html')
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


app.whenReady().then(() => {
    try {
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
