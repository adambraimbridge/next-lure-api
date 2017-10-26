const getMostRelatedConcepts = require('../lib/get-most-related-concepts');
const getRelatedContent = require('../lib/get-related-content');
const toViewModel = require('../lib/related-teasers-to-view-model');
const topStoriesPoller = require('../data-sources/top-stories-poller');

const { dedupeById } = require('../lib/utils');

module.exports = async (content, {edition, slots}) => {
	const concepts = getMostRelatedConcepts(content);

	const topStories = topStoriesPoller.get(edition)
		.filter(teaser => teaser.id !== content.id)

	const topStoriesModel = {
		title: 'More from the front page',
		titleHref: '/',
		// TODO: think about how we track how often we _show_ recommendations with a particular signal
		// and also what are the rival signals on the page at the same time
		tracking: 'top-stories'
	}

	const response = {};

	if (slots.rhr) {
		response.rhr = Object.assign({
			recommendations: topStories.slice(0, 5)
		}, topStoriesModel);
	}

	if (slots.onward) {
		const secondaryOnward = await getRelatedContent(concepts[0], 6, content.id);

		response.onward = [
			Object.assign({
				recommendations: topStories.slice(0, 3)
			}, topStoriesModel),
			toViewModel({
				concept:secondaryOnward.concept,
				teasers: dedupeById(secondaryOnward.teasers, topStories.slice(0, 3)).slice(0, 3)
			})
		];
	}

	return response;

}
