import React, { Component } from 'react'
import './Widget.scss'
import PropTypes from 'prop-types'

class Widget extends Component {
  constructor (title, name, props) {
    super(props)
    this.name = name
    this.title = title
    this.state = {
      editing: false,
      temporaryConfigString: ''
    }
  }

  componentWillReceiveProps (newProps) {
    const config = this.getWidgetConfig(newProps)
    if (config) {
      const configString = JSON.stringify(config, null, '  ')
      if (configString !== this.state.temporaryConfigString) {
        this.setState({temporaryConfigString: configString})
      }
    }
  }

  getWidgetConfig (props = this.props) {
    return props.services.services ? props.services.services.find((service) => service.name === this.name).config : null
  }

  getWidgetData () {
    return this.props.services.services ? this.props.services.services.find((service) => service.name === this.name).data : null
  }

  isReady () {
    return this.state.data !== null
  }

  getMainClassNames () {
    return ['widget', 'widget-' + this.name]
  }

  editConfig () {
    this.setState({editing: true})
    if (this.configJsonElement) {
      this.configJsonElement.focus()
    }
  }

  saveConfig () {
    this.setState({editing: false})
    this.props.setServiceConfig(this.name, JSON.parse(this.temporaryConfigString))
  }

  cancelConfig () {
    this.setState({editing: false})
  }

  render () {
    return (
      <div className={['widget-wrapper', (this.state.editing ? 'widget-editing' : null)].join(' ')}>
        <div className={this.getMainClassNames().join(' ')} key={this.name}>
          <div className='widget-title'>
            {this.title}
            <button className='widget-title-edit' onClick={() => this.editConfig()}>Edit</button>
          </div>
          <div className='widget-body'>
            {this.renderWidget()}
          </div>
        </div>
        <div className='widget-editor'>
          <div className='widget-editor-title'>
            {this.title}
          </div>
          <div className='widget-editor-body'>
            <textarea className='widget-editor-json' ref={(el) => { this.configJsonElement = el }} onChange={(event) => this.setState({temporaryConfigString: event.target.value})} value={this.state.temporaryConfigString} />
            <div className='widget-editor-buttons'>
              <button className='widget-editor-button' onClick={() => this.saveConfig()}>Save</button>
              <button className='widget-editor-button' onClick={() => this.cancelConfig()}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderWidget () {
    return null
  }
}

Widget.propTypes = {
  services: PropTypes.shape({
    services: PropTypes.array
  }),
  setServiceConfig: PropTypes.func.isRequired
}

export default Widget
