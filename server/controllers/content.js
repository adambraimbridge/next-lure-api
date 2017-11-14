const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;
const { relatedContent, topStories, timeRelevantRecommendations } = require('../signals');

const fourOhFour = res => {
	res.set('Surrogate-Control', res.FT_SHORT_CACHE);
	return res.status(404).end();
};


module.exports = transformer => {
	return async function (req, res, next) {
		try {
			const slots = req.query.slots ? req.query.slots.split(',')
				.reduce((map, key) => {
					map[key] = true;
					return map;
				}, {}) : {'rhr': true, 'onward': true};

			const localTimeHour = req.query.localTimeHour ? req.query.localTimeHour : undefined;

			let content;
			try {
				content = await es.get(req.params.contentId, {}, 500);
			} catch (err) {
				if (err.status === 404) {
					return fourOhFour(res);
				}
				throw err;
			}

			let recommendations;
			const ftEdition = ['uk', 'international'].includes(req.get('ft-edition')) ? req.get('ft-edition') : undefined;

			// TODO - true should be replaced by a flag
			if (res.locals.flags.lureTopStories && ftEdition) {
				recommendations = await topStories(content, {
					edition: ftEdition,
					slots
				});
			} else if (res.locals.flags.lureTimeRelevantRecommendations && localTimeHour && ftEdition) {
				recommendations = await timeRelevantRecommendations(content, {
					edition: ftEdition,
					localTimeHour: localTimeHour,
					slots
				});
			} else {
				recommendations = await relatedContent(content, {slots});
			}
			res.vary('ft-edition');
			res.set('Cache-Control', res.FT_NO_CACHE);

			if (!recommendations) {
				return fourOhFour(res);
			}

			res.set('Surrogate-Control', res.FT_HOUR_CACHE);
			res.json(transformer(recommendations));
		} catch (err) {
			logger.error({event: 'RECOMMENDATION_FAILURE', contentId: req.params.contentId}, err);

			if (/(network|response) timeout at: https:\/\/search-next-elasticsearch/.test(err.message)) {
				return res.status(504).end();
			}
			next(err);
		}

	};
};
