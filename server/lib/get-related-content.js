const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;
const { TEASER_PROPS } = require('../constants');

module.exports = (concept, count, parentContentId) => {

	return es.search({
		_source: TEASER_PROPS,
		query: {
			bool: {
				must: [
					{ term: { 'annotations.id': concept.id } }
				],
				must_not: [
					{ term: { id: parentContentId } }
				]
			}
		},
		size: count
	}, {}, 500)
		.catch(err => {
			logger.error(err);
			return [];
		})
		.then(teasers => ({
			concept,
			teasers
		}));
};
