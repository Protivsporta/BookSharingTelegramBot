const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'sharingbot',
    'Sasha',
    'CfIf187618',
    {
        host: '109.71.13.242',
        port: '6432',
        dialect: 'postgres'
    }
)