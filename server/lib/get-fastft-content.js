const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;
const TEASER_PROPS = require('@financial-times/n-teaser').esQuery;

module.exports = (count) => {

	return es.search({
		_source: TEASER_PROPS,
		query: { term: { 'annotations.id': '5c7592a8-1f0c-11e4-b0cb-b2227cce2b54' } },
		size: count + 1
	}, 500)
		.catch(err => {
			logger.error(err);
			return [];
		})
		.then(teasers => ({
			teasers: teasers
		}));
};
