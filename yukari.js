var _s = require('underscore.string'),
	https = require('https'),
	irc = require('irc'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter

util.inherits(yukari, EventEmitter)

function yukari(client, cmds) {
	this.version = '0.0.4'
	this.client = client
	this.commands = {}

	var yukari = this
	cmds.forEach(function(val, key, ar) {
		console.log('loading module "' + val + '"')
		yukari.commands[val] = require('./command/' + val).init(yukari)
	})
}

module.exports = { construct:function(client, cmds) { return new yukari(client, cmds) } }
