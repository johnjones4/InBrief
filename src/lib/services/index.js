['Tasks', 'RSS', 'Email', 'Calendar', 'Twitter', 'Weather', 'IFrame'].forEach((klass) => {
  module.exports[klass] = require('./' + klass)
})
