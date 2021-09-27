import React from 'react'
import Widget from './Widget'
import './RSS.css'
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
import {
  WidgetEditorFieldGroup,
  WidgetEditorList
} from '../util/widgetElements'
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
                  <div className='rss-feed-item-title' dangerouslySetInnerHTML={{__html: item.title}} />
                  <div>
                    { item.author && (<span className='rss-feed-item-author'>
                      {item.author}
                    </span>)}
                    <span className='rss-feed-item-website'>
                      {item.website}
                    </span>
                    <span className='rss-feed-item-date'>
                      {formatDate(item.date)}
                    </span>
                  </div>
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
            <WidgetEditorFieldGroup name='Max Items Per Set'>
              <input className='widget-editor-input' type='number' value={isNaN(tempConfig.max) ? '' : tempConfig.max} onChange={(event) => this.setTempConfigValue('max', parseInt(event.target.value))} />
            </WidgetEditorFieldGroup>
          </div>
          <WidgetEditorList
            wrapperClassName='rss-feed-config-sets'
            list={tempConfig.sets || []}
            sectionClassNames={['rss-feed-config-set']}
            renderSection={(set, i) => {
              return (
                <div>
                  <WidgetEditorFieldGroup name='Title'>
                    <input className='widget-editor-input' type='text' value={set.title} onChange={(event) => this.setTempConfigArrayIndexValue('sets', i, 'title', event.target.value)} />
                  </WidgetEditorFieldGroup>
                  <WidgetEditorFieldGroup name='Feeds (One per line)'>
                    <textarea className='widget-editor-input' value={set.feeds.join('\n')} onChange={(event) => this.setTempConfigArrayIndexValue('sets', i, 'feeds', event.target.value.split('\n'))} />
                  </WidgetEditorFieldGroup>
                </div>
              )
            }}
            removable
            movable
            appendable
            removeItem={(i) => this.removeTempConfigArrayIndex('sets', i)}
            translateItem={(i, d) => this.moveTempConfigArrayIndex('sets', i, d)}
            append={() => this.addTempConfigArrayObject('sets', {title: '', feeds: []})} />
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
