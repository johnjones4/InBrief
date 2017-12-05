import React from 'react';
import Widget from './Widget';

export default class Calendar extends Widget {
  constructor(props) {
    super('Calendar','calendar',props);
  }

  renderWidget() {
    return (
      <div className="calendar">
        {
          this.state.data && this.state.data.map((event,i) => {
            return (
              <div className="calendar-item" key={i}>

              </div>
            )
          })
        }
      </div>
    );
  }
}
