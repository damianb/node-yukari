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
		'primarychannel':'#yukari'
	},
	'irc':{
		'address':'irc.oftc.net',
		'port':6667,
		'secure':false,
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

client.addListener('registered', function() {
	console.log('-!- connection established')
})

/**
 * display notices, messages, and pm's
 */
client.addListener('message#', function (from, to, text) {
	console.log(from + ' => ' + to + ': ' + text)
})
client.addListener('notice', function (from, to, text) {
	if(from) {
		console.log('NOTICE ' + from + ' => ' + to + ': ' + text)
	}
})
client.addListener('pm', function (nick, text) {
	console.log(nick + ' => ~: ' + text)
})

/**
 * handle ctcp responses
 */
client.addListener('ctcp', function (from, to, text, type) {
	console.log('CTCP ' + type + ': ' + from + ' (' + text + ')')
	if(text == 'VERSION') {
		var reply = 'Yukari.js IRC bot - version ' + yukari.version()
		console.log('CTCP REPLY VERSION: => ' + from + ' (' + reply + ')')
		client.ctcp(from, 'VERSION', reply)
	}
})

/**
 * identify with nickserv
 */
client.addListener('motd', function (motd) {
	console.log('-!- identifying to nickserv...')
	if(nconf.get('bot:nickserv_pass')) {
		client.say('NickServ', 'identify ' + nconf.get('bot:nickserv_pass'))
		nconf.set('bot:nickserv_pass', '')
		// for sec reasons, nuke this from memory
	}
})

/**
 * handle commands in our primary channel
 */
client.addListener('message' + nconf.get('bot:primarychannel'), function (nick, text) {
	if(text.charAt(0) == nconf.get('bot:command')) {
		console.log('debug: received command "' + text.slice(1) + '"')
		var command = text.slice(1).split(' ', 2)
		switch(command[0]) {
			case 'youtube':
				var videoid = false
				var params = (command.length > 1) ? url.parse(command[1],true) : false

				if(params) {
					if(params['query']['v'] != null) {
						videoid = params['query']['v']
					} else if(params['hostname'] == 'youtu.be' && params['path'] != null) {
						videoid = params['path'].split('/')[1]
					}
				}

				if(videoid != false) {
					yukari.grabYoutube(videoid, function(ret) {
						if(ret !== false) {
							client.say(nconf.get('bot:primarychannel'), ret.replace('[YouTube]', '[' + irc.colors.wrap('light_red', 'You') + irc.colors.wrap('white', 'Tube') + ']'))
						} else {
							client.action(nconf.get('bot:primarychannel'), 'hiccups')
						}
					})
				}
				break;

			case 'die':
				client.say(nconf.get('bot:primarychannel'), 'Bai!')
				console.log('-!- TERMINATING')
				client.disconnect('Yukari.js IRC bot - version ' + yukari.version())
				break;
			default:
				console.log('debug: unknown command "' + command[0] + '"')
		}
	}
})
/**
 * YouTube URI Eavesdropping
 */
client.addListener('message' + nconf.get('bot:primarychannel'), function (nick, text) {
	youtube = text.match(/http:\/\/(?:(?:www\.)?youtube\.com|youtu\.be)(?:\/watch\?v=|\/)([\w\-\_]+)/ig)
	if(youtube != null) {
		for(i in youtube) {
			var videoid = false
			var params = url.parse(youtube[i],true)
			if(params['query']['v'] != null) {
				videoid = params['query']['v']
			} else if(params['hostname'] == 'youtu.be' && params['path'] != null) {
				videoid = params['path'].split('/')[1]
			}

			if(videoid != false) {
					yukari.grabYoutube(videoid, function(ret) {
					if(ret !== false) {
						client.say(nconf.get('bot:primarychannel'), ret.replace('[YouTube]', '[' + irc.colors.wrap('light_red', 'You') + irc.colors.wrap('white', 'Tube') + ']'))
					} else {
						client.action(nconf.get('bot:primarychannel'), 'hiccups')
					}
				})
			}
		}
	}
})

/**
 * runtime
 */
client.connect()
