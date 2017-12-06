const Service = require('./Service');
const request = require('request-promise-native');
const asana = require('asana');

class Tasks extends Service {
  constructor(config) {
    super('tasks',config);
  }

  exec() {
    const now = new Date();
    const tonight = new Date(now.getFullYear(),now.getMonth(),now.getDate(),23,59,59,999);
    const dates = {
      now,
      tonight
    }
    return Promise.all(
      this.config.apis.map((api) => {
        return this.fetchApi(dates,api)
          .catch((err) => this.handleSubError(err));
      })
    ).then((data) => {
      const totals = {
        'today': 0,
        'total': 0
      };
      data.forEach((item) => {
        if (item && item.today) totals.today += item.today;
        if (item && item.total) totals.total += item.total;
      })
      return {
        'type': 'tasks',
        'data': totals
      };
    });
  }

  fetchApi(dates,api) {
    switch(api.type) {
      case 'todoist':
        return this.fetchTodoist(dates,api);
      case 'asana':
        return this.fetchAsana(dates,api);
      default:
        throw new Error('API not supported!');
    }
  }

  fetchTodoist({now,tonight},api) {
    const todoistRequest = (uri,params) => {
      params.token = api.token;
      return request({
        'uri': uri,
        'qs': params,
        'useQueryString': true,
        'json': true
      })
    }
    return todoistRequest('https://todoist.com/api/v7/sync',{
      'sync_token': '*',
      'resource_types': JSON.stringify(['projects'])
    })
      .then((body) => {
        return Promise.all(
          body.projects.map((project) => {
            return todoistRequest('https://todoist.com/api/v7/projects/get_data',{
              'project_id': project.id
            })
              .then((data) => {
                return this.thenSleep(data,500);
              });
          })
        )
      })
      .then((projects) => {
        projects.forEach((project) => {
          project.items.forEach((item) => {
            if (item.due_date_utc !== null) {
              item.dueDate = new Date(item.due_date_utc);
            } else {
              item.dueDate = null;
            }
          })
        })

        const today = projects.reduce((total,project) => {
          return project.items.reduce((subtotal,item) => {
            if (item.dueDate) {
              return subtotal + (item.dueDate.getTime() <= tonight.getTime() ? 1 : 0);
            } else {
              return subtotal;
            }
          },total);
        },0);

        const total = projects.reduce((total,project) => {
          return total + project.items.length;
        },0);

        return {
          today,
          total
        };
      });
  }

  fetchAsana({now,tonight},api) {
    const client = asana.Client.create().useAccessToken(api.token);
    return client.users.me()
      .then(function(me) {
        return Promise.all(
          me.workspaces.map((workspace) => {
            return client.tasks.findAll({
              'assignee': me.id,
              'workspace': workspace.id,
              'opt_fields': 'due_on'
            });
          })
        )
      })
      .then((workspaceTasks) => {
        workspaceTasks.forEach((workspace) => {
          workspace.data.forEach((task) => {
            if (task.due_on === null) {
              task.due_on = new Date(task.due_on);
            }
          })
        });

        const today = workspaceTasks.reduce((total,workspace) => {
          return workspace.data.reduce((subtotal,task) => {
            if (task.dueDate) {
              return subtotal + (task.due_on.getTime() <= tonight.getTime() ? 1 : 0);
            } else {
              return subtotal;
            }
          },total);
        },0);

        const total = workspaceTasks.reduce((total,workspace) => {
          return total + workspace.data.length;
        },0);

        return {
          today,
          total
        };
      })
  }
}

module.exports = Tasks;
