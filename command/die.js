var conf = require('nconf')

function command() {
	this.name = 'die'
	this.help = 'terminates the bot'
	this.longhelp = ''
}

command.prototype.init = function(yukari) {
	this.yukari = yukari
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
	if(!c.validateMessage(victim)) return

	callback('Bai!')
	console.log('-!- TERMINATING')
	c.yukari.client.disconnect('Yukari.js IRC bot - version ' + c.yukari.version)
}

var c = module.exports = new command()
