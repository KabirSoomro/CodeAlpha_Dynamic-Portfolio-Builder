// ============================================================
// db.js — MongoDB Atlas Connection Module
// I am isolating the database connection logic here so that
// server.js stays clean and this module can be reused or
// swapped without touching any other file in the project.
// ============================================================

const mongoose = require('mongoose');

/**
 * I am exporting a single async function that establishes the
 * MongoDB Atlas connection. I call this once at server startup
 * inside server.js to avoid multiple open connections.
 *
 * @param {string} mongoURI — The Atlas connection string from .env
 */
const connectDB = async (mongoURI) => {
  try {
    // I am passing these options to suppress deprecation warnings
    // and to ensure the driver uses the latest connection engine.
    const conn = await mongoose.connect(mongoURI);

    // I log the host so I can visually confirm in the terminal
    // which Atlas cluster we are actually connected to.
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    // I log the full error then exit the process with code 1.
    // A non-zero exit code signals Render that the server crashed
    // so it can restart automatically instead of hanging silently.
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
