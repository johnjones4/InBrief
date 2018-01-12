const { ipcMain, BrowserWindow } = require('electron')
const keys = require('../../keys')
const OAuth = require('oauth-electron-twitter').oauth
const Twitter = require('oauth-electron-twitter').twitter
const oauthFactory = require('../util/oauthFactory')

module.exports = (mainWindow) => {
  const authWindowOptions = {
    alwaysOnTop: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false
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
    const oauth = oauthFactory(service, authWindowOptions)
    oauth.getAccessToken(getAccessTokenOptions(service))
      .then(token => {
        mainWindow.webContents.send('authorize-tasks-' + service, {
          token: token.access_token,
          refreshToken: token.refresh_token
        })
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
      .catch((error) => {
        console.log('here')
        console.error(error)
      })
  })
}
