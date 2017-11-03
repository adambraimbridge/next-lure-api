/*eslint-disable*/

const signedFetch = require('signed-aws-es-fetch');
const nHealth = require('n-health');

const INTERVAL = 60 * 1000;

const statuses = {
	elastic: false,
	lists: false
};

function pingServices () {
	signedFetch('https://next-elastic.ft.com/content/item/_search?size=0')
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(`Elasticsearch returned a ${response.statusCode}`);
			}
		})
		.then((json) => { statuses.elastic = Boolean(json.hits && json.hits.total); })
		.catch(() => { statuses.elastic = false; });

	fetch('https://api.ft.com/lists/520ddb76-e43d-11e4-9e89-00144feab7de', {
		headers: {
			'X-Api-Key': process.env.API_KEY
		}
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error(`api.ft.com/lists returned a ${response.statusCode}`);
			}
		})
		.then((json) => { statuses.lists = true })
		.catch(() => { statuses.lists = false; });
}

function elasticStatus () {
	return {
		getStatus: () => ({
			name: 'elasticsearch responded successfully.',
			ok: statuses.elastic,
			businessImpact: 'Users may not see related content recommendations.',
			severity: 1,
			technicalSummary: 'Runs a search against the content index in elastic search',
			panicGuide: 'Info on what to do in case of elastic search failure is in the next-article runbook'
		})
	};
}

function listsStatus () {
	return {
		getStatus: () => ({
			name: 'api.ft.com/lists responded successfuly with JSON for a top stories list',
			ok: statuses.lists,
			businessImpact: 'Users may not see recommendations based on curated lists',
			severity: 2,
			technicalSummary: 'Fetches a top stories list from api.ft.com/lists',
			panicGuide: 'Info on what to do in case of elastic search failure is in the next-front-page and next-api runbook'
		})
	};
};


module.exports = {
	init: function () {
		pingServices();
		setInterval(pingServices, INTERVAL);
	},
	checks: [
		elasticStatus(),
		listsStatus()
	]
};
