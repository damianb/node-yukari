function command(yukari) {
	this.yukari = yukari

	this.provides = [
		{
			command:	'to',
			help:		'forwards a command\'s result to someone else',
			longhelp:	''
		},
	]
}

command.prototype.load = function() {
	this.yukari.on('command.to', this.procCoin)
	this.enabled = true
}

command.prototype.init = function(yukari) {
	this.yukari = yukari
	this.load()
}

command.prototype.unload = function() {
	this.yukari.removeListener('command.to', this.procTo)
	this.enabled = false
}

command.prototype.procTo = function(callback, victim, recipient) {
	if(arguments.length < 4) {
		return
	}

	args = Array.prototype.slice.call(arguments, 2)
	command = args.shift()
	if(c.yukari.listeners('command.' + command).length == 0) {
		callback(victim + ': invalid command')
		return
	}

	c.yukari.emit.apply(c.yukari, ['command.' + command, callback, victim, recipient].concat(args))
}

var c = module.exports = new command()
