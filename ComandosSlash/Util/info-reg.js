const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const moment = require("moment");

const corAzul = parseInt('1672cc', 16);

module.exports = {
    name: "info-reg",
    description: "Ver informações do registro de uma pessoa.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "usuário",
            type: Discord.ApplicationCommandOptionType.User,
            description: "Pega as informações de um usuário.",
            required: false 
        }
    ],

    run: async (client, interaction) => {
        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: "❌ Você não tem permissão para usar este comando.", ephemeral: true });
        }

        const user = interaction.options.getUser("usuário") || interaction.user;

        // Dados básicos
        const nome = await db.get(`nome_${user.id}_${interaction.guild.id}`) || "nulo";
        const id = await db.get(`user_id_${user.id}_${interaction.guild.id}`) || 0;
        const whatsapp = await db.get(`whatsapp_${user.id}_${interaction.guild.id}`) || "000000000";
        const idrec = await db.get(`idrec_${user.id}_${interaction.guild.id}`) || 0;
        const cargo = await db.get(`cargo_${user.id}_${interaction.guild.id}`) || "nulo";

        // Histórico
        const historico = await db.get(`historico_pontos_${id}`) || [];

        let totalSegundos = 0;
        for (const ponto of historico) {
            totalSegundos += ponto.duracaoSegundos;
        }

        const duracaoTotal = moment.duration(totalSegundos, 'seconds');
        const horasFormatadas = `${Math.floor(duracaoTotal.asHours())}h ${duracaoTotal.minutes()}m ${duracaoTotal.seconds()}s`;

        // Formatação segura para números de telefone
        const whatsappFormatado = whatsapp.length >= 9 
            ? `${whatsapp.slice(0, 3)}-${whatsapp.slice(3, 6)}}` 
            : whatsapp;

        const embed = new Discord.EmbedBuilder()
            .setColor(corAzul)
            .setTitle("🩺 Info")
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `<:NE_purpleArrow:1185202226759745606> Nome: **${nome}**\n` +
                `:id: ID: **${id}**\n` +
                `<:WhatsApp:1185205652809842750> NúmeroZap: **${whatsappFormatado}**\n` +
                `<:membros:1168585775881928804> ID Recrutador: **${idrec}**\n` +
                `:timer: Horas Totais: \`${horasFormatadas}\`\n` +
                `🧰 Cargo Atual: **<@&${cargo}>**`
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
