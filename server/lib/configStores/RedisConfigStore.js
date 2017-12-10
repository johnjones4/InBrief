const ConfigStore = require('./ConfigStore');
const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class RedisConfigStore extends ConfigStore {
  connect() {
    this.client = redis.createClient({
      'host': process.env.REDIS_HOST,
      'port': process.env.REDIS_PORT,
    });
    this.connected = false;
    return new Promise((resolve,reject) => {
      this.client.on('ready',() => {
        this.connected = true;
        resolve();
      });
      this.client.on('error',(error) => {
        if (this.connected) {
          console.error(error);
        } else {
          reject(error);
        }
      });
    });
  }

  get(key) {
    return this.client.get(key)
      .then((data) => {
        return JSON.parse(data);
      });
  }

  set(key,value) {
    return this.client.set(key,JSON.stringify(value))
      .then(() => value);
  }
}

module.exports = RedisConfigStore;
