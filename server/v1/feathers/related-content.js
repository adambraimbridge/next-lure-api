const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;
const { TEASER_PROPS } = require('../../constants');

const getMostRelatedConcepts = content => {
	const mostRelatedConcepts = [
		content.annotations.find(annotation => annotation.predicate === 'http://www.ft.com/ontology/annotation/about'),
		content.annotations.find(annotation => annotation.predicate === 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy')
	]
		.filter(concept => !!concept)

	if (mostRelatedConcepts.length < 2) {
		if(content.brandConcept && !mostRelatedConcepts.find(concept => concept.id === content.brandConcept.id)) {
			mostRelatedConcepts.push(content.brandConcept);
		}
	}
	return mostRelatedConcepts.length ? mostRelatedConcepts : undefined;
};

const getTrackableProperty = concept => {
	const predicate = concept.predicate.split('/').pop();
	return ['about', 'isPrimarilyClassifiedBy'].includes(predicate) ? predicate : 'brand';
}

const getRelatedContent = (concept, count, parentContentId) => {
	return es.search({
		_source: TEASER_PROPS,
		query: {
			bool: {
				must: [
					{term: { 'annotations.id': concept.id }}
				],
				must_not: [
					{term: {id: parentContentId}}
				]
			}
		},
		size: count
	})
		.catch(err => {
			logger.error(err);
			return [];
		})
		.then(teasers => ({
			concept,
			teasers
		}))
};


const dedupeById = (subjects, filters) => {
	return subjects.filter(subject => !filters.find(filter => subject.id === filter.id))
}

module.exports = async content => {
	const concepts = await getMostRelatedConcepts(content)
	const teasersPerSection = 3

	const relatedContent = await Promise.all(
		concepts
			.map((concept, i) => getRelatedContent(concept, teasersPerSection * (i + 1), content.id))
	)
		.then(relatedContent => relatedContent.filter(related => related.teasers.length))
		.then(([related1, related2]) => {
			const relatedContent = [ related1 ]
			if (related2) {
				relatedContent.push({
					concept: related2.concept,
					teasers: dedupeById(related2.teasers, related1.teasers).slice(0, 3)
				});
			}
			return relatedContent;
		});

	return relatedContent.map(({concept, teasers}) => ({
		title: `Latest ${concept.preposition} ${concept.prefLabel}`,
		titleHref: concept.relativeUrl,
		// TODO: think about how we track how often we _show_ recommendations with a particular signal
		// and also what are the rival signals on the page at the same time
		tracking: getTrackableProperty(concept),
		concept,
		recommendations: teasers.map(teaser => Object.assign(teaser, {
			recommendationType: 'content'
		}))
	}));
}
