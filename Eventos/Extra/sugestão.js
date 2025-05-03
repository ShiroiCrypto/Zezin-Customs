const client = require(`../../index.js`);
const Discord = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const corRosa = parseInt('1672cc', 16);

module.exports = {
  name: "sugestão.js",
};

client.on('messageCreate', async message => {

    if (message.content) {
        const channelId = await db.get(`canalsugestao_${message.guild.id}`);

        if (message.channel.id !== channelId) return;

        try {
            await message.delete();
        } catch (error) {
            console.error('Erro ao deletar mensagem', error);
        }
        const embed = new Discord.EmbedBuilder()
            .setAuthor({ name: `Sugestão de: ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(`> \`\`\`${message.content}\`\`\``)
            .setThumbnail(message.author.displayAvatarURL())
            .setColor(corRosa)
            .setFooter({ text: `${message.author.username}`, icon_url: `${message.author.displayAvatarURL({ format: "png" })}`, })

        const row1 = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('aceitar_sugestao')
                    .setLabel(`0`)
                    .setStyle(2)
                    .setEmoji('✅'),
                new Discord.ButtonBuilder()
                    .setCustomId('recusar_sugestao')
                    .setLabel(`0`)
                    .setStyle(2)
                    .setEmoji('❌'),
                new Discord.ButtonBuilder()
                    .setCustomId('mostrar_votos')
                    .setLabel('Mostrar Votos')
                    .setStyle(1)
            );

        const sentMessage = await message.channel.send({ embeds: [embed], components: [row1] });
        db.set(`suggest_${message.id}`, true);

        const thread = await sentMessage.startThread({
            name: `Sugestão Thread - ${message.author.username}`,
            autoArchiveDuration: 60, // sugestão será encerrada durante 60 segundos
            startMessage: message.content
        });
    }
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;

    if (interaction.customId === 'aceitar_sugestao' || interaction.customId === 'recusar_sugestao') {
        const r = await db.get(`${userId}_${interaction.message.id}`);
        const embed = new Discord.EmbedBuilder()
            .setDescription('Você já votou.')
            .setColor(corRosa);
        if (r === 1) return interaction.reply({ embeds: [embed], ephemeral: true });

        await db.set(`${userId}_${interaction.message.id}`, 1);

        const yesVotes = await db.get(`positivo_${interaction.message.id}`) || [];
        const noVotes = await db.get(`negativo_${interaction.message.id}`) || [];

        if (interaction.customId === 'aceitar_sugestao') {
            if (!yesVotes.includes(userId)) {
                yesVotes.push(userId);
                await db.set(`positivo_${interaction.message.id}`, yesVotes);
            }
        } else {
            if (!noVotes.includes(userId)) {
                noVotes.push(userId);
                await db.set(`negativo_${interaction.message.id}`, noVotes);
            }
        }

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('aceitar_sugestao')
                    .setLabel(`${yesVotes.length}`)
                    .setStyle(2)
                    .setEmoji('✅'),
                new Discord.ButtonBuilder()
                    .setCustomId('recusar_sugestao')
                    .setLabel(`${noVotes.length}`)
                    .setStyle(2)
                    .setEmoji('❌'),
                new Discord.ButtonBuilder()
                    .setCustomId('mostrar_votos')
                    .setLabel('Mostrar Votos')
                    .setStyle(1)
            );

        interaction.update({ components: [row] });
    }
    
    if (interaction.customId === 'mostrar_votos') {
        const yesVotes = await db.get(`positivo_${interaction.message.id}`) || [];
        const noVotes = await db.get(`negativo_${interaction.message.id}`) || [];

        const yesUsernames = yesVotes.map(userId => `<@${userId}>`).join('\n');
        const noUsernames = noVotes.map(userId => `<@${userId}>`).join('\n');

        const embed = new Discord.EmbedBuilder()
          .setColor(corRosa)

        if (yesUsernames.length > 0) {
            embed.addFields({ name: 'Votação positiva', value: yesUsernames, inline: true });
        } else {
            embed.addFields({ name: 'Votação positiva', value: 'Sem votação', inline: true });
        }

        if (noUsernames.length > 0) {
            embed.addFields({ name: 'Votação negativa', value: noUsernames, inline: true });
        } else {
            embed.addFields({ name: 'Votação negativa', value: 'Sem votação', inline: true });
        }

        interaction.reply({ embeds: [embed], ephemeral: true });
    }


})