const topStoriesPoller = require('../data-sources/top-stories-poller');
const getMostRelatedConcepts = require('../lib/get-most-related-concepts');
const getRelatedContent = require('../lib/get-related-content');
const toViewModel = require('../lib/related-teasers-to-view-model');
const dedupeById = require('../lib/dedupe-by-id');
const { NEWS_CONCEPT_ID } = require('../constants');

const constructRHR = (stories, model) => Object.assign({
	recommendations: stories.slice(0, 5)
}, model);

const constructOnward = (primary, secondary, model, onwardRowItemCount) => {
	const primaryItems = primary.slice(0, onwardRowItemCount);

	return [
		Object.assign({
			recommendations: primaryItems
		}, model),
		toViewModel({
			concept:secondary.concept,
			teasers: dedupeById(secondary.teasers, primaryItems).slice(0, onwardRowItemCount)
		})
	];
}


module.exports = async (content, {localTimeHour, edition, slots, onwardRowItemCount = 3}) => {

	if (!(edition && localTimeHour)) {
		return
	}

	const response = {};

	const concepts = getMostRelatedConcepts(content);
	const topStories = topStoriesPoller.get(edition)
		.filter(teaser => teaser.id !== content.id);

	// am slant towards news
	if (localTimeHour > 5 && localTimeHour < 11) {
		const model = {
			title: 'This morning\'s news',
			titleHref: '/',
			tracking: 'morning-reads'
		};

		const newsStories = topStories
			.filter(teaser => teaser.genreConcept && teaser.genreConcept.id === NEWS_CONCEPT_ID );

		if (slots.rhr) {
			response.rhr = constructRHR(newsStories, model);
		}

		if (slots.onward) {
			const secondaryOnward = await getRelatedContent(concepts[0], onwardRowItemCount * 2, content.id, true);
			response.onward = constructOnward(newsStories, secondaryOnward, model, onwardRowItemCount);
		}

		return response;
	}

	// pm slant towards non news
	if (localTimeHour > 14 && localTimeHour < 20) {

		const model = {
			title: 'Looking back on the day',
			titleHref: '/',
			tracking: 'evening-reads'
		};

		const nonNewsStories = topStories
			.filter(teaser => teaser.genreConcept && teaser.genreConcept.id !== NEWS_CONCEPT_ID);

		if (slots.rhr) {
			response.rhr = constructRHR(nonNewsStories, model);
		}

		if (slots.onward) {
			const secondaryOnward = await getRelatedContent(concepts[0], onwardRowItemCount * 2, content.id, false);
			response.onward = constructOnward(nonNewsStories, secondaryOnward, model, onwardRowItemCount);
		}

		return response;
	}

	// otherwise return undefined to fall through to next thing in the stack

};
