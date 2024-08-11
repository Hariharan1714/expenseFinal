// models/passwordResetRequest.js

const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');
const User = require('./users');

const PasswordResetRequest = sequelize.define('passwordResetRequest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

User.hasMany(PasswordResetRequest, { foreignKey: 'userId' });
PasswordResetRequest.belongsTo(User, { foreignKey: 'userId' });

module.exports = PasswordResetRequest;
