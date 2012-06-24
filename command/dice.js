module.exports = {
	// inherits core version
	name:"dice",
	help:"rolls a specified dice and speaks the result",
	longhelp:"",

	register:function(yukari) {
		yukari.register('message', 'dice', 'dice')
		yukari.register('message', 'dice', 'roll')
	},

	validateMessage:function(yukari, victim, args) {
		return false
		args.join(' ')
		var match = args.match(/(\d+)\s*d\s*(\d+)(\s*[-+]\s*\d+)?(.*)/i)
		if(match != null || match.length < 2) {
			return true
		}
		return false
	},

	processMessage:function(yukari, callback, victim) {
		var match = args.match(/(\d+)\s*d\s*(\d+)(\s*[-+]\s*\d+)?(.*)/i)
		var number, sides, additional, rest

		match.shift()
		number = match.shift()
		sides = match.shift()
		if(match.length > 0) {
			additional = match.shift()
		}
		if(match.length > 0) {
			rest = _s.trim(match.join(''))
		}

		if(additional) {
			additional = _s.trim(additional).replace(' ', '')
			if(additional.charAt(0) == '-') {
				additional = parseInt(additional) * -1
			} else {
				additional = parseInt(additional)
			}
		}

		var roll = 0, rolls = []
		for(i = 0; i < number; i++) {
			var t = 0
			if(sides >= 1) {
				t = Math.floor(Math.random() * sides) + 1
				rolls.push(t)
				roll += t
			}
		}
		if(additional) {
			roll += additional
			result = number + 'd' + sides + (rest ? ' ' + rest : '') + ', got [' + rolls.join(',') + ']' + ((additional > 0) ? ' +' : ' -') + ' ' + additional + ' totaling ' + roll
		} else {
			result = number + 'd' + sides + (rest ? ' ' + rest : '') + ', got [' + rolls.join(',') + '] totaling ' + roll
		}

		callback(victim + ' rolls ' + result)
	}
}
