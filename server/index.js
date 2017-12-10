require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const serviceLoader = require('./lib/util/serviceLoader');
const path = require('path');

//TODO security
serviceLoader.load()
  .then((services) => {
  const app = express();
  app.use(express.static(path.join(__dirname, 'build')));
  app.use(logger('combined'));

  app.param('service',(req,res,next,serviceName) => {
    const service = services.find((service) => {
      return service.name === serviceName;
    });
    if (service) {
      req.service = service;
      next();
    } else {
      res.send(404);
    }
  })

  app.get('/api/service',(req,res,next) => {
    res.send(services.map((service) => {
      return service.name;
    }));
  });

  app.get('/api/service/:service',(req,res,next) => {
    req.service.getCachedOrExec()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => next(err));
  });

  app.get('/api/service/:service/config',(req,res,next) => {
    res.send(req.service.config);
  });

  app.post('/api/service/:service/config',(req,res,next) => {
    req.service.updateConfig(req.body)
      .then(() => {
        res.send(req.service.config);
      })
      .catch((err) => next(err));
  });

  app.listen(process.env.PORT || 8080,(err) => {
    if (err) {
      console.error(err);
      process.exit(-1);
    } else {
      console.log('Server running');
    }
  });
}).catch((err) => console.error(err));
