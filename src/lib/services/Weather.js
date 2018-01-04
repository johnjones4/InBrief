const Service = require('./Service')
const request = require('request-promise-native')
const keys = require('../../keys.json')

class Weather extends Service {
  constructor (config) {
    super('weather', config)
    this.intervalDelay = 172800
  }

  exec () {
    if (this.config.location) {
      return request({
        'uri': 'http://api.wunderground.com/api/' + keys.weatherUnderground + '/conditions/forecast/q/' + this.config.location + '.json',
        'json': true,
        'agent': false
      })
        .then((weatherData) => {
          return {
            'name': 'weather',
            'data': {
              'now': {
                'weather': weatherData.current_observation.weather,
                'temp': weatherData.current_observation.temp_f,
                'feelslike': parseFloat(weatherData.current_observation.feelslike_f),
                'humidity': weatherData.current_observation.relative_humidity,
                'icon': weatherData.current_observation.icon
              },
              'forecast': [0, 1, 2].map((i) => {
                return {
                  'label': weatherData.forecast.txt_forecast.forecastday[i].title,
                  'forecast': weatherData.forecast.txt_forecast.forecastday[i].fcttext,
                  'high': parseFloat(weatherData.forecast.simpleforecast.forecastday[i].high.fahrenheit),
                  'low': parseFloat(weatherData.forecast.simpleforecast.forecastday[i].low.fahrenheit),
                  'icon': weatherData.forecast.simpleforecast.forecastday[i].icon
                }
              })
            }
          }
        })
        .catch((err) => {
          this.handleExecError(err)
          return {
            'name': 'weather',
            'data': null
          }
        })
    } else {
      return Promise.resolve({
        'name': 'weather',
        'data': null
      })
    }
  }
}

Weather.defaultConfig = {
  location: null
}

module.exports = Weather
