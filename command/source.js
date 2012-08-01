function command() {
	this.name = 'source'
	this.help = 'provides a link to the yukari.js source code'
	this.longhelp = ''
}

command.prototype.init = function(yukari) {
	this.yukari = yukari
	this.load()
}

command.prototype.load = function() {
	command.yukari.on('command.source', command.processMessage)
	command.enabled = true
}

command.prototype.unload = function() {
	command.yukari.removeListener('command.source', command.processMessage)
	command.enabled = false
}

command.prototype.validateMessage = function(victim) {
	return true
}

command.prototype.processMessage = function(callback, victim) {
	if(!command.validateMessage()) return

	callback(victim + ': My source is available at <https://github.com/damianb/node-yukari>')
}

module.exports = new command()
