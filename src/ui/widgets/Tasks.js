import React from 'react'
import Widget from './Widget'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  commitTempConfig,
  setTemporaryConfig,
  removeService
} from '../util/actions'
const { ipcRenderer } = window.require('electron')

class Tasks extends Widget {
  constructor (props) {
    super('Tasks', 'tasks', props)
  }

  renderWidget () {
    const data = this.getWidgetData()
    return data && (
      <div className='widget-big-numbers'>
        <div className='widget-big-numbers-group'>
          <div className='widget-big-numbers-number'>
            {data.today}
          </div>
          <div className='widget-big-numbers-label'>
            Due Today
          </div>
        </div>
        <div className='widget-big-numbers-group'>
          <div className='widget-big-numbers-number'>
            {data.endOfWeek}
          </div>
          <div className='widget-big-numbers-label'>
            By Friday
          </div>
        </div>
      </div>
    )
  }

  renderEditor () {
    const tempConfig = this.getWidgetTempConfig()
    const apiTypes = [
      {
        name: 'asana',
        label: 'Asana'
      },
      {
        name: 'todoist',
        label: 'Todoist'
      }
    ]
    if (tempConfig) {
      return (
        <div className='tasks-config-apis'>
          {
            tempConfig.apis.map((api, i) => {
              return (
                <div className='widget-editor-section tasks-config-api' key={i}>
                  <div className='widget-editor-input-group'>
                    <label className='widget-editor-label'>Title</label>
                    <select className='widget-editor-input' value={api.type} onChange={(event) => this.setTempConfigArrayIndexValue('apis', i, 'type', apiTypes[event.target.selectedIndex - 1].name)}>
                      <option value=''>Select an API</option>
                      {
                        apiTypes.map((type, j) => {
                          return (<option key={j} value={type.name}>{type.label}</option>)
                        })
                      }
                    </select>
                  </div>
                  <div className='widget-editor-input-group'>
                    { this.renderAPIConfig(api, i) }
                  </div>
                  <div className='widget-editor-button-set'>
                    <button className='small destructive' onClick={() => this.removeTempConfigArrayIndex('apis', i)}>Remove API</button>
                  </div>
                </div>
              )
            })
          }
          <button className='additive' onClick={() => this.addTempConfigArrayObject('apis', {type: '', key: ''})}>Add API</button>
        </div>
      )
    } else {
      return null
    }
  }

  authorizeService (api, index) {
    const messageType = 'authorize-tasks-' + api.type
    ipcRenderer.once(messageType, (event, token) => {
      console.log(token)
      this.setTempConfigArrayIndexValue('apis', index, 'token', token)
    })
    ipcRenderer.send(messageType)
  }

  deauthorizeService (api, index) {
    this.setTempConfigArrayIndexValue('apis', index, 'token', null)
  }

  renderAPIConfig (api, index) {
    switch (api.type) {
      case 'asana':
      case 'todoist':
        if (api.token) {
          return (<button className='destructive' onClick={() => this.deauthorizeService(api, index)}>Deauthorize</button>)
        } else {
          return (<button className='additive' onClick={() => this.authorizeService(api, index)}>Authorize</button>)
        }
      default:
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

Tasks.widgetProps = {
  h: 1.5,
  isResizable: false
}

export default connect(stateToProps, dispatchToProps)(Tasks)
