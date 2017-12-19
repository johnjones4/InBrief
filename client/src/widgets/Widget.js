import React, { Component } from 'react'
import {
  fetchServiceData
} from '../util'
import './Widget.scss'
import '../spinner.scss'

export default class Widget extends Component {
  constructor (title, name, props) {
    super(props)
    this.name = name
    this.title = title
    this.state = {
      'data': null,
      'loading': false
    }
  }

  isReady () {
    return this.state.data !== null
  }

  getMainClassNames () {
    const classes = ['widget', 'widget-' + this.name]
    if (!this.isReady()) {
      classes.push('widget-not-ready')
    }
    if (this.state.loading) {
      classes.push('widget-loading')
    }
    return classes
  }

  componentDidMount () {
    this.doRequest()
    this.interval = setInterval(() => {
      this.doRequest()
    }, 10000)
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  doRequest () {
    this.setState({
      'loading': true
    })
    fetchServiceData(this.name)
      .then(({data}) => {
        this.setState({
          data,
          'loading': false
        })
      })
  }

  render () {
    return (
      <div className={this.getMainClassNames().join(' ')}>
        <div className='widget-title'>
          {this.title}
          <div className='spinner'>
            <div className='double-bounce1' />
            <div className='double-bounce2' />
          </div>
        </div>
        <div className='widget-body'>
          {this.renderWidget()}
        </div>
      </div>
    )
  }

  renderWidget () {
    return null
  }
}
