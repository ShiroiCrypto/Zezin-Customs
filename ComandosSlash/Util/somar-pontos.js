const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: "somar-pontos",
    description: "Mostra o histórico de pontos do usuário registrado no sistema da mecânica",
    type: 1, // tipo 1 = Chat Input (slash command)
    permissions: {},
    options: [
        {
            name: 'usuario',
            type: 6,
            description: 'O usuário cujo histórico você deseja ver',
            required: false
        }
    ],
    run: async (client, interaction, args) => {
        try {
            // Verifica se um usuário foi mencionado
            const mentionedUser  = interaction.options.getUser ('usuario'); // 'usuario' é o nome do parâmetro que você deve definir no comando
            const userId = mentionedUser  ? mentionedUser .id : interaction.user.id; // Se um usuário foi mencionado, usa o ID dele, caso contrário, usa o ID do usuário que executou o comando

            const id = await db.get(`user_id_${userId}_${interaction.guild.id}`);
            if (!id) {
                return interaction.reply({ content: "❌ Este usuário ainda não está registrado no sistema da mecânica.", ephemeral: true });
            }

            const historico = await db.get(`historico_pontos_${id}`) || [];
            if (historico.length === 0) {
                return interaction.reply({ content: "⚠️ Nenhum ponto registrado até agora.", ephemeral: true });
            }

            let totalSegundos = 0;
            const linhas = historico.map(ponto => {
                totalSegundos += ponto.duracaoSegundos;
                const tempo = moment.duration(ponto.duracaoSegundos, 'seconds');
                return `📆 **${ponto.data}** — \`${Math.floor(tempo.asHours())}h ${tempo.minutes()}m ${tempo.seconds()}s\``;
            });

            const duracaoTotal = moment.duration(totalSegundos, 'seconds');
            const embed = new EmbedBuilder()
                .setTitle("📋 Histórico de Pontos")
                .setDescription(`**ID FiveM:** \`${id}\`\n**Horas Totais:** \`${Math.floor(duracaoTotal.asHours())}h ${duracaoTotal.minutes()}m ${duracaoTotal.seconds()}s\`\n\n**Pontos Registrados:**\n${linhas.join("\n")}`)
                .setColor("Blue")
                .setFooter({ text: "Sistema de Ponto | ShiroiCrypto" })
                .setTimestamp();

            interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (e) {
            console.log(e);
            return interaction.reply({ content: "❌ Ocorreu um erro ao buscar o histórico.", ephemeral: true });
        }
    }
};
