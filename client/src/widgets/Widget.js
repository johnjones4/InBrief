import React, { Component } from 'react';
import {
  fetchServiceData
} from '../util';
import './Widget.css';

export default class Widget extends Component {
  constructor(title,name,props) {
    super(props);
    this.name = name;
    this.title = title;
    this.state = {
      'data': null
    };
  }

  getMainClassNames() {
    return ['widget','widget-'+this.name];
  }

  componentDidMount() {
    this.doRequest();
    this.interval = setInterval(() => {
      this.doRequest();
    },10000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  doRequest() {
    fetchServiceData(this.name)
      .then(({data}) => {
        this.setState({
          data
        });
      });
  }

  render() {
    return (
      <div className={this.getMainClassNames().join(' ')}>
        <div className="widget-title">
          {this.title}
        </div>
        <div className="widget-body">
          {this.renderWidget()}
        </div>
      </div>
    )
  }

  renderWidget() {
    return null;
  }
}
