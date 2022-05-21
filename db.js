const {Sequelize} = require('sequelize');
require('dotenv').config();

module.exports = new Sequelize(
    'sharingbot',
    'Sasha',
    process.env.DB_PASSWORD,
    {
        host: '109.71.13.242',
        port: '6432',
        dialect: 'postgres'
    }
)