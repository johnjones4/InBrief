const services = require('../services')
const _ = require('lodash')
const settings = require('electron-settings')
const fs = require('fs-extra')

class ServiceManager {
  constructor () {
    this.services = null
    this.reloadListeners = []
  }

  addReloadListener (fn) {
    this.reloadListeners.push(fn)
  }

  usesLocalConfig () {
    return !settings.get('serviceConfigPath')
  }

  loadConfig (path) {
    if (!path || path === settings.file()) {
      settings.delete('serviceConfigPath')
    } else {
      settings.set('serviceConfigPath', path)
    }
    return this.load()
  }

  load () {
    if (this.services) {
      this.services.forEach((service) => {
        service.end()
        service.clearListeners()
      })
    }
    const config = this.getServiceConfig() || {}
    this.services = _.keys(config).map((name) => {
      const serviceObject = this.instantiateServiceByName(name, config[name])
      serviceObject.begin()
      return serviceObject
    })
    this.reloadListeners.forEach((fn) => fn())
    return Promise.resolve(this.services)
  }

  getServiceByName (name) {
    return this.services.find((service) => service.name === name)
  }

  updateServiceLayout (name, layout) {
    const service = this.getServiceByName(name)
    if (service && service.config) {
      service.config.layout = layout
      this.commitServiceConfigs()
    }
  }

  updateServiceConfig (name, config) {
    const serviceIndex = this.services.findIndex((service) => service.name === name)
    let newService = this.instantiateServiceByName(name, config)
    if (serviceIndex >= 0) {
      this.services[serviceIndex].end()
      this.services[serviceIndex].clearListeners()
      this.services[serviceIndex] = newService
    } else {
      this.services.push(newService)
    }
    this.commitServiceConfigs()
    newService.begin()
    return newService
  }

  removeService (name) {
    const serviceIndex = this.services.findIndex((service) => service.name === name)
    if (serviceIndex >= 0) {
      this.services[serviceIndex].end()
      this.services[serviceIndex].clearListeners()
      this.services.splice(serviceIndex, 1)
    }
    this.commitServiceConfigs()
  }

  commitServiceConfigs () {
    const serviceConfig = {}
    this.services.forEach((service) => {
      serviceConfig[service.name] = service.config
    })
    if (this.usesLocalConfig()) {
      settings.set('serviceConfig', serviceConfig)
    } else {
      fs.writeJsonSync(settings.get('serviceConfigPath'), serviceConfig)
    }
  }

  getServiceConfig () {
    if (this.usesLocalConfig()) {
      return settings.get('serviceConfig')
    } else {
      return fs.readJsonSync(settings.get('serviceConfigPath'))
    }
  }

  instantiateServiceByName (name, config) {
    switch (name) {
      case 'calendar':
        return new services.Calendar(config || services.Calendar.defaultConfig)
      case 'email':
        return new services.Email(config || services.Email.defaultConfig)
      case 'rss':
        return new services.RSS(config || services.RSS.defaultConfig)
      case 'tasks':
        return new services.Tasks(config || services.Tasks.defaultConfig)
      case 'twitter':
        return new services.Twitter(config || services.Twitter.defaultConfig)
      case 'weather':
        return new services.Weather(config || services.Weather.defaultConfig)
      default:
        return null
    }
  }
}

module.exports = ServiceManager
