const Discord = require("discord.js");
const client = new Discord.Client();
const configs = require("./configs.json");
const db = require("quick.db");
const ping = require("node-fetch");
const fs = require("fs");

const log = message => {
console.log(`${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./commands/", (err, files) => {
if(err) console.error(err);
log(`${files.length} komut yüklenecek.`);
files.forEach(f => {
let props = require(`./commands/${f}`);
log(`Yüklenen komut: ${props.help.name}.`);
client.commands.set(props.help.name, props);
props.conf.aliases.forEach(alias => {
client.aliases.set(alias, props.help.name);
});
});
});

client.reload = command => {
return new Promise((resolve, reject) => {
try {
delete require.cache[require.resolve(`./commands/${command}`)];
let cmd = require(`./commands/${command}`);
client.commands.delete(command);
client.aliases.forEach((cmd, alias) => {
if(cmd === command) client.aliases.delete(alias);
});
client.commands.set(command, cmd);
cmd.conf.aliases.forEach(alias => {
client.aliases.set(alias, cmd.help.name);
});
resolve();
} catch (e) {
reject(e);
}
});
};

client.load = command => {
return new Promise((resolve, reject) => {
try {
let cmd = require(`./commands/${command}`);
client.commands.set(command, cmd);
cmd.conf.aliases.forEach(alias => {
client.aliases.set(alias, cmd.help.name);
});
  resolve();
} catch (e) {
reject(e);
}
});
};

client.unload = command => {
return new Promise((resolve, reject) => {
try {
delete require.cache[require.resolve(`./commands/${command}`)];
let cmd = require(`./commands/${command}`);
client.commands.delete(command);
client.aliases.forEach((cmd, alias) => {
if(cmd === command) client.aliases.delete(alias);
});
resolve();
} catch (e) {
reject(e);
}
});
};

client.on('ready', () => {
console.log(`${client.user.username} ismiyle giriş yaptım!`);
client.user.setStatus('online');
client.user.setActivity(`${configs.prefix}help | ${configs.prefix}invite`, { type: 'PLAYING'})
})
  
client.on('message', async message => {
if(message.author.bot) return;
let prefix = configs.prefix
if(!message.content.startsWith(prefix)) return;
const args = message.content.slice(prefix.length).trim().split(/ +/g);
const command = args.shift().toLowerCase();
let params = message.content.split(' ').slice(1);
let perms = client.elevation(message);
let cmd;
if (client.commands.has(command)) {
cmd = client.commands.get(command);
} else if (client.aliases.has(command)) {
cmd = client.commands.get(client.aliases.get(command));
}
if(cmd){
cmd.run(client, message, args)
}
});

client.login(configs.token)