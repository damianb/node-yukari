/**
 * Yukari IRC bot, node.js flavor
 */

/**
 * includes
 */
var yukari = require('./yukari'),

// magic load stuff, will be stuffed into yukari
	// node builtins
	http = require('http'),
	https = require('https'),

	// npm packages
	conf = require('nconf'),
	url = require('url'),
	irc = require('irc'),
	cheerio = require('cheerio')

EventEmitter = require('events').EventEmitter

/**
 * configuration
 */
conf.argv().env()
conf.file({file: 'config.json'})
conf.defaults({
	'bot':{
		'nick'			:'Yukari-chan',
		'username'		:'Yukari',
		'realname'		:'Yukari.js IRC bot',
		'owner'			:'unknown',
		'command'		:'!',
		'nickserv_pass'	:'',
		'channels':		[
			'#yukari'
		],
		'commands'		:[
			'core',
			'random',
			'to'
		]
	},
	'irc':{
		'address':'irc.oftc.net',
		'port':6667,
		'secure':false
	}
})

/**
 * Prep for connection
 */
var client = new irc.Client(conf.get('irc:address'), conf.get('bot:nick'), {
	userName: conf.get('bot:username'),
	realName: conf.get('bot:realname') + ' (owner: ' + conf.get('bot:owner') + ')',
	channels: conf.get('bot:channels'),
	port: conf.get('irc:port'),
	secure: conf.get('irc:secure'),
	autoConnect: false,
	stripColors: true
})


var nickcheck = new RegExp('^' + conf.get('bot:nick').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + '\\W+\\s*(.*)', 'i'),
	responsecb = function(origin, response){
		if(response == false) {
			client.action(origin, 'hiccups')
		} else {
			client.say(origin, response)
		}
	},
	bot = yukari.construct(client, conf.get('bot:commands')),
	libs = {
		http: http,
		https: https,
		conf: conf,
		url: url,
		irc: irc,
		colors: irc.colors,
		cheerio: cheerio
	}
for(var attrname in libs) bot.libs[attrname] = libs[attrname]

/**
 * display notices, messages, and pm's
 */
client.addListener('registered', function() {
	console.log('-!- connection established')
})
client.addListener('message#', function (from, to, text) {
	console.log('' + from + to + ': ' + text)
})
client.addListener('pm', function (nick, text) {
	console.log('  ' + nick + ': ' + text)
})
client.addListener('notice', function (from, to, text) {
	if(from) console.log('NOTICE ' + from + ' => ' + to + ': ' + text)
})


/**
 * identify with nickserv
 */
client.addListener('motd', function (motd) {
	console.log('-!- identifying to nickserv...')
	if(conf.get('bot:nickserv_pass')) {
		client.say('NickServ', 'identify ' + conf.get('bot:nickserv_pass'))
	}
})

/**
 * handle ctcp responses
 * - does not obey bot.talk for functionality purposes.
 */
client.addListener('ctcp', function (from, to, text, type) {
	console.log('CTCP ' + type + ': ' + from + '=>' + to + ' (' + text + ')')

	text = text.toLowerCase()
	var cb = function(reply){
			if(reply != false) client.ctcp(from, text.toUpperCase(), reply)
		}

	bot.emit('ctcp.' + text, cb, from, to, text, type)
})

/**
 * handle commands in our primary channel
 */
client.addListener('message#', function (nick, to, text) {
	if(bot.talk == true && text.charAt(0) == conf.get('bot:command')) {
		var split = text.slice(1).split(' '),
			command = split.shift()
		if(bot.listeners('command.' + command).length == 0) {
			// invalid command!
			bot.emit.apply(bot, ['null.command', responsecb, to, nick, command].concat(split))
		} else {
			bot.emit.apply(bot, ['command.' + command, responsecb, to, nick].concat(split))
		}
	} else {
		// check for "addressed" commands
		var addr = nickcheck.exec(text)
		if(addr != null) {
			var split = addr.slice(1).shift().split(' '),
				command = split.shift()
			// @todo special emit perhaps, because this was addressed?
			if(bot.listeners('command.' + command).length == 0) {
				// invalid command!
				bot.emit.apply(bot, ['null.command', responsecb, to, nick, command].concat(split))
			} else {
				bot.emit.apply(bot, ['command.' + command, responsecb, to, nick].concat(split))
			}
		}
	}
})

/**
 * non-command eavesdropping...
 */
client.addListener('message#', function (nick, to, text) {
	if(bot.talk == true && text.charAt(0) != conf.get('bot:command') && nickcheck.exec(text) == null) {
		bot.emit('sniff', responsecb, to, nick, text)
	}
})

/**
 * runtime
 */
client.connect()
console.log('Starting up Yukari...')
