import { combineReducers } from 'redux'
import { ACTIONS } from './consts'

const initialServicesState = {
  'services': []
}

const services = (state = initialServicesState, action) => {
  switch (action.type) {
    case ACTIONS.SET_SERVICES:
      return Object.assign({}, state, {
        services: action.services.slice(0)
      })
    case ACTIONS.SET_SERVICE_DATA:
      const index = state.services.findIndex((service) => service.name === action.name)
      if (index >= 0) {
        const newServices = state.services.slice(0)
        newServices[index].data = action.data
        return Object.assign({}, state, {
          services: newServices
        })
      } else {
        const newServices = state.services.slice(0)
        newServices.push({
          name: action.name,
          config: {},
          data: action.data
        })
        return Object.assign({}, state, {
          services: newServices
        })
      }
    case ACTIONS.SET_SERVICE_CONFIG:
      const index1 = state.services.findIndex((service) => service.name === action.name)
      if (index1 >= 0) {
        const newServices = state.services.slice(0)
        newServices[index1].config = action.config
        return Object.assign({}, state, {
          services: newServices
        })
      } else {
        return state
      }
    default:
      return state
  }
}

const rootReducer = combineReducers({
  services
})

export default rootReducer
