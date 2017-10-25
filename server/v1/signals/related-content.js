const getMostRelatedConcepts = require('../../lib/get-most-related-concepts');
const getRelatedContent = require('../../lib/get-related-content');
const toViewModel = require('../../lib/related-teasers-to-view-model');

const { dedupeById } = require('../../lib/utils');

module.exports = async (content, {slots}) => {
	const concepts = getMostRelatedConcepts(content);
	const [related1, related2] = await Promise.all([
		getRelatedContent(concepts[0], 5, content.id), // get enough for the right hand rail
		slots.includes['onward'] ? getRelatedContent(concepts[1], 6, content.id) : Promise.resolve({teasers: []}) // get enough so that if there is an overlap pf 3 with concepts[0], there will still be some left
	])
		.then(relatedContent => relatedContent.filter(related => related.teasers.length))

	const response = {};

	if (slots.includes('onward')) {
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
		response.onward = onward.map(data => toViewModel(data));
	}

	if (slots.includes('rhr')) {
		response.rhr = toViewModel(related1);
	}

	return response;

}
