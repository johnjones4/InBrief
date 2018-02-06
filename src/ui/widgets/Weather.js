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
import {
  WidgetEditorFieldGroup
} from '../util/widgetElements'

class Weather extends Widget {
  constructor (props) {
    super('Weather', 'weather', props)
    this.state = {
      selectedIndex: 0
    }
  }

  getForecaseTranslation (index) {
    if (index === this.state.selectedIndex) {
      return {}
    } else {
      const delta = index - this.state.selectedIndex
      return {
        'transform': 'translateX(' + (delta * 100) + '%)'
      }
    }
  }

  renderWeather (weather, index) {
    return (
      <div className='weather-forecast' style={this.getForecaseTranslation(index)} key={weather.label}>
        <div className='weather-content'>
          <div className='weather-icon-wrapper'>
            <img src={'./weather/' + weather.icon + '.svg'} className='weather-icon' alt={weather.description} />
          </div>
          <div className='weather-text'>
            <div className='weather-description'>
              {weather.description}
            </div>
            { weather.temps.length === 2 ? (
              <div>
                <div className='weather-key-value'>
                  <span className='weather-key'>High: </span>
                  <span className='weather-value'>{weather.temps[0]}&#176;</span>
                </div>
                <div className='weather-key-value'>
                  <span className='weather-key'>Low: </span>
                  <span className='weather-value'>{weather.temps[1]}&#176;</span>
                </div>
              </div>
            ) : (
              <div className='weather-key-value'>
                <span className='weather-key'>Temp: </span>
                <span className='weather-value'>{weather.temps[0]}&#176;</span>
              </div>
            )}
            <div className='weather-key-value'>
              <span className='weather-key'>Humidity: </span>
              <span className='weather-value'>{weather.humidity}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderWidget () {
    const data = this.getWidgetData()
    return data && (
      <div className='weather-wrapper'>
        <div className='weather-forecasts'>
          { data.map((weather, index) => this.renderWeather(weather, index)) }
        </div>
        <div className='weather-nav-labels'>
          { data.map((weather, index) => {
            return (<button key={index} className={'weather-nav-label' + (index === this.state.selectedIndex ? ' active' : '')} onClick={() => this.setState({selectedIndex: index})}>{weather.label}</button>)
          }) }
        </div>
      </div>
    )
  }

  renderEditor () {
    const tempConfig = this.getWidgetTempConfig()
    if (tempConfig) {
      return (
        <div>
          <WidgetEditorFieldGroup name='ZIP Code'>
            <input className='widget-editor-input' type='text' value={tempConfig.location || ''} onChange={(event) => this.setTempConfigValue('location', event.target.value)} />
          </WidgetEditorFieldGroup>
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
  h: 2,
  isResizable: true
}

export default connect(stateToProps, dispatchToProps)(Weather)
