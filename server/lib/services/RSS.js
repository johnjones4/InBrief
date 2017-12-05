const Service = require('./Service');
const request = require('request-promise-native');
const FeedParser = require('feedparser');

class RSS extends Service {
  constructor(config) {
    super('rss',config);
  }

  exec() {
    return Promise.all(
      this.config.sets.map((set) => {
        return Promise.all(
          set.feeds.map((feed) => {
            return new Promise((resolve,reject) => {
              const items = [];
              const req = request(feed)
              const feedparser = new FeedParser();
              req.on('error',(err) => reject(err));
              feedparser.on('error',(err) => reject(err));
              req.on('response', function(res) {
                var stream = this;
                if (res.statusCode !== 200) {
                  this.emit('error', new Error('Bad status code'));
                } else {
                  stream.pipe(feedparser);
                }
              });
              feedparser.on('readable',function() {
                var stream = this;
                var item;
                while (item = stream.read()) {
                  items.push(item);
                }
              });
              feedparser.on('end',function() {
                resolve(items);
              });
            });
          })
        )
          .then((unmergedItems) => {
            const items = [];
            unmergedItems.forEach((_items) => {
              _items.forEach((item) => items.push(item));
            });
            items.sort((a,b) => {
              if (a.pubDate && b.pubDate) {
                return b.pubDate.getTime() - a.pubDate.getTime();
              } else if (a.pubDate) {
                return -1;
              } else if (b.pubDate) {
                return 1;
              } else {
                return 0;
              }
            });
            return {
              'title': set.title,
              'items': items.map((item) => {
                return {
                  'title': item.title,
                  'date': item.pubDate,
                  'link': item.link
                };
              })
            }
          })
      })
    );
  }
}

module.exports = RSS;
