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
	switch(text.toLowerCase()) {
		case 'version':
			var reply = 'Yukari.js IRC bot - version ' + yukari.version()
			console.log('CTCP REPLY VERSION: => ' + from + ' (' + reply + ')')
			client.ctcp(from, 'VERSION', reply)
			break;
		default:
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
		var split = text.slice(1).split(' ')
		var command = split.shift()
		if(command in yukari.message_hooked) {
			for(var c in yukari.message_hooked) {
				if(yukari.commands[yukari.message_hooked[command][c]].validate(command, split)) {
					yukari.commands[yukari.message_hooked[command][c]].process(
						function(message){
							if(message == false) {
								client.action(nconf.get('bot:primarychannel'), 'hiccups')
							} else {
								client.say(nconf.get('bot:primarychannel'), message)
							}
						},
						nick,
						command,
						split
					)
				}
			}
		}
		yukari.parseCommand(client, nconf.get('bot:primarychannel'), nick, command, split)
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
