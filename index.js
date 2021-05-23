const TelegramApi = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options')
const sequelize = require('./db');
const UserModel = require('./models');

const token = process.env.TOKEN //Insert in .env file token of your telegram chanel

const bot = new TelegramApi(token, { polling: true })

const chats = {}


const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Guess number from 0-9`);
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Guess', gameOptions);
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Failed to connect to db', e)
    }

    bot.setMyCommands([
        { command: '/start', description: 'Greeting' },
        { command: '/info', description: 'Info of user' },
        { command: '/game', description: 'Guess number game' },
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                await UserModel.create({ chatId })
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.webp')
                return bot.sendMessage(chatId, `Welcome to Telegram Bot`);
            }
            if (text === '/info') {
                const user = await UserModel.findOne({ chatId })
                return bot.sendMessage(chatId, `Your nickname is ${msg.from.first_name} ${msg.from.last_name}, correct answers: ${user.right}, wrong answers ${user.wrong}`);
            }
            if (text === '/game') {
                return startGame(chatId);
            }
            return bot.sendMessage(chatId, 'I cannot understand you try again!)');
        } catch (e) {
            return bot.sendMessage(chatId, `Server error`);
        }

    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
            return startGame(chatId)
        }
        const user = await UserModel.findOne({ chatId })
        if (data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Yeahhh you found number ${chats[chatId]}`, againOptions);
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `Unfortunately you guesed wrong, try again ${chats[chatId]}`, againOptions);
        }
        await user.save();
    })
}

start()
