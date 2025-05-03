// Importações
const { GatewayIntentBits, Client, Collection } = require("discord.js");
const express = require('express');
const server = express();
require('dotenv').config();

// Inicialização do servidor Express
server.get('/', (req, res) => {
  return res.json({ message: 'Nossa API está online' });
});

server.listen(3000, () => {
  console.log('Servidor Express está funcionando na porta 3000...');
});

// Criação do cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

client.slashCommands = new Collection();
client.prefixCommands = new Collection();

// Carregar as APIs e handlers
require("./api.js")(client);
require("./Handler")(client);

// Processamento de erros não tratados (opcional)
// Para capturar promessas não tratadas
process.on('unhandledRejection', (reason, promise) => {
  console.log(`🚫 Erro detectado na promise não tratada:`, reason, promise);
});

// Para capturar exceções não tratadas (exceções de código)
process.on('uncaughtException', (error, origin) => {
  console.log(`🚫 Exceção não tratada detectada:`, error, origin);
});

// Login do bot
client.login(process.env.clientToken).then(() => {
  console.log(`✅ Bot logado com sucesso!`);
}).catch((err) => {
  console.log(`❌ Erro ao logar o bot: ${err}`);
});
