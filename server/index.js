const express = require('express');
const logger = require('morgan');
const serviceLoader = require('./lib/util/serviceLoader');
const path = require('path');

//TODO security
const services = serviceLoader.load()
const app = express();
app.use(express.static(path.join(__dirname, 'build')));
app.use(logger('combined'));

app.get('/api/service',(req,res,next) => {
  res.send(services.map((service) => {
    return service.name;
  }));
});

app.get('/api/service/:service',(req,res,next) => {
  const service = services.find((service) => {
    return service.name === req.params.service;
  });
  if (service) {
    service.exec()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => next(err));
  } else {
    res.send(404);
  }
});

app.listen(process.env.PORT || 8080,(err) => {
  if (err) {
    console.error(err);
    process.exit(-1);
  } else {
    console.log('Server running');
  }
});
