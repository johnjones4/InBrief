const Service = require('./Service')
const request = require('request-promise-native')
const zipcodes = require('zipcodes')

class Weather extends Service {
  constructor (config) {
    super('weather', config)
    this.intervalDelay = 172800
  }

  exec () {
    if (this.config.location) {
      const coords = zipcodes.lookup(this.config.location)
      if (coords) {
        return request({
          'uri': 'https://api.weather.gov/points/' + coords.latitude + '%2C' + coords.longitude + '/forecast',
          'json': true,
          'agent': false,
          'headers': {
            'User-agent': 'InBrief',
            'Accept': 'application/ld+json'
          }
        })
          .then((weatherData) => {
            return {
              'name': 'weather',
              'data': weatherData.periods.slice(0, 4).map(period => {
                return {
                  'label': period.name,
                  'icon': period.icon,
                  'description': period.shortForecast,
                  'temp': period.temperature
                }
              })
            }
          })
          .catch((err) => {
            this.handleExecError(err)
            return {
              'name': 'weather',
              'data': null
            }
          })
      }
    }
    return Promise.resolve({
      'name': 'weather',
      'data': null
    })
  }
}

Weather.defaultConfig = {
  location: null
}

module.exports = Weather
