function command(yukari) {
	this.yukari = yukari

	this.name = 'coin'
	this.help = 'flips a coin, guaranteed to possibly be random'
	this.longhelp = ''
}

command.prototype.register = function() {
	this.yukari.register('message', this.name, 'coins')
}

command.prototype.validateMessage = function(victim) {
	return true
}

command.prototype.processMessage = function(callback, victim) {
	callback(victim + ': ' + (Math.round(Math.random()) ? 'heads' : 'tails'))
}

module.exports = {
	construct:function(yukari) {
		return new command(yukari)
	}
}
