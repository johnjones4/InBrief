import { combineReducers } from 'redux'
import { ACTIONS } from './consts'

const initialServicesState = {
  'services': []
}

const services = (state = initialServicesState, action) => {
  switch (action.type) {
    case ACTIONS.SET_SERVICES:
      const newServices = action.services.slice(0)
      newServices.forEach((service) => {
        const existingService = state.services.find((_service) => service.name === _service.name)
        if (existingService) {
          service.data = existingService.data
        }
      })
      newServices.forEach((service) => {
        service.tempConfig = Object.assign({}, service.config)
      })
      return Object.assign({}, state, {
        services: newServices
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
          data: action.data,
          tempConfig: {}
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
        const newServices = state.services.slice(0)
        newServices.push({
          name: action.name,
          config: action.config,
          data: null,
          tempConfig: Object.assign({}, action.config)
        })
        return Object.assign({}, state, {
          services: newServices
        })
      }
    case ACTIONS.SET_TEMP_CONFIG:
      const index2 = state.services.findIndex((service) => service.name === action.name)
      if (index2 >= 0) {
        const newServices = state.services.slice(0)
        newServices[index2].tempConfig = Object.assign({}, action.tempConfig)
        return Object.assign({}, state, {
          services: newServices
        })
      } else {
        return state
      }
    case ACTIONS.REMOVE_SERVICE:
      return Object.assign({}, state, {
        services: state.services
          .filter((service) => {
            return service.name !== action.name
          })
          .map((service) => {
            return Object.assign({}, service)
          })
      })
    case ACTIONS.SET_LAYOUTS:
      const newServices1 = state.services.slice(0)
      action.layouts.forEach((layoutInfo) => {
        const serviceIndex = newServices1.findIndex((service) => service.name === layoutInfo.name)
        if (serviceIndex >= 0 && newServices1[serviceIndex].config) {
          newServices1[serviceIndex].config.layout = layoutInfo.layout
        }
      })
      return Object.assign({}, state, {
        services: newServices1
      })
    default:
      return state
  }
}

const rootReducer = combineReducers({
  services
})

export default rootReducer
