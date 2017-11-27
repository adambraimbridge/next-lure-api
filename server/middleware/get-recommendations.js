const send404 = require('../lib/send-404');

module.exports = async (req, res, next) => {
	try {
		let recommendations;

		const signalStack = [relatedContent];

		if (res.locals.flags.lureTopStories) {
			signalStack.unshift(topStories);
		}

		if (res.locals.flags.lureTimeRelevantRecommendations) {
			signalStack.unshift(timeRelevantRecommendations);
		}

		let signal;

		while (signal = signalStack.shift()) {
			recommendations = await signal (res.locals.content, { locals: res.locals, query: req.query})
			if (recommendations) {
				break;
			}
		}
		res.locals.recommendations = recommendations;
		next();
	} catch (err) {
		logger.error({event: 'RECOMMENDATION_FAILURE', contentId: req.params.contentId}, err);

		if (/(network|response) timeout at: https:\/\/search-next-elasticsearch/.test(err.message)) {
			return res.status(504).end();
		}
		next(err);
	}
}
