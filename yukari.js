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
var _s = require('underscore.string')
var irc = require('irc')
var http = require('http')
var https = require('https')
var colors = irc.colors
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
				videoid = command[1]
				// https://gdata.youtube.com/feeds/api/videos/$videoid?v=2&alt=json
				// http://nodejs.org/docs/v0.6.12/api/http.html#http_http_get_options_callback
				var options = {
					host: 'gdata.youtube.com',
					path: '/feeds/api/videos/' + videoid + '?v=2&alt=json',
				};
				https
					.get(options, function(res) {
						var api_body = ''
						res.setEncoding('utf8')
						res
							.on('data', function(chunk) {
								api_body += chunk
							})
							.on('end', function() {
								var data = JSON.parse(api_body)
								var format = '[' + colors.wrap('light_red', 'You') + colors.wrap('white', 'Tube') + '] "%s" %d:%d [%d+/%d-]'
								client.say(config.primary_channel, _s.sprintf(format,
									data['entry']['title']['$t'],
									Math.round(data['entry']['media$group']['yt$duration']['seconds'] / 60),
									data['entry']['media$group']['yt$duration']['seconds'] % 60,
									Number(data['entry']['yt$rating']['numLikes']),
									Number(data['entry']['yt$rating']['numDislikes'])
								))
							})
					})
					.on('error', function(e) {
						console.log('error fetching youtube video data from api: ' + e.message)
						client.action(config.primary_channel, 'hiccups')
					})
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
