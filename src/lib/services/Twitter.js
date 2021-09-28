const Service = require('./Service')
const TwitterClient = require('twitter')
const keys = require('../../keys')

class Twitter extends Service {
  constructor (uuid, config) {
    super(uuid, config)
    this.intervalDelay = 10000
  }

  getName () {
    return 'twitter'
  }

  exec () {
    if (this.config.credentials && this.config.credentials.access && this.config.credentials.access.token && this.config.credentials.access.tokenSecret) {
      this.client = new TwitterClient({
        'consumer_key': keys.twitter.key,
        'consumer_secret': keys.twitter.secret,
        'access_token_key': this.config.credentials.access.token,
        'access_token_secret': this.config.credentials.access.tokenSecret
      })
      const tweetStreams = []
      const start = (i) => {
        if (i < this.config.lists.length) {
          return this.queryList(i)
            .then((tweets) => {
              if (tweets) {
                tweetStreams.push({
                  'title': this.config.lists[i].title,
                  'tweets': tweets
                })
              }
              return this.thenSleep(null, 100)
            })
            .then(() => {
              return start(i + 1)
            })
        } else {
          return Promise.resolve({
            'uuid': this.uuid,
            'name': this.getName(),
            'data': tweetStreams
          })
        }
      }
      return start(0)
    } else {
      return Promise.resolve({
        'uuid': this.uuid,
        'name': 'twitter',
        'data': []
      })
    }
  }

  queryList (i) {
    return new Promise((resolve, reject) => {
      const params = {
        'owner_screen_name': this.config.lists[i].owner,
        'slug': this.config.lists[i].slug
      }
      this.client.get('lists/statuses', params, (err, tweets) => {
        if (err) {
          reject(err)
        } else {
          resolve(tweets)
        }
      })
    }).catch((err) => this.handleExecError(err))
  }
}

Twitter.defaultConfig = {
  lists: [],
  credentials: {
    access: {
      token: null,
      tokenSecret: null
    }
  }
}

module.exports = Twitter
