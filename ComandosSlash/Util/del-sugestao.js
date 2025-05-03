const { PermissionsBitField, ComponentType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Discord = require("discord.js")
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
    name: "del-sugestao",
    description: "Deletar canal",
    type: 1,
    permissions: {},
    run: async (client, interaction, args) => {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator))
            return interaction.reply({
                content: `Olá ${interaction.user}, você não possui permissão para utilizar este comando!`,
                ephemeral: true,
            })
        


        try{
             interaction.guild
      
           
    
      db.delete(`canalsugestao_${interaction.guild.id}`)
            interaction.reply({ content: `✅ Canal deletado com sucesso`})
        } catch(e) {
            return console.log(e)   
        }
    } 
    }