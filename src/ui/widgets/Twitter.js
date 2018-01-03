import React from 'react'
import Widget from './Widget'
import './Twitter.scss'
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
const { shell, ipcRenderer } = window.require('electron')

class Twitter extends Widget {
  constructor (props) {
    super('Twitter', 'twitter', props)
  }

  getMainClassNames () {
    return super.getMainClassNames().concat(['widget-scroll'])
  }

  renderWidget () {
    const data = this.getWidgetData()
    return (
      <div>
        {
          data && data.map((tweets, i) => this.renderTweets(tweets, i))
        }
      </div>
    )
  }

  prepareTweetText (tweet) {
    const hrefize = (text, url) => {
      return text.replace(url.url, '<span class="faux-link in-tweet-link" onClick="window.require(\'electron\').shell.openExternal(\'' + url.url + '\'); return false">' + url.display_url + '</span>')
    }

    let text = tweet.text
    if (tweet.entities && tweet.entities.urls) {
      tweet.entities.urls.forEach((url) => {
        text = hrefize(text, url)
      })
    }
    if (tweet.extended_entities && tweet.extended_entities.media) {
      tweet.extended_entities.media.forEach((url) => {
        text = hrefize(text, url)
      })
    }
    return text
  }

  tweetLink (tweet) {
    return 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str
  }

  renderTweets (tweets, i) {
    return (
      <div className='twitter-feed' key={i}>
        <div className='twitter-feed-title widget-subhead'>
          {tweets.title}
        </div>
        <div className='twitter-feed-tweets'>
          {
            tweets.tweets.slice(0, 10).map((tweet, j) => {
              return (
                <div className='twitter-feed-tweet striped' key={j}>
                  <span className='faux-link' onClick={() => shell.openExternal(this.tweetLink(tweet))}>
                    <img className='twitter-feed-tweet-profile-image' alt={'Twitter profile image for ' + tweet.user.screen_name} src={tweet.user.profile_image_url_https} />
                  </span>
                  <div className='twitter-feed-tweet-header'>
                    <span className='faux-link' onClick={() => shell.openExternal(this.tweetLink(tweet))}>
                      <span className='twitter-feed-tweet-name'>
                        {tweet.user.name}
                      </span>
                      <span className='twitter-feed-tweet-date'>
                        {formatDate(tweet.created_at)}
                      </span>
                    </span>
                  </div>
                  <div className='twitter-feed-tweet-text' dangerouslySetInnerHTML={{__html: this.prepareTweetText(tweet)}} />
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  setAccessCredentials (accessCredentials) {
    const credentials = Object.assign({}, this.getWidgetTempConfig().credentials)
    credentials.access = accessCredentials
    this.setTempConfigValue('credentials', credentials)
  }

  authorizeTwitter () {
    const messageType = 'authorize-twitter'
    ipcRenderer.once(messageType, (event, accessCredentials) => {
      this.setAccessCredentials(accessCredentials)
    })
    ipcRenderer.send(messageType)
  }

  renderEditor () {
    const tempConfig = this.getWidgetTempConfig()
    if (tempConfig) {
      return (
        <div>
          <div className='widget-editor-section'>
            {
              tempConfig.credentials &&
                tempConfig.credentials &&
                tempConfig.credentials.access &&
                tempConfig.credentials.access.token &&
                tempConfig.credentials.access.tokenSecret ? (
                  <button className='destructive' onClick={() => this.setAccessCredentials(null)}>Deauthorize</button>
                ) : (
                  <button className='additive' onClick={() => this.authorizeTwitter()}>Authorize</button>
                )
            }
          </div>
          <div className='twitter-feed-config-lists'>
            {
              tempConfig.lists.map((list, i) => {
                return (
                  <div className='widget-editor-section twitter-feed-config-list' key={i}>
                    <div className='widget-editor-input-group'>
                      <label className='widget-editor-label'>Title</label>
                      <input className='widget-editor-input' type='text' value={list.title} onChange={(event) => this.setTempConfigArrayIndexValue('lists', i, 'title', event.target.value)} />
                    </div>
                    <div className='widget-editor-input-group'>
                      <label className='widget-editor-label'>Owner</label>
                      <input className='widget-editor-input' type='text' value={list.owner} onChange={(event) => this.setTempConfigArrayIndexValue('lists', i, 'owner', event.target.value)} />
                    </div>
                    <div className='widget-editor-input-group'>
                      <label className='widget-editor-label'>Slug</label>
                      <input className='widget-editor-input' type='text' value={list.slug} onChange={(event) => this.setTempConfigArrayIndexValue('lists', i, 'slug', event.target.value)} />
                    </div>
                    <div className='widget-editor-button-set'>
                      <button className='small destructive' onClick={() => this.removeTempConfigArrayIndex('lists', i)}>Remove List</button>
                      <button className='small' onClick={() => this.moveTempConfigArrayIndex('lists', i, i - 1)}>Move Up</button>
                      <button className='small' onClick={() => this.moveTempConfigArrayIndex('lists', i, i + 1)}>Move Down</button>
                    </div>
                  </div>
                )
              })
            }
            <button className='additive' onClick={() => this.addTempConfigArrayObject('lists', {title: '', owner: '', slug: ''})}>Add List</button>
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

Twitter.widgetProps = {
  h: 4,
  isResizable: true
}

export default connect(stateToProps, dispatchToProps)(Twitter)
