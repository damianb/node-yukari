var nconf = require('nconf')

function cmd_die(yukari) {
	this.yukari = yukari

	this.name = 'die'
	this.help = 'terminates the bot'
	this.longhelp = ''
}

cmd_die.prototype.register = function() {
	this.yukari.register('message', this.name, 'die')
}

cmd_die.prototype.validateMessage = function(victim) {
	return true
}

cmd_die.prototype.processMessage = function(callback, victim) {
	callback('Bai!')

	console.log('-!- TERMINATING')
	console.log(this)
	this.yukari.client.disconnect('Yukari.js IRC bot - version ' + this.yukari.version)
}

module.exports = {
	construct:function(yukari) {
		return new cmd_die(yukari)
	}
}
