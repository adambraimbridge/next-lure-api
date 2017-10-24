module.exports = ({concept, teasers}, getTrackableName) => ({
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
