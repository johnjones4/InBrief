export const serverRequest = (path) => {
  return fetch(path)
    .then((response) => response.json());
}

export const fetchServiceNames = () => {
  return serverRequest('/api/service');
}

export const fetchServiceData = (service) => {
  return serverRequest('/api/service/' + service);
}
