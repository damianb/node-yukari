function cmd_version(yukari) {
	this.yukari = yukari

	this.name = 'version'
	this.help = 'identifies the current version of yukari.js in use'
	this.longhelp = ''
}

cmd_version.prototype.register = function() {
	this.yukari.register('ctcp', this.name, 'version')
	this.yukari.register('message', this.name, 'version')
}

cmd_version.prototype.validateMessage = function(victim) {
	return true
}

cmd_version.prototype.processMessage = function(callback, victim) {
	callback(victim + ': I am running Yukari.js IRC bot, version ' + this.yukari.version)
}

cmd_version.prototype.processCTCP = function(callback, victim, target, ctcp, type) {
	callback('Yukari.js IRC bot - version ' + this.yukari.version)
}

module.exports = {
	construct:function(yukari) {
		return new cmd_version(yukari)
	}
}
