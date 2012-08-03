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
	conf = require('nconf'),
	url = require('url'),
	irc = require('irc'),
	//db = require('orm'),
	colors = irc.colors

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
		'primarychannel':'#yukari',
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
	channels: [conf.get('bot:primarychannel')],
	port: conf.get('irc:port'),
	secure: conf.get('irc:secure'),
	autoConnect: false,
	stripColors: true
})

var bot = yukari.construct(client, conf.get('bot:commands'))

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
	if(from) {
			console.log('NOTICE ' + from + ' => ' + to + ': ' + text)
	}
})


/**
 * identify with nickserv
 */
client.addListener('motd', function (motd) {
	console.log('-!- identifying to nickserv...')
	if(conf.get('bot:nickserv_pass')) {
		client.say('NickServ', 'identify ' + conf.get('bot:nickserv_pass'))

		// for sec reasons, nuke this from memory
		conf.set('bot:nickserv_pass', '')
	}
})

/**
 * handle ctcp responses
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
client.addListener('message' + conf.get('bot:primarychannel'), function (nick, text, message) {
	if(text.charAt(0) == conf.get('bot:command')) {
		var split = text.slice(1).split(' '),
			command = split.shift(),
			cb = function(message){
					if(message == false) {
						client.action(conf.get('bot:primarychannel'), 'hiccups')
					} else {
						client.say(conf.get('bot:primarychannel'), message)
					}
				}
		if(bot.listeners('command.' + command).length == 0) {
			// invalid command!
			//bot.emit.apply(bot, ['command..null', cb, nick, command].concat(split))
		} else {
			bot.emit.apply(bot, ['command.' + command, cb, nick].concat(split))
		}
	}
})

/**
 * non-command eavesdropping...
 */
client.addListener('message' + conf.get('bot:primarychannel'), function (nick, text) {
	if(text.charAt(0) != conf.get('bot:command')) {
		var cb = function(message){
				if(message == false) {
					client.action(conf.get('bot:primarychannel'), 'hiccups')
				} else {
					client.say(conf.get('bot:primarychannel'), message)
				}
			}

		bot.emit('sniff', cb, nick, text)
	}
})

/**
 * runtime
 */
client.connect()
console.log('Starting up Yukari...')
