const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;
const { relatedContent, topStories } = require('../signals');

module.exports = transformer => {
	return async function (req, res, next) {

		try {
			const slots = req.query.slots ? req.query.slots.split(',')
				.reduce((map, key) => {
					map[key] = true;
					return map;
				}, {}) : {'rhr': true, 'onward': true};

			const content = await es.get(req.params.contentId, {}, 500);
			let recommendations;
			// TODO - true should be replaced by a flag
			if (res.locals.flags.lureTopStories && ['uk', 'international'].includes(req.get('ft-edition'))) {
				recommendations = await topStories(content, {
					edition: req.get('ft-edition'),
					slots
				});
			} else {
				recommendations = await relatedContent(content, {slots});
			}
			res.vary('ft-edition');
			if (!recommendations) {
				return res.status(404).end();
			}
			res.json(transformer(recommendations));
		} catch (err) {
			logger.error(err);

			if (/network timeout at: https:\/\/search-next-elasticsearch/.test(err.message)) {
				return res.status(504).end();
			}
			next(err);
		}

	};
};
