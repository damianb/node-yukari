var nconf = require('nconf')

function command(yukari) {
	this.yukari = yukari

	this.name = 'die'
	this.help = 'terminates the bot'
	this.longhelp = ''

	this.load()
}

command.prototype.load = function() {
	command.yukari.on('command.die', command.processMessage)
	command.enabled = true
}

command.prototype.unload = function() {
	command.yukari.removeListener('command.die', command.processMessage)
	command.enabled = false
}

command.prototype.validateMessage = function(victim) {
	return true
}

command.prototype.processMessage = function(callback, victim) {
	if(!command.validateMessage(victim)) return

	callback('Bai!')
	console.log('-!- TERMINATING')
	command.yukari.client.disconnect('Yukari.js IRC bot - version ' + command.yukari.version)
}

module.exports = {
	construct:function(yukari) {
		return new command(yukari)
	}
}
