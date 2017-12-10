const services = require('../services');
const _ = require('lodash');
const JSONConfigStore = require('../configStores/JSONConfigStore');
const RedisConfigStore = require('../configStores/RedisConfigStore');

exports.load = () => {
  const store = getConfigStore();
  return store.connect()
    .then(() => {
      return Promise.all(
        ['Tasks','RSS','Email','Calendar','Twitter','Weather'].map((klass) => {
          const Service = services[klass];
          const serviceObject = new Service(store);
          return serviceObject.loadConfig()
            .then(() => {
              return serviceObject;
            })
        })
      );
    });
};

const getConfigStore = () => {
  switch(process.env.CONFIG_STORE) {
    case 'JSON':
      return new JSONConfigStore();
    case 'redis':
      return new RedisConfigStore();
    default:
      throw new Error('Specify CONFIG_STORE as a env variable');
  }
};
