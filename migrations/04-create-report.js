'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Reports', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
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
                allowNull: true
            },
            firmId: {
                type: Sequelize.INTEGER,
                references: {
                    model: {
                        tableName: 'Firms',
                        key: 'id'
                    },
                    onDelete: 'CASCADE'
                },
                allowNull: true
            },
            title: {
                type: Sequelize.STRING
            },
            summary: {
                type: Sequelize.STRING(10000),
            },
            pdfUrl: {
                type: Sequelize.STRING
            },
            ticker: {
                type: Sequelize.STRING
            },
            stockName: {
                type: Sequelize.STRING
            },
            investmentOpinion: {
                type: Sequelize.STRING
            },
            postedAt: {
                type: Sequelize.DATE
            },
            refPrice: {
                type: Sequelize.INTEGER
            },
            targetPrice: {
                type: Sequelize.INTEGER
            },
            returnRate: {
                type: Sequelize.FLOAT
            },
            achievementScore: {
                type: Sequelize.INTEGER
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Reports');
    }
};