const client = require('../../index.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const corRosa = parseInt('1672cc', 16);

module.exports = {
  name: 'sugestao.js',
};

// Evento para capturar mensagens no canal de sugestões
client.on('messageCreate', async (message) => {
  if (!message.content || message.author.bot) return;

  const channelId = await db.get(`canalsugestao_${message.guild.id}`);
  if (message.channel.id !== channelId) return;

  try {
    await message.delete();
  } catch (error) {
    console.error('Erro ao deletar mensagem:', error);
    return;
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Sugestão de: ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
    .setDescription(`> \`\`\`${message.content}\`\`\``)
    .setThumbnail(message.author.displayAvatarURL())
    .setColor(corRosa)
    .setFooter({ text: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ format: 'png' }) });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('aceitar_sugestao')
      .setLabel('0')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId('recusar_sugestao')
      .setLabel('0')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('❌'),
    new ButtonBuilder()
      .setCustomId('mostrar_votos')
      .setLabel('Mostrar Votos')
      .setStyle(ButtonStyle.Primary)
  );

  const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });
  await db.set(`suggest_${sentMessage.id}`, true);

  try {
    await sentMessage.startThread({
      name: `Sugestão Thread - ${message.author.username}`,
      autoArchiveDuration: 60,
    });
  } catch (error) {
    console.error('Erro ao iniciar a thread:', error);
  }
});

// Evento para capturar interações com os botões
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const userId = interaction.user.id;
  const messageId = interaction.message.id;

  // Verifica se a mensagem é uma sugestão
  const isSuggestion = await db.get(`suggest_${messageId}`);
  if (!isSuggestion) return;

  // Verifica se o usuário já votou
  const hasVoted = await db.get(`${userId}_${messageId}`);
  if (hasVoted && interaction.customId !== 'mostrar_votos') {
    const embed = new EmbedBuilder()
      .setDescription('Você já votou.')
      .setColor(corRosa);
    try {
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error('Erro ao responder interação duplicada:', err);
      return;
    }
  }

  // Processa o voto
  if (interaction.customId === 'aceitar_sugestao' || interaction.customId === 'recusar_sugestao') {
    await db.set(`${userId}_${messageId}`, true);

    const yesVotes = (await db.get(`positivo_${messageId}`)) || [];
    const noVotes = (await db.get(`negativo_${messageId}`)) || [];

    if (interaction.customId === 'aceitar_sugestao') {
      if (!yesVotes.includes(userId)) {
        yesVotes.push(userId);
        await db.set(`positivo_${messageId}`, yesVotes);
      }
    } else if (interaction.customId === 'recusar_sugestao') {
      if (!noVotes.includes(userId)) {
        noVotes.push(userId);
        await db.set(`negativo_${messageId}`, noVotes);
      }
    }

    // Atualiza os contadores nos botões
    const updatedRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('aceitar_sugestao')
        .setLabel(`${yesVotes.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId('recusar_sugestao')
        .setLabel(`${noVotes.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❌'),
      new ButtonBuilder()
        .setCustomId('mostrar_votos')
        .setLabel('Mostrar Votos')
        .setStyle(ButtonStyle.Primary)
    );

    try {
      await interaction.update({ components: [updatedRow] });
    } catch (err) {
      console.error('Erro ao atualizar os botões:', err);
    }
  }

  // Mostra os votos
  if (interaction.customId === 'mostrar_votos') {
    const yesVotes = (await db.get(`positivo_${messageId}`)) || [];
    const noVotes = (await db.get(`negativo_${messageId}`)) || [];

    const yesMentions = yesVotes.map((id) => `<@${id}>`).join(', ') || 'Nenhum voto.';
    const noMentions = noVotes.map((id) => `<@${id}>`).join(', ') || 'Nenhum voto.';

    const embed = new EmbedBuilder()
      .setTitle('Votos da Sugestão')
      .addFields(
        { name: '✅ A favor', value: yesMentions, inline: false },
        { name: '❌ Contra', value: noMentions, inline: false }
      )
      .setColor(corRosa);

    try {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error('Erro ao mostrar votos:', err);
    }
  }
});
