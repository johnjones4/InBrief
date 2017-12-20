import React from 'react'
import Widget from './Widget'
import './RSS.scss'
import {
  formatDate
} from '../util'

export default class RSS extends Widget {
  constructor (props) {
    super('News', 'rss', props)
  }

  getMainClassNames () {
    return super.getMainClassNames().concat(['widget-scroll'])
  }

  renderWidget () {
    return (
      <div>
        {
          this.state.data && this.state.data.map((feed, i) => this.renderFeed(feed, i))
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
            feed.items.slice(0, 10).map((item, j) => {
              return (
                <a href={item.link} target='_blank' className='rss-feed-item striped striped-hover' key={j}>
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
                </a>
              )
            })
          }
        </div>
      </div>
    )
  }
}
