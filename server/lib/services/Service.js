class Service {
  constructor(name,config) {
    this.name = name;
    this.config = config;
  }

  exec() {
    throw new Error('Must override!');
  }

  handleSubError(err) {
    console.error(err);
  }

  thenSleep(data,time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      },time);
    })
  }

  promiseIfy(op) {
    return new Promise((resolve,reject) => {
      op((err,data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    })
  }
}

module.exports = Service;
