const getTrackablePredicate = concept => {
	const predicate = concept.predicate.split('/').pop();
	return ['about', 'isPrimarilyClassifiedBy'].includes(predicate) ? predicate : 'brand';
}

module.exports = ({concept, teasers}) => ({
	title: `Latest ${concept.preposition} ${concept.prefLabel}`,
	titleHref: concept.relativeUrl,
	// TODO: think about how we track how often we _show_ recommendations with a particular signal
	// and also what are the rival signals on the page at the same time
	tracking: getTrackablePredicate(concept),
	concept,
	recommendations: teasers
});
