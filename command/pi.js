var cheerio = require('cheerio'),
	http = require('http')

function command() {
	this.name = 'pi'
	this.provides = [
		{
			command:	'pi',
			help:		'does pi things',
			longhelp:	''
		}
	]
	this.throttle = null
}

command.prototype.init = function(yukari) {
	this.yukari = yukari
	this.load()
}

command.prototype.load = function() {
	this.yukari.on('command.pi', this.procPi)
	this.enabled = true
}

command.prototype.unload = function() {
	this.yukari.removeListener('command.pi', this.procPi)
	this.enabled = false
}

command.prototype.procPi = function(callback, origin, victim) {
	// need to throttle
	if(c.throttle != null && (new Date().getTime() - c.throttle.getTime()) < 1000) {
		callback(victim + ': NOPE! Throttled.') // bleh
		return
	}

	var options = {
		host: 'hoopycat.com',
		path: '/cgi-bin/random-pi-point.py',
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
						$ = cheerio.load(api_body)
						c.throttle = new Date()
						callback(origin, victim + ': ' + $('title').text())
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
}

var c = module.exports = new command()
