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
        service.tempConfigString = JSON.stringify(service.config, null, '  ')
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
          tempConfigString: '{}'
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
          tempConfigString: JSON.stringify(action.config, null, '  ')
        })
        return Object.assign({}, state, {
          services: newServices
        })
      }
    case ACTIONS.SET_TEMP_SERVICE_CONFIG_STRING:
      const index2 = state.services.findIndex((service) => service.name === action.name)
      if (index2 >= 0) {
        const newServices = state.services.slice(0)
        newServices[index2].tempConfigString = action.tempConfigString
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
    default:
      return state
  }
}

const rootReducer = combineReducers({
  services
})

export default rootReducer
