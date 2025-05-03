const Discord = require("discord.js")
const { QuickDB } = require("quick.db")
const db = new QuickDB()

module.exports = {
  name: "set-registro", // Coloque o nome do comando
  description: "Abra o painel de registro para os membros.", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
        name: "canal_registro",
        description: "Canal para enviar o registro dos membros.",
        type: Discord.ApplicationCommandOptionType.Channel,
        required: true,
    },
    {
        name: "canal_logs",
        description: "Canal para enviar as logs dos registros recebidos.",
        type: Discord.ApplicationCommandOptionType.Channel,
        required: true,
    },
    {
        name: "cargo_membro",
        description: "Cargo de membro da fac.",
        type: Discord.ApplicationCommandOptionType.Role,
        required: true,
    },
],

  run: async (client, interaction) => {

    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
        interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true })
    } else {
        const canal_registro = interaction.options.getChannel("canal_registro")
        const canal_logs = interaction.options.getChannel("canal_logs")
        const cargo_membro = interaction.options.getRole("cargo_membro")

        if (canal_registro.type !== Discord.ChannelType.GuildText) {
            interaction.reply({ content: `O canal ${canal_registro} não é um canal de texto.`, ephemeral: true })
        } else if (canal_logs.type !== Discord.ChannelType.GuildText) {
            interaction.reply({ content: `O canal ${canal_logs} não é um canal de texto.`, ephemeral: true })
        } else {
            await db.set(`canal_registro_${interaction.guild.id}`, canal_registro.id)
            await db.set(`canal_logs_${interaction.guild.id}`, canal_logs.id)
            await db.set(`cargo_pt_${interaction.guild.id}`, cargo_membro.id)

            let embed = new Discord.EmbedBuilder()
            .setDescription("#1672cc")
            .setTitle("Canais Configurados!")
            .setDescription(`> Canal De Registro: ${canal_registro}.\n> Canal de Logs: ${canal_logs}. \n > Cargo Configurado: ${cargo_membro}.`)

            interaction.reply({ embeds: [embed], ephemeral: true }).then( () => {
                let embed_registro = new Discord.EmbedBuilder()
                .setColor("#1672cc")
                .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setTitle(`${interaction.guild}`)
                .setDescription(`Faça seu registro clicando no botão abaixo!`);

                let botao = new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                    .setCustomId("registro")
                    .setEmoji("☝")
                    .setLabel("Clique Aqui!")
                    .setStyle(Discord.ButtonStyle.Primary)
                );

                canal_registro.send({ embeds: [embed_registro], components: [botao] })
            })
        } 
    }
  }
}