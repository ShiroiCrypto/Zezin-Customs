const dc = require("discord.js");
const client = require("../../index.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const corRoxa = parseInt('1672cc', 16);
let shiroi = [];

client.on("interactionCreate", async (int) => {
    const logs = await db.get(`canallogid_${int.guild.id}`);
    const id = await db.get(`user_id_${int.user.id}_${int.guild.id}`);

    if (!int.isButton()) return;

    const canalLogs = client.channels.cache.get(`${logs}`);
    if (!canalLogs) return console.error("O canal de logs não foi encontrado.");

    if (int.customId === "btE") {
        if (shiroi.includes(int.user.id)) {
            const reply = new dc.EmbedBuilder()
                .setDescription(`Você já possui um ponto **ABERTO**.`)
                .setColor(corRoxa);
            return await int.reply({ embeds: [reply], ephemeral: true });
        }

        shiroi.push(int.user.id);
        const startTime = new Date();

        await db.set(`startTime_${int.user.id}`, startTime.toISOString());

        const reply = new dc.EmbedBuilder()
            .setDescription(`${int.user} Seu ponto foi **INICIADO** com sucesso.`)
            .setColor(corRoxa);
        await int.reply({ embeds: [reply], ephemeral: true });

        const embed = new dc.EmbedBuilder()
            .setTitle(`**NOVO PONTO INICIADO**\n\n_INFORMAÇÕES ABAIXO:_`)
            .setThumbnail(int.user.displayAvatarURL({ dynamic: true, size: 2048, format: 'png' }))
            .setDescription(`Horário de entrada: ${startTime.toLocaleString('pt-BR')}\nMembro: **<@${int.user.id}> ID: (${id})**`)
            .setColor(corRoxa)
            .setFooter({
                iconURL: int.guild.iconURL({ dynamic: true }),
                text: `Copyright © | ShiroiCrypto.`
            })
            .setTimestamp();

        canalLogs.send({ embeds: [embed] });
    }

    if (int.customId === "btS") {
        if (!shiroi.includes(int.user.id)) {
            const reply = new dc.EmbedBuilder()
                .setDescription(`Você não possui ponto **ABERTO**.`)
                .setColor(corRoxa);
            return await int.reply({ embeds: [reply], ephemeral: true });
        }

        shiroi = shiroi.filter((el) => el !== int.user.id);
        const endTime = new Date();
        const startTimeISO = await db.get(`startTime_${int.user.id}`);
        const startTime = new Date(startTimeISO);
        const durationMs = endTime - startTime;
        const duration = new Date(durationMs).toISOString().substr(11, 8); // HH:MM:SS

        const reply = new dc.EmbedBuilder()
            .setDescription(`${int.user} Seu ponto foi **FINALIZADO** com sucesso.\n## Horas Totais: \n\`\`\`ansi\n[31;1m${duration}[0m\`\`\``)
            .setColor(corRoxa);
        await int.reply({ embeds: [reply], ephemeral: true });

        const embed = new dc.EmbedBuilder()
            .setTitle(`**PONTO FINALIZADO**\n\n_INFORMAÇÕES ABAIXO:_`)
            .setThumbnail(int.user.displayAvatarURL({ dynamic: true, size: 2048, format: 'png' }))
            .setDescription(`Horário de saída: ${endTime.toLocaleString('pt-BR')}\nMembro: **<@${int.user.id}> ID: (${id})**\n## **Horas Totais:** \n\`\`\`ansi\n[31;1m${duration}[0m\`\`\``)
            .setColor(corRoxa)
            .setFooter({
                iconURL: int.guild.iconURL({ dynamic: true }),
                text: `Copyright © | ShiroiCrypto.`
            })
            .setTimestamp();

        canalLogs.send({ embeds: [embed] });
        int.user.send({ embeds: [embed] });
    }
});
