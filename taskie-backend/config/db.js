const mongoose = require('mongoose')

mongoose.set('sanitizeFilter', true)
mongoose.set('strictQuery', true)

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    throw error
  }
}

module.exports = connectDB
