// استيراد المكتبات المطلوبة
const TelegramBot = require('node-telegram-bot-api');
const XLSX = require('xlsx');
require('dotenv').config(); // إذا كنت تستخدم متغيرات بيئية
const express = require('express');  // إضافة Express لتشغيل السيرفر

// استبدل 'YOUR_BOT_TOKEN_HERE' بالتوكن الخاص بالبوت
const token = '7203035834:AAFsWjHtF2q3p-dGH_6mm9IykYqX4Erfrnc';

// إنشاء البوت مع التفعيل
const bot = new TelegramBot(token, { polling: true });

// تحميل البيانات من ملف Excel
let students = {};

// قراءة البيانات من ملف Excel
try {
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
    console.log('تم تحميل البيانات بنجاح.');
} catch (error) {
    console.error('حدث خطأ أثناء قراءة ملف Excel:', error.message);
}

// الرد عند بدء المحادثة
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "مرحبًا! أدخل اسمك للحصول على نتيجتك.");
});

// الرد عند استقبال رسالة
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const name = msg.text.trim();

    if (name === '/start') return; // تجاهل أمر /start

    const result = students[name];
    if (result) {
        bot.sendMessage(chatId, `النتيجة الخاصة بـ ${name}: ${result}`);
    } else {
        bot.sendMessage(chatId, "عذرًا، لم أتمكن من العثور على اسمك.");
    }
});

// إعداد سيرفر Express (لتشغيل التطبيق على Render أو في بيئة محلية)
const app = express();

// تحديد المنفذ باستخدام متغير البيئة PORT
const express = require('express')
const app = express()
const port = process.env.PORT || 4000;  // إذا لم يكن هناك PORT في البيئة، سيعمل على 3000 محليًا

// بدء السيرفر
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
