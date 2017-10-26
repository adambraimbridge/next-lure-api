const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;
const { relatedContent, topStories } = require('../signals');

module.exports = transformer => {
	return async function (req, res, next) {

		try {
			const slots = req.query.slots ? req.query.slots.split(',') : ['rhr', 'onward']
			const content = await es.get(req.params.contentId);
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

			// if(err.name === NoRelatedResultsException.NAME) {
			// 	res.status(200).end();
			// } else if (err instanceof fetchres.ReadTimeoutError) {
			// 	res.status(500).end();
			// } else if (fetchres.originatedError(err)) {
			// 	res.status(404).end();
			// } else {
				next(err);
			// }
		}

	};
}
