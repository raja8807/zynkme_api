require("pg");
require("pg-hstore");
const app = require("../server");
const { sequelize } = require("../models");


// Initialize database connection (only once for Vercel)
let dbInitialized = false;

const initializeDatabase = async () => {
  if (!dbInitialized) {
    try {
      await sequelize.authenticate();
      console.log("Database connected successfully.");
      dbInitialized = true;
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }
};

// Initialize on first request
app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

module.exports = app;

