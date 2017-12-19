const fs = require('fs-extra')
const services = require('../services')
const _ = require('lodash')

exports.load = () => {
  return fs.readJson(process.env.CONFIG || './config.json')
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
