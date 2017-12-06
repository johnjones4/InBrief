['Tasks','RSS','Email','Calendar','Twitter','Weather'].forEach((klass) => {
  module.exports[klass] = require('./' + klass);
})
