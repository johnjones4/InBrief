/* global fetch */
export const serverRequest = (path) => {
  return fetch(path)
    .then((response) => response.json())
}

export const fetchServiceNames = () => {
  return serverRequest('/api/service')
}

export const fetchServiceData = (service) => {
  return serverRequest('/api/service/' + service)
}

export const formatDate = (dateStr) => {
  const now = new Date()
  const date = new Date(dateStr)
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString()
  } else {
    return date.toLocaleDateString()
  }
}
