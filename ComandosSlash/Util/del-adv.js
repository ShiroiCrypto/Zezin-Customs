const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: "remover-advertencia",
    description: "Remove uma advertência de um usuário.",
    type: 1,
    options: [
        {
            name: "usuario",
            description: "Usuário que terá a advertência removida.",
            type: Discord.ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "quantidade",
            description: "Quantidade de advertências a remover (padrão 1).",
            type: Discord.ApplicationCommandOptionType.Integer,
            required: false
        }
    ],
    run: async (client, interaction) => {
        const requiredRoleId = await db.get(`cargo_advertencia_${interaction.guild.id}`);
        if (!interaction.member.roles.cache.has(requiredRoleId)) {
            return interaction.reply({
                content: `❌ Você não tem permissão para usar este comando. É necessário ter o cargo específico.`,
                ephemeral: true
            });
        }

        const user = interaction.options.getUser("usuario");
        let quantidade = interaction.options.getInteger("quantidade") || 1;

        const guildId = interaction.guild.id;
        let advertCount = await db.get(`advertencias_${guildId}_${user.id}`) || 0;

        if (advertCount === 0) {
            return interaction.reply({
                content: `❌ O usuário ${user.tag} não possui advertências.`,
                ephemeral: true
            });
        }

        advertCount -= quantidade;
        if (advertCount < 0) advertCount = 0;

        await db.set(`advertencias_${guildId}_${user.id}`, advertCount);

        const logChannelId = await db.get(`log_advertencia_${guildId}`);
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        if (logChannel && logChannel.viewable && logChannel.permissionsFor(interaction.guild.members.me).has("SendMessages")) {
            const embedLog = new Discord.EmbedBuilder()
            .setColor("#FFD700") // Amarelo dourado elegante
            .setTitle("🗑️ Advertência Removida")
            .setThumbnail(user.displayAvatarURL({ dynamic: true })) // Foto do usuário para personalizar
            .addFields(
                { name: "👤 Usuário", value: `> ${user.tag} \`(${user.id})\``, inline: false },
                { name: "🛠️ Removida por", value: `> ${interaction.user.tag}`, inline: true },
                { name: "📌 Advertências restantes", value: `> ${advertCount}`, inline: true }
            )
            .setFooter({ text: "Sistema de Advertências | Zezin Customs", iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

            await logChannel.send({ embeds: [embedLog] });
        }

        return interaction.reply({
            content: `✅ Removidas ${quantidade} advertência(s) do usuário ${user.tag}. Atualmente com ${advertCount} advertência(s).`,
            ephemeral: true
        });
    }
};