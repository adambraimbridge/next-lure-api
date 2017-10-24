const es = require('@financial-times/n-es-client');
const logger = require('@financial-times/n-logger').default;

const getMostRelatedConcepts = require('../../lib/get-most-related-concepts');
const getRelatedContent = require('../../lib/get-related-content');
const toViewModel = require('../../lib/related-teasers-to-view-model');
const topStoriesPoller = require('../../data-sources/top-stories-poller');

const { dedupeById } = require('../../lib/utils');

module.exports = async (content, edition) => {
	const concepts = getMostRelatedConcepts(content);
	const secondaryOnward = await getRelatedContent(concepts[0], 6, content.id);

	const topStories = topStoriesPoller.get(edition).slice(0, 3);

	const topStoriesModel = {
		title: `More from the front page`,
		titleHref: '/',
		// TODO: think about how we track how often we _show_ recommendations with a particular signal
		// and also what are the rival signals on the page at the same time
		tracking: 'top-stories'
	}
	console.log(secondaryOnward, topStories);
	return {
		rhr: Object.assign({
			recommendations: topStories.slice(0, 5)
		}, topStoriesModel),
		onward: [
			Object.assign({
				recommendations: topStories.slice(0, 3)
			}, topStoriesModel),
			toViewModel({
				concept:secondaryOnward.concept,
				teasers: dedupeById(secondaryOnward.teasers, topStories.slice(0, 3)).slice(0, 3)
			})
		]
	}

}
