const { ipcMain } = require('electron')

module.exports = (mainWindow, manager) => {
  const sendServices = () => {
    console.log('Sending services list')
    mainWindow.webContents.send('services', manager.services.map((service) => {
      return {
        uuid: service.uuid,
        config: service.config,
        name: service.getName()
      }
    }))
  }

  const setupServiceDataListeners = (service) => {
    service.addDataListener((data) => {
      console.log('Sending servicedata for ' + service.uuid)
      mainWindow.webContents.send('servicedata', data)
    })
    service.addErrorListener((error) => {
      const errorStr = error.length && error.length > 0 ? (error[0].message || error[0]) : (error.message || error)
      console.log('Sending error ' + errorStr)
      mainWindow.webContents.send('serviceerror', {
        error: errorStr,
        type: service.uuid
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

    ipcMain.on('serviceconfig', (event, {name, uuid, config}) => {
      const service = manager.updateServiceConfig(name, uuid, config)
      sendServices()
      setupServiceDataListeners(service)
    })

    ipcMain.on('removeService', (event, uuid) => {
      console.log('Will remove ' + uuid)
      manager.removeService(uuid)
      sendServices()
    })

    ipcMain.on('layouts', (event, layouts) => {
      console.log('Updating layouts')
      layouts.forEach(({uuid, layout}) => {
        manager.updateServiceLayout(uuid, layout)
      })
    })

    manager.addReloadListener(() => {
      sendServices()
      setupAllServiceDataListeners()
    })
  })
    .catch((err) => console.error(err))
}
