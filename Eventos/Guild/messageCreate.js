const client = require("../../index");
const { prefix } = require("../../Config.json");
client.on("messageCreate", message =>{
  if(message.author.bot || !message.guild || !message.content.startsWith(prefix)) return;

  const [comando, ...args] = message.content.slice(prefix.length).trim().split(/ +/)

  const cmd = client.prefixCommands.get(comando)

  if(!cmd) return message.reply(`Calma ae, esse comando não existe.`)
  
  cmd.run(client, message, args)
})