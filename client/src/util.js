export const serverRequest = (path,method='GET',body) => {
  return fetch(path,{
    'method': method,
    'body': body ? JSON.stringify(body) : null
  }).then((response) => response.json());
}

export const fetchServiceNames = () => {
  return serverRequest('/api/service');
}

export const fetchServiceData = (service) => {
  return serverRequest('/api/service/' + service);
}

export const formatDate = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString();
  } else {
    return date.toLocaleDateString();
  }
}

export const fetchSettings = (service) => {
  return serverRequest('/api/service/' + service + '/config');
}

export const saveSettings = (service,data) => {
  return serverRequest('/api/service/' + service + '/config','POST',data);
}