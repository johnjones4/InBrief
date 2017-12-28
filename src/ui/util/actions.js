import { ACTIONS } from './consts'

export const setServices = (services) => {
  return {
    type: ACTIONS.SET_SERVICES,
    services
  }
}

export const setServiceData = (data) => {
  return {
    type: ACTIONS.SET_SERVICE_DATA,
    data: data.data,
    name: data.name
  }
}

export const setServiceConfig = (name, config) => {
  return {
    type: ACTIONS.SET_SERVICE_CONFIG,
    name,
    config
  }
}
