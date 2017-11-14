//const getMostRelatedConcepts = require('../lib/get-most-related-concepts');
const getFastFtContent = require('../lib/get-fastft-content');
const toViewModel = require('../lib/related-teasers-to-view-model');
const es = require('@financial-times/n-es-client');
const TEASER_PROPS = require('@financial-times/n-teaser').esQuery;
const dedupeById = require('../lib/dedupe-by-id');

module.exports = async (content, {slots}, accessTimeHr) => {

	const ampm = parseFloat(accessTimeHr) > 12 ? 'pm' : 'am';
	const response = {};
	const [fastFtRecs] =	await Promise.all([getFastFtContent(5)]);
	console.log(fastFtRecs);

	switch (ampm) {
		case 'am':
			// TODO set correct properties
			// const amRecommendationsModel = {
			// 	title: 'Morning Recommendations',
			// 	titleHref: '/',
			// 	tracking: 'morning-recommendations'
			// }

			if (slots.rhr) {
			}

			if (slots.onward) {
				const onward = [];
				if (fastFtRecs.teasers.length) {
					onward.push({
						//concept: fastFtRecs.concept,
						teasers: fastFtRecs.teasers.slice(0, 3)
					});
				}

				if (onward.length) {
					response.onward = onward.map(data => toViewModel(data));
				}
			}
			break;

		case 'pm':
			// TODO set correct properties
			// const pmRecommendationsModel = {
			// 	title: 'Evening Recommendations',
			// 	titleHref: '/',
			// 	tracking: 'evening-recommendations'
			// };

			if (slots.rhr) {
			}

			if (slots.onward) {
			}
			break;
		default:
	}

	return response;

};
