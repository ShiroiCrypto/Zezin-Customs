const client = require("../../index");
const Discord = require("discord.js")

client.on("messageCreate", message => {

  if (message.author.bot) return;
  if (!message.guild) return;

  if (message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`) {

    const embed = new Discord.EmbedBuilder()
      .setTitle(`${client.user.username}`)
      .setColor(`1672cc`)
      .setThumbnail(client.user.avatarURL())
      .setDescription(`> **Opa! Bem Vindo a melhor mecanica do Fivem! Customs né vida!!!**`)

    message.reply({ embeds: [embed] })
  }
});