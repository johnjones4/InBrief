const { Menu, dialog } = require('electron')

module.exports = (app, serviceManager) => {
  buildMenu(app, serviceManager)
  serviceManager.addReloadListener(() => {
    buildMenu(app, serviceManager)
  })
}

const buildMenu = (app, serviceManager) => {
  const template = [
    {
      label: 'Application',
      submenu: [
        { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'reload', id: 'reload' },
        { type: 'separator' },
        {
          label: 'Open Settings File',
          click: () => {
            const paths = dialog.showOpenDialog({properties: ['openFile']})
            if (paths && paths.length > 0) {
              serviceManager.loadConfig(paths[0])
            }
          }
        },
        {
          label: 'Switch to Default Settings',
          click: () => {
            serviceManager.loadConfig(null)
          },
          enabled: !serviceManager.usesLocalConfig()
        },
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
  if (process.env.IS_DEV) {
    template[0].submenu.push({
      role: 'toggledevtools',
      position: 'after=reload'
    })
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
