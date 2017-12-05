['Tasks','RSS','Email','Calendar','Twitter'].forEach((klass) => {
  module.exports[klass] = require('./' + klass);
})
