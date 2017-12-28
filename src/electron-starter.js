const electron = require('electron')
const {app, BrowserWindow, ipcMain} = electron
const path = require('path')
const url = require('url')
const ServiceManager = require('./lib/util/ServiceManager')

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    title: 'InBrief'
  })

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

app.on('ready', () => {
  createWindow()

  const manager = new ServiceManager()

  manager.load().then(() => {
    const sendServices = () => {
      mainWindow.webContents.send('services', manager.services.map((service) => {
        return {
          name: service.name,
          config: service.config
        }
      }))
    }

    sendServices()

    ipcMain.on('services', (event) => {
      sendServices()
    })

    manager.services.forEach((service) => {
      service.addListener((data) => {
        mainWindow.webContents.send('servicedata', data)
      })
      ipcMain.on('servicedata-' + service.name, (event) => {
        if (service.getData()) {
          const data = service.getData()
          mainWindow.webContents.send('servicedata', data)
        }
      })
      if (service.getData()) {
        const data = service.getData()
        mainWindow.webContents.send('servicedata', data)
      }
    })

    ipcMain.on('servicedata', (event) => {
      manager.services.forEach((service) => {
        if (service.getData()) {
          const data = service.getData()
          mainWindow.webContents.send('servicedata', data)
        }
      })
    })

    ipcMain.on('serviceconfig', (event, {name, config}) => {
      manager.updateServiceConfig(name, config)
      mainWindow.webContents.send('services', manager.services.map((service) => {
        return {
          name: service.name,
          config: service.config
        }
      }))
    })
  })
    .catch((err) => console.error(err))
})

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
