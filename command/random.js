function command() {
	this.name = 'random'
	this.provides = [
		{
			command:	'coin',
			help:		'flips a coin, guaranteed to possibly be random',
			longhelp:	''
		},
		{
			command:	'random',
			help:		'returns a random number, guaranteed to be random as per RFC 1149.5', // http://xkcd.com/221/
			longhelp:	''
		}
	]
}

command.prototype.init = function(yukari) {
	this.yukari = yukari
	this.load()
}

command.prototype.load = function() {
	this.yukari.on('command.coin', this.procCoin)
	this.yukari.on('command.random', this.procRandom)
	this.enabled = true
}

command.prototype.unload = function() {
	this.yukari.removeListener('command.coin', this.procCoin)
	this.yukari.removeListener('command.random', this.procRandom)
	this.enabled = false
}

command.prototype.valRandom = function(victim) {
	return true
}

command.prototype.procRandom = function(callback, victim) {
	if(!c.valRandom(victim)) return

	callback(victim + ': 4')
}

command.prototype.valCoin = function(victim) {
	return true
}

command.prototype.procCoin = function(callback, victim) {
	if(!c.valCoin(victim)) return

	callback(victim + ': ' + (Math.round(Math.random()) ? 'heads' : 'tails'))
}

var c = module.exports = new command()
