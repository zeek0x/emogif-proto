const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  const filepath = process.env.EMOGIF || 'video.mp4'
  win.loadURL(`file://${__dirname}/index.html#${filepath}`);
  
  win.webContents.openDevTools()

  win.on('closed', function() {
    win = null;
  });
});