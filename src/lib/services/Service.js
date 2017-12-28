class Service {
  constructor (name, config) {
    this.name = name
    this.config = config
    this.intervalDelay = 60000
    this.cachedResponse = null
    this.listeners = []
    this.executing = false
  }

  addListener (fn) {
    this.listeners.push(fn)
  }

  clearListeners () {
    this.listeners = []
  }

  exec (dataEmitter) {
    throw new Error('Must override!')
  }

  getData () {
    return this.cachedResponse
  }

  runExec () {
    if (!this.executing) {
      this.executing = true
      console.log('Fetching updates for ' + this.name)
      const publishData = (response) => {
        if (response) {
          this.cachedResponse = response
          this.listeners.forEach((listener) => listener(response))
        }
      }
      this.exec(publishData)
        .then(publishData)
        .then(() => {
          this.executing = false
        })
        .catch((err) => {
          this.executing = false
          console.error(err)
        })
    } else {
      console.log(this.name + ' is not done running yet.')
    }
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
