const ews = require('ews-javascript-api');
const ewsFactory = require('../util/ewsFactory');
const Service = require('./Service');
const Imap = require('imap');

class Email extends Service {
  constructor(config) {
    super('email',config);
    this.intervalDelay = 300000;
  }

  exec() {
    return Promise.all(
      this.config.mailboxes.map((mailbox) => {
        return this.fetchMail(mailbox)
          .catch((err) => this.handleSubError(err));
      })
    ).then((data) => {
      const totals = {
        'unread': 0,
        'flagged': 0
      };
      data.forEach((item) => {
        if (item && item.unread) totals.unread += item.unread;
        if (item && item.flagged) totals.flagged += item.flagged;
      })
      return {
        'type': 'email',
        'data': totals
      };
    });
  }

  fetchMail(mailbox) {
    switch(mailbox.type) {
      case 'exchange':
        return this.fetchExchange(mailbox);
      case 'imap':
        return this.fetchImap(mailbox);
      default:
        throw new Error('Mailbox not supported!');
    }
  }

  fetchExchange(mailbox) {
    const exch = ewsFactory.init(mailbox.credentials);
    const response = {
      'unread': 0,
      'flagged': 0
    };

    const execFlagSearch = () => {
      const view = new ews.ItemView();
      const filt = new ews.SearchFilter.IsEqualTo()
      filt.PropertyDefinition = ews.TaskSchema.Status;
      filt.Value = ews.TaskStatus.NotStarted;
      return exch.FindItems(ews.WellKnownFolderName.ToDoSearch,filt,view)
        .then((results) => {
          response.flagged = results.items.length;
        })
    }

    const execUnreadSearch = () => {
      const view = new ews.ItemView();
      const filt = new ews.SearchFilter.IsEqualTo()
      filt.PropertyDefinition = ews.EmailMessageSchema.IsRead;
      filt.Value = false;
      return exch.FindItems(ews.WellKnownFolderName.Inbox,filt,view)
        .then((results) => {
          response.unread = results.items.length;
        })
    }

    return execFlagSearch()
      .then(() => execUnreadSearch())
      .then(() => response);
  }

  fetchImap(mailbox) {
    const response = {
      'unread': 0,
      'flagged': 0
    };
    const imap = new Imap(mailbox.credentials);
    const p = new Promise((resolve,reject) => {
      imap.once('error',(err) => reject(err));
      imap.once('ready',() => {
        const execFlagSearch = () => {
          return this.promiseIfy((cb) => {
            imap.openBox(mailbox.flagMailboxName,true,cb);
          })
            .then(() => {
              return this.promiseIfy((cb) => {
                imap.search([['FLAGGED',true]],cb)
              })
            })
            .then((messages) => {
              response.flagged = messages.length;
            });
        }

        const execUnreadSearch = () => {
          return this.promiseIfy((cb) => {
            imap.openBox(mailbox.unreadMailboxName,true,cb);
          })
          .then(() => {
            return this.promiseIfy((cb) => {
              imap.search([['UNSEEN',true]],cb)
            })
          })
          .then((messages) => {
            response.unread = messages.length;
          })
        }

        execFlagSearch()
          .then(() => execUnreadSearch())
          .then(() => {
            imap.end();
            resolve(response);
          })
          .catch((err) => reject(err));
      });
    });
    imap.connect();
    return p;
  }
}

module.exports = Email;
