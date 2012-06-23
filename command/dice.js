
// oh god what am i doing
module.exports = {
	name:"dice",
	help:"rolls a specified dice and speaks the result",
	longhelp:"",
	version:"0.0.1",

	register:function(yukari) {
		yukari.register('message', 'dice', 'dice')
		yukari.register('message', 'dice', 'roll')
	},

	validate:function(command, args) {
		// asdf
	},

	process:function(callback, victim, command, args) {
		// asdf
	}
}
