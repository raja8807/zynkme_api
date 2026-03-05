const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SubAdmin = sequelize.define('SubAdmin', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        auth_user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'auth.users',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        email: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        phone: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.TEXT,
            defaultValue: 'Active',
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true
        }
    }, {
        tableName: 'sub_admins',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return SubAdmin;
};
