const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize);

// db.User.hasMany(db.Address, { foreignKey: 'user_id' });
// db.Address.belongsTo(db.User, { foreignKey: 'user_id' });


module.exports = db;
