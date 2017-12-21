const ews = require('ews-javascript-api')
const httpntlm = require('httpntlm')

const NTLMXHRAPI = (function () {
  function ntlmXHRApi (user, password) {
    this.userName = user
    this.password = password
  }
  ntlmXHRApi.prototype.xhr = function (xhroptions) {
    const _this = this
    let userName = _this.userName
    let domain = ''
    if (userName.indexOf('\\') >= 0) {
      const usersplit = userName.split('\\', 2)
      userName = usersplit[1]
      domain = usersplit[0]
    }
    const headers = xhroptions.headers

    if (headers['Authorization']) {
      delete headers['Authorization']
    }
    const xhr = {
      url: xhroptions.url,
      username: userName,
      password: _this.password,
      workstation: '',
      domain: domain,
      body: xhroptions.data,
      headers: headers
    }
    return new Promise(function (resolve, reject) {
      httpntlm.post(xhr, function (err, res) {
        res.getAllResponseHeaders = function () {
          let header = ''
          if (res.headers) {
            for (let key in res.headers) {
              header += key + ' : ' + res.headers[key] + '\r\n'
            }
          }
          return header
        }
        if (err) {
          reject(err)
        } else {
          res['responseText'] = res.body
          res['status'] = res.statusCode
          if (res.statusCode === 200) {
            resolve(res)
          } else {
            reject(res)
          }
        }
      })
    })
  }
  Object.defineProperty(ntlmXHRApi.prototype, 'type', {
    get: function () {
      return 'ntlmXHR'
    },
    enumerable: true,
    configurable: true
  })
  return ntlmXHRApi
})()

exports.init = (credentials) => {
  var ntlmXHRApi = new NTLMXHRAPI(credentials.username, credentials.password)
  ews.EwsLogging.DebugLogEnabled = false
  const exch = new ews.ExchangeService(ews.ExchangeVersion.Exchange2013)
  exch.XHRApi = ntlmXHRApi
  exch.Credentials = new ews.WebCredentials('blah', 'blah')
  exch.Url = new ews.Uri(credentials.url)
  return exch
}
