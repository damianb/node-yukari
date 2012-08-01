function command() {
	this.name = 'coin'
	this.help = 'flips a coin, guaranteed to possibly be random'
	this.longhelp = ''
}

command.prototype.init = function(yukari) {
	this.yukari = yukari
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
	if(!c.validateMessage(victim)) return

	callback(victim + ': ' + (Math.round(Math.random()) ? 'heads' : 'tails'))
}

var c = module.exports = new command()
