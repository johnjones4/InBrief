import React from 'react'
import Widget from './Widget'
import './Calendar.scss'
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

const MIN_MINUTES = 8 * 60
const MAX_MINUTES = 19 * 60

class Calendar extends Widget {
  constructor (props) {
    super('Calendar', 'calendar', props)
  }

  estimateYPosition (event) {
    const start = new Date(event.start)
    const minutesIntoDay = (start.getHours() * 60) + start.getMinutes()
    const offsetFromStart = minutesIntoDay - MIN_MINUTES
    const percent = offsetFromStart / (MAX_MINUTES - MIN_MINUTES)
    return Math.max(percent, 0)
  }

  estimateHeight (event) {
    const start = new Date(event.start)
    const end = new Date(event.end)
    const spanInMillis = end.getTime() - start.getTime()
    const spanInMinutes = spanInMillis / 1000 / 60
    const percent = spanInMinutes / (MAX_MINUTES - MIN_MINUTES)
    return percent
  }

  estimateNowPosition () {
    const now = new Date()
    const minutesIntoDay = (now.getHours() * 60) + now.getMinutes()
    const offsetFromStart = minutesIntoDay - MIN_MINUTES
    const percent = offsetFromStart / (MAX_MINUTES - MIN_MINUTES)
    return percent
  }

  renderWidget () {
    const data = this.getWidgetData()
    return (
      <div className='calendar-items'>
        {
          data && data.map((event, i) => {
            return (
              <div className='calendar-item' key={i} style={{'top': (this.estimateYPosition(event) * 100) + '%', 'height': (this.estimateHeight(event) * 100) + '%'}}>
                <div className='calendar-item-name'>
                  {event.name}
                </div>
                <div className='calendar-item-timespan'>
                  <span className='calendar-item-timespan-start'>
                    {new Date(event.start).toLocaleTimeString()}
                  </span>
                  <span className='calendar-item-timespan-end'>
                    {new Date(event.end).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )
          })
        }
        <div className='calendar-now' style={{'top': (this.estimateNowPosition() * 100) + '%'}} />
      </div>
    )
  }

  renderEditor () {
    const tempConfig = this.getWidgetTempConfig()
    const calendarTypes = [
      {
        name: 'exchange',
        label: 'Microsoft Exchange'
      },
      {
        name: 'ics',
        label: 'ICS'
      }
    ]
    if (tempConfig) {
      return (
        <WidgetEditorList
          wrapperClassName='email-config-calendars'
          list={tempConfig.calendars || []}
          sectionClassNames={['email-config-calendar']}
          renderSection={(calendar, i) => {
            return (
              <div>
                <WidgetEditorFieldGroup name='Type'>
                  <select className='widget-editor-input' value={calendar.type} onChange={(event) => this.setTempConfigArrayIndexValue('calendars', i, 'type', calendarTypes[event.target.selectedIndex - 1].name)}>
                    <option value=''>Select Calendar</option>
                    {
                      calendarTypes.map((type, j) => {
                        return (<option key={j} value={type.name}>{type.label}</option>)
                      })
                    }
                  </select>
                </WidgetEditorFieldGroup>
                { this.renderCalendarConfig(calendar, i) }
              </div>
            )
          }}
          removable
          appendable
          translateItem={(i, d) => this.moveTempConfigArrayIndex('calendars', i, d)}
          append={() => this.addTempConfigArrayObject('calendars', {type: ''})} />
      )
    } else {
      return null
    }
  }

  setCalendarCredentialValue (index, key, value) {
    const credentials = Object.assign({}, this.getWidgetTempConfig().calendars[index].credentials)
    credentials[key] = value
    this.setTempConfigArrayIndexValue('calendars', index, 'credentials', credentials)
  }

  renderCalendarConfig (calendar, i) {
    switch (calendar.type) {
      case 'exchange':
        return (
          <div>
            <WidgetEditorFieldGroup name='Server URL'>
              <input className='widget-editor-input' type='text' value={calendar.credentials && calendar.credentials.url} onChange={(event) => this.setCalendarCredentialValue(i, 'url', event.target.value)} />
            </WidgetEditorFieldGroup>
            <WidgetEditorFieldGroup name='Username'>
              <input className='widget-editor-input' type='text' value={calendar.credentials && calendar.credentials.username} onChange={(event) => this.setCalendarCredentialValue(i, 'username', event.target.value)} />
            </WidgetEditorFieldGroup>
            <WidgetEditorFieldGroup name='Password'>
              <input className='widget-editor-input' type='password' value={calendar.credentials && calendar.credentials.password} onChange={(event) => this.setCalendarCredentialValue(i, 'password', event.target.value)} />
            </WidgetEditorFieldGroup>
          </div>
        )
      case 'ics':
        return (
          <div>
            <WidgetEditorFieldGroup name='ICS URL'>
              <input className='widget-editor-input' type='text' value={calendar.url} onChange={(event) => this.setTempConfigArrayIndexValue('calendars', i, 'url', event.target.value)} />
            </WidgetEditorFieldGroup>
          </div>
        )
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

Calendar.widgetProps = {
  h: 2,
  isResizable: true
}

export default connect(stateToProps, dispatchToProps)(Calendar)
