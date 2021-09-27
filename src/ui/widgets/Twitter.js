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
import {
  WidgetEditorFieldGroup,
  WidgetEditorList
} from '../util/widgetElements'
const { shell, ipcRenderer } = window.require('electron')

class Twitter extends Widget {
  constructor (props) {
    super('Twitter', 'twitter', props)
    this.state = {
      listOptions: [],
      lastListAuthStr: null
    }
  }

  componentDidMount () {
    ipcRenderer.on('twitterlists', (event, lists) => {
      this.setState({listOptions: lists})
    })
  }

  componentWillReceiveProps (newProps) {
    const twitterService = newProps.services.services.find((service) => service.name === 'twitter')
    if (this.state.listOptions.length === 0 &&
        twitterService &&
        twitterService.tempConfig &&
        twitterService.tempConfig.credentials &&
        twitterService.tempConfig.credentials.access &&
        twitterService.tempConfig.credentials.access.token &&
        twitterService.tempConfig.credentials.access.tokenSecret) {
      const authStr = [twitterService.tempConfig.credentials.access.token, twitterService.tempConfig.credentials.access.tokenSecret].join('+')
      if (this.state.lastListAuth !== authStr) {
        this.setState({lastListAuth: authStr})
        ipcRenderer.send('twitterlists', {
          accessToken: twitterService.tempConfig.credentials.access.token,
          tokenSecret: twitterService.tempConfig.credentials.access.tokenSecret
        })
      }
    }
  }

  getMainClassNames () {
    return super.getMainClassNames().concat(['widget-scroll'])
  }

  renderWidget () {
    const data = this.getWidgetData()
    if (!data) {
      return null
    }
    const config = this.getWidgetConfig()
    if (config.merge) {
      const all = []
      data.forEach(tweets => {
        tweets.tweets.forEach(tweet => {
          tweet.timestamp = new Date(tweet.created_at).getTime()
          all.push(tweet)
        })
      })
      all.sort((a, b) => {
        return b.timestamp - a.timestamp
      })
      return this.renderTweets({tweets: all}, null)
    } else {
      return (
        <div>
          { data.map((tweets, i) => this.renderTweets(tweets, i)) }
        </div>
      )
    }
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
    const config = this.getWidgetConfig()
    const width = Math.floor(100.0 / (config.layout ? (config.layout.w || 0) : 0)) + '%'
    return (
      <div className='twitter-feed' style={{width}} key={i}>
        {tweets.title && (
          <div className='twitter-feed-title widget-subhead'>
            {tweets.title}
          </div>
        )}
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
                      <span className='twitter-feed-tweet-screen-name'>
                        @{tweet.user.screen_name}
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

  updateList (listIndex, selectedIndex) {
    console.log(this.state.listOptions[selectedIndex].name)
    this.setTempConfigArrayIndexValues('lists', listIndex, {
      title: this.state.listOptions[selectedIndex].title,
      owner: this.state.listOptions[selectedIndex].owner,
      slug: this.state.listOptions[selectedIndex].slug
    })
  }

  renderEditor () {
    const tempConfig = this.getWidgetTempConfig()
    if (tempConfig) {
      return (
        <div>
          <div className='widget-editor-section'>
            {
              tempConfig.credentials &&
                tempConfig.credentials.access &&
                tempConfig.credentials.access.token &&
                tempConfig.credentials.access.tokenSecret ? (
                  <div>
                    <label>
                      <input type='checkbox' name='merge' checked={this.getWidgetTempConfig().merge || false} onChange={(event) => this.setTempConfigValue('merge', event.target.checked)} />
                      Merge Lists
                    </label>
                    <button className='destructive pull-right' onClick={() => this.setAccessCredentials(null)}>Deauthorize</button>
                  </div>
                ) : (
                  <button className='additive' onClick={() => this.authorizeTwitter()}>Authorize</button>
                )
            }
          </div>
          <WidgetEditorList
            wrapperClassName='twitter-feed-config-lists'
            list={tempConfig.lists || []}
            sectionClassNames={['twitter-feed-config-list']}
            renderSection={(list, i) => {
              return (
                <WidgetEditorFieldGroup name='List'>
                  <select className='widget-editor-input' value={[list.owner, list.slug].join('/')} onChange={(event) => event.target.selectedIndex > 0 && this.updateList(i, event.target.selectedIndex - 1)}>
                    <option>Select a List</option>
                    {
                      this.state.listOptions.map((_list) => {
                        return (<option key={_list.title} value={[_list.owner, _list.slug].join('/')}>{_list.title}</option>)
                      })
                    }
                  </select>
                </WidgetEditorFieldGroup>
              )
            }}
            removable
            movable
            appendable
            removeItem={(i) => this.removeTempConfigArrayIndex('lists', i)}
            translateItem={(i, d) => this.moveTempConfigArrayIndex('lists', i, d)}
            append={() => this.addTempConfigArrayObject('lists', {title: '', owner: '', slug: ''})} />
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
