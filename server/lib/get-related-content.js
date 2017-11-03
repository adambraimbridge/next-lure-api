const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;
const TEASER_PROPS = require('@financial-times/n-teaser').esQuery;

module.exports = (concept, count, parentContentId) => {

	return es.search({
		_source: TEASER_PROPS,
		query: { term: { 'annotations.id': concept.id } },
		size: count + 1
	}, 500)
		.catch(err => {
			logger.error(err);
			return [];
		})
		.then(teasers => ({
			concept,
			teasers: teasers.filter(teaser => teaser.id !== parentContentId).slice(0, count)
		}));
};
