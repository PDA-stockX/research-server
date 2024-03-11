'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Analyst extends Model {
        static associate(models) {
            // define association here
            this.hasMany(models.Report, {
                as: 'reports',
                foreignKey: 'analystId',
                onDelete: 'CASCADE'
            });
            this.hasMany(models.Follow, {
                as: 'follows',
                foreignKey: 'analystId',
                onDelete: 'CASCADE'
            });
        }
    }

    Analyst.init({
        name: DataTypes.STRING,
        firm: DataTypes.STRING,
        returnRate: DataTypes.FLOAT,
        achievementRate: DataTypes.FLOAT,
        email: DataTypes.STRING,
        photoUrl: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Analyst',
    });
    return Analyst;
};