const dc = require("discord.js");
const client = require("../../index.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const corRoxa = parseInt('1672cc', 16);
const moment = require('moment');

client.on("interactionCreate", async (int) => {
    const logs = await db.get(`canallogid_${int.guild.id}`);
    const id = await db.get(`user_id_${int.user.id}_${int.guild.id}`);

    if (!int.isButton()) return;

    const canalLogs = client.channels.cache.get(`${logs}`);
    if (!canalLogs) {
        return await int.reply({ content: "❌ O canal de logs não foi encontrado.", ephemeral: true });
    }

    if (int.customId === "btE") {
        const pontoAberto = await db.get(`ponto_aberto_${int.user.id}_${int.guild.id}`);
        if (pontoAberto) {
            const reply = new dc.EmbedBuilder()
                .setDescription(`Você já possui um ponto **ABERTO**.`)
                .setColor(corRoxa);
            return await int.reply({ embeds: [reply], flags: 64 }); // Resposta efêmera
        }

        const startTime = new Date();
        await db.set(`startTime_${int.user.id}`, startTime.toISOString());
        await db.set(`ponto_aberto_${int.user.id}_${int.guild.id}`, true); // Marca o ponto como aberto

        const reply = new dc.EmbedBuilder()
            .setDescription(`${int.user} Seu ponto foi **INICIADO** com sucesso.`)
            .setColor(corRoxa);
        await int.reply({ embeds: [reply], flags: 64 }); // Resposta efêmera

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
        const pontoAberto = await db.get(`ponto_aberto_${int.user.id}_${int.guild.id}`);
        if (!pontoAberto) {
            const reply = new dc.EmbedBuilder()
                .setDescription(`Você não possui ponto **ABERTO**.`)
                .setColor(corRoxa);
            return await int.reply({ embeds: [reply], flags: 64 }); // Resposta efêmera
        }

        await db.set(`ponto_aberto_${ int.user.id}_${int.guild.id}`, false); // Marca o ponto como fechado
        const endTime = new Date();
        const startTimeISO = await db.get(`startTime_${int.user.id}`);
        const startTime = new Date(startTimeISO);
        const durationMs = endTime - startTime;
        const elapsedTime = Math.floor(durationMs / 1000); // Convertendo milissegundos para segundos
        const duration = new Date(durationMs).toISOString().substr(11, 8); // HH:MM:SS

        // Salvar o ponto no histórico
        const data = moment().format("DD/MM/YYYY");
        const historicoKey = `historico_pontos_${id}`;
        let historico = await db.get(historicoKey) || [];

        historico.push({
            data,
            duracaoSegundos: elapsedTime // Usando elapsedTime aqui
        });

        await db.set(historicoKey, historico);

        const reply = new dc.EmbedBuilder()
            .setDescription(`${int.user} Seu ponto foi **FINALIZADO** com sucesso.\n## Horas Totais: \n\`\`\`ansi\n[31;1m${duration}[0m\`\`\``)
            .setColor(corRoxa);
        await int.reply({ embeds: [reply], flags: 64 }); // Resposta efêmera

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

        // Verifica se o usuário pode receber mensagens diretas
        const user = await client.users.fetch(int.user.id);
        if (user.dmChannel) {
            user.send({ embeds: [embed] }).catch(err => console.error("Não foi possível enviar mensagem direta ao usuário:", err));
        }
    }
});
