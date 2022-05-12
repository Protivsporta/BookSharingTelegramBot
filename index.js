const TelegramApi = require('node-telegram-bot-api');

const token = '5240333795:AAHVNuVL39AtP354tNpJ3ur1WfCujACX7Ck';

const bot = new TelegramApi(token, {polling: true});

const options = require('./options.js');

const botButtons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Поделиться книгами', callback_data: '1'}],
            [{text: 'Взглянуть на предложения', callback_data: '2'}],
            [{text: 'Изменить твои предложения', callback_data: '3'}]
        ]
    })
}



const start = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Начать работу с ботом!'},
        {command: '/info', description: 'Получить информацию о работе с ботом!'},
        {command: '/share', description: 'Поделиться с ботом книгами, которые хочешь зашерить!'}])
    
    bot.on('message', msg => {
        console.log(msg)
        const text = msg.text;
        const chatId = msg.chat.id;
    
        if(text === '/start') {
            return bot.sendMessage(chatId, 'Выбери дальнейшее действие!', botButtons)
        }
    
        if(text === '/info') {
            return bot.sendMessage(chatId, 'Для получения дополнительной информации нужно пукнуть в воду')
        } 
        
        return bot.sendMessage(chatId, "Бот тебя не понимает, попробуй воспользоваться меню команд")
    })

    bot.on('callback_query', msg => {
        console.log(msg);
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if(data === '1') {
            bot.sendMessage(chatId, "Отправь фото книг или список в текстовом формате")
        }
    })
}

start();

