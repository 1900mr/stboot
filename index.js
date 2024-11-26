const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// أدخل التوكن الخاص بالبوت
const bot = new Telegraf('7778626923:AAHhe0U3UTEtW2Kr9cRi_h0No0CB3w35i9k');

// دالة لمعالجة رفع الملف
bot.on('document', async (ctx) => {
    try {
        const fileId = ctx.message.document.file_id;
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const fileName = ctx.message.document.file_name;

        // تحميل الملف
        const response = await axios.get(fileLink.href, { responseType: 'stream' });
        const filePath = `./${fileName}`;
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', async () => {
            // رفع الملف إلى GitHub
            const githubRepo = 'YOUR_GITHUB_USERNAME/REPO_NAME';
            const githubToken = 'YOUR_GITHUB_TOKEN';

            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            await axios.put(`https://api.github.com/repos/${githubRepo}/contents/${fileName}`, {
                message: `Upload ${fileName}`,
                content: fs.readFileSync(filePath).toString('base64'),
            }, {
                headers: {
                    Authorization: `token ${githubToken}`,
                },
            });

            ctx.reply('تم رفع الملف بنجاح إلى GitHub!');
            fs.unlinkSync(filePath); // حذف الملف المحلي
        });

        writer.on('error', (err) => {
            console.error(err);
            ctx.reply('حدث خطأ أثناء رفع الملف.');
        });
    } catch (error) {
        console.error(error);
        ctx.reply('حدث خطأ!');
    }
});

// بدء تشغيل البوت
bot.launch();