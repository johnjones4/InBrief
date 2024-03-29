const Service = require('./Service')
const request = require('request-promise-native')
const asana = require('asana')
const oauthFactory = require('../util/oauthFactory')

class Tasks extends Service {
  constructor (uuid, config) {
    super(uuid, config)
    this.intervalDelay = 60000
  }

  getName () {
    return 'tasks'
  }

  exec () {
    const now = new Date()
    const tonight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    const dayOfWeek = tonight.getDay()
    const friday = new Date(tonight.getTime() + ((5 - dayOfWeek) * (1000 * 60 * 60 * 24)))
    const dates = {
      now,
      tonight,
      friday
    }
    return Promise.all(
      this.config.apis.map((api) => {
        return this.fetchApi(dates, api)
          .catch((err) => this.handleExecError(err))
      })
    ).then((data) => {
      const totals = {
        'today': 0,
        'endOfWeek': 0
      }
      data.forEach((item) => {
        if (item && item.today) totals.today += item.today
        if (item && item.endOfWeek) totals.endOfWeek += item.endOfWeek
      })
      return {
        'uuid': this.uuid,
        'name': this.getName(),
        'data': totals
      }
    })
  }

  fetchApi (dates, api) {
    switch (api.type) {
      case 'todoist':
        return this.fetchTodoist(dates, api)
      case 'asana':
        return this.fetchAsana(dates, api)
      default:
        throw new Error('API not supported!')
    }
  }

  refreshAPIToken (refreshToken, service) {
    return oauthFactory(service, null)
      .refreshToken(refreshToken)
  }

  fetchTodoist ({now, tonight, friday}, api) {
    if (api.token || api.refreshToken) {
      const todoistRequest = (uri, params) => {
        params.token = api.token
        return request({
          'uri': uri,
          'qs': params,
          'useQueryString': true,
          'json': true,
          'agent': false
        })
      }
      return (() => {
        if (api.refreshToken) {
          return this.refreshAPIToken(api.refreshToken, 'todoist')
            .then((token) => {
              api.token = token
            })
        } else {
          return Promise.resolve()
        }
      })()
        .then(() => {
          return todoistRequest('https://todoist.com/api/v7/sync', {
            'sync_token': '*',
            'resource_types': JSON.stringify(['items'])
          })
        })
        .then((body) => {
          body.items.forEach((item) => {
            if (item.due_date_utc !== null) {
              item.dueDate = new Date(item.due_date_utc)
            } else {
              item.dueDate = null
            }
          })

          const reducer = (limitDate) => {
            return (subtotal, item) => {
              if (item.dueDate && item.checked === 0) {
                return subtotal + (item.dueDate.getTime() <= limitDate.getTime() ? 1 : 0)
              } else {
                return subtotal
              }
            }
          }

          const today = body.items.reduce(reducer(tonight), 0)

          const endOfWeek = body.items.reduce(reducer(friday), 0)

          return {
            today,
            endOfWeek
          }
        })
    } else {
      return Promise.resolve({
        today: 0,
        endOfWeek: 0
      })
    }
  }

  fetchAsana ({now, tonight, friday}, api) {
    if (api.token || api.refreshToken) {
      let client
      return (() => {
        if (api.refreshToken) {
          return this.refreshAPIToken(api.refreshToken, 'asana')
            .then((token) => {
              api.token = token
            })
        } else {
          return Promise.resolve()
        }
      })()
        .then(() => {
          client = asana.Client.create().useAccessToken(api.token)
          return client.users.me()
        })
        .then(function (me) {
          return Promise.all(
            me.workspaces.map((workspace) => {
              return client.tasks.findAll({
                'assignee': me.id,
                'workspace': workspace.id,
                'opt_fields': 'due_on'
              })
            })
          )
        })
        .then((workspaceTasks) => {
          workspaceTasks.forEach((workspace) => {
            workspace.data.forEach((task) => {
              if (task.due_on === null) {
                task.due_on = new Date(task.due_on)
              }
            })
          })

          const reducer = (limitDate) => {
            return (total, workspace) => {
              return workspace.data.reduce((subtotal, task) => {
                if (task.dueDate) {
                  return subtotal + (task.due_on.getTime() <= limitDate.getTime() ? 1 : 0)
                } else {
                  return subtotal
                }
              }, total)
            }
          }

          const today = workspaceTasks.reduce(reducer(tonight), 0)

          const endOfWeek = workspaceTasks.reduce(reducer(friday), 0)

          return {
            today,
            endOfWeek
          }
        })
    } else {
      return Promise.resolve({
        today: 0,
        endOfWeek: 0
      })
    }
  }
}

Tasks.defaultConfig = {
  apis: []
}

module.exports = Tasks
