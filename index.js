const TelegramBot = require('node-telegram-bot-api');
const XLSX = require('xlsx');
const fs = require('fs');

// استبدل 'YOUR_BOT_TOKEN_HERE' بالتوكن الخاص بالبوت الذي حصلت عليه من BotFather
const bot = new TelegramBot(7203035834:AAFsWjHtF2q3p-dGH_6mm9IykYqX4Erfrnc, { polling: true });

// تحميل البيانات من ملف Excel
let students = {};

// قراءة البيانات من ملف Excel
const workbook = XLSX.readFile('students_results.xlsx'); // تأكد من أن اسم الملف صحيح
const sheetName = workbook.SheetNames[0]; // الحصول على اسم أول ورقة عمل
const worksheet = workbook.Sheets[sheetName];

// تحويل البيانات إلى JSON
const data = XLSX.utils.sheet_to_json(worksheet);
data.forEach((row) => {
    const name = row['اسم الطالب'];
    const result = row['النتيجة'];
    if (name && result) {
        students[name.trim()] = result.trim();
    }
});

// الرد عند بدء المحادثة
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "مرحبًا! أدخل اسمك للحصول على نتيجتك.");
});

// الرد عند استقبال رسالة
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const name = msg.text.trim();

    if (name === '/start') return; // تجاهل أمر /start

    const result = students[name] || "عذرًا، لم أتمكن من العثور على اسمك.";
    bot.sendMessage(chatId, result);
});