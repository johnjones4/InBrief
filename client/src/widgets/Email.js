import React from 'react';
import Widget from './Widget';

export default class Email extends Widget {
  constructor(props) {
    super('Email','email',props);
  }

  renderWidget() {
    return this.state.data && (
      <div className="widget-big-numbers">
        <div className="widget-big-numbers-group">
          <div className="widget-big-numbers-number">
            {this.state.data.unread}
          </div>
          <div className="widget-big-numbers-label">
            Unread
          </div>
        </div>
        <div className="widget-big-numbers-group">
          <div className="widget-big-numbers-number">
            {this.state.data.flagged}
          </div>
          <div className="widget-big-numbers-label">
            Flagged
          </div>
        </div>
      </div>
    );
  }
}
