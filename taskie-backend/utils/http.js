function sendError(res, error) {
  console.error({
    event: 'controller_error',
    name: error?.name,
    code: error?.code,
    message: error?.message,
  })
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid request data' })
  }
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'A matching record already exists' })
  }
  return res.status(500).json({ message: 'Server error' })
}

module.exports = { sendError }
