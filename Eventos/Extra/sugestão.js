const client = require(`../../index.js`);
const Discord = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const corRosa = parseInt('1672cc', 16);

module.exports = {
  name: "sugestão.js",
};

client.on('messageCreate', async message => {
    if (!message.content) return; // Verifica se a mensagem não está vazia

    const channelId = await db.get(`canalsugestao_${message.guild.id}`);
    if (message.channel.id !== channelId) return;

    try {
        await message.delete();
    } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
        return; // Retorna se não conseguir deletar a mensagem
    }

    const embed = new Discord.EmbedBuilder()
        .setAuthor({ name: `Sugestão de: ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setDescription(`> \`\`\`${message.content}\`\`\``)
        .setThumbnail(message.author.displayAvatarURL())
        .setColor(corRosa)
        .setFooter({ text: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ format: "png" }) });

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
    await db.set(`suggest_${message.id}`, true);

    try {
        const thread = await sentMessage.startThread({
            name: `Sugestão Thread - ${message.author.username}`,
            autoArchiveDuration: 60, // Sugestão será encerrada após 60 minutos
            startMessage: message.content
        });
    } catch (error) {
        console.error('Erro ao iniciar a thread:', error);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;

    if (interaction.customId === 'aceitar_sugestao' || interaction.customId === 'recusar_sugestao') {
        const hasVoted = await db.get(`${userId}_${interaction.message.id}`);
        const embed = new Discord.EmbedBuilder()
            .setDescription('Você já votou.')
            .setColor(corRosa);
        
        if (hasVoted) return interaction.reply({ embeds: [embed], ephemeral: true });

        await db.set(`${userId}_${interaction.message.id}`, true); // Marca que o usuário já votou

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

        await interaction.update({ components: [row] });
    }
    
    if (interaction.customId === 'mostrar_votos') {
        const yesVotes = await db.get(`positivo_${interaction.message.id}`) || [];
        const noVotes = await db.get(`negativo_${interaction.message.id}`) || [];

        const yesUsernames = yesVotes.map(userId => `<@${userId}>`).join('\n') || 'Sem votação';
        const noUsernames = noVotes.map(userId => `<@${userId}>`).join('\n') || 'Sem votação';

        const embed = new Discord.EmbedBuilder()
            .setColor(corRosa)
            .addFields(
                { name: 'Votação positiva', value: yesUsernames, inline: true },
                { name: 'Votação negativa', value: noUsernames, inline: true }
            );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
});
