const { GatewayIntentBits, Client, Collection } = require("discord.js")
const express = require('express');
const server = express();
require('dotenv').config()

server.get('/', (req, res) => {
  return res.json({ Retorno: 'Nossa APi está online' })
})

server.listen(3000, () => {
  console.log('Servidor está funcionando...')
})

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

module.exports = client;

client.slashCommands = new Collection();
client.prefixCommands = new Collection();

//require("./api.js")(client);
require("./Handler")(client);

// process.on('unhandRejection', (reason, promise) => {
//   console.log(`🚫 Erro Detectado:\n\n` + reason, promise);
//  });

//  process.on('uncaughtException', (error, origin) => {
//   console.log(`🚫 Erro Detectado:\n\n` + error, origin);
// });

client.login(process.env.clientToken).then(() => {
  console.log(`✅ Bot logado com sucesso!`);
}).catch((err) => {
  console.log(`❌ Erro ao logar o bot: ${err}`);
});