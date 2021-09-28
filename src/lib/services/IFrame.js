const Service = require('./Service')

class IFrame extends Service {
  getName () {
    return 'iframe'
  }

  exec () {
    return Promise.resolve()
  }
}

IFrame.defaultConfig = {
  url: '',
  title: ''
}

module.exports = IFrame
