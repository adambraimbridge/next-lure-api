const getMostRelatedConcepts = require('../lib/get-most-related-concepts');
const getRelatedContent = require('../lib/get-related-content');
const toViewModel = require('../lib/related-teasers-to-view-model');
const es = require('@financial-times/n-es-client');
const { TEASER_PROPS } = require('../constants');
const dedupeById = require('../lib/dedupe-by-id');

const getCuratedContent = ids => ids.length ? es.mget({
	docs: ids.map(id => ({
		_id: id.replace('http://api.ft.com/things/', ''),
		_source: TEASER_PROPS
	}))
}) : Promise.resolve([]);

module.exports = async (content, {slots}) => {
	const concepts = getMostRelatedConcepts(content);

	if (!concepts) {
		return {};
	}

	const [curated, related1, related2] = await Promise.all([
		slots.rhr ? getCuratedContent(content.curatedRelatedContent.map(content => content.id)) : Promise.resolve([]),
		getRelatedContent(concepts[0], 5, content.id), // get enough for the right hand rail
		( slots.onward && concepts[1] ) ? getRelatedContent(concepts[1], 6, content.id) : Promise.resolve({teasers: []}) // get enough so that if there is an overlap pf 3 with concepts[0], there will still be some left
	]);

	const response = {};

	if (slots.onward) {
		const onward = [];
		if (related1.teasers.length) {
			onward.push({
				concept: related1.concept,
				teasers: related1.teasers.slice(0, 3)
			});
		}
		if (related2.teasers.length) {
			onward.push({
				concept: related2.concept,
				teasers: dedupeById(related2.teasers, related1.teasers.slice(0, 3)).slice(0, 3)
			});
		}
		if (onward.length) {
			response.onward = onward.map(data => toViewModel(data));
		}
	}

	if (slots.rhr) {
		// TODO differentiate in the tracking when there are curated links as well
		// as related
		response.rhr = toViewModel({
			concept: related1.concept,
			teasers: dedupeById(curated.concat(related1.teasers)).slice(0, 5)
		});
	}

	return response;

};
