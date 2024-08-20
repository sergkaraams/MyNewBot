require('dotenv').config();

const {Bot, GrammyError, HttpError, Keyboard, InlineKeyboard} = require('grammy');

const {hydrate} = require('@grammyjs/hydrate');

const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate());

bot.api.setMyCommands ([
    {
        command: 'start', description: 'Запуск',
    },
    {
        command: 'say_hello', description: 'Приветствие',
    },
    {
        command: 'mood', description: 'Mood',
    },
    {
        command: 'share', description: 'Share',
    },
    {
        command: 'inline_keyboard', description: 'inlinekeyboard',
    }
])
// ID чата создателя (твой Telegram ID)
const creatorChatId = 6197836987;

bot.command('start', async (ctx) => {
    await ctx.reply('Привіт');
})

bot.command('mood', async (ctx) => {
    //const moodKeyboard = new Keyboard().text('good').row().text('bad').row().text('soso').resized().oneTime()
    const moodLabels = ['Good','Soso','Bad']
    const rows = moodLabels.map((label) => {
        return [
            Keyboard.text(label)
        ]
    })
    const moodKeyboard2 = Keyboard.from(rows).resized()
    await ctx.reply('How are you?', {
        reply_markup:moodKeyboard2
    })
})

bot.command('inline_keyboard', async (ctx) => {
    const inlineKeyboard = new InlineKeyboard()
        .text('1', 'button-1')
        .text('2', 'button-2')
        .text('3', 'button-3')
    await ctx.reply('number', {
        reply_markup: inlineKeyboard
    })
})



bot.callbackQuery(['button-1', 'button-2', 'button-3'], async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply('Your number');
})

bot.command('share', async (ctx) => {
    const shareKeyboard = new Keyboard().requestLocation('Geolocation').requestContact('Contact').requestPoll('Poll').resized()
    await ctx.reply('Why?', {
        reply_markup: shareKeyboard
    })
})

bot.command('say_hello', async (ctx) => {
    await ctx.reply('Hello');
})

bot.on('message', async (ctx) => {
    await ctx.reply('?');
    console.log(ctx.from);
    console.log(ctx.update.message.text);
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name;
    const username = ctx.from.username || 'username отсутствует';
    const userInfo = `
    Новое сообщение от пользователя:
    Имя: ${firstName}
    ID: ${userId}
    Username: @${username}
    `;
    await bot.api.sendMessage(creatorChatId, userInfo);
    await ctx.forwardMessage(creatorChatId);
})

bot.catch( (err) => {
    const ctx = err.ctx;
    console.error(`Error while handing update ${ctx.update.update_id}`);
    const e = err.error;

    if( e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
})

bot.start();
