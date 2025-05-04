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
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({
                content: "⛔ Você não tem permissão para remover advertências.",
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

        const logChannelId = await db.get(`canal_advertencia_${guildId}`);
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        if (logChannel && logChannel.viewable && logChannel.permissionsFor(interaction.guild.members.me).has("SendMessages")) {
            const embedLog = new Discord.EmbedBuilder()
                .setColor("Yellow")
                .setTitle("🗑️ Advertência Removida")
                .addFields(
                    { name: "👤 Usuário", value: `${user.tag} (${user.id})`, inline: true },
                    { name: "🛠️ Removida por", value: `${interaction.user.tag}`, inline: true },
                    { name: "📌 Advertências restantes", value: `${advertCount}`, inline: true }
                )
                .setTimestamp();

            await logChannel.send({ embeds: [embedLog] });
        }

        return interaction.reply({
            content: `✅ Removidas ${quantidade} advertência(s) do usuário ${user.tag}. Atualmente com ${advertCount} advertência(s).`,
            ephemeral: true
        });
    }
};

// Comando separado para listar advertências
module.exports.listarAdvertencias = {
    name: "listar-advertencias",
    description: "Lista as advertências de um usuário.",
    type: 1,
    options: [
        {
            name: "usuario",
            description: "Usuário cujas advertências serão listadas.",
            type: Discord.ApplicationCommandOptionType.User,
            required: true
        }
    ],
    run: async (client, interaction) => {
        const user = interaction.options.getUser("usuario");
        const guildId = interaction.guild.id;
        const advertCount = await db.get(`advertencias_${guildId}_${user.id}`) || 0;

        return interaction.reply({
            content: `📋 O usuário ${user.tag} possui ${advertCount} advertência(s).`,
            ephemeral: true
        });
    }
};
