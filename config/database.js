const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

// Check if DATABASE_URL is provided (recommended for production)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
      ssl:
        process.env.NODE_ENV === "production"
          ? {
            require: true,
            rejectUnauthorized: false,
          }
          : false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Fallback to individual parameters for local development
  sequelize = new Sequelize(
    process.env.DB_NAME || "postgres",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "password",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
  );
}

module.exports = sequelize;
