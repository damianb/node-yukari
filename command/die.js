var nconf = require('nconf')

function command(yukari) {
	this.yukari = yukari

	this.name = 'die'
	this.help = 'terminates the bot'
	this.longhelp = ''
}

command.prototype.register = function() {
	this.yukari.register('message', this.name, 'die')
}

command.prototype.validateMessage = function(victim) {
	return true
}

command.prototype.processMessage = function(callback, victim) {
	callback('Bai!')

	console.log('-!- TERMINATING')
	console.log(this)
	this.yukari.client.disconnect('Yukari.js IRC bot - version ' + this.yukari.version)
}

module.exports = {
	construct:function(yukari) {
		return new command(yukari)
	}
}
