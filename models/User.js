const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        full_name: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        phone: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        gender: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        avatar_url: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        role: {
            type: DataTypes.TEXT,
            defaultValue: 'customer',
            allowNull: true
        },
        email: {
            type: DataTypes.TEXT,
            // allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        push_token: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return User;
};
