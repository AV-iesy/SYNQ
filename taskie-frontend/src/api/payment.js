import api from './axios'

export const createOrder = (plan) =>
  api.post('/payment/create-order', { plan }).then(r => r.data)

export const verifyPayment = (payload) =>
  api.post('/payment/verify', payload).then(r => r.data)

export const getStatus = () =>
  api.get('/payment/status').then(r => r.data)
