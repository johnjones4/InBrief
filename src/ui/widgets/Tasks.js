import React from 'react'
import Widget from './Widget'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  commitTempConfigString,
  setTemporaryServiceConfigString,
  removeService
} from '../util/actions'

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
}

const stateToProps = (state) => {
  return {
    services: state.services
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    commitTempConfigString,
    setTemporaryServiceConfigString,
    removeService
  }, dispatch)
}

Tasks.widgetProps = {
  h: 1.5,
  isResizable: false
}

export default connect(stateToProps, dispatchToProps)(Tasks)
