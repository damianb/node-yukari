var _s = require('underscore.string')
var https = require('https')
var irc = require('irc')

var yukari = {}
yukari.version = function() {
	// makeshift version constant
	return '0.0.1'
}
yukari.grabYoutube = function(videoid, callback, error) {
	// https://gdata.youtube.com/feeds/api/videos/$videoid?v=2&alt=json
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
					var format = '[YouTube] <http://youtu.be/%s> "%s" [%d:%d] - %d views, %d likes, %d dislikes'
					callback(_s.sprintf(format,
						data['entry']['media$group']['yt$videoid']['$t'],
						data['entry']['title']['$t'],
						Math.round(data['entry']['media$group']['yt$duration']['seconds'] / 60),
						data['entry']['media$group']['yt$duration']['seconds'] % 60,
						Number(data['entry']['yt$statistics']['viewCount']),
						Number(data['entry']['yt$rating']['numLikes']),
						Number(data['entry']['yt$rating']['numDislikes'])
					))
				})
		})
		.on('error', function(e) {
			console.log('error fetching youtube video data from api: ' + e.message)
			callback(false)
		})
}
yukari.parseCommand = function(client, channel, victim, command, args) {
	switch(command) {
		case 'to':
			var split = args.split(' ', 3)
			if(split.length >= 2) {
				yukari.parseCommand(client, channel, split[1], split[0], split[2])
			} else {
				client.say(channel, victim + ': Need more arguments for that command')
			}
			break;
		case 'version':
			client.say(channel, victim + ': I am running Yukari.js IRC bot, version ' + yukari.version())
			break;
		case 'source':
			client.say(channel, victim + ': My source is available at <https://github.com/damianb/node-yukari>')
			break;
		case 'youtube':
			var videoid = false
			var params = (command.length > 1) ? url.parse(args,true) : false

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
						client.say(channel, ret.replace('[YouTube]', '[' + irc.colors.wrap('light_red', 'You') + irc.colors.wrap('white', 'Tube') + ']'))
					} else {
						client.action(channel, 'hiccups')
					}
				})
			}
			break;

		case 'die':
			client.say(channel, 'Bai!')
			console.log('-!- TERMINATING')
			client.disconnect('Yukari.js IRC bot - version ' + yukari.version())
			break;
		default:
			console.log('debug: unknown command "' + command + '"')
	}
}

module.exports = yukari
