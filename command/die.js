var nconf = require('nconf')

function command(yukari) {
	this.yukari = yukari

	this.name = 'die'
	this.help = 'terminates the bot'
	this.longhelp = ''

	this.load()
}

command.prototype.load = function() {
	this.yukari.on('command.die', this.processMessage)
	this.enabled = true
}

command.prototype.unload = function() {
	this.yukari.removeListener('command.die', this.processMessage)
	this.enabled = false
}

command.prototype.validateMessage = function(victim) {
	return true
}

command.prototype.processMessage = function(callback, victim) {
	if(!this.validateMessage(victim)) return

	callback('Bai!')
	console.log('-!- TERMINATING')
	this.yukari.client.disconnect('Yukari.js IRC bot - version ' + this.yukari.version)
}

module.exports = {
	construct:function(yukari) {
		return new command(yukari)
	}
}
