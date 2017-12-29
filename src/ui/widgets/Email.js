import React from 'react'
import Widget from './Widget'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  commitTempConfigString,
  setTemporaryServiceConfigString,
  removeService
} from '../util/actions'

class Email extends Widget {
  constructor (props) {
    super('Email', 'email', props)
  }

  renderWidget () {
    const data = this.getWidgetData()
    return data && (
      <div className='widget-big-numbers'>
        <div className='widget-big-numbers-group'>
          <div className='widget-big-numbers-number'>
            {data.unread}
          </div>
          <div className='widget-big-numbers-label'>
            Unread
          </div>
        </div>
        <div className='widget-big-numbers-group'>
          <div className='widget-big-numbers-number'>
            {data.flagged}
          </div>
          <div className='widget-big-numbers-label'>
            Flagged
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

Email.widgetProps = {
  h: 1.5,
  isResizable: false
}

export default connect(stateToProps, dispatchToProps)(Email)
