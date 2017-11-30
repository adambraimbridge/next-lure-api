const topStoriesPoller = require('../data-sources/top-stories-poller');
const getMostRelatedConcepts = require('../lib/get-most-related-concepts');
const getRelatedContent = require('../lib/get-related-content');

module.exports = async (content, {locals: {edition, slots, q1Length, q2Length}}) => {

	if (!edition) {
		return;
	}

	const concepts = getMostRelatedConcepts(content);
	const topStories = topStoriesPoller.get(edition)
		.map(item => {
			return Object.assign({}, item, {originator: 'top-stories'});
		})
		.filter(teaser => teaser.id !== content.id);

	const topStoriesModel = {
		title: 'More from the homepage',
		titleHref: '/'
		// TODO: think about how we track how often we _show_ recommendations with a particular signal
		// and also what are the rival signals on the page at the same time
	};

	const response = {};

	response.rhr = Object.assign({
		items: topStories.slice(0, q1Length)
	}, topStoriesModel);

	if (slots.onward) {
		const secondaryOnward = await getRelatedContent(concepts[0], q2Length, content.id);

		response.onward = [
			Object.assign({}, response.rhr),
			secondaryOnward
		];
	}

	return response;
};
