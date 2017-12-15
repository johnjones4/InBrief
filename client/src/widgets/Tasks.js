import React from 'react';
import Widget from './Widget';

export default class Tasks extends Widget {
  constructor(props) {
    super('Tasks','tasks',props);
  }

  renderWidget() {
    return this.state.data && (
      <div className="widget-big-numbers">
        <div className="widget-big-numbers-group">
          <div className="widget-big-numbers-number">
            {this.state.data.today}
          </div>
          <div className="widget-big-numbers-label">
            Due Today
          </div>
        </div>
        <div className="widget-big-numbers-group">
          <div className="widget-big-numbers-number">
            {this.state.data.endOfWeek}
          </div>
          <div className="widget-big-numbers-label">
            By Friday
          </div>
        </div>
      </div>
    );
  }
}
