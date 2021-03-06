const TelegramApi = require('node-telegram-bot-api');
const { options } = require('nodemon/lib/config');

require('dotenv').config();

const sequelize = require('./db.js');
const OrderModel = require('./models.js');

const token = process.env.TOKEN_API;

const bot = new TelegramApi(token, {polling: true});

const startButtons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Поделиться книгой', callback_data: 'share'}],
            [{text: 'Взглянуть на все предложения', callback_data: 'lookup'}],
            [{text: 'Удалить мое предложение', callback_data: 'delete'}]
        ]
    })
}

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (error) {
        console.log('Подключение к БД умерло', error)
    }

    bot.setMyCommands([
        {command: '/start', description: 'Начать работу с ботом!'},
        {command: '/info', description: 'Получить информацию о работе с ботом!'}])
    
    bot.on('message', async msg => {
        console.log(msg)
        const text = msg.text;
        const chatId = msg.chat.id;
        const username = msg.chat.username;
        const caption = msg.caption;

        try {
            if(text === '/start') {
                const messages = await OrderModel.findAll();
                console.log(messages);
                return bot.sendMessage(chatId, 'Привет! Это бот для обмена книгами в Каше, выбери дальнейшее действие!', startButtons)
            }
        
            if(text === '/info') {
                bot.sendMessage(chatId, 'Это бот для обмена книгами между жителями Каша. Ты можешь загрузить фотографию книг, которыми готов поделиться на время. В ответ бот позволяет выбрать интересные тебе книги из уже существующих объявлений и связаться с их владельцем чтобы взять себе одну или несколько на время! По всем вопросам - @protivsporta');
                return bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/f65/1a8/f651a8b9-647b-3249-848c-152033492f63/192/5.webp');
            } 

            if(msg.photo) {
                const newItem = await OrderModel.create({
                    chatID: chatId,
                    messageId: msg.message_id,
                    username: msg.from.username,
                    photoId: msg.photo[0].file_id
                })
                return bot.sendMessage(chatId, "Принял фотографию книги! Отправь автора и название в формате 'Джэк Лондон - Мартен Иден'");
            }

            if(text.includes('-')) {
                const lastOrder = await OrderModel.findOne({ where: { chatID: chatId }, order: [['createdAt', 'DESC']]});
                await lastOrder.update({ messageText: text});
                bot.sendMessage(chatId, "Принял описание книги!");
                return bot.sendMessage(chatId, "Выбери дальнейшее действие!", startButtons);
            }

            if(isNumeric(text)) {
                let numberOfOrder = Number(text) - 1;
                const messages = await OrderModel.findAll({ where: { username: username }});
                const currentMessage = messages[numberOfOrder];
                if(currentMessage) {
                    await currentMessage.destroy();
                } else {
                    return bot.sendMessage(chatId, 'Введи существующий номер предложения!')
                }
                return bot.sendMessage(chatId, 'Предложение удалено!')
            }
            
            bot.sendMessage(chatId, "Бот тебя не понимает, попробуй воспользоваться меню команд!");
            return bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/45c/48e/45c48e77-b672-348e-a79a-bc4aae8a344a/192/5.webp');

        } catch (error) {
            return bot.sendMessage(chatId, 'Произошла ошибка логики чата!')
        }
    
    })

    // Ниже обработка колбэков
    
    bot.on('callback_query', async msg => {
        console.log(msg);
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const username = msg.message.chat.username;
        if(data === 'share') {
            return bot.sendMessage(chatId, "Отправь фотографию книги, которой хочешь поделиться!")
        }

        if(data === 'lookup') {
            const messages = await OrderModel.findAll();
            console.log(messages);
            const bookList = {
                reply_markup: {
                    inline_keyboard: []
                }
            }
            if(messages.length > 0) {
                for(let i = 0; i < messages.length; i++) {
                    if(messages[i].messageText) {
                        bookList.reply_markup.inline_keyboard.push([{ text: messages[i].messageText, callback_data: `${i} elementNumber` }]);
                    } else {
                        console.log("Ошибка логики списка книг");
                    }
                }
                bot.sendMessage(chatId, "Выбери книгу из списка!", bookList);
            } else {
                bot.sendMessage(chatId, 'Нет доступных предложений!');
            }
        }

        if(data === 'delete') {
            const messages = await OrderModel.findAll({ where: { username: username }});
            const listForDelete = {
                reply_markup: {
                    inline_keyboard: []
                }
            }
            if(messages.length > 0) {
                for(let i = 0; i < messages.length; i++) {
                    let j = i + 1;
                    await bot.sendPhoto(chatId, messages[i].photoId, {caption: `Предложение #${j}`});
                    listForDelete.reply_markup.inline_keyboard.push([{ text: String(j), callback_data: `${i} deleteItem` }]);
                }
                return bot.sendMessage(chatId, 'Выбери номер предложения, которое хочешь удалить!', listForDelete);

            } else {
                return bot.sendMessage(chatId, "У тебя нет доступных для удаления предложений!");
            }
        }

        if(data.includes('deleteItem')) {
            const numberOfElement = Number(data.charAt(0));
            const messages = await OrderModel.findAll({ where: { username: username }});
            const currentMessage = messages[numberOfElement];
            await currentMessage.destroy();
            bot.sendMessage(chatId, 'Предложение удалено!');
            return bot.sendMessage(chatId, "Выбери дальнейшее действие!", startButtons);

        }

        if(data.includes('elementNumber')) {
            const dataArray = data.split(' ')
            const numberOfElement = Number(dataArray[0]);
            const messages = await OrderModel.findAll();
            await bot.sendPhoto(chatId, messages[numberOfElement].photoId, {caption: `Владелец - @${messages[numberOfElement].username} \nНапиши владельцу чтобы забрать книжку!`});
            return bot.sendMessage(chatId, "Выбери дальнейшее действие!", startButtons);
        }
    })
}

start();

function isNumeric(value) {
    return /^-?\d+$/.test(value);
} 
