const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const corAzul = parseInt('1672cc', 16);

module.exports = {
    name: "advertir",
    description: "Aplica uma advertência a um membro.",
    type: 1,
    options: [
        {
            name: "usuário",
            description: "Usuário que será advertido.",
            type: Discord.ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "motivo",
            description: "Motivo da advertência.",
            type: Discord.ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (client, interaction) => {
        // Verifica se o usuário tem permissão pelo cargo específico
        const requiredRoleId = await db.get(`cargo_advertencia_${interaction.guild.id}`);
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({
                content: `❌ Você não tem permissão para usar este comando. É necessário ter o cargo específico.`,
                ephemeral: true
            });
        }

        const user = interaction.options.getUser ("usuário");
        const motivo = interaction.options.getString("motivo");

        if (user.id === interaction.user.id) {
            return interaction.reply({ content: "❌ Você não pode advertir a si mesmo.", ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const logChannelId = await db.get(`log_advertencia_${guildId}`);
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        let advertCount = await db.get(`advertencias_${guildId}_${user.id}`) || 0;
        advertCount++;

        await db.set(`advertencias_${guildId}_${user.id}`, advertCount);

        const embedDM = new Discord.EmbedBuilder()
            .setColor("Yellow")
            .setTitle("⚠️ Advertência Recebida")
            .setDescription(`Você recebeu uma advertência no servidor **${interaction.guild.name}**.`)
            .addFields(
                { name: "👮 Punição aplicada por", value: `${interaction.user.tag}`, inline: true },
                { name: "📄 Motivo", value: motivo, inline: true },
                { name: "📌 Total de Advertências", value: `\`${advertCount}/3\``, inline: true }
            )
            .setTimestamp();

        try {
            await user.send({ embeds: [embedDM] });
        } catch (e) {
            console.error(`Erro ao enviar DM para ${user.tag}:`, e);
            if (logChannel) {
                logChannel.send({
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor("DarkRed")
                            .setTitle("❗ DM não enviada")
                            .setDescription(`Não consegui enviar DM para <@${user.id}>. DMs desativadas ou bloqueadas.`)
                            .setTimestamp()
                    ]
                });
            }
        }

        // Envia para o canal de logs (se estiver configurado)
        if (logChannel) {
            const logEmbed = new Discord.EmbedBuilder()
                .setColor("Orange")
                .setTitle("📋 Nova Advertência")
                .addFields(
                    { name: "👤 Usuário", value: `${user.tag} (${user.id})` },
                    { name: "🛠️ Aplicada por", value: `${interaction.user.tag}` },
                    { name: "📄 Motivo", value: motivo },
                    { name: "📌 Total de Advertências", value: `\`${advertCount}/3\`` }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }

        // Demissão manual caso tenha 3 advertências
        if (advertCount >= 3) {
            await db.delete(`advertencias_${guildId}_${user.id}`);

            if (logChannel) {
                const demissaoEmbed = new Discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle("🚨 3ª Advertência Recebida")
                    .setDescription(`O usuário <@${user.id}> atingiu o limite de 3 advertências.\n\n` +
                        `⚠️ A demissão deverá ser feita manualmente pela equipe responsável.`)
                    .setTimestamp();

                await logChannel.send({ embeds: [demissaoEmbed] });
            }
        }

        return interaction.reply({
            content: `✅ Advertência aplicada com sucesso ao usuário ${user}. Total de advertências: \`${advertCount}/3\`.`,
            ephemeral: true
        });
    }
};