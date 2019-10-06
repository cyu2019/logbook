const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

var token = "";
var logbookChannelID = null;
var logbookChannel = null;
var interceptPinChannels = {};
var allowAllMembers = false;

function saveSettings() {
  logbookChannelID = logbookChannel? logbookChannel.id : null;
  fs.writeFileSync("./settings.json", JSON.stringify({token, logbookChannelID, interceptPinChannels, allowAllMembers}));
}
function logEmbed(msg) {
  var data = {
    'footer':{'text':new Date().toLocaleDateString()},
    'author':{'name':msg.author.username,'icon_url':msg.author.avatarURL},
    'description':msg.content,
    'color':0xe8c67d
  }
  if (msg.attachments.first()) {
    console.log(msg.attachments.first());
    data.image = {'url': msg.attachments.first().url}
  }
  console.log(data);
  return new Discord.RichEmbed(data);
}


if (!fs.existsSync("./settings.json")) {
  saveSettings();
  console.log("This is your first time running me! Put your bot token in the token field of settings.json.")
} else {
  var {token, logbookChannelID, interceptPinChannels, allowAllMembers} = JSON.parse(fs.readFileSync("settings.json"));
}


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  logbookChannel = client.channels.get(logbookChannelID);
});

client.setInterval(saveSettings, 1000 * 60 * 5);

var commands = {
  "!setlogbook": {
    "description":"(needs manage channels perm) Sets the logbook to the current channel. Logged messages will go here.",
    "action": function(msg){
      if (!msg.member.permissions.has("MANAGE_CHANNELS", true))
        return msg.channel.send("You don't have sufficient permissions.");
      logbookChannel = msg.channel;
      msg.channel.send("Logbook set.");
    }
  },
  "!watch": {
    "description": "(needs manage channels perm) Sets the current channel to be 'watched.' Pinning messages in this channel will be sent to the logbook instead of the regular pinned messages.",
    "action": function(msg) {
      if (!msg.member.permissions.has("MANAGE_CHANNELS", true))
        return msg.channel.send("You don't have sufficient permissions.");
      if (interceptPinChannels[msg.channel.id])
        return msg.channel.send("Already intercepting pins in this channel.");
      interceptPinChannels[msg.channel.id] = true;
      msg.channel.send("Now intercepting pins in this channel.")
    }
  },
  "!unwatch": {
    "description": "(needs manage channels perm) Reverts current channel to usual pinning functionality",
    "action": function(msg) {
      if (!msg.member.permissions.has("MANAGE_CHANNELS", true))
        return msg.channel.send("You don't have sufficient permissions.");
      if (!interceptPinChannels[msg.channel.id])
        return msg.channel.send("I wasn't intercepting pins in this channel.");
      delete interceptPinChannels[msg.channel.id];
      msg.channel.send("No longer intercepting pins in this channel.")
    }
  },
  "!save": {
    "description":"(needs manage channels perm) Saves your current settings (logbook channel, watched channels). This will run every five minutes anyway, so you probably don't need to run it.",
    "action": function(msg) {
      if (!msg.member.permissions.has("MANAGE_CHANNELS", true))
        return msg.channel.send("You don't have sufficient permissions.");
      saveSettings();
      msg.channel.send("Settings saved.");
    }
  },
  "!log ": {
    "description": "Takes in the id of a message in the current channel (turn on developer mode and right click -> 'Copy ID') and puts the message into the logbook. By default, you need manage channel perms to use this.",
    "action": function(msg) {
      if (!allowAllMembers && !msg.member.permissions.has("MANAGE_CHANNELS", true))
        return msg.channel.send("You don't have sufficient permissions. Ask an admin do !toggleEveryone");
      if (logbookChannel) {
        var id = msg.content.substring('!log '.length)
        msg.channel.fetchMessage(id).then(found => {
          if (found) {
            msg.channel.send("**Logged!**")
            logbookChannel.send(logEmbed(found));
          } else
            msg.channel.send("I couldn't find a message in this channel with that ID.");
        });
      } else {
        msg.channel.send("You haven't set a valid logbook channel!");
      }
    }
  },"!toggleEveryone": {
    "description":"(needs manage channels perm) Allows all members to use the !log command (by default they cannot). Use it once to enable, again to disable.",
    "action": function(msg) {
      if (!msg.member.permissions.has("MANAGE_CHANNELS", true))
        return msg.channel.send("You don't have sufficient permissions.");
      allowAllMembers = !allowAllMembers;
      msg.channel.send("All members can"+(allowAllMembers? "":"not") + " use the !log command.");
    }
  },
  "!help": {
    "description":"Displays a short description of each command.",
    "action": function(msg) {
      var msgStr = "```ini\n";
      for (command in commands) {
        msgStr += "[ "+ command + " ] - " + commands[command].description + "\n\n";
      }
      msgStr += "```"
      msg.channel.send(msgStr);
    }
  }

}

client.on('messageUpdate', (oldMsg, newMsg) => {
  if (!interceptPinChannels[newMsg.channel.id])
    return;

  if (!oldMsg.pinned && newMsg.pinned) {
    if (logbookChannel) {
      newMsg.unpin();
      newMsg.channel.send("Intercepting pin: **Logged!**");
      logbookChannel.send(logEmbed(newMsg));
    } else
      newMsg.channel.send("Pin not intercepted: You haven't set a valid logbook channel!");
  }
});

client.on('message', msg => {
  if (msg.author.bot)
    return;

  for (command in commands) {
    if (msg.content.startsWith(command)) {
      return commands[command].action(msg);
    }
  }
});

client.login(token);
