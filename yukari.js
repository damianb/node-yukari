var _s = require('underscore.string'),
	https = require('https'),
	irc = require('irc'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter

util.inherits(yukari, EventEmitter)

function yukari(client, cmds) {
	this.version = '0.0.4'
	this.client = client
	this.commands = {}
	//this.ctcp_hooked = {}
	//this.message_hooked = {}
	//this.sniff_hooked = []

	cmds.forEach(function(val, key, ar) {
		console.log('loading module "' + value + '"')
		this.commands[value] = require('./command/' + value).construct(this)
	})
}

yukari.prototype.register = function(type, name, sub) {
	switch(type) {
		case 'ctcp':
			if(this.ctcp_hooked[sub] == undefined) {
				this.ctcp_hooked[sub] = []
			}
			this.ctcp_hooked[sub].push(name)
			break;
		case 'message':
			if(this.message_hooked[sub] == undefined) {
				this.message_hooked[sub] = [];
			}
			this.message_hooked[sub].push(name)
			break;
		case 'sniff':
			this.sniff_hooked.push(name)
			break;
	}
}
yukari.prototype.grabYoutube = function(videoid, callback) {
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
					var format = '[YouTube] <http://youtu.be/%s> "%s" [%d:%d] - %d views'
					callback(_s.sprintf(format,
						data['entry']['media$group']['yt$videoid']['$t'],
						data['entry']['title']['$t'],
						Math.round(data['entry']['media$group']['yt$duration']['seconds'] / 60),
						data['entry']['media$group']['yt$duration']['seconds'] % 60,
						Number(data['entry']['yt$statistics']['viewCount'])
					))
				})
		})
		.on('error', function(e) {
			console.log('error fetching youtube video data from api: ' + e.message)
			callback(false)
		})
}

/*
yukari.rollDice = function(number, sides, additional, rest) {
	var roll = 0
	var rolls = []
	for(i = 0; i < number; i++) {
		var t = 0
		if(sides >= 1) {
			t = Math.floor(Math.random() * sides) + 1
			rolls.push(t)
			roll += t
		}
	}
	if(additional) {
		roll += additional
		return number + 'd' + sides + (rest ? ' ' + rest : '') + ', got [' + rolls.join(',') + ']' + ((additional > 0) ? ' +' : ' -') + ' ' + additional + ' totaling ' + roll
	}

	return number + 'd' + sides + (rest ? ' ' + rest : '') + ', got [' + rolls.join(',') + '] totaling ' + roll
}

yukari.parseCommand = function(client, channel, victim, command, args) {
	switch(command) {
		case 'to':
			var split = args.split(' ')
			if(split.length > 1) {
				var nvictim = split.shift(),
					ncommand = split.shift(),
					nargs = split.join(' ')
				yukari.parseCommand(client, channel, nvictim, ncommand, nargs)
			} else {
				client.say(channel, victim + ': Need more arguments for that command')
			}
			break;
		case 'coin':
			client.say(channel, victim + ': ' + (Math.round(Math.random()) ? 'heads' : 'tails'))
			break;
		case 'random':
			client.say(channel, victim + ': 4') // http://xkcd.com/221/
			break;
		case 'roll':
			var match = args.match(/(\d+)\s*d\s*(\d+)(\s*[-+]\s*\d+)?(.*)/i)
			if(match != null || match.length < 2) {
				var number, sides, additional, rest

				match.shift()
				number = match.shift()
				sides = match.shift()
				if(match.length > 0) {
					additional = match.shift()
				}
				if(match.length > 0) {
					rest = _s.trim(match.join(''))
				}

				if(additional) {
					additional = _s.trim(additional).replace(' ', '')
					if(additional.charAt(0) == '-') {
						additional = parseInt(additional) * -1
					} else {
						additional = parseInt(additional)
					}
				}

				client.say(channel, victim + ' rolls ' + yukari.rollDice(number, sides, additional, rest))
			} else {
				client.action(channel, 'hiccups')
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
			// at some point, fall back to magic commands?
			client.action(channel, 'hiccups')
			console.log('debug: unknown command "' + command + '"')
	}
}
*/

module.exports = { construct:function(client, cmds) { return new yukari(client, cmds) } }
