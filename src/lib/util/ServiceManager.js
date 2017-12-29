const services = require('../services')
const _ = require('lodash')
const settings = require('electron-settings')

class ServiceManager {
  constructor () {
    this.services = null
  }

  load () {
    const config = settings.get('serviceConfig') || {}
    this.services = _.keys(config).map((name) => {
      const serviceObject = this.instantiateServiceByName(name, config[name])
      serviceObject.begin()
      return serviceObject
    })
    return Promise.resolve(this.services)
  }
  
  getServiceByName (name) {
    return this.services.find((service) => service.name === name)
  }

  updateServiceLayout (name, layout) {
    const service = this.getServiceByName(name)
    if (service && service.config) {
      service.config.layout = layout
      settings.set('serviceConfig.' + name, service.config)
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
    settings.set('serviceConfig.' + name, config)
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
    settings.delete('serviceConfig.' + name)
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
