function command(yukari) {
	this.yukari = yukari

	this.name = 'coin'
	this.help = 'flips a coin, guaranteed to possibly be random'
	this.longhelp = ''

	this.load()
}

command.prototype.load = function() {
	command.yukari.on('command.coin', command.processMessage)
	command.enabled = true
}

command.prototype.unload = function() {
	command.yukari.removeListener('command.coin', command.processMessage)
	command.enabled = false
}

command.prototype.validateMessage = function(victim) {
	return true
}

command.prototype.processMessage = function(callback, victim) {
	if(!command.validateMessage(victim)) return

	callback(victim + ': ' + (Math.round(Math.random()) ? 'heads' : 'tails'))
}

module.exports = {
	construct:function(yukari) {
		return new command(yukari)
	}
}
