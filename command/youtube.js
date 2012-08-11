var util = require('util'),
	https = require('https'),
	url = require('url'),
	irc = require('irc')

function command() {
	this.name = 'youtube'
	this.provides = [
		{
			command:	'youtube',
			help:		'provides various information about youtube videos on demand',
			longhelp:	''
		}
	]
}

command.prototype.init = function(yukari) {
	this.yukari = yukari
	this.load()
}

command.prototype.load = function() {
	this.yukari.on('command.youtube', this.procYoutube)
	this.yukari.on('sniff', this.procSniff)
	this.enabled = true
}

command.prototype.unload = function() {
	this.yukari.removeListener('command.youtube', this.procYoutube)
	this.yukari.removeListener('sniff', this.procSniff)
	this.enabled = false
}

command.prototype.extractVidID = function(uri) {
	var videoid = false,
		params = url.parse(uri ,true)

	if(params) {
		if(params['query']['v'] != null) {
			videoid = params['query']['v']
		} else if(params['hostname'] == 'youtu.be' && params['path'] != null) {
			videoid = params['path'].split('/')[1]
		}
	}

	return videoid
}

command.prototype.procYoutube = function(callback, origin, victim, video) {
	if(arguments.length < 2) return

	var videoid = c.extractVidID(video)
	if(!videoid) return

	c.grabYoutube(videoid, function(ret) {
		if(ret !== false) {
			callback(origin, victim + ': ' + ret.replace('[YouTube]', '[' + irc.colors.wrap('light_red', 'You') + irc.colors.wrap('white', 'Tube') + ']'))
		} else {
			callback(origin, false)
		}
	})
}

command.prototype.procSniff = function(callback, origin, victim, text) {
	youtube = text.match(/http:\/\/(?:(?:www\.)?youtube\.com|youtu\.be)(?:\/watch\?v=|\/)([\w\-\_]+)/ig)
	if(youtube == null) return

	// @todo check if this is blocking
	youtube.forEach(function(uri, key, ar) {
		var videoid = c.extractVidID(uri)
		if(videoid != false) {
			c.grabYoutube(videoid, function(ret) {
				if(ret !== false) {
					callback(origin, ret.replace('[YouTube]', '[' + irc.colors.wrap('light_red', 'You') + irc.colors.wrap('white', 'Tube') + ']'))
				} else {
					callback(origin, false)
				}
			})
		}
	})
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
						callback(util.format('[YouTube] <http://youtu.be/%s> "%s" [%d:%d] - %d views',
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
