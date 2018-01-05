# Development

To extend the capabilities of this tool, there are two key classes you must implement, in addition to modifiying the proper files so that those classes may be instantiated.

## Classes

### Service Class

The service class is the backend implementation that performs the API calls and other communication with the remote service. The below is a bare-bones template of a service class that belongs in `./lib/services`:

```Javascript
const Service = require('./Service')

class NewService extends Service {
  constructor (config) {
    // That first parameter becomes this.name
    super('newServiceName', config)
  }

  exec (dataEmitter) {
    // Return a Promise while executing remote communication for the service fetch. 
    // Once done, return an object like the one below, with a type key and a data 
    // key containing the information needed on the front end. Services may also
    // "emit" data by directly calling the function dataEmitter passed in the 
    // method signature with the object format below as the first parameter. The 
    // parent class handles caching of this data. That cache can be accessed at 
    // this.cachedResponse. Also, access the configuration, passed from the 
    // frontend at this.config.
    return Promise.resolve({
      type: this.name,
      data: {}
    })
  }
}

// When a Service is instantiated, this is used to provide a default configuration
NewService.defaultConfig = {
  someConfigKey: null
}

module.exports = NewService
```

Also, make sure to update the `index.js` file in `./lib/services` to include this class.

### ServiceManager

The method `instantiateServiceByName(name, config)` in `./liv/util/ServiceManager.js` takes a name slug, matching `this.name` from the service class, and returns an instantiated class. This must be updated to include the new class.

### Widget Class

The widget class is used to display the information on the front-end. The below is a bare-bones template of a widget class that belongs in `./ui/widgets`:

```Javascript
import React from 'react'
import Widget from './Widget'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  commitTempConfig,
  setTemporaryConfig,
  removeService
} from '../util/actions'
import {
  WidgetEditorFieldGroup
} from '../util/widgetElements'

class NewWidget extends Widget {
  constructor (props) {
    // The first parameter can be any string, used fo the widget's title, but the
    // second paramter must match the slug used for the name in the service class
    super('Widget Nice Title', 'newServiceName', props)
  }

  renderWidget () {
    // getWidgetData returns the information sent in "data" by the service class
    const data = this.getWidgetData()
    return data && (
      <div>
        Some widget data
      </div>
    )
  }

  renderEditor () {
    // The "tempConfig" is a copy of the configuration made every time the widget
    // enters editing-mode. When the user hits "Save" on the editor, that temp
    // configuration is committed to the primary config and the service class is
    // restarted with that new config data. The easiest way to modify it is by 
    // calling the method, this.setTempConfigValue('key', value) as seen below.
    const tempConfig = this.getWidgetTempConfig()
    if (tempConfig) {
      return (
        <div>
          <WidgetEditorFieldGroup name='Config field name'>
            <input 
              className='widget-editor-input' 
              type='text' 
              value={tempConfig.someConfigKey} 
              onChange={(event) => this.setTempConfigValue('someConfigKey', event.target.value)} />
          </WidgetEditorFieldGroup>
        </div>
      )
    } else {
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
    commitTempConfig,
    setTemporaryConfig,
    removeService
  }, dispatch)
}

// These are used by the layout engine. "h" is the default h in row-units for 
// the widget and "isResizable" dictates whether or not the user may resize
// the widget.
NewWidget.widgetProps = {
  h: 3,
  isResizable: true
}

export default connect(stateToProps, dispatchToProps)(NewWidget)
```

### Dashboard.js

The main React class of this application, Dashboard.js, contains two methods that must be updated to accommodate the new widget class:

* `renderWidget(service)` takes a service object and uses `service.name` to determine which React/widget element to return.
* `getServiceProps(service)` takes a service object and uses `service.name` to determine which React/widget `widgetProps` property to return.
