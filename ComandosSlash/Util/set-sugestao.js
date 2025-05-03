const Discord = require("discord.js")
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: "set-sugestao",
    description: "Setar canal",
    type: 1,
    options: [
        {
            name: "canal_sugestão",
            description: "Canal aonde será enviado as sugestões",
            type: Discord.ApplicationCommandOptionType.Channel,
            required: true
        },],
    permissions: {},
    run: async (client, interaction, args) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator))
            return interaction.reply({
                content: `Olá ${interaction.user}, você não possui permissão para utilizar este comando!`,
                ephemeral: true,
            })
        

        const canal = interaction.options.getChannel("canal_sugestão");

        await db.set(`canalsugestao_${interaction.guild.id}`, canal.id);

        interaction.reply(`✅ Canal de sugestões definido como ${canal}`);
    }
}