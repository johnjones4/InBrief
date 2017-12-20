const ews = require('ews-javascript-api')
var NTLMXHR = require('./ntlmXHRApi')

exports.init = (credentials) => {
  var ntlmXHRApi = new NTLMXHR.NTLMXHRApi(credentials.username, credentials.password)
  ews.EwsLogging.DebugLogEnabled = false
  const exch = new ews.ExchangeService(ews.ExchangeVersion.Exchange2013)
  exch.XHRApi = ntlmXHRApi
  exch.Credentials = new ews.WebCredentials('blah', 'blah')
  exch.Url = new ews.Uri(credentials.url)
  return exch
}
