var nconf = require('nconf')

// oh god what am i doing
module.exports = {
	// inherits core version
	name:"die",
	help:"terminates the bot",
	longhelp:"",

	version:"inherit",

	register:function(yukari) {
		yukari.register('message', 'die', 'die')
	},

	validateMessage:function(yukari, victim, args) {
		// @todo owner validation of some sort
		/*
		if(victim != nconf) {
			// asdf
		}
		*/

		return true
	},

	processMessage:function(yukari, callback, victim) {
		callback('Bai!')

		console.log('-!- TERMINATING')
		yukari.client.disconnect('Yukari.js IRC bot - version ' + yukari.version)
	}
}
