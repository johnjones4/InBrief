const electronOauth2 = require('electron-oauth2')
const keys = require('../../keys')

module.exports = (service, authWindowOptions) => {
  return electronOauth2({
    clientId: keys[service].id,
    clientSecret: keys[service].secret,
    authorizationUrl: getAuthURL(service),
    tokenUrl: getTokenURL(service),
    useBasicAuthorizationHeader: false,
    redirectUri: 'http://localhost'
  }, authWindowOptions)
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
