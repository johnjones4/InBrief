import React, { Component } from 'react'
import './Widget.css'
import './WidgetEditor.css'
import './WidgetBigNumbers.css'
import PropTypes from 'prop-types'
const {ipcRenderer} = window.require('electron')

class Widget extends Component {
  constructor (title, name, props) {
    super(props)
    this.name = name
    this.state = {
      editing: false,
      error: null,
      title: title
    }
    ipcRenderer.on('serviceerror', (event, info) => {
      this.handleError(info)
    })
  }

  handleError ({type, error}) {
    if (type === this.name) {
      this.setState({error})
      if (this.errorTimeout) {
        clearTimeout(this.errorTimeout)
      }
      this.errorTimeout = setTimeout(() => {
        this.setState({error: null})
      }, 5000)
    }
  }

  getWidgetConfig (props = this.props) {
    return props.services.services ? props.services.services.find((service) => service.uuid === this.props.uuid).config : null
  }

  getWidgetTempConfig (props = this.props) {
    return props.services.services ? props.services.services.find((service) => service.uuid === this.props.uuid).tempConfig : null
  }

  getWidgetData () {
    return this.props.services.services ? this.props.services.services.find((service) => service.uuid === this.props.uuid).data : null
  }

  isReady () {
    return this.state.data !== null
  }

  getMainClassNames () {
    const classNames = ['widget', 'widget-' + this.name]
    if (this.state.error) {
      classNames.push('widget-error')
    }
    return classNames
  }

  editConfig () {
    this.setState({editing: true})
    if (this.configJsonElement) {
      this.configJsonElement.focus()
    }
  }

  saveConfig () {
    this.props.commitTempConfig(this.name, this.props.uuid)
    this.setState({editing: false})
  }

  cancelConfig () {
    this.props.setTemporaryConfig(this.props.uuid, this.getWidgetConfig())
    this.setState({editing: false})
  }

  destroyWidget () {
    this.props.removeService(this.props.uuid)
  }

  setTempConfigSubValue (field, subfield, value) {
    const newTempConfig = Object.assign({}, this.getWidgetTempConfig())
    newTempConfig[field][subfield] = value
    this.props.setTemporaryConfig(this.props.uuid, newTempConfig)
  }

  setTempConfigValue (field, value) {
    const newTempConfig = Object.assign({}, this.getWidgetTempConfig())
    newTempConfig[field] = value
    this.props.setTemporaryConfig(this.props.uuid, newTempConfig)
  }

  setTempConfigArrayIndexValue (arrayName, index, field, value) {
    const tempConfig = this.getWidgetTempConfig()
    if (index < tempConfig[arrayName].length) {
      const newArray = tempConfig[arrayName].slice(0)
      newArray[index][field] = value
      this.setTempConfigValue(arrayName, newArray)
    }
  }

  setTempConfigArrayIndexValues (arrayName, index, map) {
    const tempConfig = this.getWidgetTempConfig()
    if (index < tempConfig[arrayName].length) {
      const newArray = tempConfig[arrayName].slice(0)
      for (let field in map) {
        newArray[index][field] = map[field]
      }
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
        <div className={this.getMainClassNames().join(' ')}>
          <div className='widget-title'>
            {this.state.title}
            <button className='widget-title-edit' onClick={() => this.editConfig()}>Edit</button>
          </div>
          <div className='widget-body'>
            {this.renderWidget()}
          </div>
          { this.state.error && (
            <div className='widget-error-details'>
              { this.state.error }
            </div>
          )}
        </div>
        <div className='widget-editor'>
          <div className='widget-editor-title'>
            {this.state.title}
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
  setTemporaryConfig: PropTypes.func.isRequired,
  uuid: PropTypes.string.isRequired
}

export default Widget
