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
	nconf = require('nconf'),
	url = require('url'),
	irc = require('irc'),
	cheerio = require('cheerio')

EventEmitter = require('events').EventEmitter

/**
 * configuration
 */
nconf.argv().env()
nconf.file({file: 'config.json'})
nconf.defaults({
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
var client = new irc.Client(nconf.get('irc:address'), nconf.get('bot:nick'), {
	userName: nconf.get('bot:username'),
	realName: nconf.get('bot:realname') + ' (owner: ' + nconf.get('bot:owner') + ')',
	channels: nconf.get('bot:channels'),
	port: nconf.get('irc:port'),
	secure: nconf.get('irc:secure'),
	autoConnect: false,
	stripColors: true
})


var nickcheck = new RegExp('^' + nconf.get('bot:nick').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + '\\W+\\s*(.*)', 'i'),
	responsecb = function(origin, response){
		// check for mute
		if(bot.talk != false || origin.search(/^[&#\+\!]/i) == -1) {
			if(response == false) {
				client.action(origin, 'hiccups')
			} else {
				client.say(origin, response)
			}
		}
	},
	bot = yukari.construct(client, nconf.get('bot:commands')),
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
	if(nconf.get('bot:nickserv_pass')) {
		client.say('NickServ', 'identify ' + conf.get('bot:nickserv_pass'))
	}
})

/**
 * handle ctcp responses
 * - does not obey bot.talk for functionality purposes.
 */
client.addListener('ctcp', function (from, to, type, text) {
	console.log('CTCP ' + type + ': ' + from + '=>' + to + ' (' + type + ')')

	ctcp = type.toLowerCase()
	var cb = function(reply){
			if(reply != false) client.ctcp(from, ctcp.toUpperCase(), reply)
		},
		split = text.split(' ')

	if(ctcp == 'privmsg' && split.shift() == 'action') {
		//console.log('CTCP ' + type + ': ' + from + '=>' + to + ' (' + type + ')')
		bot.emit('action', responsecb, to, from, split)
	} else {
		//console.log('CTCP ' + type + ': ' + from + '=>' + to + ' (' + type + ')')
		bot.emit('ctcp.' + ctcp, cb, from, to, ctcp, text)
	}
})

/**
 * handle commands in our primary channel
 */
client.addListener('message#', function (nick, to, text) {
	var addr, split, command
	if(text.charAt(0) == nconf.get('bot:command')) {
		split = text.slice(1).split(' ')
		command = split.shift()
		if(bot.listeners('command.' + command).length == 0) {
			// invalid command!
			bot.emit.apply(bot, ['null.command', responsecb, to, nick, command].concat(split))
		} else {
			bot.emit.apply(bot, ['command.' + command, responsecb, to, nick].concat(split))
		}
	} else {
		// check for "addressed" commands
		if((addr = nickcheck.exec(text)) != null) {
			split = addr.slice(1).shift().split(' ')
			command = split.shift()
			// @todo special emit perhaps, because this was addressed?
			if(bot.listeners('command.' + command).length == 0) {
				// invalid command!
				bot.emit.apply(bot, ['null.command', responsecb, to, nick, command].concat(split))
			} else {
				bot.emit.apply(bot, ['command.' + command, responsecb, to, nick].concat(split))
			}
		} else {
			bot.emit('sniff', responsecb, to, nick, text)
		}
	}
})

/**
 * non-command eavesdropping...
 *
client.addListener('message#', function (nick, to, text) {
	if(text.charAt(0) != nconf.get('bot:command') && nickcheck.exec(text) == null) {
		bot.emit('sniff', responsecb, to, nick, text)
	}
})
 */

/**
 * runtime
 */
client.connect()
console.log('Starting up Yukari...')
