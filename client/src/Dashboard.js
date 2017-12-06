import React, { Component } from 'react';
import './reset.css';
import './Dashboard.css';
import {
  fetchServiceNames
} from './util';
import {
  Calendar,
  Email,
  RSS,
  Tasks,
  Twitter,
  Weather
} from './widgets';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      'services': []
    };
  }

  componentDidMount() {
    fetchServiceNames()
      .then((services) => {
        this.setState({
          services
        });
      });
  }

  render() {
    return (
      <div className="dashboard">
        <div className="dashboard-primary">
          {
            this.state.services.map((service,i) => {
              switch(service) {
                case 'rss':
                  return (<RSS key={i} />);
                case 'twitter':
                  return (<Twitter key={i} />);
                default:
                  return null;
              }
            })
          }
        </div>
        <div className="dashboard-secondary">
          {
            this.state.services.map((service,i) => {
              switch(service) {
                case 'calendar':
                  return (<Calendar key={i} />);
                case 'email':
                  return (<Email key={i} />);
                case 'tasks':
                  return (<Tasks key={i} />);
                case 'weather':
                  return (<Weather key={i} />);
                default:
                  return null;
              }
            })
          }
        </div>
      </div>
    );
  }
}

export default App;
