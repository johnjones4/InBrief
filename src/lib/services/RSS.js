const Service = require('./Service')
const request = require('request')
const FeedParser = require('feedparser')
const url = require('url')
const Queue = require('promise-queue')

class RSS extends Service {
  constructor (uuid, config) {
    super(uuid, config)
    this.requestQueue = new Queue(5, Infinity)
  }

  getName () {
    return 'rss'
  }

  exec (dataEmitter) {
    const outputData = this.cachedResponse ? this.cachedResponse.data : []
    const fetchNextFeedSet = (index) => {
      if (index < this.config.sets.length) {
        const set = this.config.sets[index]
        return this.fetchArrayOfFeeds(set.feeds)
          .then((items) => {
            if (items) {
              outputData[index] = this.processRSSItems(set, items)
              dataEmitter({
                'uuid': this.uuid,
                'name': this.getName(),
                'data': outputData
              })
            }
            return fetchNextFeedSet(index + 1)
          })
      } else {
        return Promise.resolve(outputData)
      }
    }
    return fetchNextFeedSet(0)
      .then(() => {
        return {
          'uuid': this.uuid,
          'name': this.getName(),
          'data': outputData
        }
      })
  }

  processRSSItems (set, items) {
    const parsedUrls = {}
    items.forEach((item) => {
      parsedUrls[item.link] = url.parse(item.link)
    })
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const j = items.findIndex((_item) => {
        return parsedUrls[item.link].hostname === parsedUrls[_item.link].hostname && item.title === _item.title
      })
      if (j >= 0 && j !== i) {
        items.splice(j, 1)
      }
    }
    items.sort((a, b) => {
      if (a.pubDate && b.pubDate) {
        return b.pubDate.getTime() - a.pubDate.getTime()
      } else if (a.pubDate) {
        return -1
      } else if (b.pubDate) {
        return 1
      } else {
        return 0
      }
    })
    return {
      'title': set.title,
      'items': items.slice(0, this.config.max).map((item) => {
        return {
          'title': item.title,
          'date': item.pubDate,
          'link': item.link,
          'website': url.parse(item.link).hostname.replace('www.', ''),
          'author': item.author
        }
      })
    }
  }

  fetchArrayOfFeeds (feeds) {
    return Promise.all(
      feeds.map((feed) => {
        return this.requestQueue.add(() => {
          return this.fetchSingleFeed(feed)
        })
      })
    ).then((arraysOfItems) => {
      const items = []
      arraysOfItems.forEach((_items) => {
        if (_items) {
          _items.forEach((item) => items.push(item))
        }
      })
      return items
    })
  }

  fetchSingleFeed (feed) {
    return new Promise((resolve, reject) => {
      const items = []
      const req = request({
        'uri': feed,
        'agent': false,
        'pool': {
          'maxSockets': 1000
        }
      })
      const feedparser = new FeedParser()
      feedparser.on('error', (err) => {
        this.handleExecError(err)
        resolve([])
      })
      req.on('error', (err) => {
        this.handleExecError(err)
        resolve([])
      })
      req.on('response', function (res) {
        var stream = this
        if (res.statusCode === 200) {
          stream.pipe(feedparser)
        } else {
          resolve([])
        }
      })
      feedparser.on('readable', function () {
        var stream = this
        var item
        while ((item = stream.read()) !== null) {
          items.push(item)
        }
      })
      feedparser.on('end', function () {
        resolve(items)
      })
    }).catch((err) => {
      this.handleExecError(err)
      return Promise.resolve([])
    })
  }
}

RSS.defaultConfig = {
  sets: []
}

module.exports = RSS
