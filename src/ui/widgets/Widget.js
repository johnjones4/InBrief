import React, { Component } from 'react'
import './Widget.scss'
import PropTypes from 'prop-types'

class Widget extends Component {
  constructor (title, name, props) {
    super(props)
    this.name = name
    this.title = title
    this.state = {
      editing: false
    }
  }

  getWidgetConfig (props = this.props) {
    return props.services.services ? props.services.services.find((service) => service.name === this.name).config : null
  }

  getWidgetTempConfig (props = this.props) {
    return props.services.services ? props.services.services.find((service) => service.name === this.name).tempConfigString : null
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
    this.props.commitTempConfigString(this.name)
    this.setState({editing: false})
  }

  cancelConfig () {
    this.setState({editing: false})
  }

  destroyWidget () {
    this.props.removeService(this.name)
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
            <textarea
              className='widget-editor-json'
              ref={(el) => { this.configJsonElement = el }}
              onChange={(event) => this.props.setTemporaryServiceConfigString(this.name, event.target.value)}
              value={this.getWidgetTempConfig()} />
            <div className='widget-editor-buttons'>
              <button className='widget-editor-button destructive' onClick={() => this.destroyWidget()}>Remove</button>
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
  commitTempConfigString: PropTypes.func.isRequired,
  removeService: PropTypes.func.isRequired,
  setTemporaryServiceConfigString: PropTypes.func.isRequired
}

export default Widget
