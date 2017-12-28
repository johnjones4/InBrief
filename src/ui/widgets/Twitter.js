import React from 'react'
import Widget from './Widget'
import './Twitter.scss'
import {
  formatDate
} from '../util'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  setServiceConfig
} from '../util/actions'
const {shell} = window.require('electron')

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
}

const stateToProps = (state) => {
  return {
    services: state.services
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    setServiceConfig
  }, dispatch)
}

Twitter.widgetProps = {
  h: 4,
  isResizable: true
}

export default connect(stateToProps, dispatchToProps)(Twitter)
