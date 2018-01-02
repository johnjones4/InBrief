import React from 'react'
import Widget from './Widget'
import './RSS.scss'
import {
  formatDate
} from '../util'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  commitTempConfig,
  setTemporaryConfig,
  removeService
} from '../util/actions'
const {shell} = window.require('electron')

class RSS extends Widget {
  constructor (props) {
    super('News', 'rss', props)
  }

  getMainClassNames () {
    return super.getMainClassNames().concat(['widget-scroll'])
  }

  renderWidget () {
    const data = this.getWidgetData()
    return (
      <div>
        {
          data && data.map((feed, i) => this.renderFeed(feed, i))
        }
      </div>
    )
  }

  renderFeed (feed, i) {
    return (
      <div className='rss-feed' key={i}>
        <div className='rss-feed-title widget-subhead'>
          {feed.title}
        </div>
        <div className='rss-feed-links'>
          {
            feed.items.map((item, j) => {
              return (
                <div onClick={() => shell.openExternal(item.link)} className='faux-link rss-feed-item striped striped-hover' key={j}>
                  <span className='rss-feed-item-title'>
                    <span className='rss-feed-item-headeline'>
                      {item.title}
                    </span>
                    { item.author && (<span className='rss-feed-item-author'>
                      {item.author}
                    </span>)}
                    <span className='rss-feed-item-website'>
                      {item.website}
                    </span>
                  </span>
                  <span className='rss-feed-item-date'>
                    {formatDate(item.date)}
                  </span>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  renderEditor () {
    const tempConfig = this.getWidgetTempConfig()
    if (tempConfig) {
      return (
        <div>
          <div className='widget-editor-section'>
            <div className='widget-editor-input-group'>
              <label className='widget-editor-label'>Max Items Per Set</label>
              <input className='widget-editor-input' type='number' value={isNaN(tempConfig.max) ? '' : tempConfig.max} onChange={(event) => this.setTempConfigValue('max', parseInt(event.target.value))} />
            </div>
          </div>
          <div className='rss-feed-config-sets'>
            {
              tempConfig.sets.map((set, i) => {
                return (
                  <div className='widget-editor-section rss-feed-config-set' key={i}>
                    <div className='widget-editor-input-group'>
                      <label className='widget-editor-label'>Title</label>
                      <input className='widget-editor-input' type='text' value={set.title} onChange={(event) => this.setTempConfigArrayIndexValue('sets', i, 'title', event.target.value)} />
                    </div>
                    <div className='widget-editor-input-group'>
                      <label className='widget-editor-label'>Feeds (One per line)</label>
                      <textarea className='widget-editor-input' value={set.feeds.join('\n')} onChange={(event) => this.setTempConfigArrayIndexValue('sets', i, 'feeds', event.target.value.split('\n'))} />
                    </div>
                    <div className='widget-editor-button-set'>
                      <button className='small destructive' onClick={() => this.removeTempConfigArrayIndex('sets', i)}>Remove Feed Set</button>
                      <button className='small' onClick={() => this.moveTempConfigArrayIndex('sets', i, i - 1)}>Move Up</button>
                      <button className='small' onClick={() => this.moveTempConfigArrayIndex('sets', i, i + 1)}>Move Down</button>
                    </div>
                  </div>
                )
              })
            }
            <button className='additive' onClick={() => this.addTempConfigArrayObject('sets', {title: '', feeds: []})}>Add Feed Set</button>
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

RSS.widgetProps = {
  h: 8,
  isResizable: true
}

export default connect(stateToProps, dispatchToProps)(RSS)
