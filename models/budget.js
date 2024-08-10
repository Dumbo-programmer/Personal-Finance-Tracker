const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Category = require('./category');

const Budget = sequelize.define('Budget', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id',
    },
  },
  limit: {
    type: DataTypes.REAL,
    allowNull: false,
  },
  period: {
    type: DataTypes.ENUM('monthly', 'yearly'),
    allowNull: false,
  },
}, {
  timestamps: false,
});

module.exports = Budget;
