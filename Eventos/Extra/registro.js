const client = require("../../index.js");
const Discord = require("discord.js")
const { QuickDB } = require("quick.db");
const db = new QuickDB();

client.on("interactionCreate", async(interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === "registro") {
      if (!interaction.guild.channels.cache.get(await db.get(`canal_logs_${interaction.guild.id}`))) return interaction.reply({ content: `O sistema está desativado.`, ephemeral: true })
      const modal = new Discord.ModalBuilder()
      .setCustomId("modal")
      .setTitle("Registro Família Delacruz!");

      const pergunta1 = new Discord.TextInputBuilder()
      .setCustomId("pergunta1") // Coloque o ID da pergunta
      .setLabel("Nome Do Personagem") // Coloque a pergunta
      .setPlaceholder("Seu Nome / Não coloque o sobrenome, apenas 1° nome!") // Mensagem que fica antes de escrever a resposta
      .setRequired(true) // Deixar para responder obrigatório (true | false)
      .setStyle(Discord.TextInputStyle.Short) // Tipo de resposta (Short | Paragraph)
      const pergunta2 = new Discord.TextInputBuilder()
      .setCustomId("pergunta2") // Coloque o ID da pergunta
      .setLabel("ID") // Coloque a pergunta
      .setPlaceholder("Seu ID / Não coloque letras!") // Mensagem que fica antes de escrever a resposta
      .setRequired(true) // Deixar para responder obrigatório (true | false)
      .setStyle(Discord.TextInputStyle.Short) // Tipo de resposta (Short | Paragraph)
      const pergunta3 = new Discord.TextInputBuilder()
      .setCustomId("pergunta3") // Coloque o ID da pergunta
      .setLabel("Whatsapp da City") // Coloque a pergunta
      .setPlaceholder("Seu Whatsapp / Apenas os números sem o traço!") // Mensagem que fica antes de escrever a resposta
      .setRequired(true) // Deixar para responder obrigatório (true | false)
      .setStyle(Discord.TextInputStyle.Short) // Tipo de resposta (Short | Paragraph)
      const pergunta4 = new Discord.TextInputBuilder()
      .setCustomId("pergunta4") // Coloque o ID da pergunta
      .setLabel("ID do Recrutador") // Coloque a pergunta
      .setPlaceholder("ID do Recrutador / Não coloque letras!") // Mensagem que fica antes de escrever a resposta
      .setRequired(true) // Deixar para responder obrigatório (true | false)
      .setStyle(Discord.TextInputStyle.Short) // Tipo de resposta (Short | Paragraph)

      modal.addComponents(
        new Discord.ActionRowBuilder().addComponents(pergunta1),
        new Discord.ActionRowBuilder().addComponents(pergunta2),
        new Discord.ActionRowBuilder().addComponents(pergunta3),
        new Discord.ActionRowBuilder().addComponents(pergunta4)
      )

      await interaction.showModal(modal)
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === "modal") {
      const resposta1 = interaction.fields.getTextInputValue("pergunta1");
      const resposta2 = interaction.fields.getTextInputValue("pergunta2");
      const resposta3 = interaction.fields.getTextInputValue("pergunta3");
      const resposta4 = interaction.fields.getTextInputValue("pergunta4");

      const nome = await db.set(`nome_${interaction.user.id}_${interaction.guild.id}`, resposta1)

      if (!/^\d+$/.test(resposta2)) {
        return interaction.reply({ content: 'Por favor, forneça apenas números para o ID.', ephemeral: true });
      }
      if (!/^\d+$/.test(resposta3)) {
        return interaction.reply({ content: 'Por favor, forneça apenas números para o Whatsapp da City.', ephemeral: true });
      }
      if (!/^\d+$/.test(resposta4)) {
        return interaction.reply({ content: 'Por favor, forneça apenas números para o ID do Recrutador.', ephemeral: true });
      }
      
      interaction.reply({ content: `Olá **${interaction.user.username}**, seu registro foi enviado com sucesso!`, ephemeral: true });

      const usuario = interaction.member;
      if (!usuario.manageable) return console.log("Não é possível gerenciar o usuário.");

      try {
        await usuario.setNickname(`[EST] ${resposta1} | ${resposta2}`); //Altera o apelido do discord.
        let role_id = await db.get(`cargo_pt_${interaction.guild.id}`);
        let role = interaction.guild.roles.cache.get(role_id);
        if (!role) return;
        interaction.member.roles.add(role.id) //Adiciona um cargo ao usuario que interagiu com o botão e enviou o formulario.
        await db.set(`user_id_${interaction.user.id}_${interaction.guild.id}`, resposta2);

        const embed = new Discord.EmbedBuilder()
          .setColor("#1672cc")
          .setTitle("Customs System")
          .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setDescription(`O usuário ${interaction.user} enviou o seu registro:`)
          .addFields(
            { name: `Nome Do Personagem:`, value: `\`${nome}\``, inline: false },
            { name: `ID:`, value: `\`${resposta2}\``, inline: false },
            { name: `Whatsapp da City:`, value: `\`${resposta3}\``, inline: false },
            { name: `ID do Recrutador:`, value: `\`${resposta4}\``, inline: false }
          )
          .setTimestamp()

        await interaction.guild.channels.cache.get(await db.get(`canal_logs_${interaction.guild.id}`)).send({ embeds: [embed] });
      } catch (error) {
        console.error("Erro ao definir o apelido:", error);
      }
    }
  }
});