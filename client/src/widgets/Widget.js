import React, { Component } from 'react';
import {
  fetchServiceData,
  fetchSettings,
  saveSettings
} from '../util';
import './Widget.css';

export default class Widget extends Component {
  constructor(title,name,props) {
    super(props);
    this.name = name;
    this.title = title;
    this.state = {
      'data': null,
      'editing': false,
      'settings': null
    };
  }

  getMainClassNames() {
    const classNames = ['widget','widget-'+this.name];
    if (this.state.editing) {
      classNames.push('widget-editing');
    }
    return classNames;
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

  toggleEditing() {
    if (!this.state.editing) {
      this.loadSettings();
    }
    this.setState({
      'editing': !this.state.editing
    });
  }

  loadSettings() {
    fetchSettings(this.name)
    .then((settings) => {
      this.setState({
        settings
      });
    });
  }

  saveSettings() {
    if (this.state.settings) {
      saveSettings(this.name,this.state.settings)
        .then(({settings}) => {
          this.setState({
            'editing': false,
            'settings': null
          });
        });
    }
  }

  render() {
    return (
      <div className={this.getMainClassNames().join(' ')}>
        <div className="widget-title">
          <span className="widget-title-text">
            {this.title}
          </span>
          <button className="widget-title-edit" onClick={() => this.toggleEditing()}>{this.state.editing ? 'Cancel' : 'Edit'}</button>
        </div>
        <div className="widget-body">
          {this.renderWidget()}
        </div>
        <div className="widget-edit">
          {this.renderWidgetEditor()}
          <div className="widget-edit-save-container">
            <button className="widget-edit-save" onClick={() => this.saveSettings()} disabled={this.state.settings === null}>Save</button>
          </div>
        </div>
      </div>
    )
  }

  renderWidget() {
    return null;
  }

  renderWidgetEditor() {
    return null;
  }
}
