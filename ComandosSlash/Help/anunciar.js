const Discord = require("discord.js")
const corRoxa = parseInt('800080', 16);
const corRosa = parseInt('FF007F', 16);

module.exports = {
  name: "anunciar", // Coloque o nome do comando
  description: "Anuncie algo em uma embed.", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
        name: "título",
        description: "Escreva algo.",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
    },
    {
        name: "descrição",
        description: "Escreva algo.",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
    },
    {
        name: "chat",
        description: "Mencione um canal.",
        type: Discord.ApplicationCommandOptionType.Channel,
        required: true,
    },
    {
        name: "cor",
        description: "Coloque uma cor em hexadecimal.",
        type: Discord.ApplicationCommandOptionType.String,
        required: false,
    }
],

  run: async (client, interaction) => {

    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
        interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true })
    } else {
        let titulo = interaction.options.getString("título")
        let desc = interaction.options.getString("descrição")
        let cor = interaction.options.getString("cor")
        if (!cor) cor = corRosa
        let chat = interaction.options.getChannel("chat")
        if (Discord.ChannelType.GuildText !== chat.type) return interaction.reply(`❌ Este canal não é um canal de texto para enviar uma mensagem.`)

        let embed = new Discord.EmbedBuilder()
        .setTitle(titulo)
        .setDescription(desc)
        .setColor(cor)
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        .setFooter({
            text: `Anuncio enviado por: ${interaction.user.tag}`,
            iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}`
        });
        

        chat.send({ embeds: [embed] }).then( () => { 
            interaction.reply(`✅ Seu anúncio foi enviado em ${chat} com sucesso.`)
        }).catch( (e) => {
            interaction.reply(`❌ Algo deu errado.`)
        })
    }

  }
}