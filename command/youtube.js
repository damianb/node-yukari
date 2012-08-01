var _s = require('underscore.string')
var https = require('https')
var irc = require('irc')
var url = require('url')

function command() {
	this.name = 'youtube'
	this.help = 'provides various information about youtube videos on demand'
	this.longhelp = ''
}

command.prototype.init = function(yukari) {
	this.yukari = yukari
	this.load()
}

command.prototype.load = function() {
	this.yukari.on('command.youtube', this.processMessage)
	this.yukari.on('sniff', this.processSniff)
	this.enabled = true
}

command.prototype.unload = function() {
	this.yukari.removeListener('command.youtube', this.processMessage)
	this.yukari.removeListener('sniff', this.processSniff)
	this.enabled = false
}

command.prototype.validateMessage = function(victim, video) {
	if(arguments.length < 2) {
		// at some point, need to add a way to tell the sender to hang up and try again...
		return false
	}

	var videoid = false,
		params = url.parse(video ,true)

	if(params) {
		if(params['query']['v'] != null) {
			videoid = params['query']['v']
		} else if(params['hostname'] == 'youtu.be' && params['path'] != null) {
			videoid = params['path'].split('/')[1]
		}
	}

	return (this.videoid != false) ? true : false
}

command.prototype.processMessage = function(callback, victim, video) {
	if(!c.validateMessage(victim)) return

	c.grabYoutube(c.videoid, function(ret) {
		if(ret !== false) {
			callback(victim + ': ' + ret.replace('[YouTube]', '[' + irc.colors.wrap('light_red', 'You') + irc.colors.wrap('white', 'Tube') + ']'))
		} else {
			callback(false)
		}
	})
}

command.prototype.processSniff = function(callback, victim, text) {
	youtube = text.match(/http:\/\/(?:(?:www\.)?youtube\.com|youtu\.be)(?:\/watch\?v=|\/)([\w\-\_]+)/ig)
	if(youtube == null) return

	for(i in youtube) {
		var videoid = false
		var params = url.parse(youtube[i],true)
		if(params['query']['v'] != null) {
			videoid = params['query']['v']
		} else if(params['hostname'] == 'youtu.be' && params['path'] != null) {
			videoid = params['path'].split('/')[1]
		}

		if(videoid != false) {
				c.grabYoutube(videoid, function(ret) {
				if(ret !== false) {
					callback(ret.replace('[YouTube]', '[' + irc.colors.wrap('light_red', 'You') + irc.colors.wrap('white', 'Tube') + ']'))
				} else {
					callback(false)
				}
			})
		}
	}
}

command.prototype.grabYoutube = function(videoid, callback) {
	// https://gdata.youtube.com/feeds/api/videos/$videoid?v=2&alt=json
	var options = {
		host: 'gdata.youtube.com',
		path: '/feeds/api/videos/' + videoid + '?v=2&alt=json',
	};
	try {
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
	} catch (err) {
		console.log('error: youtube fetch error: ' + err)
		callback(false)
	}
}

var c = module.exports = new command()
