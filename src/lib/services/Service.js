class Service {
  constructor (name, config) {
    this.name = name
    this.config = config
    this.intervalDelay = 60000
    this.cachedResponse = null
    this.listeners = []
  }

  addListener (fn) {
    this.listeners.push(fn)
  }

  exec (dataEmitter) {
    throw new Error('Must override!')
  }

  getData () {
    return this.cachedResponse
  }

  runExec () {
    console.log('Fetching updates for ' + this.name)
    const publishData = (response) => {
      this.cachedResponse = response
      this.listeners.forEach((listener) => listener(response))
    }
    this.exec(publishData)
      .then(publishData)
      .catch((err) => {
        console.error(err)
      })
  }

  begin () {
    this.runExec()
    this.interval = setInterval(() => {
      this.runExec()
    }, this.intervalDelay)
  }

  end () {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  handleSubError (err) {
    console.error(err)
  }

  thenSleep (data, time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data)
      }, time)
    })
  }

  promiseIfy (op) {
    return new Promise((resolve, reject) => {
      op((err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
}

module.exports = Service
