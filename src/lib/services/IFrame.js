const Service = require('./Service')
const request = require('request-promise-native')
const zipcodes = require('zipcodes')

class IFrame extends Service {
  constructor (config) {
    super('iframe', config)
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
