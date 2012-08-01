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

	cmds.forEach(function(val, key, ar) {
		console.log('loading module "' + val + '"')
		this.commands[val] = require('./command/' + val).construct(this)
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

module.exports = { construct:function(client, cmds) { return new yukari(client, cmds) } }
