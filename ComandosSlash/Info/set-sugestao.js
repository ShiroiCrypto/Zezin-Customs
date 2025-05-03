const Discord = require("discord.js")
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: "set-sugestao",
    description: "Setar canal",
    type: 1,
    options: [
        {
            name: "setsugestao",
            description: "Canal aonde será enviado as sugestões",
            type: Discord.ApplicationCommandOptionType.Channel,
            required: true
        },],
    permissions: {},
    run: async (client, interaction, args) => {



        const canal = interaction.options.getChannel("canal_sugestão");

        await db.set(`canalsugestao_${interaction.guild.id}`, canal.id);

        interaction.reply(`✅ Canal de sugestões definido como ${canal}`);
    }
}