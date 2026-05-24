const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Zone = sequelize.define('Zone', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  coordinates: {
    type: DataTypes.JSON,
    allowNull: false
  },
  centerLat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  centerLng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  density: {
    type: DataTypes.ENUM('FAIBLE', 'MOYEN', 'ELEVE'),
    defaultValue: 'FAIBLE'
  },
  vehicleCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  averageSpeed: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'zones',
  timestamps: true
});

module.exports = Zone;
