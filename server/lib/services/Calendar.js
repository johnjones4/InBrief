const ical = require('ical');
const request = require('request-promise-native');
const Service = require('./Service');
const _ = require('lodash');
const ews = require('ews-javascript-api');
const ewsFactory = require('../util/ewsFactory');

class Calendar extends Service {
  constructor(config) {
    super('calendar',config);
  }

  exec() {
    const now = new Date();
    const tonight = new Date(now.getFullYear(),now.getMonth(),now.getDate(),23,59,59,999);
    const dates = {
      now,
      tonight
    }
    return Promise.all(
      this.config.calendars.map((calendar) => {
        return this.fetchEvents(dates,calendar);
      })
    ).then((arraysOfEvents) => {
      const allEvents = [];
      arraysOfEvents.forEach((events) => {
        events.forEach((event) => allEvents.push(event));
      });
      allEvents.sort((a,b) => {
        return a.start.getTime() - b.start.getTime();
      });
      return {
        'type': 'calendar',
        'data': allEvents
      }
    });
  }

  fetchEvents(dates,calendar) {
    switch(calendar.type) {
      case 'ics':
        return this.fetchICSEvents(dates,calendar);
      case 'exchange':
        return this.fetchExchangeEvents(dates,calendar);
      default:
        throw new Error('Calendar not supported!');
    }
  }

  fetchICSEvents({now,tonight},calendar) {
    return request(calendar.url)
      .then((icsData) => {
        const events = _.values(ical.parseICS(icsData));
        return events
          .filter((event) => {
            return event.start && event.end && event.end.getTime() > now.getTime() && event.start.getTime() < tonight.getTime();
          })
          .map((event) => {
            return {
              'name': event.summary,
              'start': new Date(event.start.getTime()),
              'end': new Date(event.end.getTime())
            };
          })
      })
  }

  fetchExchangeEvents({now,tonight},calendar) {
    const exch = ewsFactory.init(calendar.credentials);
    const view = new ews.CalendarView();
    view.StartDate = now.toISOString();
    view.EndDate = tonight.toISOString();
    return exch.FindAppointments(ews.WellKnownFolderName.Calendar,view)
      .then((results) => {
        return results.items.map((item) => {
          return {
            'name': item.propertyBag.properties.objects.Subject,
            'start': new Date(item.propertyBag.properties.objects.Start.valueOf()),
            'end': new Date(item.propertyBag.properties.objects.End.valueOf())
          };
        });
      })
  }
}

module.exports = Calendar;
