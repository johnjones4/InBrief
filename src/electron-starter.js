const electron = require('electron')
const {app, BrowserWindow} = electron
const path = require('path')
const url = require('url')
const servicesSetup = require('./lib/processHelpers/servicesSetup')
const menuSetup = require('./lib/processHelpers/menuSetup')
const authorizorsSetup = require('./lib/processHelpers/authorizorsSetup')
const twitterListHelper = require('./lib/processHelpers/twitterListHelper')

process.env.IS_DEV = !(!process.env.ELECTRON_START_URL)

let mainWindow

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

app.on('ready', () => {
  createWindow()
  menuSetup(app)
  servicesSetup(mainWindow)
  authorizorsSetup(mainWindow)
  twitterListHelper(mainWindow)
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
