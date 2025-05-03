const Discord = require("discord.js")
const dc = require('discord.js');
const moment = require("moment");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const corRoxa = parseInt('1672cc', 16);
const corRosa = parseInt('1672cc', 16);

module.exports = {
  name: "set-ponto",
  description: "Ativar painel de bater ponto.",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
        name: 'canal',
        description: 'Selecione um canal de texto.',
        type: Discord.ApplicationCommandOptionType.Channel,
        required: true,
    },
    {
        name: 'canal-log', 
        description: 'Selecione o canal de logs da liderança.',
        type: Discord.ApplicationCommandOptionType.Channel,
        required: true,
    }
  ],

  run: async (client, interaction) => {

    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator))
    return interaction.reply({
        content: `Olá ${interaction.user}, você não possui permissão para utilizar este comando!`,
        ephemeral: true,
    })

    const canallogid = interaction.options.getChannel('canal-log');
    await db.set(`canallogid_${interaction.guild.id}`, canallogid.id);

    interaction.reply({ content: `Painel bate-ponto enviado com sucesso!`, ephemeral: true })

        const canalEnv = interaction.options.getChannel('canal')

    const embedT = new Discord.EmbedBuilder()
    .setTitle(`Bate Ponto System | ShiroiCrypto`)
    .setThumbnail(interaction.guild.iconURL({ dinamyc: true, format: "png", size: 4096 }))
    .setDescription(`  Para **INICIAR** seu **PONTO** clique no botão: \n\n  Para **FINALIZAR** seu **PONTO** clique no botão: <a:nao:1217903998103982131>`)
    .setColor(corRoxa)
    .setFooter({
        iconURL: interaction.guild.iconURL({ dynamic: true }),
        text: (`Copyright © | ShiroiCrypto.`)
            })
    .setTimestamp()

    const acct = new dc.ActionRowBuilder()
                  .addComponents(
                  new dc.ButtonBuilder()
                  .setLabel("Abrir Ponto")
                  .setStyle(2)
                  .setCustomId("btE")
                  .setEmoji("🧰"),
                  new dc.ButtonBuilder()
                  .setLabel("Fechar Ponto")
                  .setStyle(2)
                  .setCustomId("btS")
                  .setEmoji(`❌`),
                  )

    canalEnv.send({ embeds: [embedT], components: [acct] })
    
    
  }}
