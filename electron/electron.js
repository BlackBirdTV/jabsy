// electron/electron.js
const path = require('path');
const { electron, screen, app, BrowserWindow, ipcMain, nativeTheme, dialog, remote } = require('electron');
const Store = require('electron-store')

const isDev = process.env.IS_DEV == "true" ? true : false;
let mainWindow;

const store = new Store()

function createWindow() {
  // Gets the data for the app
  const display = screen.getPrimaryDisplay();
  const dimensions = display.workAreaSize;
  const maximized = store.get('maximized')
  // Create the browser window.
  let windowWidth = store.get('width')
  if (windowWidth < 800 || maximized) windowWidth = dimensions.width * 0.7
  let windowHeight = store.get('height')
  if (windowHeight < 800 || maximized) windowHeight = dimensions.height * 0.7
  let windowX = store.get('x')
  if (windowX < 0) windowX = (dimensions.width * 0.5) - (windowWidth * 0.5)
  let windowY = store.get('y')
  if (windowY < 0) windowY = (dimensions.height * 0.5) - (windowHeight * 0.5)

  nativeTheme.themeSource = store.get('darkmode') ? 'dark' : 'light'

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 1017,
    minHeight: 756,
    x: windowX,
    y: windowY,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (maximized) mainWindow.maximize();

  // and load the index.html of the app.
  // win.loadFile("index.html");
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  let windowSize = mainWindow.getBounds();
  console.log(windowSize.width);
  console.log(windowSize.height);
  console.log(windowSize.x);
  console.log(windowSize.y);

  mainWindow.on('close', () => {
    let windowSize = mainWindow.getBounds();
    store.set('width', windowSize.width);
    store.set('height', windowSize.height);
    store.set('x', windowSize.x);
    store.set('y', windowSize.y);
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('close', () => {
  store.set('maximized', mainWindow.isMaximized());
  mainWindow.close();
})
ipcMain.on('minimize', () => {
  mainWindow.minimize();
})
ipcMain.on('maximize', () => {
  if (mainWindow.isMaximized) mainWindow.maximize();
  else mainWindow.restore();
})
ipcMain.on('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  store.set('darkmode', nativeTheme.shouldUseDarkColors)
})
ipcMain.on('restart', () => {
  app.relaunch()
  app.exit()
})
ipcMain.on('requestStoreValue', (event, key) => {
  event.sender.send('replyStoreValue', key, store.get(key));
});
ipcMain.on('setStoreValue', (event, key, value) => {
  store.set(key, value);
})