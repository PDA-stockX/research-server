'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Follows', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'Users',
                        key: 'id'
                    },
                    onDelete: 'CASCADE'
                },
                allowNull: false
            },
            analystId: {
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'Analysts',
                        key: 'id'
                    },
                    onDelete: 'CASCADE'
                },
                allowNull: false
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Follows');
    }
};