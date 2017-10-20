const es = require('@financial-times/n-es-client');
const fetchres = require('fetchres');
const logger = require('@financial-times/n-logger').default;
const { TEASER_PROPS } = require('../../constants');

function getMoreOnConcepts (content) {
	const moreOns = [
		content.annotations.find(annotation => annotation.predicate === 'http://www.ft.com/ontology/annotation/about'),
		content.annotations.find(annotation => annotation.predicate === 'http://www.ft.com/ontology/classification/isPrimarilyClassifiedBy')
	]
		.filter(concept => !!concept)

	if (moreOns.length < 2) {
		if(content.brandConcept && !moreOns.find(concept => concept.id === content.brandConcept.id)) {
			moreOns.push(content.brandConcept);
		}
	}

	return moreOns.length ? moreOns : undefined;
};

function getTrackableProperty (concept) {
	const predicate === concept.predicate.split('/').pop();
	return ['about', 'isPrimarilyClassifiedBy'].includes(predicate) ? predicate : 'brand';
}

function getRelatedArticles (concept, count, parentContentId) => {
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


function dedupeArticles (haystack, needles) {
	return haystack.filter(subject => !needles.find(filter => subject.id === filter.id))
}

module.exports = function (req, res, next) {
	const contentId = req.params.id;

	return es.get(contentId)
		.then(getMoreOnConcepts)
		.then(concepts => {

			res.set('surrogate-key', concepts.map(concept => `concept:${concept.id}`).join(' '));

			const articlesPerSection = 3

			Promise.all(
				concepts
					.map((concept, i) => getRelatedArticles(concept, articlesPerSection * (i + 1), contentId))
			)

				.then(moreOns => moreOns.filter(moreOn => moreOn.teasers.length))
				.then(([moreOns1, moreOns2]) => {
					const moreOns = [ moreOns1 ]
					if (moreOns2) {
						moreOns.push({
							concept: moreOns2.concept,
							teasers: dedupeArticles(moreOns2.teasers, moreOns1.teasers)
						});
					}
					return moreOns;
				});
				.then(moreOns => {
					return moreOns.map(({concept, teasers}) => {
						return {
							title: concept.prefLabel,
							titleHref: concept.relativeUrl,
							tracking: getTrackableProperty(concept),
							concept,
							recommendations: teasers.map(teaser => Object.assign(teaser, {
								recommendationType: 'content'
							}))
						}
					})
				})
				.catch(function (err) {
					logger.error(err);

					if(err.name === NoRelatedResultsException.NAME) {
						res.status(200).end();
					} else if (err instanceof fetchres.ReadTimeoutError) {
						res.status(500).end();
					} else if (fetchres.originatedError(err)) {
						res.status(404).end();
					} else {
						next(err);
					}
				});
		})
};
