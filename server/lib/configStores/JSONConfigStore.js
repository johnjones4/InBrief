const ConfigStore = require('./ConfigStore');
const fs = require('fs-extra');

class JSONConfigStore extends ConfigStore {
  connect() {
    return fs.readJson(process.env.JSON_CONFIG_PATH)
      .then((data) => {
        this.data = data || {};
      });
  }

  get(key) {
    return Promise.resolve(this.data[key] || null);
  }

  set(key,value) {
    this.data[key] = value;
    return fs.outputJson(process.env.JSON_CONFIG_PATH,this.data)
      .then(() => {
        return value;
      });
  }
}

module.exports = JSONConfigStore;
