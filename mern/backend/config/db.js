const mongoose = require('mongoose');
const { MONGO_URI } = require('../utils/config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI)

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

module.exports = connectDB
