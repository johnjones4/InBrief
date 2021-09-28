import React from 'react'
import Widget from './Widget'
import './IFrame.css'
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

class IFrame extends Widget {
  constructor (props) {
    super('IFrame', 'iframe', props)
  }

  componentWillReceiveProps (newProps) {
    const iframeService = newProps.services.services.find((service) => service.uuid === this.props.uuid)
    if (iframeService) {
      this.setState({
        title: iframeService.config ? iframeService.config.title : 'iFrame'
      })
    }
  }

  renderWidget () {
    const config = this.getWidgetConfig()
    return (<iframe src={config ? (config.url || '') : ''} />)
  }

  renderEditor () {
    const tempConfig = this.getWidgetTempConfig()
    if (tempConfig) {
      return (
        <div>
          <div className='widget-editor-section'>
            <WidgetEditorFieldGroup name='URL'>
              <input className='widget-editor-input' type='text' value={tempConfig.url} onChange={(event) => this.setTempConfigValue('url', event.target.value)} />
            </WidgetEditorFieldGroup>
            <WidgetEditorFieldGroup name='Title'>
              <input className='widget-editor-input' type='text' value={tempConfig.title} onChange={(event) => this.setTempConfigValue('title', event.target.value)} />
            </WidgetEditorFieldGroup>
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

IFrame.widgetProps = {
  h: 8,
  isResizable: true
}

export default connect(stateToProps, dispatchToProps)(IFrame)
