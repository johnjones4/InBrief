const config = require('../../config');
const services = require('../services');
const _ = require('lodash');

exports.load = () => {
  return _.keys(config).map((klass) => {
    const Service = services[klass];
    return new Service(config[klass]);
  });
};
