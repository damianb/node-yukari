function command() {
	this.name = 'version'
	this.help = 'identifies the current version of yukari.js in use'
	this.longhelp = ''
}

command.prototype.init = function(yukari) {
	this.yukari = yukari
	this.load()
}

command.prototype.load = function() {
	this.yukari.on('ctcp.version', this.processCTCP)
	this.yukari.on('command.version', this.processMessage)
	this.enabled = true
}

command.prototype.unload = function() {
	this.yukari.removeListener('ctcp.version', this.processCTCP)
	this.yukari.removeListener('command.version', this.processMessage)
	this.enabled = false
}

command.prototype.validateMessage = function(victim) {
	return true
}

command.prototype.processMessage = function(callback, victim) {
	if(!c.validateMessage()) return

	callback(victim + ': I am running Yukari.js IRC bot, version ' + command.yukari.version)
}

command.prototype.processCTCP = function(callback, victim, target, ctcp, type) {
	callback('Yukari.js IRC bot - version ' + command.yukari.version)
}

var c = module.exports = new command()
