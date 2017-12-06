const config = require('../../config');
const services = require('../services');
const _ = require('lodash');

exports.load = () => {
  return _.keys(config).map((klass) => {
    const Service = services[klass];
    const serviceObject = new Service(config[klass]);
    serviceObject.begin();
    return serviceObject;
  });
};
