const { ipcMain } = require('electron')

module.exports = (mainWindow, manager) => {
  const sendServices = () => {
    console.log('Sending services list')
    mainWindow.webContents.send('services', manager.services.map((service) => {
      return {
        name: service.name,
        config: service.config
      }
    }))
  }

  const setupServiceDataListeners = (service) => {
    service.addDataListener((data) => {
      console.log('Sending servicedata for ' + service.name)
      mainWindow.webContents.send('servicedata', data)
    })
    service.addErrorListener((error) => {
      const errorStr = error.length && error.length > 0 ? (error[0].message || error[0]) : (error.message || error)
      console.log('Sending error ' + errorStr)
      mainWindow.webContents.send('serviceerror', {
        error: errorStr,
        type: service.name
      })
    })
    if (service.getData()) {
      const data = service.getData()
      mainWindow.webContents.send('servicedata', data)
    }
  }

  const setupAllServiceDataListeners = () => {
    manager.services.forEach((service) => {
      setupServiceDataListeners(service)
    })
  }

  manager.load().then(() => {
    sendServices()
    setupAllServiceDataListeners()

    ipcMain.on('services', (event) => {
      sendServices()
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
      const service = manager.updateServiceConfig(name, config)
      sendServices()
      setupServiceDataListeners(service)
    })

    ipcMain.on('removeService', (event, name) => {
      console.log('Will remove ' + name)
      manager.removeService(name)
      sendServices()
    })

    ipcMain.on('layouts', (event, layouts) => {
      console.log('Updating layouts')
      layouts.forEach(({name, layout}) => {
        manager.updateServiceLayout(name, layout)
      })
    })

    manager.addReloadListener(() => {
      sendServices()
      setupAllServiceDataListeners()
    })
  })
    .catch((err) => console.error(err))
}
