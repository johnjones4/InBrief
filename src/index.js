import React from 'react'
import ReactDOM from 'react-dom'
import Dashboard from './ui/Dashboard'
import { compose, applyMiddleware, createStore } from 'redux'
import { Provider } from 'react-redux'
import { createLogger } from 'redux-logger'
import rootReducer from './ui/util/reducer'
import thunk from 'redux-thunk'

const logger = createLogger({
  'predicate': () => window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
})

const store = createStore(
  rootReducer,
  undefined,
  compose(
    applyMiddleware(thunk, logger)
  )
)

ReactDOM.render(
  <Provider store={store}>
    <Dashboard />
  </Provider>,
  document.getElementById('root')
)
