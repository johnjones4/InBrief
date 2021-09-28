class Service {
  constructor (uuid, config) {
    this.uuid = uuid
    this.config = config
    this.intervalDelay = 60000
    this.cachedResponse = null
    this.dataListeners = []
    this.errorListeners = []
    this.executing = false
  }

  getName () {
    throw new Error('Must override!')
  }

  addDataListener (fn) {
    this.dataListeners.push(fn)
  }

  addErrorListener (fn) {
    this.errorListeners.push(fn)
  }

  clearListeners () {
    this.dataListeners = []
    this.errorListeners = []
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
      console.log('Fetching updates for ' + this.uuid)
      const publishData = (response) => {
        if (response) {
          this.cachedResponse = response
          this.dataListeners.forEach((listener) => listener(response))
        }
      }
      this.exec(publishData)
        .then(publishData)
        .then(() => {
          this.executing = false
        })
        .catch((err) => {
          this.executing = false
          this.handleExecError(err)
        })
    } else {
      console.log(this.uuid + ' is not done running yet.')
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

  handleExecError (err) {
    console.error(err)
    this.errorListeners.forEach((listener) => listener(err))
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
