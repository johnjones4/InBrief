const electron = require('electron')
const {app, BrowserWindow, ipcMain} = electron
const path = require('path')
const url = require('url')
const serviceLoader = require('./lib/util/serviceLoader')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600})

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  })
  mainWindow.loadURL(startUrl)

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

serviceLoader.load().then((services) => {
  const sendServices = () => {
    mainWindow.webContents.send('services', services.map((service) => {
      return service.name
    }))
  }

  sendServices()

  ipcMain.on('services', (event) => {
    sendServices()
  })

  services.forEach((service) => {
    service.addListener(({type, data}) => {
      mainWindow.webContents.send(type, data)
    })
    ipcMain.on(service.name, (event) => {
      service.getCachedOrExec()
        .then(({type, data}) => {
          mainWindow.webContents.send(type, data)
        })
        .catch((error) => console.error(error))
    })
  })
})
