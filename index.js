const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const express = require('express');

// إعداد البوت باستخدام التوكن
const BOT_TOKEN = '7778626923:AAHhe0U3UTEtW2Kr9cRi_h0No0CB3w35i9k';
const bot = new Telegraf(BOT_TOKEN);

// إعداد خادم Express لتلقي Webhook
const app = express();
const PORT = process.env.PORT || 3000;

// إعداد Webhook مع عنوان التطبيق على Render
const WEBHOOK_URL = `https://stboot-1.onrender.com/bot${BOT_TOKEN}`;
bot.telegram.setWebhook(WEBHOOK_URL).then(() => {
    console.log('Webhook set successfully:', WEBHOOK_URL);
}).catch((error) => {
    console.error('Error setting webhook:', error);
});
app.use(bot.webhookCallback(`/bot${BOT_TOKEN}`));

// إرسال زر لتحميل الملف
bot.start((ctx) => {
    ctx.reply('مرحباً! لإرسال ملف Excel، اضغط على الزر أدناه:', {
        reply_markup: {
            keyboard: [
                [{ text: 'رفع ملف Excel' }]
            ],
            one_time_keyboard: true,
            resize_keyboard: true
        }
    });
});

// دالة لمعالجة رفع الملفات
bot.on('document', async (ctx) => {
    try {
        console.log('File upload initiated.');

        // الحصول على بيانات الملف المرفق
        const fileId = ctx.message.document.file_id;
        const fileName = ctx.message.document.file_name;
        console.log(`File ID: ${fileId}, File Name: ${fileName}`);

        // الحصول على رابط الملف
        const fileLink = await ctx.telegram.getFileLink(fileId);
        console.log('File link obtained:', fileLink.href);

        // تنزيل الملف إلى المجلد المحلي
        const filePath = `./${fileName}`;
        const response = await axios.get(fileLink.href, { responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            console.log('File download complete:', filePath);

            // التأكد من أن الملف موجود في المسار المحدد
            if (fs.existsSync(filePath)) {
                console.log('File exists in the local directory.');

                // رفع الملف إلى GitHub
                const githubRepo = '1900mr/stboot'; // اسم المستودع
                const githubToken = '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'; // التوكن الخاص بـ GitHub

                try {
                    const githubResponse = await axios.put(
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
                    console.log('GitHub response:', githubResponse.data);
                    ctx.reply('تم رفع الملف بنجاح إلى GitHub!');
                } catch (error) {
                    console.error('Error uploading to GitHub:', error.response?.data || error);
                    ctx.reply('حدث خطأ أثناء رفع الملف إلى GitHub.');
                }

                // حذف الملف من الجهاز المحلي
                fs.unlinkSync(filePath);
                console.log('File deleted locally.');
            } else {
                ctx.reply('لم يتم العثور على الملف في المسار المحدد.');
                console.error('File does not exist locally:', filePath);
            }
        });

        writer.on('error', (err) => {
            console.error('Error during file download:', err);
            ctx.reply('حدث خطأ أثناء تنزيل الملف.');
        });
    } catch (error) {
        console.error('Error handling file upload:', error.response?.data || error);
        ctx.reply('حدث خطأ أثناء معالجة الملف.');
    }
});

// بدء الخادم على المنفذ المحدد
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
