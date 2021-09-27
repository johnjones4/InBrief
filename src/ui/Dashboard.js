import React, { Component } from 'react'
import './reset.css'
import './vars_mixins.css'
import '../../node_modules/react-grid-layout/css/styles.css'
import '../../node_modules/react-resizable/css/styles.css'
import './Dashboard.css'
import {
  Calendar,
  Email,
  RSS,
  Tasks,
  Twitter,
  Weather,
  IFrame
} from './widgets'
import {
  setServices,
  setServiceData,
  setServicesLayouts
} from './util/actions'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {Responsive, WidthProvider} from 'react-grid-layout'
import PropTypes from 'prop-types'
import AddWidget from './AddWidget'
const ResponsiveReactGridLayout = WidthProvider(Responsive)
const {ipcRenderer} = window.require('electron')

const MARGIN = 20

class Dashboard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      perferredRowHeight: 200
    }
    window.addEventListener('resize', () => {
      this.resetRowHeight()
    })
  }

  resetRowHeight () {
    this.setState({
      perferredRowHeight: ((window.innerHeight - MARGIN) / 8) - MARGIN
    })
  }

  componentDidMount () {
    ipcRenderer.once('services', (event, services) => {
      this.props.setServices(services)

      ipcRenderer.on('servicedata', (event, data) => {
        this.props.setServiceData(data)
      })
      ipcRenderer.send('servicedata')

      ipcRenderer.on('services', (event, services) => {
        this.props.setServices(services)
      })
    })
    ipcRenderer.send('services')

    this.resetRowHeight()
  }

  componentWillUnmount () {
    if (this.errorInterval) {
      clearInterval(this.errorInterval)
    }
  }

  layoutChanged (layout, layouts) {
    const newLayouts = layout.map((serviceLayout) => {
      return {
        name: serviceLayout.i,
        layout: {
          x: serviceLayout.x,
          y: serviceLayout.y,
          h: serviceLayout.h,
          w: serviceLayout.w
        }
      }
    })
    this.props.setServicesLayouts(newLayouts)
  }

  render () {
    if (this.props.services.services && this.props.services.services.length > 0) {
      const cols = 3
      return (
        <div>
          <ResponsiveReactGridLayout
            rowHeight={this.state.perferredRowHeight}
            breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
            cols={{lg: cols, md: cols, sm: cols, xs: cols, xxs: cols}}
            onLayoutChange={(layout, layouts) => this.layoutChanged(layout, layouts)}
            draggableCancel='input,textarea'
            margin={[MARGIN, MARGIN]}>
            {
              this.props.services.services.map((service, i) => {
                const defaultProps = this.getServiceProps(service)
                const layout = {
                  i: service.name,
                  x: service.config && service.config.layout ? (service.config.layout.x || 0) : 0,
                  y: service.config && service.config.layout ? (service.config.layout.y || 0) : 0,
                  w: service.config && service.config.layout ? (service.config.layout.w || 1) : 1,
                  h: defaultProps.isResizable ? (service.config && service.config.layout ? (service.config.layout.h || defaultProps.h) : defaultProps.h) : defaultProps.h,
                  isResizable: defaultProps.isResizable
                }
                return (
                  <div key={service.name} data-grid={layout}>
                    { this.renderWidget(service) }
                  </div>
                )
              })
            }
          </ResponsiveReactGridLayout>
          <AddWidget />
        </div>
      )
    } else {
      return (
        <div>
          <div className='dashboard-placeholder'>
            <div className='dashboard-placeholder-text-1'>
              Welcome to InBrief. We're glad to have you here
            </div>
            <div className='dashboard-placeholder-text-2'>
              Add Some Cards
            </div>
          </div>
          <AddWidget />
        </div>
      )
    }
  }

  renderWidget (service) {
    switch (service.name) {
      case 'rss':
        return (<RSS key={service} />)
      case 'twitter':
        return (<Twitter key={service} />)
      case 'calendar':
        return (<Calendar key={service} />)
      case 'email':
        return (<Email key={service} />)
      case 'tasks':
        return (<Tasks key={service} />)
      case 'weather':
        return (<Weather key={service} />)
      case 'iframe':
        return (<IFrame key={service} />)
      default:
        return null
    }
  }

  getServiceProps (service) {
    switch (service.name) {
      case 'rss':
        return RSS.widgetProps
      case 'twitter':
        return Twitter.widgetProps
      case 'calendar':
        return Calendar.widgetProps
      case 'email':
        return Email.widgetProps
      case 'tasks':
        return Tasks.widgetProps
      case 'weather':
        return Weather.widgetProps
      case 'iframe':
        return IFrame.widgetProps
      default:
        return null
    }
  }
}

const stateToProps = (state) => {
  return {
    services: state.services
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    setServices,
    setServiceData,
    setServicesLayouts
  }, dispatch)
}

Dashboard.propTypes = {
  setServices: PropTypes.func.isRequired,
  setServiceData: PropTypes.func.isRequired,
  setServicesLayouts: PropTypes.func.isRequired,
  services: PropTypes.shape({
    services: PropTypes.array
  })
}

export default connect(stateToProps, dispatchToProps)(Dashboard)
