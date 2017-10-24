const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;

const getMostRelatedConcepts = require('../../lib/get-most-related-concepts');
const getRelatedContent = require('../../lib/get-related-content');
const toViewModel = require('../../lib/teasers-to-view-model');

module.exports = async content => {
	const concepts = getMostRelatedConcepts(content);
	const secondaryOnward = getRelatedContent(concepts[0], 6, content.id);



}





const { dedupeById } = require('../../lib/utils');

const getTrackableProperty = concept => {
	const predicate = concept.predicate.split('/').pop();
	return ['about', 'isPrimarilyClassifiedBy'].includes(predicate) ? predicate : 'brand';
}

const toViewModel = ({concept, teasers}, getTrackableName) => ({
	title: `Latest ${concept.preposition} ${concept.prefLabel}`,
	titleHref: concept.relativeUrl,
	// TODO: think about how we track how often we _show_ recommendations with a particular signal
	// and also what are the rival signals on the page at the same time
	tracking: getTrackableName(concept),
	concept,
	recommendations: teasers.map(teaser => Object.assign(teaser, {
		recommendationType: 'content'
	}))
});

module.exports = async content => {
	const concepts = getMostRelatedConcepts(content);
	const teasersPerSection = 3

	const relatedContent = await Promise.all([
		getRelatedContent(concepts[0], 5, content.id), // get enough for the right hand rail
		getRelatedContent(concepts[1], 6, content.id) // get enough so that if there is an overlap pf 3 with concepts[0], there will still be some left
	])
		.then(relatedContent => relatedContent.filter(related => related.teasers.length))
		.then(([related1, related2]) => {

			const onward = [{
				concept: related1.concept,
				teasers: related1.teasers.slice(0, 3)
			}];

			if (related2) {
				onward.push({
					concept: related2.concept,
					teasers: dedupeById(related2.teasers, related1.teasers.slice(0, 3)).slice(0, 3)
				});
			}

			return {
				rhr: related1,
				onward: onward
			}
		});

	return {
		rhr: toViewModel(relatedContent.rhr, () => 'rhr'),
		onward: relatedContent.onward.map(data => toViewModel(data, getTrackableProperty))
	};
}
