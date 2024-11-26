const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const express = require('express');

// إعداد البوت باستخدام التوكن
const BOT_TOKEN = '7778626923:AAHhe0U3UTEtW2Kr9cRi_h0No0CB3w35i9k';
const bot = new Telegraf(BOT_TOKEN);

// إعداد خادم Express لتلقي Webhook
const app = express();
const PORT = process.env.PORT || 3000;

// إعداد Webhook مع عنوان التطبيق على Render
const WEBHOOK_URL = `https://stboot-1.onrender.com/bot${BOT_TOKEN}`;
bot.telegram.setWebhook(WEBHOOK_URL);
app.use(bot.webhookCallback(`/bot${BOT_TOKEN}`));

// دالة لمعالجة رفع الملفات
bot.on('document', async (ctx) => {
    try {
        // الحصول على بيانات الملف المرفق
        const fileId = ctx.message.document.file_id;
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const fileName = ctx.message.document.file_name;

        // تنزيل الملف إلى المجلد المحلي
        const response = await axios.get(fileLink.href, { responseType: 'stream' });
        const filePath = `./${fileName}`;
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            // رفع الملف إلى GitHub
            const githubRepo = 'https://github.com/1900mr/stboot'; // اسم المستودع
            const githubToken = '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'; // التوكن الخاص بـ GitHub

            // رفع الملف باستخدام API
            await axios.put(
                `https://api.github.com/repos/${githubRepo}/contents/${fileName}`,
                {
                    message: `Upload ${fileName}`,
                    content: fs.readFileSync(filePath).toString('base64'), // تحويل الملف إلى Base64
                },
                {
                    headers: {
                        Authorization: `token ${githubToken}`, // المصادقة باستخدام التوكن
                    },
                }
            );

            ctx.reply('تم رفع الملف بنجاح إلى GitHub!');
            fs.unlinkSync(filePath); // حذف الملف من الجهاز المحلي
        });

        writer.on('error', (err) => {
            console.error(err);
            ctx.reply('حدث خطأ أثناء تنزيل الملف.');
        });
    } catch (error) {
        console.error(error);
        ctx.reply('حدث خطأ أثناء معالجة الملف.');
    }
});

// بدء الخادم على المنفذ المحدد
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
