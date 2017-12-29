import { ACTIONS } from './consts'
const {ipcRenderer} = window.require('electron')

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
  ipcRenderer.send('serviceconfig', {name, config})
  return {
    type: ACTIONS.SET_SERVICE_CONFIG,
    name,
    config
  }
}

export const commitTempConfigString = (name) => {
  return (dispatch, getState) => {
    try {
      const config = JSON.parse(getState().services.services.find((service) => service.name === name).tempConfigString)
      dispatch(setServiceConfig(name, config))
    } catch (err) {
      console.error(err)
    }
  }
}

export const setTemporaryServiceConfigString = (name, tempConfigString) => {
  return {
    type: ACTIONS.SET_TEMP_SERVICE_CONFIG_STRING,
    name,
    tempConfigString
  }
}

export const removeService = (name) => {
  ipcRenderer.send('removeService', name)
  return {
    type: ACTIONS.REMOVE_SERVICE,
    name
  }
}

export const setServicesLayouts = (layouts) => {
  ipcRenderer.send('layouts', layouts)
  return {
    type: ACTIONS.SET_LAYOUTS,
    layouts
  }
}
