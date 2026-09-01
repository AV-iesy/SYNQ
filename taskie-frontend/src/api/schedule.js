import api from './axios'

export const generateSchedule = async (input) => {
  const { data } = await api.post('/schedule/generate', { input })
  return data.blocks
}

export const getSchedule = async (date) => {
  const { data } = await api.get(`/schedule/${date}`)
  return data.schedule
}

export const saveSchedule = async (date, blocks, sourceInput = '') => {
  const { data } = await api.post('/schedule', { date, blocks, sourceInput })
  return data.schedule
}

export const deleteSchedule = async (date) => {
  const { data } = await api.delete(`/schedule/${date}`)
  return data
}

export const getAllSchedules = async () => {
  const { data } = await api.get('/schedule')
  return data.schedules
}
