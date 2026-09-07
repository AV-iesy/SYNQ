const PLACEHOLDER_RE = /(placeholder|replace[_-]?me|change[_-]?me|example)/i

function isMissing(name) {
  const value = process.env[name]
  return !value || PLACEHOLDER_RE.test(value)
}

function getJwtSignOptions() {
  return {
    algorithm: 'HS256',
    issuer: 'synq-api',
    audience: 'synq-web',
  }
}

function getJwtVerifyOptions() {
  return {
    algorithms: ['HS256'],
    issuer: 'synq-api',
    audience: 'synq-web',
  }
}

function assertRuntimeConfig() {
  const required = ['MONGODB_URI', 'JWT_SECRET']
  const missing = required.filter(isMissing)
  if (missing.length) throw new Error(`Missing required server configuration: ${missing.join(', ')}`)

  if (process.env.NODE_ENV === 'production') {
    if (Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
      throw new Error('JWT_SECRET must contain at least 32 bytes in production')
    }
    if (isMissing('CLIENT_URL') || !process.env.CLIENT_URL.startsWith('https://')) {
      throw new Error('CLIENT_URL must be an HTTPS origin in production')
    }
    const clientUrl = new URL(process.env.CLIENT_URL)
    if (clientUrl.origin !== process.env.CLIENT_URL || clientUrl.username || clientUrl.password) {
      throw new Error('CLIENT_URL must contain only an HTTPS origin')
    }
  }

  if (process.env.PAYPAL_MODE && !['sandbox', 'live'].includes(process.env.PAYPAL_MODE)) {
    throw new Error('PAYPAL_MODE must be sandbox or live')
  }
}

module.exports = { assertRuntimeConfig, getJwtSignOptions, getJwtVerifyOptions, isMissing }
