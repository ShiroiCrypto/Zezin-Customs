const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const corAzul = parseInt('1672cc', 16);

module.exports = {
    name: "set-manualreg",
    description: "Define manualmente os dados de registro de um membro.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            type: Discord.ApplicationCommandOptionType.User,
            description: "Selecione o membro para definir os dados.",
            required: true,
        },
        {
            name: "nome",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Nome do funcionário.",
            required: true,
        },
        {
            name: "id",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "ID do funcionário.",
            required: true,
        },
        {
            name: "whatsapp",
            type: Discord.ApplicationCommandOptionType.String,
            description: "Número do WhatsApp (apenas números, ex: 123456789).",
            required: true,
        },
        {
            name: "id_recrutador",
            type: Discord.ApplicationCommandOptionType.Integer,
            description: "ID do recrutador.",
            required: true,
        },
        {
            name: "cargo",
            type: Discord.ApplicationCommandOptionType.Role,
            description: "Cargo atual do funcionário.",
            required: true,
        }
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ Você não tem permissão para usar este comando.", ephemeral: true });
        }

        const user = interaction.options.getUser("usuário");
        const nome = interaction.options.getString("nome");
        const id = interaction.options.getInteger("id");
        const whatsapp = interaction.options.getString("whatsapp");
        const idrec = interaction.options.getInteger("id_recrutador");
        const cargo = interaction.options.getRole("cargo");

        const guildId = interaction.guild.id;

        // Salvando no banco
        await db.set(`nome_${user.id}_${guildId}`, nome);
        await db.set(`user_id_${user.id}_${guildId}`, id);
        await db.set(`whatsapp_${user.id}_${guildId}`, whatsapp);
        await db.set(`idrec_${user.id}_${guildId}`, idrec);
        await db.set(`cargo_${user.id}_${guildId}`, cargo.id);

        const embed = new Discord.EmbedBuilder()
            .setTitle("✅ Registro Atualizado")
            .setColor(corAzul)
            .setDescription(`As informações de <@${user.id}> foram definidas com sucesso:`)
            .addFields(
                { name: "👤 Nome", value: `\`${nome}\``, inline: true },
                { name: "🪪 ID", value: `\`${id}\``, inline: true },
                { name: "📱 WhatsApp", value: `\`${whatsapp.substring(0,3)}-${whatsapp.substring(3,6)}\``, inline: true },
                { name: "👥 ID do Recrutador", value: `\`${idrec}\``, inline: true },
                { name: "🎖️ Cargo", value: `<@&${cargo.id}>`, inline: true }
            )
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    },
};
