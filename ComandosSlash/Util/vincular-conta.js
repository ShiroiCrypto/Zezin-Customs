const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: "vincular-conta",
    description: "Vincula a conta de um usuário ao ID FiveM (comando restrito para chefes)",
    type: 1, // tipo 1 = Chat Input (slash command)
    options: [
        {
            name: "usuario",
            type: 6, // USER
            description: "Usuário que terá a conta vinculada",
            required: true,
        },
        {
            name: "id_fivem",
            type: 3, // STRING
            description: "ID FiveM para vincular",
            required: true,
        }
    ],
    permissions: {
        // Permitir somente quem tem permissão de administrador (ou customize como desejar)
        DEFAULT_MEMBER_PERMISSIONS: PermissionsBitField.Flags.ManageGuild.toString(),
    },
    run: async (client, interaction) => {
        try {
            // Verifica se quem executa tem a permissão ManageGuild (pode ajustar para roles específicas se quiser)
            if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply({ content: "❌ Você não tem permissão para usar este comando.", ephemeral: true });
            }

            const user = interaction.options.getUser("usuario");
            const idFivem = interaction.options.getString("id_fivem");
            const guildId = interaction.guild.id;

            await db.set(`user_id_${user.id}_${guildId}`, idFivem);

            const embed = new EmbedBuilder()
                .setTitle("🔗 Conta vinculada com sucesso!")
                .setDescription(`O usuário ${user} teve o ID FiveM \`${idFivem}\` vinculado à sua conta Discord.`)
                .setColor("Green")
                .setFooter({ text: "Sistema de Ponto | ShiroiCrypto" })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: false });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "❌ Ocorreu um erro ao vincular a conta.", ephemeral: true });
        }
    }
};
