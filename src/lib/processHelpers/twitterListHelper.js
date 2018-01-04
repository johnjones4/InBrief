const { ipcMain } = require('electron')
const TwitterClient = require('twitter')
const keys = require('../../keys')

module.exports = (mainWindow) => {
  ipcMain.on('twitterlists', (event, {accessToken, tokenSecret}) => {
    const client = new TwitterClient({
      'consumer_key': keys.twitter.key,
      'consumer_secret': keys.twitter.secret,
      'access_token_key': accessToken,
      'access_token_secret': tokenSecret
    })
    client.get('lists/list', {}, (err, lists) => {
      if (err) {
        console.error(err)
      } else {
        mainWindow.webContents.send('twitterlists', lists.map((list) => {
          return {
            owner: list.user.screen_name,
            slug: list.slug,
            name: list.full_name
          }
        }))
      }
    })
  })
}
