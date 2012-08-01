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

	cmds.forEach(function(val, key, ar) {
		console.log('loading module "' + val + '"')
		this.commands[val] = require('./command/' + val).construct(this)
	})
}

module.exports = { construct:function(client, cmds) { return new yukari(client, cmds) } }
