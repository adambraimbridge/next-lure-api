const getMostRelatedConcepts = require('../lib/get-most-related-concepts');
const getRelatedContent = require('../lib/get-related-content');
const toViewModel = require('../lib/related-teasers-to-view-model');
const es = require('@financial-times/n-es-client');
const TEASER_PROPS = require('@financial-times/n-teaser').esQuery;
const dedupeById = require('../lib/dedupe-by-id');

const getCuratedContent = ids => ids.length ? es.mget({
	docs: ids.map(id => ({
		_id: id.replace('http://api.ft.com/things/', ''),
		_source: TEASER_PROPS
	}))
}) : Promise.resolve([])
	.then(items => items.map(item => {
		item.originator = 'curated-related';
		return item;
	}));

module.exports = async (content, {locals: {slots, q1Length, q2Length}}) => {
	const concepts = getMostRelatedConcepts(content);

	if (!concepts) {
		return {};
	}

	const [curated, related1, related2] = await Promise.all([
		getCuratedContent(content.curatedRelatedContent.map(content => content.id)),
		getRelatedContent(concepts[0], q1Length, content.id), // get enough for the right hand rail
		slots.onward ? getRelatedContent(concepts[1], q2Length, content.id) : Promise.resolve({})
	])

	const response = {};

	response.rhr = {
		concept: related1.concept,
		items: dedupeById(curated.concat(related1.items)).slice(0, q1Length)
	};

	if (slots.onward) {
		const onward = [];

		if (related1.items.length) {
			onward.push(related1);
		}
		if (related2.items.length) {
			onward.push(related2);
		}
		if (onward.length) {
			response.onward = onward;
		}
	}

	return response;
};
