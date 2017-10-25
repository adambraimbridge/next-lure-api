const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;
const { relatedContent, topStories } = require('../signals');

module.exports = async function (req, res, next) {

	try {
		const content = await es.get(req.params.contentId);
		let recommendations;
		// TODO - true should be replaced by a flag
		if (res.locals.flags.lureTopStories && ['uk', 'international'].includes(req.get('ft-edition'))) {
			recommendations = await topStories(content, req.get('ft-edition'));
		} else {
			recommendations = await relatedContent(content);
		}
		res.vary('ft-edition');
		res.json(recommendations);
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
