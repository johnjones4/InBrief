const ews = require('ews-javascript-api')
var NTLMXHRAPI = require('./NTLMXHRAPI')

exports.init = (credentials) => {
  var ntlmXHRApi = new NTLMXHRAPI(credentials.username, credentials.password)
  ews.EwsLogging.DebugLogEnabled = false
  const exch = new ews.ExchangeService(ews.ExchangeVersion.Exchange2013)
  exch.XHRApi = ntlmXHRApi
  exch.Credentials = new ews.WebCredentials('blah', 'blah')
  exch.Url = new ews.Uri(credentials.url)
  return exch
}
