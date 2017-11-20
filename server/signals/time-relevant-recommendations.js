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


// get a slice of stories which excludes the current story, but also (to some degree)
// avoids looping through the same small number of stories
const topStoriesSlice = (stories, thisId) => {
	const thisStoryIndex = stories.indexOf(stories.find(teaser => teaser.id === thisId));
	let newStories;
	if (thisStoryIndex) {
		// avoid cycling through the top few stories
		if (thisStoryIndex < 9) {
			newStories = stories.slice(thisStoryIndex + 1)
		} else {
			newStories = stories
				.filter(teaser => teaser.id !== thisId);
		}
	}
	return (newStories.length >= 5) ? newStories : stories;
}


module.exports = async (content, {localTimeHour, edition, slots, onwardRowItemCount = 3}) => {

	if (!(edition && localTimeHour)) {
		return
	}

	const response = {};

	const concepts = getMostRelatedConcepts(content);
	let topStories = topStoriesPoller.get(edition);

	// am slant towards news
	if (localTimeHour > 4 && localTimeHour < 10) {
		const model = {
			title: 'This morning\'s news',
			titleHref: '/',
			tracking: 'morning-reads'
		};

		topStories = topStories
			.filter(teaser => teaser.genreConcept && teaser.genreConcept.id === NEWS_CONCEPT_ID );

		topStories = topStoriesSlice(topStories, content.id);

		if (slots.rhr) {
			response.rhr = constructRHR(topStories, model);
		}

		if (slots.onward) {
			const secondaryOnward = await getRelatedContent(concepts[0], onwardRowItemCount * 2, content.id, true);
			response.onward = constructOnward(topStories, secondaryOnward, model, onwardRowItemCount);
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

		topStories = topStories
			.filter(teaser => teaser.genreConcept && teaser.genreConcept.id !== NEWS_CONCEPT_ID);

		topStories = topStoriesSlice(topStories, content.id);

		if (slots.rhr) {
			response.rhr = constructRHR(topStories, model);
		}

		if (slots.onward) {

			const secondaryOnward = await getRelatedContent(concepts[0], onwardRowItemCount * 2, content.id, false);

			response.onward = constructOnward(topStories, secondaryOnward, model, onwardRowItemCount);
		}

		return response;
	}

	// otherwise return undefined to fall through to next thing in the stack

};
