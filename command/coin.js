function command(yukari) {
	this.yukari = yukari

	this.name = 'coin'
	this.help = 'flips a coin, guaranteed to possibly be random'
	this.longhelp = ''

	this.load()
}

command.prototype.load = function() {
	this.yukari.on('command.coin', this.processMessage)
	this.enabled = true
}

command.prototype.unload = function() {
	this.yukari.removeListener('command.coin', this.processMessage)
	this.enabled = false
}

command.prototype.validateMessage = function(victim) {
	return true
}

command.prototype.processMessage = function(callback, victim) {
	if(!this.validateMessage(victim)) return

	callback(victim + ': ' + (Math.round(Math.random()) ? 'heads' : 'tails'))
}

module.exports = {
	construct:function(yukari) {
		return new command(yukari)
	}
}
