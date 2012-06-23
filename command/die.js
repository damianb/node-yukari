var nconf = require('nconf')

// oh god what am i doing
module.exports = {
	name:"die",
	help:"terminates the bot",
	longhelp:"",

	version:"inherit",

	register:function(yukari) {
		yukari.register('message', 'die', 'die')
	},

	validateMessage:function(victim, args) {
		/*
		if(victim != nconf) {

		}
		*/

		return true
	},

	processMessage:function(callback, victim, args) {
		callback('Bai!')

		console.log('-!- TERMINATING')
		client.disconnect('Yukari.js IRC bot - version ' + yukari.version())
	}
}
