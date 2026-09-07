const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

export function getApiErrorMessage(error, fallback = FALLBACK_MESSAGE) {
  if (!error?.response) {
    return 'Could not reach the server. Check your connection and try again.'
  }

  const message = error.response.data?.message
  return typeof message === 'string' && message.trim() ? message : fallback
}
