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
    return props.services.services ? props.services.services.find((service) => service.name === this.name).tempConfig : null
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
    this.props.commitTempConfig(this.name)
    this.setState({editing: false})
  }

  cancelConfig () {
    this.props.setTemporaryConfig(this.name, this.getWidgetConfig())
    this.setState({editing: false})
  }

  destroyWidget () {
    this.props.removeService(this.name)
  }

  setTempConfigSubValue (field, subfield, value) {
    const newTempConfig = Object.assign({}, this.getWidgetTempConfig())
    newTempConfig[field][subfield] = value
    this.props.setTemporaryConfig(this.name, newTempConfig)
  }

  setTempConfigValue (field, value) {
    const newTempConfig = Object.assign({}, this.getWidgetTempConfig())
    newTempConfig[field] = value
    this.props.setTemporaryConfig(this.name, newTempConfig)
  }

  setTempConfigArrayIndexValue (arrayName, index, field, value) {
    const tempConfig = this.getWidgetTempConfig()
    if (index < tempConfig[arrayName].length) {
      const newArray = tempConfig[arrayName].slice(0)
      newArray[index][field] = value
      this.setTempConfigValue(arrayName, newArray)
    }
  }

  removeTempConfigArrayIndex (arrayName, index) {
    const tempConfig = this.getWidgetTempConfig()
    if (index < tempConfig[arrayName].length) {
      const newArray = tempConfig[arrayName].slice(0)
      newArray.splice(index, 1)
      this.setTempConfigValue(arrayName, newArray)
    }
  }

  addTempConfigArrayObject (arrayName, object) {
    const tempConfig = this.getWidgetTempConfig()
    const newArray = tempConfig[arrayName].slice(0)
    newArray.push(object)
    this.setTempConfigValue(arrayName, newArray)
  }

  moveTempConfigArrayIndex (arrayName, index, nextIndex) {
    const tempConfig = this.getWidgetTempConfig()
    if (index < tempConfig[arrayName].length && nextIndex >= 0 && nextIndex < tempConfig[arrayName].length) {
      const newArray = tempConfig[arrayName].slice(0)
      const oldObject = tempConfig[arrayName][nextIndex]
      newArray[nextIndex] = tempConfig[arrayName][index]
      newArray[index] = oldObject
      this.setTempConfigValue(arrayName, newArray)
    }
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
            <div className='widget-editor-form-area'>
              { this.renderEditor() }
            </div>
            <div className='widget-editor-button-set widget-editor-control-buttons'>
              <button className='destructive' onClick={() => this.destroyWidget()}>Remove</button>
              <button onClick={() => this.saveConfig()}>Save</button>
              <button onClick={() => this.cancelConfig()}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderWidget () {
    return null
  }

  renderEditor () {
    return null
  }
}

Widget.propTypes = {
  services: PropTypes.shape({
    services: PropTypes.array
  }),
  commitTempConfig: PropTypes.func.isRequired,
  removeService: PropTypes.func.isRequired,
  setTemporaryConfig: PropTypes.func.isRequired
}

export default Widget
