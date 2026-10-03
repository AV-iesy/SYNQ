const path = require('path')
const crypto = require('crypto')
const fs = require('fs')
const mongoose = require('mongoose')

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local'), quiet: true })
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true })

const connectDB = require('../config/db')
const User = require('../models/User')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function credentials() {
  const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase()
  const name = process.env.SUPERADMIN_NAME?.trim() || 'SYNQ Superadmin'
  const outputPath = process.env.SUPERADMIN_CREDENTIALS_FILE?.trim()
  const suppliedPassword = process.env.SUPERADMIN_PASSWORD
  const password = suppliedPassword || (outputPath ? crypto.randomBytes(24).toString('base64url') : null)

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    throw new Error('SUPERADMIN_EMAIL must be a valid email address')
  }
  if (!password || Buffer.byteLength(password, 'utf8') < 16 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Set SUPERADMIN_PASSWORD to 16-72 bytes, or set SUPERADMIN_CREDENTIALS_FILE to generate one')
  }
  if (name.length > 100) throw new Error('SUPERADMIN_NAME must be at most 100 characters')

  return { email, name, password, outputPath, generated: !suppliedPassword }
}

async function provision() {
  const { email, name, password, outputPath, generated } = credentials()
  await connectDB()

  let user = await User.findOne({ email }).select('+password +tokenVersion')
  const created = !user

  if (!user) {
    user = new User({ email, name, password, role: 'superadmin' })
  } else {
    user.name = name
    user.password = password
    user.role = 'superadmin'
    user.tokenVersion = (user.tokenVersion || 0) + 1
  }

  await user.save()

  if (generated) {
    const resolved = path.resolve(outputPath)
    fs.writeFileSync(resolved, `SYNQ superadmin\nEmail: ${email}\nPassword: ${password}\n`, { mode: 0o600, flag: 'wx' })
    console.log(`Superadmin ${created ? 'created' : 'updated'}; one-time credentials written to ${resolved}`)
  } else {
    console.log(`Superadmin ${created ? 'created' : 'updated'} for ${email}`)
  }
}

provision()
  .catch(error => {
    console.error(`Provisioning failed: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.connection.close()
  })
