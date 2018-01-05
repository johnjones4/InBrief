import React from 'react'
import BigNumbersWidget from './BigNumbersWidget'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  commitTempConfig,
  setTemporaryConfig,
  removeService
} from '../util/actions'
import {
  WidgetEditorFieldGroup,
  WidgetEditorList
} from '../util/widgetElements'
const { ipcRenderer } = window.require('electron')

class Tasks extends BigNumbersWidget {
  constructor (props) {
    super('Tasks', 'tasks', props)
  }

  renderWidget () {
    const data = this.getWidgetData()
    return data && this.renderBigNumbers([
      {
        label: 'Due Today',
        value: data.today
      },
      {
        label: 'By Friday',
        value: data.endOfWeek
      }
    ])
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
        <WidgetEditorList
          wrapperClassName='tasks-config-apis'
          list={tempConfig.apis || []}
          sectionClassNames={['tasks-config-api']}
          renderSection={(api, i) => {
            return (
              <div>
                <WidgetEditorFieldGroup name='Type'>
                  <select className='widget-editor-input' value={api.type} onChange={(event) => this.setTempConfigArrayIndexValue('apis', i, 'type', apiTypes[event.target.selectedIndex - 1].name)}>
                    <option value=''>Select an API</option>
                    {
                      apiTypes.map((type, j) => {
                        return (<option key={j} value={type.name}>{type.label}</option>)
                      })
                    }
                  </select>
                </WidgetEditorFieldGroup>
                { this.renderAPIConfig(api, i) }
              </div>
            )
          }}
          removable
          appendable
          translateItem={(i, d) => this.moveTempConfigArrayIndex('apis', i, d)}
          append={() => this.addTempConfigArrayObject('apis', {type: '', key: ''})} />
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
