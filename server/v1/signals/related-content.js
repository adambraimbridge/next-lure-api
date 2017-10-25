const getMostRelatedConcepts = require('../../lib/get-most-related-concepts');
const getRelatedContent = require('../../lib/get-related-content');
const toViewModel = require('../../lib/related-teasers-to-view-model');

const { dedupeById } = require('../../lib/utils');

module.exports = async content => {
	const concepts = getMostRelatedConcepts(content);

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
		rhr: toViewModel(relatedContent.rhr),
		onward: relatedContent.onward.map(data => toViewModel(data))
	};
}
