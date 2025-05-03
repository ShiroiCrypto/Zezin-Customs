// => Status: Sistema de Informações no Console.
const client = require("../../index");
const Discord = require('discord.js');

client.on(`ready`, () => {
  console.clear()
  console.log(`
       ######  ##     ## #### ########   #######  #### 
      ##    ## ##     ##  ##  ##     ## ##     ##  ##  
      ##       ##     ##  ##  ##     ## ##     ##  ##     ✅  | Bot logado com Sucesso.
       ######  #########  ##  ########  ##     ##  ##     ✅  | guss.dev
            ## ##     ##  ##  ##   ##   ##     ##  ##     ✅  | Sistema atualizado V14
      ##    ## ##     ##  ##  ##    ##  ##     ##  ##  
       ######  ##     ## #### ##     ##  #######  ####  
`);
});

// => Client: Sistema de Status do Bot.

client.on("ready", () => {
  const messages = [
    `🔧 👑A melhor da oceania👑`, // Status 1
    `🧰 👑O melhor atendimento👑`, // Status 2
    `💙 👑Mecanica Customs👑`, // Status 3
  ]

  var position = 0;

  setInterval(() => client.user.setPresence({
    activities: [{
      name: `${messages[position++ % messages.length]}`,
      type: Discord.ActivityType.Streaming,
      url: 'https://www.twitch.tv/TwitchStatusServer'
    }]
  }), 1000 * 10);

  client.user.setStatus("online");
});