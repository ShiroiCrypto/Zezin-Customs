const client = require("../../index.js");
const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === "registro") {
            const canalLogsId = await db.get(`canal_logs_${interaction.guild.id}`);
            if (!interaction.guild.channels.cache.get(canalLogsId)) {
                return interaction.reply({ content: `O sistema está desativado.`, ephemeral: true });
            }

            // Verifica se usuário já está registrado
            const registrado = await db.get(`user_id_${interaction.user.id}_${interaction.guild.id}`);
            if (registrado) {
                return interaction.reply({ content: "❌ Você já está registrado no sistema da mecânica.", ephemeral: true });
            }

            const modal = new Discord.ModalBuilder()
                .setCustomId("modal")
                .setTitle("Registro Família Delacruz!");

            const pergunta1 = new Discord.TextInputBuilder()
                .setCustomId("pergunta1")
                .setLabel("Nome Do Personagem")
                .setPlaceholder("Seu Nome / Não coloque o sobrenome, apenas 1° nome!")
                .setRequired(true)
                .setStyle(Discord.TextInputStyle.Short);

            const pergunta2 = new Discord.TextInputBuilder()
                .setCustomId("pergunta2")
                .setLabel("ID")
                .setPlaceholder("Seu ID / Não coloque letras!")
                .setRequired(true)
                .setStyle(Discord.TextInputStyle.Short);

            const pergunta3 = new Discord.TextInputBuilder()
                .setCustomId("pergunta3")
                .setLabel("Whatsapp da City")
                .setPlaceholder("Seu Whatsapp / Apenas os números sem o traço!")
                .setRequired(true)
                .setMaxLength(6)
                .setStyle(Discord.TextInputStyle.Short);

            const pergunta4 = new Discord.TextInputBuilder()
                .setCustomId("pergunta4")
                .setLabel("ID do Recrutador")
                .setPlaceholder("ID do Recrutador / Não coloque letras!")
                .setRequired(true)
                .setStyle(Discord.TextInputStyle.Short);

            modal.addComponents(
                new Discord.ActionRowBuilder().addComponents(pergunta1),
                new Discord.ActionRowBuilder().addComponents(pergunta2),
                new Discord.ActionRowBuilder().addComponents(pergunta3),
                new Discord.ActionRowBuilder().addComponents(pergunta4)
            );

            await interaction.showModal(modal);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === "modal") {
            const resposta1 = interaction.fields.getTextInputValue("pergunta1");
            const resposta2 = interaction.fields.getTextInputValue("pergunta2");
            const resposta3 = interaction.fields.getTextInputValue("pergunta3");
            const resposta4 = interaction.fields.getTextInputValue("pergunta4");

            // Verificação se o usuário já está registrado (ultima checagem para evitar bugs)
            const userIdKey = `user_id_${interaction.user.id}_${interaction.guild.id}`;
            const jaRegistrado = await db.get(userIdKey);
            if (jaRegistrado) {
                return interaction.reply({ content: "❌ Você já está registrado no sistema da mecânica.", ephemeral: true });
            }

            // Verificação de ID já registrado por outro usuário
            // Para isso precisamos checar o user_id_* para a guilda com o mesmo id fivem enviado
            // quick.db não tem busca direta, então faremos uma busca simplificada percorrendo todos os usuários do guild
            // Porém, quick.db não é ideal para isso e pode não ser performático em guilds com muitos usuários
            // Como alternativa, verificamos a chave inversa user_fivem_${guild.id}_${id} apontando para user discord id, para evitar duplicidade
            const idFivemRegistrado = await db.get(`user_fivem_${interaction.guild.id}_${resposta2}`);
            if (idFivemRegistrado) {
                return interaction.reply({ content: `❌ O ID FiveM \`${resposta2}\` já está registrado por <@${idFivemRegistrado}>.`, ephemeral: true });
            }

            // Validação de entrada numérica
            if (!/^\d+$/.test(resposta2)) {
                return interaction.reply({ content: 'Por favor, forneça apenas números para o ID.', ephemeral: true });
            }
            if (!/^\d+$/.test(resposta3)) {
                return interaction.reply({ content: 'Por favor, forneça apenas números para o Whatsapp da City.', ephemeral: true });
            }
            if (!/^\d+$/.test(resposta4)) {
                return interaction.reply({ content: 'Por favor, forneça apenas números para o ID do Recrutador.', ephemeral: true });
            }

            // Responde que o registro foi enviado com sucesso
            await interaction.reply({ content: `Olá **${interaction.user.username}**, seu registro foi enviado com sucesso!`, ephemeral: true });

            const usuario = interaction.member;
            if (!usuario.manageable) {
                console.log("Não é possível gerenciar o usuário.");
                return;
            }

            try {
                // Atualiza nickname
                await usuario.setNickname(`[EST] ${resposta1} | ${resposta2}`);

                // Adiciona cargo
                let role_id = await db.get(`cargo_pt_${interaction.guild.id}`);
                let role = interaction.guild.roles.cache.get(role_id);
                if (role) {
                    await usuario.roles.add(role.id);
                }

                // Salva a chave user_id (discord -> fivem)
                await db.set(userIdKey, resposta2);
                // Salva a chave user_fivem (fivem -> discord)
                await db.set(`user_fivem_${interaction.guild.id}_${resposta2}`, interaction.user.id);

                // Salva nome do personagem
                await db.set(`nome_${interaction.user.id}_${interaction.guild.id}`, resposta1);
                await db.set(`whatsapp_${interaction.user.id}_${interaction.guild.id}`, resposta3);
                await db.set(`idrec_${interaction.user.id}_${interaction.guild.id}`, resposta4);
                await db.set(`cargo_${interaction.user.id}_${interaction.guild.id}`, role_id);

                const embed = new Discord.EmbedBuilder()
                    .setColor("#1672cc")
                    .setTitle("Customs System")
                    .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`O usuário <@${interaction.user.id}> enviou o seu registro:`)
                    .addFields(
                        { name: `Nome Do Personagem:`, value: `\`${resposta1}\``, inline: false },
                        { name: `ID:`, value: `\`${resposta2}\``, inline: false },
                        { name: `Whatsapp da City:`, value: `\`${resposta3}\``, inline: false },
                        { name: `ID do Recrutador:`, value: `\`${resposta4}\``, inline: false },
                    )
                    .setTimestamp();

                const canalLogs = interaction.guild.channels.cache.get(await db.get(`canal_logs_${interaction.guild.id}`));
                if (canalLogs) {
                    await canalLogs.send({ embeds: [embed] });
                }
            } catch (error) {
                console.error("Erro ao definir o apelido ou roles:", error);
            }
        }
    }
});
