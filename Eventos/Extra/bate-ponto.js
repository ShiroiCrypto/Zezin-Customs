const dc = require("discord.js");
const moment = require("moment");
const client = require("../../index.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const corRoxa = parseInt('800080', 16);
let array = [];
let shiroi = [];
let intervalId;
let elapsedTime; // Mova a declaração da variável elapsedTime para um escopo mais amplo

client.on("interactionCreate", async (int) => {
 const logs = await db.get(`canallogid_${int.guild.id}`);

    if (!int.isButton()) return;
    if (int.customId === "btE") {
        if (shiroi.includes(int.user.id)) {
            const reply3 = new dc.EmbedBuilder()
                .setDescription(` Você já possui um ponto **ABERTO.**  `)
                .setColor(corRoxa);
            const canalLogs = client.channels.cache.get(`${logs}`);
            if (!canalLogs) return console.error("O canal de logs não foi encontrado.");
            return await int.reply({ embeds: [reply3], ephemeral: true })
        };

        shiroi.push(int.user.id)

        let startTime = int.createdTimestamp;
        elapsedTime = 0; // Inicialize a variável elapsedTime aqui
        intervalId = setInterval(() => {
            elapsedTime++;
        }, 1000);

        const reply1 = new dc.EmbedBuilder()
            .setDescription(` ${int.user} Seu ponto foi **INICIADO** com sucesso.`)
            .setColor(corRoxa);

        int.reply({ embeds: [reply1], ephemeral: true });

        let array = [int.user.id];

        if (int.user.customId == "entrar") {
            array.push(int.user);
        } else if (int.user.customId == "sair") {
            array = array.filter(user => user.id != int.user.id);
        }

        const canalLogs = client.channels.cache.get(`${logs}`);
        if (!canalLogs) return console.error("O canal de logs não foi encontrado2.");

        const tempo1 = `<t:${moment(startTime / 1000).unix()}>`;

        const embedE = new dc.EmbedBuilder()
            .setTitle(` **NOVO PONTO INICIADO**\n\n_ INFORMAÇOES ABAIXO:_`)
            .setThumbnail(int.user.displayAvatarURL({ dynamic: true, size: 2048, format: 'png' }))
            .setDescription(` Horário de entrada: ${tempo1}\n Membro: **${int.user.username} (${int.user.id})**`)
            .setColor(corRoxa)
            .setFooter({
                iconURL: int.guild.iconURL({ dynamic: true }),
                text: `Copyright © | ShiroiCrypto.`
            })
            .setTimestamp();

        canalLogs.send({ embeds: [embedE] });

    }

    if (int.customId === "btS") {

        clearInterval(intervalId);
        let endTime = int.createdTimestamp;
        let startTime = int.createdTimestamp;
        let duration = moment.duration(elapsedTime, "seconds");
        let formattedDuration = `${Math.floor(duration.asHours())}h ${duration.minutes()}m ${duration.seconds()}s`;

        if (!shiroi.includes(int.user.id)) {
            const reply3 = new dc.EmbedBuilder()
                .setDescription(`  | Você não possui ponto **ABERTO.**`)
                .setColor(corRoxa);
            const canalLogs = client.channels.cache.get(`${logs}`);
            if (!canalLogs) return console.error("O canal de logs não foi encontrado.");
            return await int.reply({ embeds: [reply3], ephemeral: true });
        }

        shiroi = shiroi.filter((el) => {
            return el != int.user.id;
        });

        const tempo2 = `<t:${moment(endTime / 1000).unix()}>`;
        const canalLogs = client.channels.cache.get(`${logs}`);
        if (!canalLogs) return console.error("O canal de logs não foi encontrado.");

        const reply2 = new dc.EmbedBuilder()
            .setDescription(` ${int.user} Seu ponto foi **FINALIZADO** com sucesso.\n## Horas Totais: \n\`\`\`ansi\n[31;1m${formattedDuration}[0m\`\`\``)
            .setColor(corRoxa);

        int.reply({ embeds: [reply2], ephemeral: true });

        const user = int.user

        let id = await db.get(`user_id_${int.user.id}_${int.guild.id}`);

        const embedS = new dc.EmbedBuilder()
            .setTitle(` **PONTO FINALIZADO**\n\n_INFORMAÇOES ABAIXO:_`)
            .setThumbnail(int.user.displayAvatarURL({ dynamic: true, size: 2048, format: 'png' }))
            .setDescription(` Horário de saída: ${tempo2}\n Membro: **<@${int.user.id}> ID: (${id})**\n## **Horas Totais:** \n\`\`\`ansi\n[31;1m${formattedDuration}[0m\`\`\``)
            .setColor(corRoxa)
            .setFooter({
                iconURL: int.guild.iconURL({ dynamic: true }),
                text: `Copyright © | ShiroiCrypto.`
            })
            .setTimestamp();
        canalLogs.send({ embeds: [embedS] });
        user.send({ embeds: [embedS] })
    }
});
