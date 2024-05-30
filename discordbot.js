const { Client, GatewayIntentBits, REST, Partials, PartialGroupDMChannel, ChannelType, Routes, EmbedBuilder } = require('discord.js');
const { reminders } = require("./reminders.json");
const { todo } = require("./todo.json");
const { messages, commands } = require("./messages.json");
const { token, channelID, clientID } = require('./config.json');
const express = require("express");
const app = express();

const fs = require('fs');

let MESSAGE_INTERVAL = 5;


app.get("/", (req, res) => {
  res.send("Hello world");
})

app.listen(3000, () => {
  console.log("Discord bot hosting");
})
//Setting it here so it can be cleared later on
let interval;

const rest = new REST().setToken(token)


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,           
    GatewayIntentBits.GuildMessages,    
    GatewayIntentBits.MessageContent,   
    GatewayIntentBits.DirectMessages 
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.on('ready', (message) => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.content === commands.start.commandName) {
    message.author.send(`${message.author} ${messages.welcome}`)
    startSendingMessage(message)
    
  }else if (kmpSearch(commands.addReminder.commandName, message.content)) {
      const response = modifyReminderFile(message.content, "ADD");
      message.author.send(`${response}`,  {disable_notification: false})
    }
    else if (kmpSearch(commands.removeReminder.commandName, message.content)) {
      const response = modifyReminderFile(message.content, "DELETE");
      message.author.send(`${response}`,  {disable_notification: false})
    } else if (message.content === commands.listReminder.commandName) {
      const exampleEmbed = await createReminderEmbedded();
      message.author.send({ embeds: [exampleEmbed]});
    } else if (message.content === commands.help.commandName) {
      const values = Object.values(commands);
      const indexValues = values.map((item, index) => `${index}) ${item.commandName} - ${item.description}`);
      message.author.send(indexValues.join("\n"));
    } else if (kmpSearch(commands.setInterval.commandName, message.content)) {
      const interval = extractMessage(commands.setInterval.commandName, message.content);
      MESSAGE_INTERVAL = interval.trim()
      message.author.send(`Successfully set message interval to ${interval}`);
      startSendingMessage(message);
    } else if (message.content === commands.todo.commandName) {
      const list = beautifyList(todo);
      message.author.send(list)
    } else if (message.content === commands.stop.commandName) {
      clearInterval(interval)
      message.author.send(`Successfully stop the sending of message`);
    }
  });
  
  client.login(token);

function startSendingMessage(message) {
  clearInterval(interval);
  interval = setInterval(function() {
    message.author.send(`${message.author} ${reminders[randomNumber(reminders.length)]}`,  {disable_notification: false})
  }, MESSAGE_INTERVAL * 1000)
}

function beautifyList(list, messageFormat) {
  const mapList = list.map((item, index) => `${index}) ${item}`)

  return mapList.join("\n");
}

function randomNumber(max) {
    return Math.floor(Math.random() * max);
}

function kmpSearch(pattern, text) {
    if (pattern.length == 0)
      return 0; // Immediate match
  
    // Compute longest suffix-prefix table
    var lsp = [0]; // Base case
    for (var i = 1; i < pattern.length; i++) {
      var j = lsp[i - 1]; // Start by assuming we're extending the previous LSP
      while (j > 0 && pattern[i] !== pattern[j])
        j = lsp[j - 1];
      if (pattern[i] === pattern[j])
        j++;
      lsp.push(j);
    }
  
    // Walk through text string
    var j = 0; // Number of chars matched in pattern
    for (var i = 0; i < text.length; i++) {
      while (j > 0 && text[i] != pattern[j])
        j = lsp[j - 1]; // Fall back in the pattern
      if (text[i]  == pattern[j]) {
        j++; // Next char matched, increment position
        if (j == pattern.length)
          return i - (j - 1) === 0 ? true : false ;
      }
    }
    return false;
  }
  
  function extractMessage(command, message) {
    return message.replace(command, "");
  }
  
  function modifyReminderFile(reminder, operation) {
    const data = fs.readFileSync('./reminders.json', { encoding: 'utf8', flag: 'r'});
    
    let parsedJSON = JSON.parse(data);              
    if (operation == "ADD") {
                const newReminder = extractMessage(commands.addReminder.commandName, reminder);              
                if (!checkEmpty(newReminder)) parsedJSON.reminders.push(newReminder);
                else return "Cannot be empty!" 
                
              } else if (operation == "DELETE") {
                const newReminder = extractMessage(commands.removeReminder.commandName, reminder);              
                if (!checkEmpty(newReminder)) parsedJSON.reminders = parsedJSON.reminders.filter(items => items != newReminder);
                else return "Cannot be empty!"
              }

              const stringifyReminders = JSON.stringify(parsedJSON);
              fs.writeFileSync("./reminders.json", stringifyReminders, "utf8", (err) => {
                if (err) throw err;
              });

              if (operation == "ADD") return `Successfully written "${reminder}" into file!`;
              if (operation == "DELETE") return `Successfully deleted "${reminder}" from file!`;
  }
  

function checkEmpty(string) {
  return string == "";
}

  async function createReminderEmbedded() {
    const data = await fs.readFileSync('./reminders.json', { encoding: 'utf8', flag: 'r'});
    const reminderList = JSON.parse(data).reminders;
    const list = beautifyList(reminderList)
    const exampleEmbed = new EmbedBuilder()

    .setColor(0x0099FF)
    .setDescription(list);
    

  return exampleEmbed;
  }