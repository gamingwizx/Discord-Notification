const { Client, GatewayIntentBits } = require('discord.js');
const { messages } = require("./reminders.json");
const { token } = require('./config.json');

const channel = '931361329531473930';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,            // Allow intent for guild events
        GatewayIntentBits.GuildMessages,     // Allow intent for guild message events
        GatewayIntentBits.MessageContent,    // Allow intent for message content (required for reading messages)
        // Other intents can be added as needed
    ]
});

client.on('ready', (message) => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    if (message.content === 'motivation') {
       interval = setInterval(function() {
        message.author.send(`${message.author} ${messages[randomNumber(messages.length)]}`,  {disable_notification: false})
       }, 1000);
    }
});

client.login(token);

function randomNumber(max) {
    return Math.floor(Math.random() * max);
}