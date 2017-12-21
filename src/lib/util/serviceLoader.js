const fs = require('fs-extra')
const services = require('../services')
const _ = require('lodash')
const path = require('path')

exports.load = () => {
  const configPath = path.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], '.inbriefrc.json')
  return fs.exists(configPath)
    .then((exists) => {
      if (!exists) {
        return fs.copy('./inbriefrc.sample.json', configPath)
      }
    })
    .then(() => {
      return fs.readJson(configPath)
    })
    .then((config) => {
      if (config) {
        return _.keys(config).map((klass) => {
          const Service = services[klass]
          const serviceObject = new Service(config[klass])
          serviceObject.begin()
          return serviceObject
        })
      } else {
        throw new Error('Config file not found')
      }
    })
}
