function command(yukari) {
	this.yukari = yukari

	this.name = 'version'
	this.help = 'identifies the current version of yukari.js in use'
	this.longhelp = ''

	this.load()
}

command.prototype.load = function() {
	command.yukari.on('ctcp.version', command.processCTCP)
	command.yukari.on('command.version', command.processMessage)
	command.enabled = true
}

command.prototype.unload = function() {
	command.yukari.removeListener('ctcp.version', command.processCTCP)
	command.yukari.removeListener('command.version', command.processMessage)
	command.enabled = false
}

command.prototype.validateMessage = function(victim) {
	return true
}

command.prototype.processMessage = function(callback, victim) {
	if(!command.validateMessage()) return

	callback(victim + ': I am running Yukari.js IRC bot, version ' + command.yukari.version)
}

command.prototype.processCTCP = function(callback, victim, target, ctcp, type) {
	callback('Yukari.js IRC bot - version ' + command.yukari.version)
}

module.exports = {
	construct:function(yukari) {
		return new command(yukari)
	}
}
