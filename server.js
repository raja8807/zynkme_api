const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize } = require("./models");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", require("./routes"));

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Zynkme API" });
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "healthy", database: "connected" });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "unhealthy",
        database: "disconnected",
        error: error.message,
      });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error Handling Middleware
app.use(require("./middleware/errorHandler"));

// Database Connection and Server Startup
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Sync models (optional: set force to true to drop tables and recreate)
    // await sequelize.sync();

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("Server closed");
        sequelize.close();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

// Only start server if not being imported as a module
if (require.main === module) {
  startServer();
}

module.exports = app;

