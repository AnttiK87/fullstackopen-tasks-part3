//API-service with Axios library for making HTTP requests
import axios from 'axios'

// setting base URL
const baseUrl = 'api/persons'

// get all persons
const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}

// add new person
const create = newObject => {
  const request = axios.post(baseUrl, newObject)
  return request.then(response => response.data)
}

// update existing person
const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject)
  return request.then(response => response.data)
}

// delete person
const del = (id) => {
    const request = axios.delete(`${baseUrl}/${id}`)
    return request.then(response => response.data)
}

// export functions to app.jsx
export default { getAll, create, update, del }