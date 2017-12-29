import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import './AddWidget.scss'
import PropTypes from 'prop-types'
import {
  setServiceConfig
} from './util/actions'

const services = [
  {
    name: 'twitter',
    label: 'Twitter'
  },
  {
    name: 'rss',
    label: 'RSS'
  },
  {
    name: 'calendar',
    label: 'Calendar'
  },
  {
    name: 'email',
    label: 'Email'
  },
  {
    name: 'tasks',
    label: 'Tasks'
  },
  {
    name: 'weather',
    label: 'Weather'
  }
]

class AddWidget extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showing: false
    }
  }

  addService (name) {
    this.props.setServiceConfig(name, null)
    this.setState({showing: false})
  }

  render () {
    const servicesToShow = services.filter((service) => {
      return this.props.services.services.findIndex((_service) => _service.name === service.name) < 0
    })
    if (servicesToShow.length > 0) {
      if (this.state.showing) {
        return (
          <div className='add-widget-wrapper'>
            <div className='add-widget' style={{width: ((servicesToShow.length * 140) + 10)}}>
              {
                servicesToShow
                  .map((service) => {
                    return (
                      <div className='add-widget-service-option' key={service.name}>
                        <button style={{backgroundImage: 'url(./service_icons/' + service.name + '.svg'}} className='add-widget-service-button' onClick={() => this.addService(service.name)}>{service.label}</button>
                      </div>
                    )
                  })
              }
              <button className='add-widget-close-button' onClick={() => this.setState({showing: false})}>&times;</button>
            </div>
          </div>
        )
      } else {
        return (<button className='add-widget-button' onClick={() => this.setState({showing: true})}>+</button>)
      }
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
    setServiceConfig
  }, dispatch)
}

AddWidget.propTypes = {
  services: PropTypes.shape({
    services: PropTypes.array
  }),
  setServiceConfig: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(AddWidget)
