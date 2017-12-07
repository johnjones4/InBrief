import React from 'react';
import Widget from './Widget';
import './Calendar.css';

const MIN_MINUTES = 8 * 60;
const MAX_MINUTES = 19 * 60;

export default class Calendar extends Widget {
  constructor(props) {
    super('Calendar','calendar',props);
  }

  estimateYPosition(event) {
    const start = new Date(event.start);
    const minutesIntoDay = (start.getHours() * 60) + start.getMinutes();
    const offsetFromStart = minutesIntoDay - MIN_MINUTES;
    const percent = offsetFromStart / (MAX_MINUTES - MIN_MINUTES);
    return percent;
  }

  estimateHeight(event) {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const spanInMillis = end.getTime() - start.getTime();
    const spanInMinutes = spanInMillis / 1000 / 60;
    const percent = spanInMinutes / (MAX_MINUTES - MIN_MINUTES);
    return percent;
  }

  estimateNowPosition() {
    const now = new Date();
    const minutesIntoDay = (now.getHours() * 60) + now.getMinutes();
    const offsetFromStart = minutesIntoDay - MIN_MINUTES;
    const percent = offsetFromStart / (MAX_MINUTES - MIN_MINUTES);
    return percent;
  }

  renderWidget() {
    return (
      <div className="calendar-items">
        {
          this.state.data && this.state.data.map((event,i) => {
            return (
              <div className="calendar-item" key={i} style={{'top': (this.estimateYPosition(event)*100)+'%','height':(this.estimateHeight(event)*100)+'%'}}>
                <div className="calendar-item-name">
                  {event.name}
                </div>
                <div className="calendar-item-timespan">
                  <span className="calendar-item-timespan-start">
                    {new Date(event.start).toLocaleTimeString()}
                  </span>
                  <span className="calendar-item-timespan-end">
                    {new Date(event.end).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )
          })
        }
        <div className="calendar-now" style={{'top': (this.estimateNowPosition()*100)+'%'}}></div>
      </div>
    );
  }
}
