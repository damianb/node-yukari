function cmd_source(yukari) {
	this.yukari = yukari

	this.name = 'source'
	this.help = 'provides a link to the yukari.js source code'
	this.longhelp = ''
}

cmd_source.prototype.register = function() {
	this.yukari.register('message', this.name, 'source')
}

cmd_source.prototype.validateMessage = function(victim) {
	return true
}

cmd_source.prototype.processMessage = function(callback, victim) {
	callback(victim + ': My source is available at <https://github.com/damianb/node-yukari>')
}

module.exports = {
	construct:function(yukari) {
		return new cmd_source(yukari)
	}
}
