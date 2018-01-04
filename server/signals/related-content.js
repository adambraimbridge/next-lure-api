const getMostRelatedConcepts = require('../lib/get-most-related-concepts');
const getRelatedContent = require('../lib/get-related-content');
const es = require('@financial-times/n-es-client');
const TEASER_PROPS = require('@financial-times/n-teaser').esQuery;
const dedupeById = require('../lib/dedupe-by-id');
const {RIBBON_COUNT, ONWARD_COUNT} = require('../constants');

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

module.exports = async (content, {locals: {slots}}) => {
	const concepts = getMostRelatedConcepts(content);

	if (!concepts) {
		return {};
	}

	const related = await getRelatedContent(concepts[0], ONWARD_COUNT, content.id);

	const response = {};

	if (!related.items.length) {
		return response;
	}
	if (slots.ribbon) {
		response.ribbon = {
			concept: related.concept,
			items: related.items.slice(0, RIBBON_COUNT)
		};
	}

	if (slots.onward) {
		response.onward = {
			concept: related.concept,
			items: related.items.slice(0, ONWARD_COUNT)
		};
	}

	return response;
};
