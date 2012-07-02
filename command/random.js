function cmd_random(yukari) {
	this.yukari = yukari

	this.name = 'random'
	this.help = 'returns a random number, guaranteed to be random as per RFC 1149.5' // http://xkcd.com/221/
	this.longhelp = ''
}

cmd_random.prototype.register = function() {
	this.yukari.register('message', this.name, 'random')
}

cmd_random.prototype.validateMessage = function(victim) {
	return true
}

cmd_random.prototype.processMessage = function(callback, victim) {
	callback(victim + ': 4')
}

module.exports = {
	construct:function(yukari) {
		return new cmd_random(yukari)
	}
}
