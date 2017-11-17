const topStoriesPoller = require('../data-sources/top-stories-poller');
const getMostRelatedConcepts = require('../lib/get-most-related-concepts');
const getRelatedContent = require('../lib/get-related-content');
const toViewModel = require('../lib/related-teasers-to-view-model');
const dedupeById = require('../lib/dedupe-by-id');
const { NEWS_CONCEPT_ID } = require('../constants');

const constructRHR = (stories, model) => Object.assign({
	recommendations: stories.slice(0, 5)
}, model);

const constructOnward = (primary, secondary, model) => {
	const primaryThree = primary.slice(0, 3);

	return [
		Object.assign({
			recommendations: primaryThree
		}, model),
		toViewModel({
			concept:secondary.concept,
			teasers: dedupeById(secondary.teasers, primaryThree).slice(0, 3)
		})
	];
}


module.exports = async (content, {localTimeHour, edition, slots}) => {

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
			const secondaryOnward = await getRelatedContent(concepts[0], 6, content.id, true);
			response.onward = constructOnward(newsStories, secondaryOnward, model);
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
			const secondaryOnward = await getRelatedContent(concepts[0], 6, content.id, false);
			response.onward = constructOnward(nonNewsStories, secondaryOnward, model);
		}

		return response;
	}

	// otherwise return undefined to fall through to next thing in the stack

};
