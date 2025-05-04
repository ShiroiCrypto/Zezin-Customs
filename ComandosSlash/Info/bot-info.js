const Discord = require("discord.js");
const corAzul = parseInt('1672cc', 16);

module.exports = {
  name: "bot-info",
  description: "Informações do bot oficial da Oceania Customs.",
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {

    const donoID = "1332736517281681419";
    const membros = client.users.cache.size;
    const servidores = client.guilds.cache.size;
    const canais = client.channels.cache.size;
    const bot = client.user.tag;
    const avatarBot = client.user.displayAvatarURL({ dynamic: true });
    const linguagem = "JavaScript (Node.js)";
    const livraria = "Discord.js";
    const ping = client.ws.ping;

    const embed = new Discord.EmbedBuilder()
      .setColor(corAzul)
      .setAuthor({ name: bot, iconURL: avatarBot })
      .setFooter({ text: "Oceania Customs | Sistema Mecânico", iconURL: avatarBot })
      .setTimestamp()
      .setThumbnail(avatarBot)
      .setTitle("🔧 Oceania Customs — Bot Oficial")
      .setDescription(
        `> 🛠️ **Bot oficial da Oceania Customs!**\n` +
        `> Aqui é onde os mecânicos entregam metas, conferem kits e mantêm a oficina em ordem.\n> Comando é comigo, chefe. 🚗💨\n\n` +
        `👥 **Membros atendidos:** \`${membros}\`\n` +
        `🏠 **Servidores ativos:** \`${servidores}\`\n` +
        `📁 **Canais monitorados:** \`${canais}\`\n` +
        `📡 **Ping atual:** \`${ping}ms\`\n\n` +
        `💻 **Linguagem:** \`${linguagem}\`\n` +
        `📚 **Biblioteca:** \`${livraria}\`\n` +
        `☁️ **Hospedagem:** [Square Cloud](https://squarecloud.app)\n\n` +
        `📬 **Desenvolvido por:** <@${donoID}> \`(guss.dev)\`\n` +
        `🔗 [GitHub - ShiroiCrypto](https://github.com/ShiroiCrypto)`
      );

    return interaction.reply({ embeds: [embed] });
  }
};
