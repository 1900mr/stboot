// استيراد المكتبات المطلوبة
const TelegramBot = require('node-telegram-bot-api');
const ExcelJS = require('exceljs');  // استيراد مكتبة exceljs
require('dotenv').config();  // إذا كنت تستخدم متغيرات بيئية
const express = require('express');  // إضافة Express لتشغيل السيرفر

// إعداد سيرفر Express (لتشغيل التطبيق على Render أو في بيئة محلية)
const app = express();

// تحديد المنفذ باستخدام متغير البيئة PORT
const port = process.env.PORT || 4000;  // إذا لم يكن هناك PORT في البيئة، سيعمل على 4000

// استبدل 'YOUR_BOT_TOKEN_HERE' بالتوكن الخاص بالبوت
const token = '7203035834:AAFsWjHtF2q3p-dGH_6mm9IykYqX4Erfrnc'; || 'YOUR_BOT_TOKEN_HERE';  // استخدام المتغير البيئي للتوكن

// إنشاء البوت مع التفعيل
const bot = new TelegramBot(token, { polling: true });

// تحميل البيانات من ملف Excel
let students = {};

// قراءة البيانات من ملف Excel باستخدام exceljs
async function loadDataFromExcel() {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile('students_results.xlsx');  // تأكد من أن اسم الملف صحيح
        const worksheet = workbook.worksheets[0];  // الحصول على أول ورقة عمل
        
        worksheet.eachRow((row, rowNumber) => {
            const name = row.getCell(1).value;  // أول عمود يحتوي على اسم الطالب
            const result = row.getCell(2).value;  // ثاني عمود يحتوي على النتيجة
            if (name && result) {
                students[name.trim()] = result.trim();
            }
        });

        console.log('تم تحميل البيانات بنجاح.');
    } catch (error) {
        console.error('حدث خطأ أثناء قراءة ملف Excel:', error.message);
    }
}

// تحميل البيانات عند بدء التشغيل
loadDataFromExcel();

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

// بدء السيرفر
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
