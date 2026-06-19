import api from './axios'

export const getAllEntries = async () => {
  const { data } = await api.get('/journal')
  return data.entries
}

export const getEntry = async (date) => {
  const { data } = await api.get(`/journal/${date}`)
  return data.entry
}

export const saveEntry = async (date, mood, text) => {
  const { data } = await api.post('/journal', { date, mood, text })
  return data.entry
}

export const deleteEntry = async (date) => {
  const { data } = await api.delete(`/journal/${date}`)
  return data
}
