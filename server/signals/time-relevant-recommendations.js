module.exports = async (content, {slots}, accessTimeHr) => {

	const ampm = parseFloat(accessTimeHr) > 12 ? 'pm' : 'am';
	const response = {};

	switch (ampm) {
		case 'am':
			// TODO set correct properties
			// const amRecommendationsModel = {
			// 	title: 'Morning Recommendations',
			// 	titleHref: '/',
			// 	tracking: 'morning-recommendations'
			// };

			if (slots.rhr) {
			}

			if (slots.onward) {
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
