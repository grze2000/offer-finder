# Offer Finder
**Offer Finder** is a Discord bot that allows you to create for your server watch lists of links to some advertising websites. New offers are sent to a selected channel.

![](https://grzegorzbabiarz.com/public/img/offerFinder/offerFinder.jpg)

## How to use
You need to copy the link to the website with offers (with search results or some filters applied) and use command `!of add <url>` to add it to watch list.
Then informations about latest offers will be sent to the channel selected with `!of channel <channel>` command.
You can view watch list by using `!of list` command and remove link from watch list with `!of delete <id>` command.

## Supported advertising websites
* [otomoto.pl](https://otomoto.pl/)
* [mk-motors.com.pl](https://mk-motors.com.pl/)

## Used technologies
* Node.js
* Discord.js
* MongoDB
