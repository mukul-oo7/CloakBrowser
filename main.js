const { app, BrowserWindow, Menu, globalShortcut, ipcMain } = require('electron')
const path = require('node:path')

let win;

const createWindow = () =>{
    win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            webviewTag: true,
            preload: path.join(__dirname, 'browser/preload.js'),
        }

    })

    win.loadFile('browser/webui.html');

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

    // const menu = Menu.buildFromTemplate(menuTemplate);
    // Menu.setApplicationMenu(menu);
    Menu.setApplicationMenu(null);

    const rld = globalShortcut.register('CmdOrCtrl+R', ()=>{
        win.reload()
    })

    // win.maximize();
    win.maximize();
    
    win.once('ready-to-show', ()=>{
        win.show()
    })
}

app.whenReady().then(() => {

    createWindow()

    // For mac
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

ipcMain.on('minimize-window', ()=>{
    win.minimize();
})

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
    if(process.platform!='darwin') app.quit()
})