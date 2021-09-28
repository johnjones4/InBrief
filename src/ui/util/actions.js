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
    uuid: data.uuid,
    name: data.name
  }
}

export const setServiceConfig = (name, uuid, config) => {
  ipcRenderer.send('serviceconfig', {name, uuid, config})
  return {
    type: ACTIONS.SET_SERVICE_CONFIG,
    uuid,
    name,
    config
  }
}

export const commitTempConfig = (name, uuid) => {
  return (dispatch, getState) => {
    try {
      const config = getState().services.services.find((service) => service.uuid === uuid).tempConfig
      dispatch(setServiceConfig(name, uuid, config))
    } catch (err) {
      console.error(err)
    }
  }
}

export const setTemporaryConfig = (uuid, tempConfig) => {
  return {
    type: ACTIONS.SET_TEMP_CONFIG,
    uuid,
    tempConfig
  }
}

export const removeService = (uuid) => {
  ipcRenderer.send('removeService', uuid)
  return {
    type: ACTIONS.REMOVE_SERVICE,
    uuid
  }
}

export const setServicesLayouts = (layouts) => {
  ipcRenderer.send('layouts', layouts)
  return {
    type: ACTIONS.SET_LAYOUTS,
    layouts
  }
}
