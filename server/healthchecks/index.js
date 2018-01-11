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


module.exports = {
	init: function () {
		pingServices();
		setInterval(pingServices, INTERVAL);
	},
	checks: [
		elasticStatus()
	]
};
