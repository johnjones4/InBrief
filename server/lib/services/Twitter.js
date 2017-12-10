const Service = require('./Service');
const TwitterClient = require('twitter');

class Twitter extends Service {
  constructor(configStore) {
    super('twitter',configStore);
    this.intervalDelay = 10000;
    this.config = {
      'lists': [],
      'credentials': {
        'consumer': {
          'key': '',
          'secret': ''
        },
        'access': {
          'token': '',
          'tokenSecret': ''
        }
      }
    };
  }

  exec() {
    if (this.config.lists.length > 0) {
      this.client = new TwitterClient({
        'consumer_key': this.config.credentials.consumer.key,
        'consumer_secret': this.config.credentials.consumer.secret,
        'access_token_key': this.config.credentials.access.token,
        'access_token_secret': this.config.credentials.access.tokenSecret
      });
      const tweetStreams = [];
      const start = (i) => {
        if (i < this.config.lists.length) {
          return this.queryList(i)
            .then((tweets) => {
              tweetStreams.push({
                'title': this.config.lists[i].title,
                'tweets': tweets
              });
              return this.thenSleep(null,100);
            })
            .then(() => {
              return start(i + 1);
            })
            .catch((err) => this.handleSubError(err));
        } else {
          return {
            'type': 'twitter',
            'data': tweetStreams
          };
        }
      }
      return start(0);
    } else {
      return Promise.resolve({
        'type': 'twitter',
        'data': []
      });
    }
  }

  queryList(i) {
    return new Promise((resolve,reject) => {
      const params = {
        'owner_screen_name': this.config.lists[i].owner,
        'slug': this.config.lists[i].slug
      };
      this.client.get('lists/statuses',params,(err,tweets) => {
        if (err) {
          reject(err);
        } else {
          resolve(tweets);
        }
      });
    });
  }

}

module.exports = Twitter;
