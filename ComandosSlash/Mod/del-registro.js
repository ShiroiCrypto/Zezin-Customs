const { EmbedBuilder, PermissionsBitField } = require('discord.js'); const { QuickDB } = require('quick.db'); const db = new QuickDB();

module.exports = { 
name: "del-registro", 
description: "Remove o registro de um usuário no sistema da mecânica (somente para administradores)",
type: 1, // comando slash 

options: [ 
{ 
name: "usuario",
type: 6, // USER 
description: "Usuário que terá o registro removido", required: true } ], 
permissions: { DEFAULT_MEMBER_PERMISSIONS: PermissionsBitField.Flags.Administrator.toString(), 

}, 
run: async (client, interaction) => { try { // Verificar permissão do usuário que usou o comando if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) { return interaction.reply({ content: "❌ Você não tem permissão para usar este comando.", ephemeral: true }); }

        const user = interaction.options.getUser("usuario");
        const guildId = interaction.guild.id;

        const idFivem = await db.get(`user_id_${user.id}_${guildId}`);
        if (!idFivem) {
            return interaction.reply({ content: `❌ O usuário ${user} não está registrado no sistema da mecânica.`, ephemeral: true });
        }

        // Remove os dados do usuário
        await db.delete(`user_id_${user.id}_${guildId}`);
        await db.delete(`nome_${user.id}_${guildId}`);
        await db.delete(`user_fivem_${guildId}_${idFivem}`);

        // Remover cargo se existir
        const roleId = await db.get(`cargo_pt_${guildId}`);
        const role = interaction.guild.roles.cache.get(roleId);
        const member = interaction.guild.members.cache.get(user.id);
        if (role && member && member.roles.cache.has(role.id)) {
            await member.roles.remove(role.id);
        }

        // Remover apelido se possível
        if (member && member.manageable) {
            await member.setNickname(null);
        }

        const embed = new EmbedBuilder()
            .setTitle("🛑 Registro removido")
            .setDescription(`O registro do usuário ${user} foi removido com sucesso do sistema da mecânica.`)
            .setColor("Red")
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false });
    } catch (error) {
        console.error(error);
        return interaction.reply({ content: "❌ Ocorreu um erro ao remover o registro.", ephemeral: true });
    }
}
};