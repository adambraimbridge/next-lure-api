const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;
const { relatedContent, topStories, timeRelevantRecommendations } = require('../signals');



const send404 = require('../lib/send-404');


module.exports = transformer => {

	// handle-options
	// construct-query-lengths
	// cache

	// get-content
	// get-recommendations
	// apply data template
	// respond/catch timeouts
	return async function (req, res, next) {

			if (!res.locals.recommendations) {
				return send404(res);
			}
			res.json(res.locals.recommendations);

	};
};

