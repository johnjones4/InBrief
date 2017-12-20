// see reference implementation in ews-javascript-api_repo@github\test\MockXHRApi.ts, this one is transpiled JS
//  -----   Updated to process errors in ntlm library gracefully
var httpntlm = require('httpntlm')
var ntlmXHRApi = (function () {
  function ntlmXHRApi (user, password) {
    this.userName = user
    this.password = password
  }
  ntlmXHRApi.prototype.xhr = function (xhroptions) {
    var _this = this
    var userName = _this.userName
    var domain = ''
    if (userName.indexOf('\\') >= 0) {
      var usersplit = userName.split('\\', 2)
      userName = usersplit[1]
      domain = usersplit[0]
    }
    var headers = xhroptions.headers

    if (headers['Authorization']) {
      delete headers['Authorization']
    }
    var xhr = {
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
          var header = ''
          if (res.headers) {
            for (var key in res.headers) {
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
exports.NTLMXHRApi = ntlmXHRApi
