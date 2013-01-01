/**
 * Yukari IRC bot, node.js flavor
 */

/**
 * includes
 */
	// node builtins
var http = require('http'),
	https = require('https'),
	fs = require('fs'),

	// npm packages
	nconf = require('nconf'),
	url = require('url'),
	irc = require('irc'),
	util = require('util'),
	cheerio = require('cheerio'),
	sqlite = require('sqlite3'),
	async = require('async'),
	db = new sqlite.Database('yukari.db', function(err) {
		if(err) throw new Error(err)
	})

// @todo see if this is still needed
EventEmitter = require('events').EventEmitter

var yukari = {
	c: {
		rr:{
			chamber: Math.floor(Math.random()*7),
			rounds: 'dummy',
		}
	},
	version: '0.3.2',
	talk: true,
	start: new Date(),
}

/**
 * configuration
 */
console.log('-!- loading configuration')
nconf.argv().env()
nconf.file({file: 'config.json'})
nconf.defaults({
	'bot':{
		'nick'			:'Yukari',
		'username'		:'Yukari',
		'realname'		:'Yukari.js IRC bot',
		'owner'			:'unknown',
		'command'		:'!',
		'nickserv_pass'	:'',
		'channels':		[
			'#yukari'
		]
	},
	'irc':{
		'address'		:'irc.oftc.net',
		'port'			:6667,
		'password'		:null,
		'secure'		:false
	}
})

console.log('-!- preparing database')
fs.readFileSync('./yukari.sql')
db.serialize(function() {
	var dbOut = function(line) {
		db.exec(line, function(err) { if(err) { console.log('ee: ' + err) } /*console.log('  : ' + line)*/ })
	}
	fs.readFileSync('./yukari.sql').toString().split(';\n').forEach(function(line){
		if(!line.match(/^\s*$/)) {
			dbOut(line)
		}
	})
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
	password: nconf.get('irc:password'),
	autoConnect: false,
	stripColors: true
})

var nickcheck = new RegExp('^' + nconf.get('bot:nick').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + '\\W+\\s*(.*)', 'i'),
	sayResponse = function(origin, response) {
		// check for mute
		if(yukari.talk != false || origin.search(/^[&#\+\!]/i) == -1) {
			if(response == false) {
				client.action(origin, 'hiccups')
			} else {
				client.say(origin, response)
			}
		}
	},
	extractVidID = function(uri) {
		var videoid = false, params = url.parse(uri ,true)

		if(params) {
			if(params['query']['v'] != null) {
				videoid = params['query']['v']
			} else if(params['hostname'] == 'youtu.be' && params['path'] != null) {
				videoid = params['path'].split('/')[1]
			}
		}

		return videoid
	},
	getTimespan = function (n) {
		var dtm = new Date()
		dtm.setTime(n)
		var
			h = "000" + Math.floor(n / 3600000),
			m = "0" + dtm.getMinutes(),
			s = "0" + dtm.getSeconds(),
			cs = "0" + Math.round(dtm.getMilliseconds() / 10)
		return h.substr(h.length-4) + ":" + m.substr(m.length-2) + ":" + s.substr(s.length-2) + "." + cs.substr(cs.length-2)
	}




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
 *
client.addListener('motd', function (motd) {
	console.log('-!- identifying to nickserv...')
	if(nconf.get('bot:nickserv_pass')) {
		client.say('NickServ', 'identify ' + conf.get('bot:nickserv_pass'))
	}
})
 */

/**
 * handle ctcp responses
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
		client.emit('yukari.action', sayResponse, to, from, split)
	} else {
		//console.log('CTCP ' + type + ': ' + from + '=>' + to + ' (' + type + ')')
		client.emit('yukari.ctcp.' + ctcp, cb, from, to, ctcp, text)
	}
})

/**
 * handle commands in our primary channel
 */
client.addListener('message#', function (nick, origin, text) {
	var addr, split, command
	try {
		if(text.charAt(0) == nconf.get('bot:command')) {
			split = text.slice(1).split(' ')
			command = split.shift().toLowerCase()

			if(client.listeners('yukari.command.' + command).length == 0) {
				// invalid command!
				client.emit.apply(client, ['yukari.null-command', sayResponse, origin, nick, command].concat(split))
			} else {
				client.emit.apply(client, ['yukari.command.' + command, sayResponse, origin, nick].concat(split))
			}
		} else {
			// check for "addressed" commands
			if((addr = nickcheck.exec(text)) != null) {
				split = addr.slice(1).shift().split(' ')
				command = split.shift()
				// @todo special emit perhaps, because this was addressed?
				if(client.listeners('yukari.command.' + command).length == 0) {
					// invalid command!
					client.emit.apply(client, ['yukari.null-command', sayResponse, origin, nick, command].concat(split))
				} else {
					client.emit.apply(client, ['yukari.command.' + command, sayResponse, origin, nick].concat(split))
				}
			} else {
				client.emit('yukari.sniff', sayResponse, origin, nick, text)
			}
		}
	} catch(e) {
		client.action(origin, 'chokes, collapsing in a pile on the ground')
		throw e
	}

})
client.alias = function(alias, listener) {
	var self = this
	if(util.isArray(alias)) {
		alias.forEach(function(a) { self.addListener('yukari.command.' + a, listener) })
	} else {
		self.addListener('yukari.command.' + alias, listener)
	}
	return this
}
client.addListener('yukari.null-command', function(callback, origin, victim, command) {
	console.log('unknown command "%s"', command)
})

/**
 * custom commands (not in own file because i'm just that fucking lazy)
 */
client
	.alias(['die', 'dai'], function(callback, origin, victim) {
		// @todo authorization check

		callback(origin, 'Bai!')
		console.log('-!- TERMINATING')
		client.disconnect('Yukari.js IRC bot - version ' + yukari.version)
		process.exit(0)
	})
	.alias('source', function(callback, origin, victim) {
		callback(origin, victim + ': My source is available at <https://github.com/damianb/node-yukari>')
	})
	.alias('owner', function(callback, origin, victim) {
		callback(origin, victim + ': My owner is ' + nconf.get('bot:owner'))
	})
	.alias('version', function(callback, origin, victim) {
		callback(origin, victim + ': I am running Yukari.js IRC bot, version ' + yukari.version)
	})
	.alias('uptime', function(callback, origin, victim) {
		//Convert duration from milliseconds to 0000:00:00.00 format
		callback(origin, "Yukari.js uptime: " + getTimespan((new Date().getTime()) - (yukari.start.getTime())))
	})
	.alias('to', function(callback, origin, victim, recipient) {
		if(arguments.length < 4)
			return

		args = Array.prototype.slice.call(arguments, 3)
		console.dir(args)
		target = arguments[3]
		command = arguments[4]
		console.log(target)
		if(client.listeners('yukari.command.' + command).length == 0) {
			callback(origin, victim + ': invalid command "' + command + '"')
			return
		}

		client.emit.apply(client, ['yukari.command.' + command, callback, origin].concat(args))
	})
	.alias('pi', function(callback, origin, victim) {
		// need to throttle
		if(yukari.c.piThrottle !== undefined && yukari.c.piThrottle !== null && (new Date().getTime() - yukari.c.piThrottle.getTime()) < (1.5 * 1000)) { // 1.5 sec throttle?
			callback(victim + ': NOPE! Throttled.') // bleh
			return
		}
		try {
			http
				.get({ host: 'hoopycat.com', path: '/cgi-bin/random-pi-point.py', }, function(res) {
					var api_body = ''
					res.setEncoding('utf8')
					res
						.on('data', function(chunk) { api_body += chunk })
						.on('end', function() {
							yukari.c.piThrottle = new Date()
							callback(origin, victim + ': ' + cheerio.load(api_body)('title').text())
						})
				})
				.on('error', function(e) {
					console.log('error fetching pi data: ' + e.message)
					callback(false)
				})
		} catch (err) {
			console.log('error: pi fetch error: ' + err)
			callback(false)
		}
	})
	.alias('status', function(callback, origin, victim) {
		callback(origin, victim + ': Still connected and running, haven\'t crashed y')
	})
	.alias('rimshot', function(callback, origin, victim) {
		callback(origin, victim + ': http://instantrimshot.com/classic/?sound=rimshot')
	})
	.alias(['random', 'rnd'], function(callback, origin, victim) {
		callback(origin, victim + ': 4')
	})
	.alias(['coin', 'flip'], function(callback, origin, victim) {
		callback(origin, victim + ': ' + (Math.round(Math.random()) ? 'heads' : 'tails'))
	})
	.alias('help', function(callback, origin, victim) {
		var response = victim + ': '
		switch(victim.toLowerCase()) {
			case 'katana__':
			case 'katanac':
				response += ':3'
			break
			default:
				response += 'please insert $0.50 to continue'
		}
		callback(origin, response)
	})
	.alias('rr', function(callback, origin, victim, mode) {
		if(mode !== undefined) {
			if(mode == 'live') {
				yukari.c.rr.rounds = 'live'
				callback(origin, victim + ': live rounds loaded')
			} else {
				yukari.c.rr.rounds = 'dummy'
				callback(origin, victim + ': dummy rounds loaded')
			}
		} else {
			var shot = false
			yukari.c.rr.chamber--
			if(yukari.c.rr.chamber <= 1) {
				// ded.
				if(true) {
					client.send('KICK', origin, victim, 'BANG')
				} else {
					callback(origin, victim + ': *BANG!*')
				}
				yukari.c.rr.chamber = Math.floor(Math.random()*7)
				callback(origin, '*reloads and spins the barrel*')
			} else {
				callback(origin, victim + ': *click*')
			}
		}
	})

/**
 * Youtube!
 */
grabYoutube = function(videoid, callback) {
	// https://gdata.youtube.com/feeds/api/videos/$videoid?v=2&alt=json
	var options = { host: 'gdata.youtube.com', path: '/feeds/api/videos/' + videoid + '?v=2&alt=json', }
	try {
		https
			.get(options, function(res) {
				var api_body = ''
				res.setEncoding('utf8')
				res
					.on('data', function(chunk) { api_body += chunk })
					.on('end', function() {
						var data = JSON.parse(api_body),
							time = Math.floor(data['entry']['media$group']['yt$duration']['seconds'] / 60) + ':',
							seconds = data['entry']['media$group']['yt$duration']['seconds'] % 60
						time += ((seconds <= 9) ? '0' + seconds.toString() : seconds)
						callback(util.format('[YouTube] <http://youtu.be/%s> "%s" [%s] - %d views',
							data['entry']['media$group']['yt$videoid']['$t'],
							data['entry']['title']['$t'],
							time,
							Number(data['entry']['yt$statistics']['viewCount'])
						))
					})
			})
			.on('error', function(e) {
				console.log('error fetching youtube video data from api: ' + e.message)
				callback(false)
			})
	} catch (err) {
		console.log('error: youtube fetch error: ' + err)
		callback(false)
	}
}
client
	.alias('youtube', function(callback, origin, victim, video) {
		if(arguments.length < 4)
			return

		var videoid = extractVidID(video)
		if(!videoid)
			return

		grabYoutube(videoid, function(ret) {
			if(ret !== false) {
				callback(origin, victim + ': ' + ret.replace('[YouTube]', '[' + irc.colors.wrap('light_red', 'You') + irc.colors.wrap('white', 'Tube') + ']'))
			} else {
				callback(origin, false)
			}
		})
	})
client.addListener('yukari.sniff', function(callback, origin, victim, text) {
	process.nextTick(function() {
		youtube = text.match(/http:\/\/(?:(?:www\.)?youtube\.com|youtu\.be)(?:\/watch\?v=|\/)([\w\-\_]+)/ig)
		if(youtube == null)
			return

		youtube.forEach(function(uri, key, ar) {
			var videoid = extractVidID(uri)
			if(videoid != false) {
				grabYoutube(videoid, function(ret) {
					if(ret !== false) {
						callback(origin, ret.replace('[YouTube]', '[' + irc.colors.wrap('light_red', 'You') + irc.colors.wrap('white', 'Tube') + ']'))
					} else {
						callback(origin, false)
					}
				})
			}
		})
	})
})


/**
 * runtime
 */
client.connect()
console.log('-!- Starting up Yukari...')
