# Logbook

A program originally written by [@wrxruo](https://github.com/wrxruo) in discord.py, ported to [discord.js](https://discord.js.org/#/)  with added functionality.

The logbook is a program that was written when 50 pins for stupid messages just wasn't enough. This bot will intercept message pins and post them to a special designated logbook channel. Members without pin permissions can use a command to log instead, if allowed.

To run:

(You're going to have to have node / npm installed)

1. `npm install`
This installs the necessary packages.

2. `node main` This will generate a settings.json file which you should put your token into.

3. `node main` Do it again to actually run the bot.

Commands:

```
[ !setlogbook ] - (needs manage channels perm) Sets the logbook to the current channel. Logged messages will go here.

[ !watch ] - (needs manage channels perm) Sets the current channel to be 'watched.' Pinning messages in this channel will be sent to the logbook instead of the regular pinned messages.

[ !unwatch ] - (needs manage channels perm) Reverts current channel to usual pinning functionality

[ !save ] - (needs manage channels perm) Saves your current settings (logbook channel, watched channels). This will run every five minutes anyway, so you probably don't need to run it.

[ !log  ] - Takes in the id of a message in the current channel (turn on developer mode and right click -> 'Copy ID') and puts the message into the logbook. By default, you need manage channel perms to use this.

[ !toggleEveryone ] - (needs manage channels perm) Allows all members to use the !log command (by default they cannot). Use it once to enable, again to disable.

[ !say ] - Make your logbook bot say something stupid.

[ !help ] - Displays a short description of each command.
```
