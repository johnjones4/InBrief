const { ipcMain, BrowserWindow } = require('electron')
const electronOauth2 = require('electron-oauth2')
const keys = require('../../keys')
const OAuth = require('oauth-electron-twitter').oauth
const Twitter = require('oauth-electron-twitter').twitter

module.exports = (mainWindow) => {
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
