const fetchres = require('fetchres');
const es = require('@financial-times/n-es-client');
const TEASER_PROPS = require('@financial-times/n-teaser').esQuery;
const {ONWARD_COUNT} = require('../constants');

module.exports = async (content, {locals: {slots}}) => {

	if (!slots.onward) {
		return null;
	}

	const url = `http://ft-rex.herokuapp.com/roar?article_id=${content.id}`;

	return fetch(url, { timeout: 5000 })
		.then(fetchres.json)
		.then(async articleIds => {
			if (articleIds.length < ONWARD_COUNT) {
				return null;
			}

			const options = articleIds.map(id => ({ _id: id, _source: TEASER_PROPS }));
			const articles = await es.mget({ docs: options });

			if (!articles || articles.length < ONWARD_COUNT) {
				return null;
			}

			const response = {};
			const model = {};

			const items = articles.slice(0, ONWARD_COUNT);
			items.forEach(item => item.originator = 'ft-rex');

			return {
				items: items
			};
		})
		.catch(() => {
			return null;
		});

};
