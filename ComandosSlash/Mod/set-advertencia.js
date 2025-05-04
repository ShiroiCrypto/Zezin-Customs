const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: "set-advertencia",
    description: "Define o cargo com permissão para advertir e o canal de logs de advertência.",
    type: 1,
    options: [
        {
            name: "cargo_advertencia",
            description: "Cargo que poderá aplicar advertências",
            type: Discord.ApplicationCommandOptionType.Role,
            required: true
        },
        {
            name: "canal_logs",
            description: "Canal onde serão enviados os logs das advertências",
            type: Discord.ApplicationCommandOptionType.Channel,
            required: true,
            channel_types: [Discord.ChannelType.GuildText]
        }
    ],
    run: async (client, interaction) => {
        // Verifica se quem executa o comando tem permissão de administrador
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: `⛔ Você precisa ser administrador para usar este comando.`,
                ephemeral: true
            });
        }

        const cargo = interaction.options.getRole("cargo_advertencia");
        const canal = interaction.options.getChannel("canal_logs");

        // Salva o ID do cargo e do canal de logs no banco de dados
        await db.set(`cargo_advertencia_${interaction.guild.id}`, cargo.id);
        await db.set(`log_advertencia_${interaction.guild.id}`, canal.id);

        return interaction.reply({
            content: `✅ Configuração concluída!\nCargo para advertência: **${cargo.name}**\nCanal de logs: ${canal}`,
            ephemeral: true
        });
    }
};
