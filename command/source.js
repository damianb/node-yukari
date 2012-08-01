function command(yukari) {
	this.yukari = yukari

	this.name = 'source'
	this.help = 'provides a link to the yukari.js source code'
	this.longhelp = ''

	this.load()
}

command.prototype.load = function() {
	this.yukari.on('command.source', this.processMessage)
	this.enabled = true
}

command.prototype.unload = function() {
	this.yukari.removeListener('command.source', this.processMessage)
	this.enabled = false
}

command.prototype.validateMessage = function(victim) {
	return true
}

command.prototype.processMessage = function(callback, victim) {
	if(!this.validateMessage()) return

	callback(victim + ': My source is available at <https://github.com/damianb/node-yukari>')
}

module.exports = {
	construct:function(yukari) {
		return new command(yukari)
	}
}
