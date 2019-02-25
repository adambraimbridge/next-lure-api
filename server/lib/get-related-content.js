const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;
const TEASER_PROPS = require('@financial-times/n-teaser').esQuery;
const { NEWS_CONCEPT_ID } = require('../constants');

const getTrackablePredicate = concept => {
	const predicate = concept.predicate.split('/').pop();
	return ['about', 'isPrimarilyClassifiedBy'].includes(predicate) ? predicate : 'brand';
};

module.exports = (concept, count, parentContentId, news, teaserFormat = 'n') => {

	const teaserProps = teaserFormat === 'x' ? ['id', 'teaser.*'] : TEASER_PROPS;
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
		_source: teaserProps,
		query,
		size: count + 1
	}, 500)
		.catch(err => {
			logger.error(err);
			return [];
		})
		.then(items => ({
			concept,
			items: items
				.filter(item => item.id !== parentContentId)
				.map(item => {
					item.originator = getTrackablePredicate(concept);
					item.isPremium = item.accessLevel === 'premium'; // elasticsearch -> next-api field mapping
					return item;
				})
				.slice(0, count)
		}));
};
