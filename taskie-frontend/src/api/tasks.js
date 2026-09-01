import api from './axios'

export const getAllTasks = async () => {
  const { data } = await api.get('/tasks')
  return data.tasks
}

export const getTasks = async (date) => {
  const { data } = await api.get(`/tasks/${date}`)
  return data.tasks
}

export const createTask = async (title, date, tag = 'general') => {
  const { data } = await api.post('/tasks', { title, date, tag })
  return data.task
}

export const updateTask = async (id, updates) => {
  const { data } = await api.put(`/tasks/${id}`, updates)
  return data.task
}

export const deleteTask = async (id) => {
  const { data } = await api.delete(`/tasks/${id}`)
  return data
}

export const clearAllTasks = async (date) => {
  const { data } = await api.delete(`/tasks/date/${date}`)
  return data
}
