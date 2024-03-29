import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import './AddWidget.css'
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
  },
  {
    name: 'iframe',
    label: 'IFrame'
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
    this.props.setServiceConfig(name, uuidv4(), null)
    this.setState({showing: false})
  }

  render () {
    return (
      <div>
        <div className={'add-widget-wrapper' + (this.state.showing ? ' active' : '')}>
          <div className='add-widget' style={{width: ((services.length * 140) + 10)}}>
            <div className='add-widget-title'>
              Choose a Card
            </div>
            {
              services
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
        {services.length > 0 && !this.state.showing ? (<button className='add-widget-button' onClick={() => this.setState({showing: true})}>+</button>) : null}
      </div>
    )
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
  setServiceConfig: PropTypes.func.isRequired
}

export default connect(stateToProps, dispatchToProps)(AddWidget)
