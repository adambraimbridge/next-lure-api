const es = require('@financial-times/n-es-client');
const Poller = require('ft-poller');
const { TEASER_PROPS } = require('../constants');

const pollList = uuid => {
	return new Poller({
		url: `https://api.ft.com/lists/${uuid}`,
		options: {
			headers: {
				'X-Api-Key': process.env.API_KEY
			},
			timeout: 3000,
			retry: false
		},
		refreshInterval: 60000,
		parseData: async data => {
			return es.mget({
				docs: data.items.map(item => ({
					_id: item.id.replace('http://api.ft.com/things/', ''),
					_source: TEASER_PROPS
				}))
			});
		}
	});
};

const pollers = {
	uk: pollList('520ddb76-e43d-11e4-9e89-00144feab7de'),
	international: pollList('b0d8e4fe-10ff-11e5-8413-00144feabdc0')
};


module.exports = {
	init: () => {
		pollers.uk.start({ initialRequest: true });
		pollers.international.start({ initialRequest: true });
	},
	get: region => pollers[region].getData()
};
