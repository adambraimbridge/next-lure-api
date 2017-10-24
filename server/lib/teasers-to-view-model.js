module.exports = ({concept, teasers, title, titleHref, tracking }, getTrackableName) => ({
	title: title || `Latest ${concept.preposition} ${concept.prefLabel}`,
	titleHref: titleHref || concept.relativeUrl,
	// TODO: think about how we track how often we _show_ recommendations with a particular signal
	// and also what are the rival signals on the page at the same time
	tracking: tracking || getTrackableName(concept),
	concept,
	recommendations: teasers.map(teaser => Object.assign(teaser, {
		recommendationType: 'content'
	}))
});
