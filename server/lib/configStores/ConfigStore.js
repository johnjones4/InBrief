class ConfigStore {
  connect() {
    throw new Exception('Must override');
  }

  get(key) {
    throw new Exception('Must override');
  }

  set(key,value) {
    throw new Exception('Must override');
  }
}

module.exports = ConfigStore;
