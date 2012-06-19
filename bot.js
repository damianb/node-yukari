/**
 * Yukari IRC bot, node.js flavor
 *
 * requires:
 *  npm:
 *  	underscore.string
 *  	irc
 *  	orm (in the near-ish future?)
 */

/**
 * includes
 */
var _s = require('underscore.string'),
    irc = require('irc'),
    http = require('http'),
    https = require('https'),
    colors = irc.colors,
    yukari = require('./yukari'),
    url = require('url')

//var db = require('orm')

/*
_.str = require('underscore.string')
_.mixin(_.str.exports())
_.str.include('Underscore.string', 'string')
*/

/**
 * configuration
 */
var config = require('./config')

/**
 * Prep for connection
 */
var client = new irc.Client('irc.oftc.net', 'Yukari-chan', {
	userName: 'yukari',
	realName: 'Yukari IRC bot - node.js build',
	channels: [config.primary_channel],
	port: 6667,
	secure: false,
	autoConnect: false,
	stripColors: true
})
var start = Date.now()

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
		console.log('CTCP REPLY VERSION: => ' + from + ' (Yukari IRC bot - node.js build)')
		client.ctcp(from, 'VERSION', 'Yukari IRC bot - node.js build')
	}
})

/**
 * identify with nickserv
 */
client.addListener('motd', function (motd) {
	console.log('-!- identifying to nickserv...')
	client.say('NickServ', 'identify ' + config.nickserv_pass)
	nickserv_pass = ''
})

/**
 * handle commands in our primary channel
 */
client.addListener('message' + config.primary_channel, function (nick, text) {
	if(text.charAt(0) == config.command_sep) {
		console.log('debug: received command "' + text.slice(1) + '"')
		var command = text.slice(1).split(' ', 2)
		switch(command[0]) {
			case 'youtube':
				var videoid = false
				var params = url.parse(command[1],true)
				
				
				if(params['query']['v'] != null) {
					videoid = params['query']['v']
				}

				else if(params['hostname'] == 'youtu.be' && params['path'] != null) {
					videoid = params['path'].split('/')[1]
				}

				console.log(videoid)

				if(videoid != false) {
					yukari.grabYoutube(videoid, function(ret) {
						if(ret !== false) {
							client.say(config.primary_channel, ret.replace('[YouTube]', '[' + colors.wrap('light_red', 'You') + colors.wrap('white', 'Tube') + ']'))
						} else {
							client.action(config.primary_channel, 'hiccups')
						}
					})
				}

				break;

			case 'die':
				client.say(config.primary_channel, colors.wrap('light_red', 'Seppuku time.'))
				console.log('-!- TERMINATING')
				client.disconnect()
				break;
			default:
				console.log('debug: unknown command "' + command[0] + '"')
		}
	}
})

/**
 * runtime
 */
client.connect()
