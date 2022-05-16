const sequelize = require('./db.js');
const {DataTypes} = require('sequelize');

const OrderMainList = sequelize.define('OrderMainList', {
    id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    chatID: {type: DataTypes.INTEGER},
    messageText: {type: DataTypes.STRING},
    messageId: {type: DataTypes.INTEGER},
    username: {type: DataTypes.STRING},
    photoId: {type: DataTypes.STRING}
})

module.exports = OrderMainList;