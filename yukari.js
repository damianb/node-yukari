var _s = require('underscore.string')
var https = require('https')

var yukari = {}
yukari.grabYoutube = function(videoid, callback, error) {
	// https://gdata.youtube.com/feeds/api/videos/$videoid?v=2&alt=json
	var options = {
		host: 'gdata.youtube.com',
		path: '/feeds/api/videos/' + videoid + '?v=2&alt=json',
	};
	https
		.get(options, function(res) {
			var api_body = ''
			res.setEncoding('utf8')
			res
				.on('data', function(chunk) {
					api_body += chunk
				})
				.on('end', function() {
					var data = JSON.parse(api_body)
					var format = '[YouTube] <http://youtu.be/%s> "%s" [%d:%d] - %d views, %d likes, %d dislikes'
					callback(_s.sprintf(format,
						data['entry']['media$group']['yt$videoid']['$t'],
						data['entry']['title']['$t'],
						Math.round(data['entry']['media$group']['yt$duration']['seconds'] / 60),
						data['entry']['media$group']['yt$duration']['seconds'] % 60,
						Number(data['entry']['yt$statistics']['viewCount']),
						Number(data['entry']['yt$rating']['numLikes']),
						Number(data['entry']['yt$rating']['numDislikes'])
					))
				})
		})
		.on('error', function(e) {
			console.log('error fetching youtube video data from api: ' + e.message)
			callback(false)
		})
}

module.exports = yukari
