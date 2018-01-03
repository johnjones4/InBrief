import React from 'react'
import Widget from './Widget'
import './Weather.scss'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  commitTempConfig,
  setTemporaryConfig,
  removeService
} from '../util/actions'

class Weather extends Widget {
  constructor (props) {
    super('Weather', 'weather', props)
  }

  renderCurrentWeather (data) {
    return (
      <div className='weather-now'>
        <div className='weather-label'>Now</div>
        <div className='weather-now-content'>
          <img src={'./weather/' + data.now.icon + '.svg'} alt={data.now.weather} className='weather-icon' />
          <div className='weather-description'>
            {data.now.weather}
          </div>
          <div className='weather-temp'>
            <span className='weather-value-label weather-temp-label'>Temp: </span>
            <span className='weather-temp-temp'>{data.now.temp}&#176;</span>
          </div>
          <div className='weather-feelslike'>
            <span className='weather-value-label weather-feelslike-label'>Feels Like: </span>
            <span className='weather-feelslike-temp'>{data.now.feelslike}&#176;</span>
          </div>
          <div className='weather-humidity'>
            <span className='weather-value-label weather-humidity-label'>Humidity: </span>
            <span className='weather-humidity-temp'>{data.now.humidity}</span>
          </div>
        </div>
      </div>
    )
  }

  renderForecast (data) {
    return (
      <div className='weather-forecast'>
        {
          data.forecast.map((item, i) => {
            return (
              <div className='weather-forecast-item' key={i}>
                <div className='weather-label'>{item.label}</div>
                <div className='weather-content'>
                  <div className='weather-icon-wrapper'>
                    <img src={'./weather/' + item.icon + '.svg'} className='weather-icon' alt={item.forecast} />
                  </div>
                  <div className='weather-text'>
                    <div className='weather-description'>
                      {item.forecast}
                    </div>
                    <div className='weather-high'>
                      <span className='weather-value-label weather-high-label'>High: </span>
                      <span className='weather-high-temp'>{item.high}&#176;</span>
                    </div>
                    <div className='weather-low'>
                      <span className='weather-value-label weather-low-label'>Low: </span>
                      <span className='weather-low-temp'>{item.low}&#176;</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }

  renderWidget () {
    const data = this.getWidgetData()
    return data && (
      <div className='weather-wrapper'>
        { this.renderCurrentWeather(data) }
        { this.renderForecast(data) }
      </div>
    )
  }

  renderEditor () {
    const tempConfig = this.getWidgetTempConfig()
    if (tempConfig) {
      return (
        <div>
          <div className='widget-editor-input-group'>
            <label className='widget-editor-label'>ZIP Code</label>
            <input className='widget-editor-input' type='text' value={tempConfig.location} onChange={(event) => this.setTempConfigValue('location', event.target.value)} />
          </div>
        </div>
      )
    } else {
      return null
    }
  }
}

const stateToProps = (state) => {
  return {
    services: state.services
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    commitTempConfig,
    setTemporaryConfig,
    removeService
  }, dispatch)
}

Weather.widgetProps = {
  h: 2.5,
  isResizable: false
}

export default connect(stateToProps, dispatchToProps)(Weather)
