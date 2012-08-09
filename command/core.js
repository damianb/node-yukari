function command() {
	this.name = 'core'
	this.locked = true // enable/disable commands will refuse to mess with this plugin
	this.provides = [
		{
			command:	'die',
			help:		'terminates the bot',
			longhelp:	''
		},
		/*
		{
			command:	'uptime',
			help:		'provides the amount of time that the bot has been running for',
			longhelp:	''
		},
		*/
		{
			command:	'version',
			help:		'states the current version of yukari.js in use',
			longhelp:	''
		},
		{
			command:	'source',
			help:		'provides a link to the source code for the bot',
			longhelp:	''
		},
		{
			command:	'owner',
			help:		'states the recorded owner of the bot',
			longhelp:	''
		}
	]
}

command.prototype.init = function(yukari) {
	this.yukari = yukari
	this.load()
}

command.prototype.load = function() {
	this.yukari.on('command.die', this.procDie)
	this.yukari.on('command.source', this.procSource)
	this.yukari.on('command.owner', this.procOwner)
	this.yukari.on('command.version', this.procVersion)
	this.yukari.on('ctcp.version', this.procCVersion)
	this.enabled = true
}

command.prototype.unload = function() {
	this.yukari.removeListener('command.die', this.procDie)
	this.yukari.removeListener('command.source', this.procSource)
	this.yukari.removeListener('command.owner', this.procOwner)
	this.yukari.removeListener('command.version', this.procVersion)
	this.yukari.removeListener('ctcp.version', this.processCVersion)
	this.enabled = false
}

command.prototype.procDie = function(callback, victim) {
	// @todo authorization check

	callback('Bai!')
	console.log('-!- TERMINATING')
	c.yukari.client.disconnect('Yukari.js IRC bot - version ' + c.yukari.version)
}

command.prototype.procSource = function(callback, victim) {
	callback(victim + ': My source is available at <https://github.com/damianb/node-yukari>')
}

command.prototype.procOwner = function(callback, victim) {
	callback(victim + ': My owner is ' + c.yukari.libs['conf'].get('bot:owner'))
}

command.prototype.procVersion = function(callback, victim) {
	callback(victim + ': I am running Yukari.js IRC bot, version ' + c.yukari.version)
}

command.prototype.procCVersion = function(callback, victim, target, ctcp, type) {
	callback('Yukari.js IRC bot - version ' + c.yukari.version)
}

var c = module.exports = new command()
