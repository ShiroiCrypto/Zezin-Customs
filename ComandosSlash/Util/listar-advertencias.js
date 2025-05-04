const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

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