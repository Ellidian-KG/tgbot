const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const bot = new Telegraf("7155212018:AAGo-oJNsZwZWJjP2hLo9F6x0PFL_8s7nSU");


let allVacancies = []; 
let currentVacancies = []; 

async function parseVacancies(searchTerm, chatId) {
    const url =`https://api.hh.ru/vacancies?text=${searchTerm}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        allVacancies = data.items; 

        currentVacancies = allVacancies.slice(0, 5); 
        const message = getVacanciesMessage(currentVacancies);

        bot.telegram.sendMessage(chatId, message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Еще вакансии', callback_data: 'more_vacancies' }],
                    [{ text: 'Другая профессия', callback_data: 'other_profession' }]
                ]
            }
        });
    } catch (error) {
        bot.telegram.sendMessage(chatId, 'Ошибка при выполнении запроса');
    }
}

function getVacanciesMessage(vacancies) {
    let message = '';
    vacancies.forEach((vacancy, index) => {
        message +=` Вакансия ${index + 1}:\n${vacancy.name}\nТребования: ${vacancy.snippet.requirement}\nЗарплата: ${vacancy.salary ? vacancy.salary.from : 'Не указана'}\n\n`;
    });
    return message;
}



bot.action('other_profession', ctx => {
    allVacancies = [];
    currentVacancies = [];
    ctx.reply('Введите другую профессию, чтобы найти вакансии:');
});

bot.command('start', ctx => {
    const chatId = ctx.chat.id;
    ctx.reply('Привет! Введите профессию, чтобы найти вакансии:');
});

bot.on('text', ctx => {
    const chatId = ctx.chat.id;
    const searchTerm = ctx.message.text;

    parseVacancies(searchTerm, chatId);
});
bot.action('more_vacancies', ctx => {
    currentVacancies = allVacancies.slice(currentVacancies.length, currentVacancies.length + 5);
    const message = getVacanciesMessage(currentVacancies);

    if (ctx.update.message && message !== ctx.update.message.text) {
        ctx.editMessageText(message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Еще вакансии', callback_data: 'more_vacancies' }],
                    [{ text: 'Другая профессия', callback_data: 'other_profession' }]
                ]
            }
        });
    }
});

bot.launch();
