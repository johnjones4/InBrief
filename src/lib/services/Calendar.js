const ical = require('ical')
const request = require('request-promise-native')
const Service = require('./Service')
const _ = require('lodash')
const ews = require('ews-javascript-api')
const EWSFactory = require('../util/EWSFactory')

class Calendar extends Service {
  constructor (uuid, config) {
    super(uuid, config)
    this.intervalDelay = 300000
  }

  getName () {
    return 'calendar'
  }

  exec () {
    const now = new Date()
    const thisMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const tonight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    const dates = {
      thisMorning,
      tonight
    }
    return Promise.all(
      this.config.calendars.map((calendar) => {
        return this.fetchEvents(dates, calendar)
          .catch((err) => this.handleExecError(err))
      })
    ).then((arraysOfEvents) => {
      const allEvents = []
      arraysOfEvents.forEach((events) => {
        if (events) {
          events.forEach((event) => allEvents.push(event))
        }
      })
      allEvents.sort((a, b) => {
        return a.start.getTime() - b.start.getTime()
      })
      return {
        'uuid': this.uuid,
        'name': this.getName(),
        'data': allEvents
      }
    })
  }

  fetchEvents (dates, calendar) {
    switch (calendar.type) {
      case 'ics':
        return this.fetchICSEvents(dates, calendar)
      case 'exchange':
        return this.fetchExchangeEvents(dates, calendar)
      default:
        throw new Error('Calendar not supported!')
    }
  }

  fetchICSEvents ({thisMorning, tonight}, calendar) {
    return request({
      url: calendar.url,
      agent: false
    })
      .then((icsData) => {
        const events = _.values(ical.parseICS(icsData))
        return events
          .filter((event) => {
            return event.start && event.end && event.end.getTime() > thisMorning.getTime() && event.start.getTime() < tonight.getTime()
          })
          .map((event) => {
            return {
              'name': event.summary,
              'start': new Date(event.start.getTime()),
              'end': new Date(event.end.getTime())
            }
          })
      })
  }

  fetchExchangeEvents ({thisMorning, tonight}, calendar) {
    const exch = new EWSFactory().initInstance(calendar.credentials)
    const view = new ews.CalendarView()
    view.StartDate = thisMorning.toISOString()
    view.EndDate = tonight.toISOString()
    return exch.FindAppointments(ews.WellKnownFolderName.Calendar, view)
      .then((results) => {
        return results.items.map((item) => {
          return {
            'name': item.propertyBag.properties.objects.Subject,
            'start': new Date(item.propertyBag.properties.objects.Start.valueOf()),
            'end': new Date(item.propertyBag.properties.objects.End.valueOf())
          }
        })
      })
  }
}

Calendar.defaultConfig = {
  calendars: []
}

module.exports = Calendar
