import React from 'react';
import Widget from './Widget';
import './Weather.css';

export default class Weather extends Widget {
  constructor(props) {
    super('Weather','weather',props);
  }

  renderWidget() {
    return this.state.data && (
      <div className="weather-wrapper">
        <div className="weather-now">
          <div className="weather-label">Now</div>
          <div className="weather-now-content">
            <img src={'https://icons.wxug.com/i/c/h/' + this.state.data.now.icon + '.gif'} className="weather-icon" />
            <div className="weather-description">
              {this.state.data.now.weather}
            </div>
            <div className="weather-temp">
              <span className="weather-value-label weather-feelslike-label">Temp: </span>
              <span className="weather-feelslike-temp">{this.state.data.now.temp}&#176;</span>
            </div>
            <div className="weather-feelslike">
              <span className="weather-value-label weather-feelslike-label">Feels Like: </span>
              <span className="weather-feelslike-temp">{this.state.data.now.feelslike}&#176;</span>
            </div>
            <div className="weather-humidity">
              <span className="weather-value-label weather-humidity-label">Humidity: </span>
              <span className="weather-humidity-temp">{this.state.data.now.humidity}</span>
            </div>
          </div>
        </div>
        <div className="weather-forecast">
          {
            this.state.data.forecast.map((item) => {
              return (
                <div className="weather-forecast-item">
                  <div className="weather-label">{item.label}</div>
                  <div className="weather-content">
                    <div className="weather-icon-wrapper">
                      <img src={'https://icons.wxug.com/i/c/h/' + item.icon + '.gif'} className="weather-icon" />
                    </div>
                    <div className="weather-text">
                      <div className="weather-description">
                        {item.forecast}
                      </div>
                      <div className="weather-high">
                        <span className="weather-value-label weather-high-label">High: </span>
                        <span className="weather-high-temp">{item.high}&#176;</span>
                      </div>
                      <div className="weather-low">
                        <span className="weather-value-label weather-low-label">Low: </span>
                        <span className="weather-low-temp">{item.low}&#176;</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}
