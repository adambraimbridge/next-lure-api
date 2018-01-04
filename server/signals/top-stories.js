const topStoriesPoller = require('../data-sources/top-stories-poller');
const getMostRelatedConcepts = require('../lib/get-most-related-concepts');
const getRelatedContent = require('../lib/get-related-content');
const {RIBBON_COUNT, ONWARD_COUNT} = require('../constants');

module.exports = async (content, {locals: {edition, slots}}) => {

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

	if (slots.ribbon) {
		response.ribbon = Object.assign({
			items: topStories.slice(0, RIBBON_COUNT)
		}, topStoriesModel);
	}

	if (slots.onward) {
		response.onward = Object.assign({
			items: topStories.slice(0, ONWARD_COUNT)
		}, topStoriesModel)
	}

	return response;
};
