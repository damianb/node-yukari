/**
 * Yukari IRC bot, node.js flavor
 */

/**
 * includes
 */
var yukari = require('./yukari'),

	// node builtins
	http = require('http'),
	https = require('https'),

	// npm packages
	_s = require('underscore.string'),
	nconf = require('nconf'),
	url = require('url'),
	irc = require('irc'),
	//db = require('orm'),
	colors = irc.colors

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
		'primarychannel':'#yukari',
		'commands'		:[
			'dice',
			'die'
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
	channels: [nconf.get('bot:primarychannel')],
	port: nconf.get('irc:port'),
	secure: nconf.get('irc:secure'),
	autoConnect: false,
	stripColors: true
})

var bot = yukari.construct(client, nconf.get('bot:commands'))

/**
 * display notices, messages, and pm's
 */
client.addListener('registered', function() {
	console.log('-!- connection established')
})
client.addListener('message#', function (from, to, text) {
	console.log(from + ' => ' + to + ': ' + text)
})
client.addListener('pm', function (nick, text) {
	console.log(nick + ' => ~: ' + text)
})
client.addListener('notice', function (from, to, text) {
	if(from) {
		console.log('NOTICE ' + from + ' => ' + to + ': ' + text)
	}
})

/**
 * handle ctcp responses
 */
client.addListener('ctcp', function (from, to, text, type) {
	console.log('CTCP ' + type + ': ' + from + ' (' + text + ')')

	text = text.toLowerCase()
	var cb = function(reply){
			if(reply != false) {
				client.ctcp(from, text.toUpperCase(), reply)
			}
		}

	if(text in bot.ctcp_hooked) {
		var stack = bot.ctcp_hooked[text]
		for(var module in stack) {
			console.log('debug: calling module (ctcp) ' + stack[module]) // @debug
			bot.commands[stack[module]].processCTCP.apply(bot.commands[stack[module]], [cb, from, to, text, type])
		}
	} else {
		// @todo - magic ctcp handling?
		console.log('Unknown CTCP "' + text + '" from ' + from)
	}
})

/**
 * identify with nickserv
 */
client.addListener('motd', function (motd) {
	console.log('-!- identifying to nickserv...')
	if(nconf.get('bot:nickserv_pass')) {
		client.say('NickServ', 'identify ' + nconf.get('bot:nickserv_pass'))

		// for sec reasons, nuke this from memory
		nconf.set('bot:nickserv_pass', '')
	}
})

/**
 * handle commands in our primary channel
 */
client.addListener('message' + nconf.get('bot:primarychannel'), function (nick, text, message) {
	if(text.charAt(0) == nconf.get('bot:command')) {
		var split = text.slice(1).split(' '),
			command = split.shift(),
			cb = function(message){
					if(message == false) {
						client.action(nconf.get('bot:primarychannel'), 'hiccups')
					} else {
						client.say(nconf.get('bot:primarychannel'), message)
					}
				}

		if(command in bot.message_hooked) {
			var stack = bot.message_hooked[command]
			for(var module in stack) {
				if(bot.commands[stack[module]].validateMessage.apply(bot.commands[stack[module]], [nick].concat(split))) {
					console.log('debug: calling module ' + stack[module]) // @debug
					bot.commands[stack[module]].processMessage.apply(bot.commands[stack[module]], [cb, nick].concat(split))
				}
			}
		} else {
			console.log('Unknown command "' + command + '"')
			// @todo - magic commands / factoids
		}
	}
})

/**
 * non-command eavesdropping...
 */
client.addListener('message' + nconf.get('bot:primarychannel'), function (nick, text) {
	if(text.charAt(0) != nconf.get('bot:command')) {
		var cb = function(message){
				if(message == false) {
					client.action(nconf.get('bot:primarychannel'), 'hiccups')
				} else {
					client.say(nconf.get('bot:primarychannel'), message)
				}
			}

		for(var i in bot.sniff_hooked) {
			var module = bot.sniff_hooked[i]
			console.log('debug: calling module (sniff) ' + bot.sniff_hooked[i]) // @debug
			bot.commands[module].processSniff.apply(bot.commands[module], [cb, nick, text])
		}
	}
})

/**
 * runtime
 */
client.connect()
