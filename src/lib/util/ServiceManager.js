const services = require('../services')
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
    this.services = (this.getServiceConfig() || []).map(({name, uuid, config}) => {
      const serviceObject = this.instantiateServiceByName(name, uuid, config)
      serviceObject.begin()
      return serviceObject
    })
    this.reloadListeners.forEach((fn) => fn())
    return Promise.resolve(this.services)
  }

  getServiceByUUID (uuid) {
    return this.services.find((service) => service.uuid === uuid)
  }

  updateServiceLayout (uuid, layout) {
    const service = this.getServiceByUUID(uuid)
    if (service && service.config) {
      service.config.layout = layout
      this.commitServiceConfigs()
    }
  }

  updateServiceConfig (name, uuid, config) {
    const serviceIndex = this.services.findIndex((service) => service.uuid === uuid)
    let newService = this.instantiateServiceByName(name, uuid, config)
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

  removeService (uuid) {
    const serviceIndex = this.services.findIndex((service) => service.uuid === uuid)
    if (serviceIndex >= 0) {
      this.services[serviceIndex].end()
      this.services[serviceIndex].clearListeners()
      this.services.splice(serviceIndex, 1)
    }
    this.commitServiceConfigs()
  }

  commitServiceConfigs () {
    const serviceConfig = this.services.map((service) => {
      return {
        name: service.getName(),
        uuid: service.uuid,
        config: service.config
      }
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

  instantiateServiceByName (name, uuid, config) {
    switch (name) {
      case 'calendar':
        return new services.Calendar(uuid, config || services.Calendar.defaultConfig)
      case 'email':
        return new services.Email(uuid, config || services.Email.defaultConfig)
      case 'rss':
        return new services.RSS(uuid, config || services.RSS.defaultConfig)
      case 'tasks':
        return new services.Tasks(uuid, config || services.Tasks.defaultConfig)
      case 'twitter':
        return new services.Twitter(uuid, config || services.Twitter.defaultConfig)
      case 'weather':
        return new services.Weather(uuid, config || services.Weather.defaultConfig)
      case 'iframe':
        return new services.IFrame(uuid, config || services.IFrame.defaultConfig)
      default:
        return null
    }
  }
}

module.exports = ServiceManager
