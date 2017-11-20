const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;
const TEASER_PROPS = require('@financial-times/n-teaser').esQuery;
const { NEWS_CONCEPT_ID } = require('../constants');

module.exports = (concept, count, parentContentId, news) => {

	let query;

	if (typeof news === 'boolean') {
		if (news) {
			query = {
				bool: {
					must: [{
						term: { 'annotations.id': concept.id }
					},
					{
						term: { 'genreConcept.id': NEWS_CONCEPT_ID }
					}]
				}
			};
		} else {
			query = {
				bool: {
					must: [{
						term: { 'annotations.id': concept.id }
					}],
					must_not: [{
						term: { 'genreConcept.id': NEWS_CONCEPT_ID }
					}]
				}
			};
		}
	} else {
		query = { term: { 'annotations.id': concept.id } };
	}

	return es.search({
		_source: TEASER_PROPS,
		query,
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
