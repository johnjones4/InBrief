const electron = require('electron')
const {app, BrowserWindow, ipcMain, Menu} = electron
const path = require('path')
const url = require('url')
const ServiceManager = require('./lib/util/ServiceManager')
const electronOauth2 = require('electron-oauth2')
const keys = require('./keys')
const OAuth = require('oauth-electron-twitter').oauth
const Twitter = require('oauth-electron-twitter').twitter

let mainWindow

const isDev = !(!process.env.ELECTRON_START_URL)

const createWindow = () => {
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

const setupServices = () => {
  const manager = new ServiceManager()

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
    service.addListener((data) => {
      console.log('Sending servicedata for ' + service.name)
      mainWindow.webContents.send('servicedata', data)
    })
    if (service.getData()) {
      const data = service.getData()
      mainWindow.webContents.send('servicedata', data)
    }
  }

  manager.load().then(() => {
    sendServices()

    ipcMain.on('services', (event) => {
      sendServices()
    })

    manager.services.forEach((service) => {
      setupServiceDataListeners(service)
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
  })
    .catch((err) => console.error(err))
}

const setupMenu = () => {
  var template = [
    {
      label: 'Application',
      submenu: [
        { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => { app.quit() } }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    }
  ]
  if (!isDev) {
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  }
}

const setupAuthorizers = () => {
  const authWindowOptions = {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false
    }
  }

  const getAuthURL = (service) => {
    switch (service) {
      case 'asana':
        return 'https://app.asana.com/-/oauth_authorize'
      case 'todoist':
        return 'https://todoist.com/oauth/authorize'
      default:
        return null
    }
  }

  const getTokenURL = (service) => {
    switch (service) {
      case 'asana':
        return 'https://app.asana.com/-/oauth_token'
      case 'todoist':
        return 'https://todoist.com/oauth/access_token'
      default:
        return null
    }
  }

  const getAccessTokenOptions = (service) => {
    switch (service) {
      case 'asana':
        return {
          additionalTokenRequestData: {
            'response_type': 'code',
            'state': new Date().getTime() + ''
          }
        }
      case 'todoist':
        return {
          scope: 'data:read'
        }
      default:
        return null
    }
  }

  const doOAuth2Request = (service) => {
    const oauth = electronOauth2({
      clientId: keys[service].id,
      clientSecret: keys[service].secret,
      authorizationUrl: getAuthURL(service),
      tokenUrl: getTokenURL(service),
      useBasicAuthorizationHeader: false,
      redirectUri: 'http://localhost'
    }, authWindowOptions)
    oauth.getAccessToken(getAccessTokenOptions(service))
      .then(token => {
        mainWindow.webContents.send('authorize-tasks-' + service, token.access_token)
      })
      .catch((err) => console.error(err))
  }

  ipcMain.on('authorize-tasks-asana', (event) => {
    doOAuth2Request('asana')
  })

  ipcMain.on('authorize-tasks-todoist', (event) => {
    doOAuth2Request('todoist')
  })

  ipcMain.on('authorize-twitter', (event) => {
    const window = new BrowserWindow(authWindowOptions)
    var info = new Twitter(keys.twitter.key, keys.twitter.secret)
    var auth = new OAuth()
    auth.login(info, window)
      .then((result) => {
        mainWindow.webContents.send('authorize-twitter', {
          token: result.oauth_access_token,
          tokenSecret: result.oauth_access_token_secret
        })
        window.close()
      })
      .catch((error) => console.log(error))
  })
}

app.on('ready', () => {
  createWindow()
  setupMenu()
  setupServices()
  setupAuthorizers()
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
