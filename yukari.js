var util = require('util'),
	EventEmitter = require('events').EventEmitter

util.inherits(yukari, EventEmitter)

function yukari(client, cmds) {
	this.version = '0.2.0'
	this.client = client
	this.commands = {}
	this.libs = {
		util:		util,
		client: 	client,
	}
	this.talk = true

	var yukari = this
	cmds.forEach(function(val, key, ar) {
		console.log('loading module "' + val + '"')
		yukari.commands[val] = require('./command/' + val).init(yukari)
	})
}

module.exports = { construct:function(client, cmds) { return new yukari(client, cmds) } }
