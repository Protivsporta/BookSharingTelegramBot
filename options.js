module.exports = {
     botButtons: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Поделиться книгами', callback_data: '1'}],
                [{text: 'Взглянуть на предложения', callback_data: '2'}],
                [{text: 'Изменить твои предложения', callback_data: '3'}]
            ]
        })
    }
}